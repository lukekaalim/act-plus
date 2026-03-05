import ts from "typescript";
import { ModuleBuildContext } from "./module";
import { createId } from "./utils";
import { EchoDeclaration } from "./reflections";

export const buildExternalReferences = (symbol: ts.Symbol, moduleName: string, context: ModuleBuildContext, qualifiers: string[] = []) => {
  const exports = context.checker.getExportsOfModule(symbol);

  for (const exportedSymbol of exports) {
    const declaration = (exportedSymbol.getDeclarations() || [])[0];
    
    switch (declaration.kind) {
      case ts.SyntaxKind.ModuleDeclaration: {
        const moduleDeclaration = declaration as ts.ModuleDeclaration;
        const moduleSymbol = context.checker.getSymbolAtLocation(moduleDeclaration.name);
        if (moduleSymbol) {
          buildExternalReferences(moduleSymbol, moduleName, context, [...qualifiers, moduleDeclaration.name.text])
        }
      }
      // need a "get name from declaration" function here
    }

    const id = createId<"EchoDeclarationID">()

    // Cheap stuff right now to get identifier
    // TODO: needs module/namespace support
    //context.externalSymbols.set(exportedSymbol, id);
    const name = [...qualifiers, exportedSymbol.getName()].join('.');
    context.exploredSymbols.set(exportedSymbol, EchoDeclaration.create(id, 'external', {
      identifier: name,
      module: moduleName,
    }))
  }
};

export const getModuleSource = (moduleName: string, currentFile: ts.SourceFile, context: ModuleBuildContext) => {
  const resolution = ts.resolveModuleName(
    moduleName,
    currentFile.fileName.startsWith('/') ? currentFile.fileName : context.host.getCurrentDirectory() + '/' + currentFile.fileName,
    context.program.getCompilerOptions(),
    context.host,
  )

  if (!resolution.resolvedModule)
    return null;

  return context.program.getSourceFile(resolution.resolvedModule.resolvedFileName) || null;
}