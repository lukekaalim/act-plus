import { DocComment, TextRange, TSDocParser } from "@microsoft/tsdoc";
import ts, { isIdentifier, isMethodSignature, isPropertySignature, isStringLiteral, isTypeLiteralNode, SourceFile } from "typescript";

/**
 * Not every kind of typescript node is a valid target
 * for an AnalysisFragment - only Nodes of this kind are
 * allowed inside a Fragment.
 */
export type SupportedAnalysisTypescriptNode =
  | ts.TypeAliasDeclaration
  | ts.TypeLiteralNode
  | ts.PropertySignature
  | ts.MethodSignature
  | ts.InterfaceDeclaration
  | ts.FunctionDeclaration
  | ts.ClassDeclaration
  | ts.VariableDeclaration

export type AnalysisFragment = {
  //parent: AnalysisFragment | null,
  identifier: string,
  doc: DocComment,
  syntax: SupportedAnalysisTypescriptNode,

  children: AnalysisFragment[],
};

export type SourceFileAnalysis = {
  source: ts.SourceFile
  allFragments: AnalysisFragment[],
  typeByIdentifier: Map<string, AnalysisFragment>,
  valueByIdentifier: Map<string, AnalysisFragment>,
};

/**
 * Climb the AST of a typescript source file, generating AnalysisFragments
 * for various notable elements and pairing them up with TsDoc comments.
 * 
 * @param source 
 * @returns SourceFileAnalysis
 */
export const analyzeSourceFile = (source: ts.SourceFile): SourceFileAnalysis => {
  //const source = ts.createSourceFile('source.ts', contents, ts.ScriptTarget.Latest, true);
  const docParser = new TSDocParser();
  
  const analysis: SourceFileAnalysis = {
    source,
    allFragments: [],
    typeByIdentifier: new Map(),
    valueByIdentifier: new Map(),
  }

  const docCommentFromNode = (node: ts.Node) => {
    const context = docParser.parseRange(
      TextRange.fromStringRange(
        source.text,
        node.getFullStart(),
        node.getStart()
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
            analysis.typeByIdentifier.set(identifier, fragment)
            return [fragment];
          }
        }
        if (ts.isMethodSignature(element)) {
          if (!isStringLiteral(element.name) && !isIdentifier(element.name))
            return [];
          
          const identifier = `${identifierPrefix}.${element.name.text}`
          const children = element.type ? analyzeTypeNode(element.type, identifier) : [];
          const fragment: AnalysisFragment = {
            identifier,
            children,
            doc: docCommentFromNode(element),
            syntax: element,
          }
          analysis.typeByIdentifier.set(identifier, fragment)
          return [fragment];
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
    analysis.allFragments.push(fragment);
    analysis.typeByIdentifier.set(typeAlias.name.text, fragment);
    
    return [fragment];
  }
  const analyzeFunction = (
    typeAlias: ts.FunctionDeclaration,
    externalIdentifier?: ts.Identifier
  ): AnalysisFragment[] => {
    const identifier = externalIdentifier || typeAlias.name;
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
  const analyzeVariableDeclaration = (
    variable: ts.VariableDeclaration,
    onlyChild: boolean = false
  ): AnalysisFragment[] => {
    if (!isIdentifier(variable.name))
      return [];

    const parentStatement = variable.parent.parent;

    const fragment: AnalysisFragment = {
      identifier: variable.name.text,
      children: [],
      syntax: variable,
      doc: docCommentFromNode(onlyChild ? parentStatement : variable),
    };
    analysis.allFragments.push(fragment);
    analysis.valueByIdentifier.set(variable.name.text, fragment);

    return [fragment];
  }

  const analyzeStatement = (statement: ts.Statement) => {
    if (ts.isTypeAliasDeclaration(statement))
      return analyzeTypeAlias(statement);
      
    if (ts.isFunctionDeclaration(statement))
      return analyzeFunction(statement);

    if (ts.isVariableStatement(statement)) {
      const onlyChild = statement.declarationList.declarations.length === 1;
      for (const declaration of statement.declarationList.declarations) {
        analyzeVariableDeclaration(declaration, onlyChild)
      }
    }
  }

  for (const statement of source.statements) {
    analyzeStatement(statement);
  }

  return analysis;
};


