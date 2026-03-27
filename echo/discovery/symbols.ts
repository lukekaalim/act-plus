import ts from "typescript";
import { TypescriptContext } from "../module";
import { EchoDeclaration, EchoType } from "../reflections";
import { createId } from "../utils";

export type TSExportableDeclaration =
  | ts.VariableDeclaration
  | ts.ModuleDeclaration
  | ts.TypeAliasDeclaration
  | ts.FunctionDeclaration
  | ts.ClassDeclaration
  | ts.InterfaceDeclaration
  | ts.ExportSpecifier

export type DiscoveredDeclaration = {
  id: EchoDeclaration.ID,
  symbol: ts.Symbol,
  declarationNode: TSExportableDeclaration,
}

export type DiscoveryContext = {
  ts: TypescriptContext,
  declarations: DiscoveredDeclaration[],
}

export const discoverModule = (context: DiscoveryContext, symbols: ts.Symbol[]) => {
  for (const symbol of symbols) {
    // just find the first declaration
    const declarationNode = (symbol.getDeclarations() || [])[0];

    if (!declarationNode)
      continue;

    if (!isSupportedDeclaration(declarationNode)) {
      console.warn(`Not yet supported: ${ts.SyntaxKind[declarationNode.kind]}`)
      continue;
    }
    
    const id = createId<"EchoDeclarationID">();
    context.declarations.push({
      id,
      symbol,
      declarationNode,
    });

    if (declarationNode.kind === ts.SyntaxKind.ModuleDeclaration) {
      // Recurse into namespaces
      const symbols = context.ts.checker.getExportsOfModule(symbol);
      discoverModule(context, symbols);
    }
  }
}


const isSupportedDeclaration = (declaration: ts.Declaration): declaration is TSExportableDeclaration => {
  switch (declaration.kind) {
    case ts.SyntaxKind.VariableDeclaration:
    case ts.SyntaxKind.ExportDeclaration:
    case ts.SyntaxKind.TypeAliasDeclaration:
    case ts.SyntaxKind.ModuleDeclaration:
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.ExportSpecifier:
      return true;
    default:
      return false;
  }
}