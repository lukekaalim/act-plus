import ts from "typescript";
import * as tsdoc from '@microsoft/tsdoc';
import { Comment } from "../definitions";
import { ModuleBuildContext } from "./echo"

export type CommentBuilder = {

}

const EXPAND_TAG = {
  tagName: '@expand',
  tagNameWithUpperCase: '@EXPAND',
  syntaxKind: tsdoc.TSDocTagSyntaxKind.ModifierTag,
  standardization: tsdoc.Standardization.None,
  allowMultiple: false,
};

export const findSymbolsToExpand = (cx: ModuleBuildContext) => {
  const config = new tsdoc.TSDocConfiguration();
  config.addTagDefinition(EXPAND_TAG)
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

          console.log(symbol.name, hasExpandTag, preText)
          if (hasExpandTag)
            cx.symbolsToExpand.add(symbol)
        }

        break;
    }
  }
};