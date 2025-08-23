import { ModifierTagSet } from "@microsoft/tsdoc";
import ts, { ClassDeclaration, FunctionDeclaration, Identifier, isIdentifier, Node, SourceFile, Statement, SyntaxKind, TypeAliasDeclaration, VariableDeclaration, VariableDeclarationList, VariableStatement } from "typescript";

export type DocTsRegistry = {
  load(): Promise<void>
};

export const createDocTsRegistry = () => {

}

export type IdentifierMap = {
  values: Map<string, Node>,
  types: Map<string, Node>,
  functions: Map<string, FunctionDeclaration>,
  classes: Map<string, ClassDeclaration>,
  typeAliases: Map<string, TypeAliasDeclaration>,
  variables: Map<string, VariableDeclaration>,
}

export const findIdentifiersInFile = (file: SourceFile) => {
  const identifiers: IdentifierMap = {
    values: new Map(),
    types: new Map(),
    functions: new Map(),
    classes: new Map(),
    typeAliases: new Map(),
    variables: new Map(),
  }

  const readStatement = (statement: Statement) => {
    switch (statement.kind) {
      case SyntaxKind.FunctionDeclaration:
        const func = statement as FunctionDeclaration;
        if (func.name)
          identifiers.functions.set(func.name.text, func);
        return;
      case SyntaxKind.ClassDeclaration:
        const class_ = statement as ClassDeclaration;
        if (class_.name)
          identifiers.classes.set(class_.name.text, class_);
        return;
      case SyntaxKind.TypeAliasDeclaration:
        const alias = statement as TypeAliasDeclaration;
        if (alias.name)
          identifiers.typeAliases.set(alias.name.text, alias);
        return;
      case SyntaxKind.VariableStatement:
        const variables = statement as VariableStatement;
        for (const variable of variables.declarationList.declarations) {
          if (isIdentifier(variable.name)) {
            const identifier = variable.name as Identifier;
            identifiers.variables.set(identifier.text, variable);
          }
        }
    }
  }

  for (const statement of file.statements)
    readStatement(statement);

  return identifiers;
}