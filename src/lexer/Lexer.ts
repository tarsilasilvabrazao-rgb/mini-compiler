import { Token, TokenType } from "./ILexer";

/**
 * O Lexer é responsável por transformar o código-fonte (string) em uma sequência de Tokens.
 */
class Lexer {
  private text: string;
  private position: number = 0;

  constructor(text: string) {
    this.text = text;
  }

  /**
   * Retorna o caractere na posição atual sem avançar o ponteiro.
   */
  private peek(): string {
    return this.text[this.position] || "";
  }

  /**
   * Avança a posição do ponteiro no texto.
   */
  private advance() {
    this.position++;
  }

  /**
   * Analisa o texto e retorna o próximo token encontrado.
   */
  public getNextToken(): Token {
    while (this.position < this.text.length) {
      const char = this.peek();

      // Definição de padrões (espaços, números, varras)
      const isBlankSpace = /\s/;
      const isNumber = /[0-9]/;
      const isWord = /[a-zA-Z]/;

      // Ignorar espaços em branco
      if (isBlankSpace.test(char)) {
        this.advance();
        continue;
      }

      // Mapeamento de caracteres indivuduais para seus respectivos tokens
      if (char === "+") {
        this.advance();
        return { type: TokenType.MAIS, value: "+" };
      }
      if (char === "/") {
        this.advance();
        return { type: TokenType.DIVISAO, value: "/" };
      }

      if (char === "*") {
        this.advance();
        return { type: TokenType.MULTIPLICACAO, value: "*" };
      }

      if (char === "-") {
        this.advance();
        return { type: TokenType.MENOS, value: "-" };
      }

      if (char === "=") {
        this.advance();
        return { type: TokenType.ATRIBUICAO, value: "=" };
      }

      if (char === ".") {
        this.advance();
        return { type: TokenType.SEMICOLON, value: ";" };
      }

      if (char === ":") {
        this.advance();
        return { type: TokenType.DOIS_PONTOS, value: ":" };
      }

      if (char === "(") {
        this.advance();
        return { type: TokenType.PARENTES_ESQUERDO, value: ":" };
      }
      if (char === ")") {
        this.advance();
        return { type: TokenType.PARENTES_DIREITO, value: ":" };
      }

      // Capturar números inteiros ou reais(sequência de dígitos)
      if (isNumber.test(char)) {
        let num = "";
        let isReal = false;

        while (isNumber.test(this.peek()) || this.peek() === ",") {
          if (this.peek() === ",") {
            if (isReal) throw new Error("Número real inválido");
            isReal = true;
            num += "."; 
            this.advance();
            continue;
          }
          num += this.peek();
          this.advance();
        }

        return {
          type: isReal ? TokenType.REAL : TokenType.INTEIRO,
          value: num,
        };
      }

      // Capturar palavras (identificadores ou palavras reservadas)
      if (isWord.test(char)) {
        var word = "";
        while (isWord.test(this.peek())) {
          word += this.peek();
          this.advance();
        }

        // Verificar se a palavra é uma palavra-chave reservada
        if (word === "VAR") return { type: TokenType.VAR, value: word };
        if (word === "EXIBIR") return { type: TokenType.EXIBIR, value: word };
        if (word === "INTEIRO") return { type: TokenType.INTEIRO, value: word };
        if (word === "REAL") return { type: TokenType.REAL, value: word };
        if (word === "NATURAL") return { type: TokenType.NATURAL, value: word };

        // Se não for palavra-chave, é um identificador (nome de variável)
        return { type: TokenType.IDENTIFICADOR, value: word };
      }
      throw new Error(`Caractere inválido: ${char}`);
    }

    // Fim do arquivo atingido
    return { type: TokenType.EOF, value: "" };
  }
}

export default Lexer;
