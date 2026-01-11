import ASTNode from "../parser/IParser";

/**
 * O SemanticAnalyzer percorre a AST para validar semântica e executar os comandos.
 * Ele mantém uma tabela de símbolos para armazenar valores de variáveis.
 */
class SemanticAnalyzer {
  // Tabela de símbolos: mapeia nomes de variáveis para seus valores numéricos
  private simbols: Record<string, number> = {};

  /**
   * Executa a lista de comandos representada pela AST.
   */
  public execute(ast: ASTNode[]) {
    for (const node of ast) {
      this.visit(node);
    }
  }

  /**
   * Função recursiva que "visita" cada nó da AST e executa a lógica correspondente.
   */
  private visit(node: ASTNode): any {
    switch (node.type) {
      // Declaração de variável: avalia a expressão e armazena no dicionário
      case "VariableDeclaration":
        const value = this.visit(node.value);
        this.simbols[node.id] = value;
        break;

      // Comando print: avalia a expressão e imprime o resultado no console
      case "PrintStatement":
        console.log(this.visit(node.value));
        break;

      // Valor literal: retorna o próprio número
      case "NumberLiteral":
        return node.value;

      // Identificador: busca o valor na tabela de símbolos ou lança erro se não declarado
      case "IDENTIFICADOR":
        if (!(node.name in this.simbols)) {
          throw new Error(
            `Erro semântico: variavel ${node.name} não foi declarada`
          );
        }
        return this.simbols[node.name];

      // Expressão binária: executa a operação matemática entre os dois lados
      case "BinaryExpression":
        switch (node.operator) {
          case "+":
            return this.visit(node.left) + this.visit(node.right);
          case "-":
            return this.visit(node.left) - this.visit(node.right);
          case "*":
            return this.visit(node.left) * this.visit(node.right);
          case "/":
            const left = this.visit(node.left);
            const right = this.visit(node.right);
            // Validação semântica: divisão por zero
            if (right === 0) {
              throw new Error(
                `Expressão mal definida: ${left} ${node.operator} ${right} . Não é possível divisaoir por zero`
              );
            }
            return left / right;
        }
        break;
    }
  }
}

export default SemanticAnalyzer;
