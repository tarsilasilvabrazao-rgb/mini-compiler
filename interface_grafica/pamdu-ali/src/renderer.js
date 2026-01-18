// Função de Highlighting (Syntax Highlighting)
function updateHighlight(text) {
    const resultElement = document.getElementById("highlighting-content");

    // 1. Escapar caracteres HTML básicos
    let content = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // DICIONÁRIO DE CORES (Ordem importa!)
    const rules = [
        { type: 'comment', regex: /##[\s\S]*?##/g },       // Bloco ## ##
        { type: 'comment', regex: /#.*/g },                // Linha #
        { type: 'string', regex: /"(?:\\.|[^"\\])*"/g },  // Strings " "
        { type: 'number', regex: /\b\d+(\.\d+)?\b/g },    // Números
        { type: 'keyword', regex: /\b(VAR|EXIBIR|SE|SENAO|PARA|ENQUANTO|RETORNA|FUNCAO)\b/g },
        { type: 'type', regex: /\b(TEXTO|NUMERO|BOOLEANO|LISTA)\b/g }
    ];

    // Array para guardar as partes processadas
    let parts = [{ text: content, isToken: false }];

    // Processa cada regra sem sobrepor
    rules.forEach(rule => {
        let newParts = [];
        parts.forEach(part => {
            if (part.isToken) {
                newParts.push(part);
                return;
            }

            let lastIndex = 0;
            part.text.replace(rule.regex, (match, ...args) => {
                const offset = args[args.length - 2];
                // Texto antes do match
                if (offset > lastIndex) {
                    newParts.push({ text: part.text.slice(lastIndex, offset), isToken: false });
                }
                // O match colorido
                newParts.push({
                    text: `<span class="token-${rule.type}">${match}</span>`,
                    isToken: true
                });
                lastIndex = offset + match.length;
            });

            if (lastIndex < part.text.length) {
                newParts.push({ text: part.text.slice(lastIndex), isToken: false });
            }
        });
        parts = newParts;
    });

    // Une todas as partes e aplica ao HTML
    resultElement.innerHTML = parts.map(p => p.text).join('');
}

function syncScroll(el) {
    const pre = document.getElementById("highlighting");
    pre.scrollTop = el.scrollTop;
    pre.scrollLeft = el.scrollLeft;
}

// Inicializa Highlighting
window.onload = () => {
    const textArea = document.getElementById("codigo");
    if (textArea) {
        updateHighlight(textArea.value);
    }

    // Configura o botão de executar
    const btnCompilar = document.getElementById("compilar");
    const saidaDiv = document.getElementById("saida");

    if (btnCompilar) {
        btnCompilar.addEventListener("click", async () => {
            const codigo = textArea.value;
            saidaDiv.innerHTML = '<div class="log-info">Compilando...</div>';

            if (window.api && window.api.compile) {
                const resultado = await window.api.compile(codigo);
                saidaDiv.innerHTML = ""; // Limpa anterior

                // Função auxiliar para limpar ANSI codes
                const processText = (text) => {
                    // Remove códigos ANSI (ex: \u001b[31m)
                    const cleanText = text.replace(/\x1b\[[0-9;]*m/g, "");
                    // Escapa HTML para segurança
                    return cleanText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                };

                // Renderiza ERROS
                if (resultado.errors && resultado.errors.length > 0) {
                    resultado.errors.forEach(err => {
                        const div = document.createElement("div");
                        div.className = "log-entry log-error";
                        // Adiciona título e texto processado
                        div.innerHTML = `<strong>⛔ ERRO:</strong>\n${processText(err)}`;
                        saidaDiv.appendChild(div);
                    });
                }

                // Renderiza SAÍDA
                if (resultado.output && resultado.output.length > 0) {
                    // Cabeçalho de saída
                    const header = document.createElement("div");
                    header.className = "log-header";
                    header.innerText = "RESULTADO:";
                    saidaDiv.appendChild(header);

                    resultado.output.forEach(line => {
                        const div = document.createElement("div");
                        div.className = "log-entry log-success";
                        div.textContent = `> ${line}`;
                        saidaDiv.appendChild(div);
                    });
                }

                if ((!resultado.errors || resultado.errors.length === 0) && (!resultado.output || resultado.output.length === 0)) {
                    saidaDiv.innerHTML += '<div class="log-info">✅ Executado sem saída visual.</div>';
                }

            } else {
                saidaDiv.textContent = "Erro: API não disponível.";
            }
        });
    }


    // --- Lógica do Modal de Input ---
    const modal = document.getElementById("input-modal");
    const inputField = document.getElementById("input-field");
    const btnConfirm = document.getElementById("btn-confirm-input");
    const promptTitle = document.getElementById("input-prompt");

    const submitInput = () => {
        const value = inputField.value;
        if (window.api && window.api.sendInput) {
            window.api.sendInput(value);
            inputField.value = "";
            modal.classList.add("hidden");
            modal.style.display = "none";
        }
    };

    if (btnConfirm) {
        btnConfirm.addEventListener("click", submitInput);
    }

    if (inputField) {
        inputField.addEventListener("keydown", (e) => {
            if (e.key === "Enter") submitInput();
        });
    }

    if (window.api && window.api.onInputRequest) {
        window.api.onInputRequest((prompt) => {
            if (promptTitle) promptTitle.innerText = prompt || "Entrada de Dados";
            if (modal) {
                modal.classList.remove("hidden");
                modal.style.display = "flex";
                if (inputField) inputField.focus();
            }
        });
    }
};
