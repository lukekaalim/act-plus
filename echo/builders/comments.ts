import ts from "typescript";
import * as tsdoc from '@microsoft/tsdoc';
import { Comment } from "../definitions";
import { ModuleBuildContext } from "./echo"
import { createId } from "../utils";

export type CommentBuilder = {

}

const EXPAND_TAG = {
  tagName: '@expand',
  tagNameWithUpperCase: '@EXPAND',
  syntaxKind: tsdoc.TSDocTagSyntaxKind.ModifierTag,
  standardization: tsdoc.Standardization.None,
  allowMultiple: false,
};
const config = new tsdoc.TSDocConfiguration();
config.addTagDefinition(EXPAND_TAG)
const tsDocParser = new tsdoc.TSDocParser(config);


export const findSymbolsToExpand = (cx: ModuleBuildContext) => {
  // Check every exported symbol for a tsdoc comment "@expand" tag
  for (const [symbol, declarationNode] of cx.exportableDeclarationNodeBySymbol) {
    processSymbolForTsDocContext(cx, symbol, declarationNode)
  }
};

export const processSymbolForTsDocContext = (
  cx: ModuleBuildContext,
  symbol: ts.Symbol,
  declaration: ts.Node = (symbol.declarations || [])[0],
): null | tsdoc.ParserContext => {
  if (!declaration) {
    cx.tsdocContextBySymbol.set(symbol, null);
    return null;
  }
  // check for existing symbol
  if (cx.tsdocContextBySymbol.has(symbol)) {
    return cx.tsdocContextBySymbol.get(symbol) || null;
  }

  // parse the comment
  const start = declaration.getFullStart();
  const end = declaration.getStart();

  const commentText = declaration.getSourceFile().text.slice(start, end).trim();
  if (!commentText) {
    cx.tsdocContextBySymbol.set(symbol, null);
    return null;
  }

  const commentContext = tsDocParser.parseString(commentText);

  const hasExpandTag = commentContext.docComment.modifierTagSet.hasTag(EXPAND_TAG);

  if (hasExpandTag)
    cx.symbolsToExpand.add(symbol)

  cx.tsdocContextBySymbol.set(symbol, commentContext);
  return commentContext;
}

export const createCommentBuilder = (cx: ModuleBuildContext) => {
  const readCommentForNodeAndSymbol = (node: ts.Node, symbol: ts.Symbol) => {
    const identifier = cx.identifierBySymbol.get(symbol);
    if (!identifier)
      return;

    const commentContext = processSymbolForTsDocContext(cx, symbol, node);

    if (!commentContext)
      return;

    const reprintedComment = commentContext.docComment.emitAsTsdoc()

    const comment: Comment = {
      id: createId(),
      text: reprintedComment,
      identifier,
      memberName: null,
    }
    cx.comments.set(comment.id, comment);
  }

  const readCommentForNode = (node: ts.Node) => {
    switch (node.kind) {
      case ts.SyntaxKind.VariableDeclaration: {
        const variableDeclaration = node as ts.VariableDeclaration;
        const symbol = cx.ts.checker.getSymbolAtLocation(variableDeclaration.name);
        if (!symbol)
          return;
        if (variableDeclaration.parent.kind !== ts.SyntaxKind.VariableDeclarationList)
          return;
        const variableDeclarationList = variableDeclaration.parent;

        const declarationIndex = variableDeclarationList.declarations.indexOf(variableDeclaration);
        if (declarationIndex !== 0) {
          // if not the first declaration, check the comment at the child declaration
          return readCommentForNodeAndSymbol(variableDeclaration, symbol);
        }
        // otherwise, check the comment for the statement itself

        if (variableDeclarationList.parent.kind !== ts.SyntaxKind.VariableStatement)
          return;
        const variableStatement = variableDeclarationList.parent;
        return readCommentForNodeAndSymbol(variableStatement, symbol);
      }
      case ts.SyntaxKind.FunctionDeclaration:
      case ts.SyntaxKind.ClassDeclaration:
      case ts.SyntaxKind.ModuleDeclaration:
      case ts.SyntaxKind.TypeAliasDeclaration: {
        const declaration = node as ts.TypeAliasDeclaration | ts.ModuleDeclaration | ts.ClassDeclaration | ts.FunctionDeclaration | ts.NamespaceDeclaration;
        if (!declaration.name)
          return;
        const symbol = cx.ts.checker.getSymbolAtLocation(declaration.name);
        if (!symbol)
          return;

        return readCommentForNodeAndSymbol(node, symbol);
      }
      default:
        console.warn(`Not searching for comment in node: "${ts.SyntaxKind[node.kind]}"`)
        return;
    }
  }

  return { readCommentForNode };
};

export const buildComments = (cx: ModuleBuildContext) => {
  const builder = createCommentBuilder(cx);

  for (const node of cx.exportableDeclarationNodeBySymbol.values()) {
    builder.readCommentForNode(node);
  }
}