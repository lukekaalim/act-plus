import ts from "typescript";

/**
 * For a given arbitrary typescript syntax node, try to find
 * an appropriate comment for it.
 * @param node
 */
export const findComment = (node: ts.Node): string | null => {
  const src = node.getSourceFile();

  switch (node.kind) {
    case ts.SyntaxKind.TypeAliasDeclaration:
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.InterfaceDeclaration: {
      const declaration = node as ts.TypeAliasDeclaration | ts.FunctionDeclaration | ts.ClassDeclaration | ts.InterfaceDeclaration;
      const commentStart = declaration.getFullStart()
      const commendEnd = declaration.getStart()
      return src.text.slice(commentStart, commendEnd).trim() || null
    }

    case ts.SyntaxKind.VariableDeclaration: {
      const variableDeclaration = node as ts.VariableDeclaration;
      const parent = variableDeclaration.parent;
      // we don't handle "catch" clauses yet
      if (parent.kind !== ts.SyntaxKind.VariableDeclarationList)
        return null;

      if (parent.declarations.indexOf(variableDeclaration) === 0) {
        // This declaration is the first child, so we can check above the statement (parent) itself
        const commentStart = parent.parent.getFullStart()
        const commendEnd = parent.parent.getStart()
        return src.text.slice(commentStart, commendEnd).trim() || null
      } else {
        // otherwise, check the node itself
        const commentStart = variableDeclaration.getFullStart()
        const commendEnd = variableDeclaration.getStart()
        return src.text.slice(commentStart, commendEnd).trim() || null

      }
    }
    default:
      return null;
  }
}