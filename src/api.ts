import Lexer from "./lexer/Lexer";
import Parser from "./parser/Parser";
import SemanticAnalyzer from "./semantic/Semantic";
import { TokenType } from "./lexer/ILexer";

/**
 * Interface para o resultado da execução
 */
export interface CompilationResult {
    output: string[];
    errors: string[];
    html?: string;
}

/**
 * Executa o código fonte fornecido e retorna a saída e erros.
 * @param sourceCode O código fonte em SeteAO
 * @param inputCallback Callback opcional para entrada de dados
 */
export async function executeCode(
    sourceCode: string,
    inputCallback?: (prompt: string) => Promise<string>,
    outputCallback?: (message: string) => void
): Promise<CompilationResult> {
    const output: string[] = [];
    const errors: string[] = [];

    // Função auxiliar para capturar logs
    const logCapture = (msg: string) => {
        output.push(msg);
        if (outputCallback) {
            outputCallback(msg);
        }
    };

    try {
        // 1. Lexer
        const lexer = new Lexer(sourceCode, "gui-input.sa");

        // Verificar erros léxicos
        // Nota: O lexer original acumula erros em lexer.errors
        // Precisamos forçar a leitura para preencher os erros se o Lexer for preguiçoso
        // Mas baseado no index.ts original, fazemos um passo de verificação antes

        const errorScanner = new Lexer(sourceCode, "gui-input.sa");
        let token = errorScanner.getNextToken();
        while (token.type !== TokenType.EOF) {
            token = errorScanner.getNextToken();
        }

        if (errorScanner.errors.length > 0) {
            return { output: [], errors: errorScanner.errors };
        }

        // 2. Parser
        const parser = new Parser(lexer);
        const ast = parser.parse();

        // Coletar erros do Parser
        if (parser.errors.length > 0) {
            errors.push(...parser.errors);
        }

        // Se houver erros em qualquer fase (Lexer ou Parser), não executa
        if (errors.length > 0) {
            return { output, errors };
        }

        // 3. Semântica e Execução
        const semantic = new SemanticAnalyzer("gui-input.sa", logCapture, inputCallback);
        await semantic.execute(ast);

        return { output, errors, html: semantic.getWebOutput() };

    } catch (error: any) {
        // Se o erro for formatado (contém ANSI), tentamos extrair o conteúdo limpo para o HTML
        const cleanMessage = error.message.replace(/\x1b\[[0-9;]*m/g, "");
        const errorHtml = `
            <div style="background: #fee; border-left: 5px solid #f44; padding: 20px; font-family: sans-serif; color: #333;">
                <h3 style="color: #d32; margin-top: 0;">⚠️ Erro de Execução Web</h3>
                <pre style="white-space: pre-wrap; background: #fff; padding: 10px; border: 1px solid #ddd;">${cleanMessage}</pre>
                <p style="font-size: 0.9em; color: #666;">Verifique as mensagens no console de logs para mais detalhes.</p>
            </div>
        `;
        errors.push(error.message);
        return { output, errors, html: errorHtml };
    }
}
