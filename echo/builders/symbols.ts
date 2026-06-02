import ts from "typescript";
import { createId } from "../utils";
import { ModuleBuildContext } from "./echo";

/**
 * We only support a subset of all nodes that we consider
 * documentable. This type encapsulates them all.
 */
export type TSExportableDeclaration =
  | ts.VariableDeclaration
  | ts.ModuleDeclaration
  | ts.TypeAliasDeclaration
  | ts.FunctionDeclaration
  | ts.ClassDeclaration
  | ts.InterfaceDeclaration
  | ts.ExportSpecifier
  | ts.NamespaceExport


export const discoverExportableSymbols = (cx: ModuleBuildContext) => {
  const moduleSymbol = cx.ts.checker.getSymbolAtLocation(cx.source);

  if (!moduleSymbol)
    throw new Error(`${cx.source.fileName} has no symbol??`)

  const moduleExportedSymbols = cx.ts.checker.getExportsOfModule(moduleSymbol);
  cx.visitedModules.add(moduleSymbol);
  cx.symbolsByNamespaceSymbol.set(moduleSymbol, moduleExportedSymbols);

  const discoverAllExportableSymbols = (symbols: ts.Symbol[]) => {
    for (const symbol of symbols) {
      // just find the first declaration
      const declarationNode = (symbol.getDeclarations() || [])[0];

      if (!declarationNode)
        continue;

      if (!isSupportedDeclaration(declarationNode)) {
        console.warn(`Not yet supported: ${ts.SyntaxKind[declarationNode.kind]}`)
        continue;
      }
      
      cx.exportableDeclarationNodeBySymbol.set(symbol, declarationNode);
      const id = createId<"IdentifierID">();

      cx.identifierBySymbol.set(symbol, id);

      if (declarationNode.kind === ts.SyntaxKind.ModuleDeclaration) {
        // Recurse into namespaces
        const symbols = cx.ts.checker.getExportsOfModule(symbol);
        cx.symbolsByNamespaceSymbol.set(symbol, symbols);
        discoverAllExportableSymbols(symbols);
      }
      if (declarationNode.kind === ts.SyntaxKind.NamespaceExport) {
        const declaration = declarationNode.parent.moduleSpecifier as ts.StringLiteral;
        const path = declarationNode.getSourceFile().fileName.startsWith('/')
          ? declarationNode.getSourceFile().fileName
          : cx.ts.host.getCurrentDirectory() + '/' + declarationNode.getSourceFile().fileName

        // Resolve the filename
        const declarationResolution = ts.resolveModuleName(
          declaration.text,
          path,
          cx.ts.program.getCompilerOptions(),
          cx.ts.host
        )
        
        if (!declarationResolution.resolvedModule) {
          throw new Error(`Could not resolve "${declaration.text}" from "${path}"`);
        }

        const filename = declarationResolution.resolvedModule.resolvedFileName;
        const sourceFile = cx.ts.program.getSourceFile(filename);
        if (!sourceFile)
          throw new Error();

        const sourceSymbol = cx.ts.checker.getSymbolAtLocation(sourceFile);
        if (!sourceSymbol)
          throw new Error();

        const symbols = cx.ts.checker.getExportsOfModule(sourceSymbol);
        cx.symbolsByNamespaceSymbol.set(symbol, symbols);
        discoverAllExportableSymbols(symbols);
      }
    }
  }

  discoverAllExportableSymbols(moduleExportedSymbols);
};


export const isSupportedDeclaration = (declaration: ts.Declaration): declaration is TSExportableDeclaration => {
  switch (declaration.kind) {
    case ts.SyntaxKind.VariableDeclaration:
    case ts.SyntaxKind.ExportDeclaration:
    case ts.SyntaxKind.TypeAliasDeclaration:
    case ts.SyntaxKind.ModuleDeclaration:
    case ts.SyntaxKind.FunctionDeclaration:
    case ts.SyntaxKind.ExportSpecifier:
    case ts.SyntaxKind.ClassDeclaration:
    case ts.SyntaxKind.InterfaceDeclaration:
    case ts.SyntaxKind.NamespaceExport:
      return true;
    default:
      return false;
  }
}