import ts from "typescript";
import { EchoDeclaration } from "../reflections";
import { DiscoveredDeclaration, DiscoveryContext } from "./symbols";
import { createTypeBuilder2, TypeBuildContext } from "../types";
import { TypescriptContext } from "../module";
import { TextRange, TSDocParser } from "@microsoft/tsdoc";
import { findComment } from "./comments";


export const generateDeclarationFromDiscovery = (discovered: DiscoveredDeclaration, context: TypeBuildContext): EchoDeclaration => {
  if (!discovered.declarationNode.name || discovered.declarationNode.name.kind !== ts.SyntaxKind.Identifier)
    return EchoDeclaration.create(discovered.id, 'unsupported', { identifier: "???", message: 'Name too complex' })

  const identifier = discovered.declarationNode.name.text;
  const types = createTypeBuilder2(context);

  switch (discovered.declarationNode.kind) {
    case ts.SyntaxKind.ModuleDeclaration:
      const exportedSymbols = context.ts.checker.getExportsOfModule(discovered.symbol);
      return EchoDeclaration.create(discovered.id, "namespace", {
        identifier,
        exports: exportedSymbols.map(symbol => context.declarationBySymbol.get(symbol) as EchoDeclaration.ID),
      })
    case ts.SyntaxKind.TypeAliasDeclaration:
      const parameters = (discovered.declarationNode.typeParameters || []).map(typeParameter => {
        return types.declarations.fromTypeParameterDeclaration(typeParameter)
      })
      return EchoDeclaration.create(discovered.id, 'type', {
        identifier,
        declares: types.declarations.fromAnyTypeNode(discovered.declarationNode.type),
        parameters,
      })
    case ts.SyntaxKind.FunctionDeclaration:
      return EchoDeclaration.create(discovered.id, 'function', {
        identifier,
        signature: types.instances.fromType(context.ts.checker.getTypeOfSymbol(discovered.symbol))
      })
    case ts.SyntaxKind.VariableDeclaration:
      if (discovered.declarationNode.type) {
        return EchoDeclaration.create(discovered.id, 'variable', {
          identifier,
          typeof: types.declarations.fromAnyTypeNode(discovered.declarationNode.type)
        })
      }
      return EchoDeclaration.create(discovered.id, 'variable', {
        identifier,
        typeof: types.instances.fromType(context.ts.checker.getTypeOfSymbol(discovered.symbol))
      })
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.InterfaceDeclaration:
      return EchoDeclaration.create(discovered.id, 'unsupported', { identifier, message: 'In development' })
    case ts.SyntaxKind.ExportSpecifier:
      const exportedType = context.ts.checker.getTypeAtLocation(discovered.declarationNode);

      return EchoDeclaration.create(discovered.id, 'variable', {
        identifier,
        typeof: types.instances.fromType(exportedType)
      })
    default:
      throw new Error(`Im missing a declaration kind`)
  }
}