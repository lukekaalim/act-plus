import ts from "typescript";
import { ModuleBuildContext } from "../module";
import { PackageFileReferenceInfo } from "../types";
import { EchoDeclaration, EchoType } from "../reflections";
import { createId } from "../utils";

export type ExternalTypeContext = {
  parametricTypes: Map<ts.Symbol, EchoDeclaration.TypeParameter>,
  module: ModuleBuildContext,
}

export type ExternalTypeBuilder = {
  explorePackageSymbols(symbol: ts.Symbol): void,
  buildExternalTypeFromSymbol(symbol: ts.Symbol): EchoDeclaration.External,
  findPackageFromSourceFile(sourceFile: ts.SourceFile): null | PackageFileReferenceInfo,
  findSourceFileForNode(node: ts.Node): null | ts.SourceFile,

  getReferenceTargetFromSymbol(symbol: ts.Symbol): EchoType.Reference["target"] | null,
  getSymbolTarget(symbol: ts.Symbol): EchoType.Reference["target"],
}

/**
 * The ExternalTypeBuilder can be given some symbol, and it will (in order)
 *  - Find which package the symbol is declared
 *  - find all exports from that package
 *  - add them to the "explored symbols" table
 * 
 * Thus afterwards, when resolving a symbol, you can check to see if it is
 * in the explored symbols table, and if you, you can easily create a "nice"
 * external reference to it.
 * 
 * Failure cases here might be:
 *  - 
 * 
 * @param context provided from the root ModuleBuilder
 * @returns 
 */
export const createExternalTypeBuilder = (context: ExternalTypeContext): ExternalTypeBuilder => {
  const { checker, host, program,
    exploredPackagesModules, exploredSymbols, internalSymbols,
    externalSymbols, references } = context.module;

  const createExternalDeclarationsFromSourcefileExports = (sourceFile: ts.SourceFile, moduleNameAlias?: string) => {
    const symbol = checker.getSymbolAtLocation(sourceFile);

    if (!symbol)
      throw new Error(`No symbol for sourcefile "${sourceFile.fileName}"`);

    if (exploredPackagesModules.has(symbol))
      return console.log('We have been here before...');

    console.log(`Looking through ${moduleNameAlias} for external exports`)

    exploredPackagesModules.add(symbol);
    const sourceFileExports = checker.getExportsOfModule(symbol);
    const moduleName = moduleNameAlias || sourceFile.fileName;

    for (const exportedSymbol of sourceFileExports) {
      const declaration = EchoDeclaration.create(createId(), 'external', { identifier: exportedSymbol.name, module: moduleName })
      exploredSymbols.set(exportedSymbol, declaration);
    }
  };

  const findPackageFromSourceFile = (sourceFile: ts.SourceFile): null | PackageFileReferenceInfo => {
    const filename = sourceFile.fileName;

    const pathSegments = filename.startsWith('/')
      ? filename.split('/')
      : (host.getCurrentDirectory() + '/' + filename).split('/');

    for (let i = 0; i < pathSegments.length; i++) {
      const directory = pathSegments.slice(0, pathSegments.length - i - 1).join('/');
      const packageJSONFile = host.readFile(directory + '/package.json')

      if (packageJSONFile) {
        const packageJSON = JSON.parse(packageJSONFile);
        if (packageJSON['name']) {
          const relativePath = pathSegments.slice(pathSegments.length - i - 1).join('/');
          const packagePath = pathSegments.slice(0, pathSegments.length - i - 1).join('/')

          return {
            package: packageJSON['name'],
            packagePath,
            relativePath,
          }
        }
      }
    }

    return null;
  }

  const findSourceFileForNode = (node: ts.Node): null | ts.SourceFile => {
    let currentNode: ts.Node | null = node;

    while (currentNode && currentNode.kind !== ts.SyntaxKind.SourceFile) {
      currentNode = currentNode.parent;
    }

    if (!currentNode)
      return null;

    return currentNode as ts.SourceFile;
  }

  /**
   * Explore all the symbols that belong to the package
   * that the provided symbol is from (via its first declaration)
   * @param symbol
   * @returns 
   */
  const explorePackageSymbols = (symbol: ts.Symbol) => {
    const declaration = (symbol.declarations || [])[0];

    if (!declaration)
      return;

    const sourceFile = findSourceFileForNode(declaration);

    if (!sourceFile)
      return;

    const filename = sourceFile.fileName.startsWith('/')
      ? sourceFile.fileName
      : program.getCurrentDirectory() + sourceFile.fileName;

    const packageInfo = findPackageFromSourceFile(sourceFile);

    if (packageInfo) {
      const moduleReference = ts.resolveModuleName(
        packageInfo.package,
        filename,
        program.getCompilerOptions(),
        host,
        undefined,
        undefined,
        ts.ModuleKind.ESNext
      );
      if (!moduleReference.resolvedModule) {
        throw new Error(`Could not resolve module "${packageInfo.package}"`)
      }
      const packageSourceFile = program.getSourceFile(moduleReference.resolvedModule.resolvedFileName)
      if (!packageSourceFile) {
        return null;
        //throw new Error(`Could not find source file "${moduleReference.resolvedModule.resolvedFileName}"`)
      }
      console.log(`These declarations belong to ${packageInfo.package}:`)
      console.log('============')
      createExternalDeclarationsFromSourcefileExports(packageSourceFile, packageInfo.package);
      console.log('============')
    } else {
      // no package to search

      
    }
  };

  const buildExternalTypeFromSymbol = (symbol: ts.Symbol) => {
    const declaration = (symbol.declarations || [])[0];

    if (!declaration)
      return EchoDeclaration.create(createId(), 'external', {
        identifier: symbol.name,
        module: 'Undeclared',
      })

    const sourceFile = findSourceFileForNode(declaration);

    if (!sourceFile)
      throw new Error(`Symbol ${symbol.name} is has no source file`);

    const filename = sourceFile.fileName.startsWith('/')
      ? sourceFile.fileName
      : program.getCurrentDirectory() + sourceFile.fileName;

    const packageInfo = findPackageFromSourceFile(sourceFile);

    if (packageInfo) {
      return EchoDeclaration.create(createId(), 'external', {
        identifier: symbol.name,
        module: [packageInfo.package, packageInfo.relativePath].join('/'),
      })
    } else {
      return EchoDeclaration.create(createId(), 'external', {
        identifier: symbol.name,
        module: filename
      });
    }
  }


  const getReferenceTargetFromSymbol = (symbol: ts.Symbol): EchoType.Reference["target"] | null => {
    if (symbol.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol)

    
    const genericParameter = context.parametricTypes.get(symbol);

    if (genericParameter) {
      return { type: 'generic', id: genericParameter.id }
    }

    const internalDeclaration = internalSymbols.get(symbol);

    if (internalDeclaration) {
      return { type: 'internal', id: internalDeclaration }
    }

    const externalDeclaration = externalSymbols.get(symbol);
    
    if (externalDeclaration) {
      return { type: 'external', id: externalDeclaration }
    }

    explorePackageSymbols(symbol);
    const exploredDeclaration = exploredSymbols.get(symbol);

    if (exploredDeclaration) {
      externalSymbols.set(symbol, exploredDeclaration.id);
      references.push(exploredDeclaration);

      return { type: 'external', id: exploredDeclaration.id };
    }

    return null;
  }

  const getSymbolTarget = (symbol: ts.Symbol): EchoType.Reference["target"] => {
    const existingReference = getReferenceTargetFromSymbol(symbol);
    if (existingReference)
      return existingReference

    // Otherwise, create a new entry in the "external symbols" table.
    const declaration = buildExternalTypeFromSymbol(symbol);
    references.push(declaration);
    externalSymbols.set(symbol, declaration.id);
    return { type: 'external', id: declaration.id };
  }

  return {
    getReferenceTargetFromSymbol,
    explorePackageSymbols,
    buildExternalTypeFromSymbol,
    findPackageFromSourceFile,
    findSourceFileForNode,

    getSymbolTarget,
  }
};