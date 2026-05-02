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

export const findSymbolsToExpand = (cx: ModuleBuildContext) => {
  const tsDocParser = new tsdoc.TSDocParser(config);

  for (const [symbol, declarationNode] of cx.exportableDeclarationNodeBySymbol) {
    switch (declarationNode.kind) {
      case ts.SyntaxKind.TypeAliasDeclaration:
      case ts.SyntaxKind.ClassDeclaration:
      case ts.SyntaxKind.InterfaceDeclaration:
        const start = declarationNode.getStart()
        const fullStart = declarationNode.getFullStart();

        const source = declarationNode.getSourceFile();

        const preText = source.text.slice(fullStart, start).trim();

        if (preText) {
          const parserContext = tsDocParser.parseString(preText);
          const hasExpandTag = parserContext.docComment.modifierTagSet.hasTag(EXPAND_TAG);

          if (hasExpandTag)
            cx.symbolsToExpand.add(symbol)
        }

        break;
    }
  }
};

export const createCommentBuilder = (cx: ModuleBuildContext) => {
  const parser = new tsdoc.TSDocParser(config);
  
  const readCommentForNodeAndSymbol = (node: ts.Node, symbol: ts.Symbol) => {
    const identifier = cx.identifierBySymbol.get(symbol);
    if (!identifier)
      return;
    const start = node.getFullStart();
    const end = node.getStart();
    const commentText = node.getSourceFile().text.slice(start, end).trim();
    if (!commentText)
      return;

    const commentContext = parser.parseString(commentText);
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
      case ts.SyntaxKind.ModuleDeclaration:
        return;
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
      case ts.SyntaxKind.TypeAliasDeclaration: {
        const typeAlias = node as ts.TypeAliasDeclaration;
        const symbol = cx.ts.checker.getSymbolAtLocation(typeAlias.name);
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