import ts from "typescript";
import { IdentifierID } from "../definitions/identifiers";
import { TSExportableDeclaration } from "./symbols";
import { createId } from "../utils";
import { ModuleBuildContext } from "./echo";
import { createTypeBuilder } from "./types/builder";
import { TypeID } from "../definitions/type";

export const buildIdentifiers = (cx: ModuleBuildContext) => {
  const typeBuilder = createTypeBuilder(cx);

  const buildIdentifier = (symbol: ts.Symbol, declarationNode: TSExportableDeclaration) => {
    if (!declarationNode.name || declarationNode.name.kind !== ts.SyntaxKind.Identifier)
      throw new Error(`Name is too complex`)

    const id = cx.identifierBySymbol.get(symbol) as IdentifierID;
    const name = declarationNode.name.text;

    switch (declarationNode.kind) {
      case ts.SyntaxKind.VariableDeclaration: {
        if (declarationNode.type) {
          cx.identifiers.set(id, {
            type: 'value',
            id,
            name,
            typeId: typeBuilder.fromAnyNode(declarationNode.type)
          })
        } else {
          const inferredType = cx.ts.checker.getTypeAtLocation(declarationNode);
          cx.identifiers.set(id, {
            type: 'value',
            id,
            name,
            typeId: typeBuilder.fromTypeInstance(inferredType)
          })
        }
        return;
      }
      
      case ts.SyntaxKind.FunctionDeclaration: {
        cx.identifiers.set(id, {
          type: 'value',
          id,
          name,
          typeId: typeBuilder.fromFunctionDeclaration(declarationNode)
        })
        return;
      }
      case ts.SyntaxKind.ClassDeclaration: {
        cx.identifiers.set(id, {
          type: 'type',
          id,
          name,
          parameters: (declarationNode.typeParameters || []).map(typeBuilder.fromTypeParameterDeclaration),
          typeId: typeBuilder.fromClassDeclaration(declarationNode)
        })
        return;
      }
      case ts.SyntaxKind.TypeAliasDeclaration: {
        cx.identifiers.set(id, {
          type: 'type',
          id,
          name,
          parameters: (declarationNode.typeParameters || []).map(typeBuilder.fromTypeParameterDeclaration),
          typeId: typeBuilder.fromAnyNode(declarationNode.type)
        })
        return;
      }
      case ts.SyntaxKind.InterfaceDeclaration: {
        cx.identifiers.set(id, {
          type: 'type',
          id,
          name,
          parameters: (declarationNode.typeParameters || []).map(typeBuilder.fromTypeParameterDeclaration),
          typeId: typeBuilder.fromInterfaceDeclaration(declarationNode)
        })
        return;
      }
      case ts.SyntaxKind.ModuleDeclaration: {
        const typeId: TypeID = createId();
        const namespaceExports = cx.symbolsByNamespaceSymbol.get(symbol) as ts.Symbol[];
        const namespaceIdentifiers = namespaceExports.map(symbol => cx.identifierBySymbol.get(symbol) as IdentifierID);

        cx.types.set(typeId, {
          type: 'namespace',
          id: typeId,
          name,
          exports: namespaceIdentifiers
        })
        cx.identifiers.set(id, {
          type: 'value',
          id,
          name,
          typeId,
        })
        return;
      }
        
      case ts.SyntaxKind.ExportSpecifier:
      default:
        throw new Error(`Declaration Kind "${ts.SyntaxKind[declarationNode.kind]}" not yet supported`)
    }
  }

  for (const [symbol, declarationNode] of cx.exportableDeclarationNodeBySymbol) {
    buildIdentifier(symbol, declarationNode);
  }
};
