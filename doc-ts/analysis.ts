import { DocComment, TextRange, TSDocParser } from "@microsoft/tsdoc";
import ts, { isIdentifier, isPropertySignature, isStringLiteral, isTypeLiteralNode, SourceFile } from "typescript";

export type AnalysisFragment = {
  identifier: string,
  doc: DocComment,
  syntax:
    | ts.TypeAliasDeclaration
    | ts.TypeLiteralNode
    | ts.PropertySignature
    | ts.InterfaceDeclaration
    | ts.FunctionDeclaration
    | ts.ClassDeclaration
    | ts.VariableDeclaration,

  children: AnalysisFragment[],
};

export type SourceFileAnalysis = {
  rootIdentifiers: Map<string, AnalysisFragment>,
};

export const analyzeString = (contents: string): AnalysisFragment[] => {
  const source = ts.createSourceFile('source.ts', contents, ts.ScriptTarget.Latest, true);
  const docParser = new TSDocParser();

  const docCommentFromNode = (node: ts.Node) => {
    const context = docParser.parseRange(
      TextRange.fromStringRange(
        contents,
        node.getFullStart(),
        node.getStart(source)
      )
    );

    return context.docComment;
  }

  const analyzeTypeNode = (typeNode: ts.TypeNode, identifierPrefix: string): AnalysisFragment[] => {
    if (isTypeLiteralNode(typeNode)) {
      return typeNode.members.map(element => {
        if (isPropertySignature(element)) {
          if (isStringLiteral(element.name) || isIdentifier(element.name)) {
            const identifier = `${identifierPrefix}.${element.name.text}`
            const children = element.type ? analyzeTypeNode(element.type, identifier) : [];
            const fragment: AnalysisFragment = {
              identifier,
              children,
              doc: docCommentFromNode(element),
              syntax: element,
            }
            return [fragment];
          }
        }
        return [];
      }).flat(1);
    }
    return [];
  }

  const analyzeTypeAlias = (typeAlias: ts.TypeAliasDeclaration): AnalysisFragment[] => {
    const fragment: AnalysisFragment = {
      identifier: typeAlias.name.text,
      syntax: typeAlias,
      doc: docCommentFromNode(typeAlias),
      children: analyzeTypeNode(typeAlias.type,  typeAlias.name.text),
    };
    
    return [fragment];
  }
  const analyzeFunction = (
    typeAlias: ts.FunctionDeclaration,
    externalIdentifier?: ts.Identifier
  ): AnalysisFragment[] => {
    const identifier = typeAlias.name || externalIdentifier;
    if (!identifier)
      return [];

    const fragment: AnalysisFragment = {
      identifier: identifier.text,
      syntax: typeAlias,
      doc: docCommentFromNode(typeAlias),
      children: [],
    };

    return [fragment];
  }
  const analyzeVariableDeclaration = (variable: ts.VariableDeclaration): AnalysisFragment[] => {
    if (!isIdentifier(variable.name))
      return [];

    const fragment: AnalysisFragment = {
      identifier: variable.name.text,
      children: [],
      syntax: variable,
      doc: docCommentFromNode(variable),
    };

    return [fragment];
  }

  const analyzeStatement = (statement: ts.Statement): AnalysisFragment[] => {
    if (ts.isTypeAliasDeclaration(statement))
      return analyzeTypeAlias(statement);
      
    if (ts.isFunctionDeclaration(statement))
      return analyzeFunction(statement);

    if (ts.isVariableStatement(statement))
      return statement.declarationList.declarations
        .map(analyzeVariableDeclaration)
        .flat(1)

    return [];
  }

  return source.statements
    .map(analyzeStatement)
    .flat(1);
};
