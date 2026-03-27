import ts from "typescript";
import { PackageFileReferenceInfo, TypeBuildContext } from "../types";
import { EchoDeclaration, EchoType } from "../reflections";
import { createId, OpaqueID } from "../utils";


// TODO: ADD REFERENCE PROMOTION

export type EchoExternalReference = {
  id: EchoExternalReferenceID,
  module: string,
  identifier: string,
};
export type EchoExternalReferenceID = OpaqueID<"EchoExternalReferenceID">;

export type ExternalTypeBuilder = {
  //explorePackageSymbols(symbol: ts.Symbol): void,
  //buildExternalTypeFromSymbol(symbol: ts.Symbol): EchoDeclaration.External,
  //findPackageFromSourceFile(sourceFile: ts.SourceFile): null | PackageFileReferenceInfo,
  //findSourceFileForNode(node: ts.Node): null | ts.SourceFile,

  //getReferenceTargetFromSymbol(symbol: ts.Symbol): EchoType.Reference["target"] | null,

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
export const createExternalTypeBuilder = (context: TypeBuildContext): ExternalTypeBuilder => {
  const { checker, host, program } = context.ts;

  const addReference = (symbol: ts.Symbol, module: string): EchoExternalReference => {
    const reference: EchoExternalReference = {
      id: createId(),
      module,
      identifier: symbol.name,
    };
    context.references.set(reference.id, reference);
    context.referenceBySymbol.set(symbol, reference.id);
    return reference;
  }
  const addPendingReference = (symbol: ts.Symbol, module: string) => {
    const reference: EchoExternalReference = {
      id: createId(),
      module,
      identifier: symbol.name,
    };
    context.unusedReferences.set(reference.id, reference);
    context.referenceBySymbol.set(symbol, reference.id);
    return reference;
  }

  const createExternalDeclarationsFromSourcefileExports = (sourceFile: ts.SourceFile, moduleNameAlias?: string) => {
    const symbol = checker.getSymbolAtLocation(sourceFile);

    if (!symbol)
      throw new Error(`No symbol for sourcefile "${sourceFile.fileName}"`);


    const sourceFileExports = checker.getExportsOfModule(symbol);
    const moduleName = moduleNameAlias || sourceFile.fileName;

    for (const exportedSymbol of sourceFileExports) {
      addPendingReference(exportedSymbol, moduleName);
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
    if (context.exploredSymbols.has(symbol))
      return;

    context.exploredSymbols.add(symbol);

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
      if (context.packages.has(packageInfo.package))
        return;

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
        return;
        //throw new Error(`Could not find source file "${moduleReference.resolvedModule.resolvedFileName}"`)
      }
      context.packages.set(packageInfo.package, packageSourceFile);
      
      createExternalDeclarationsFromSourcefileExports(packageSourceFile, packageInfo.package);
    }
  };

  const buildExternalTypeFromSymbol = (symbol: ts.Symbol) => {
    const declaration = (symbol.declarations || [])[0];

    if (!declaration)
      return addReference(symbol, '<Mystery Land>')

    const sourceFile = findSourceFileForNode(declaration);

    if (!sourceFile)
      throw new Error(`Symbol ${symbol.name} is has no source file`);


    const packageInfo = findPackageFromSourceFile(sourceFile);

    if (packageInfo) {
      return addReference(symbol, [packageInfo.package, packageInfo.relativePath].filter(Boolean).join('/'))
    } else {
      const filename = sourceFile.fileName.startsWith('/')
        ? sourceFile.fileName
        : program.getCurrentDirectory() + sourceFile.fileName;

      return addReference(symbol, filename)
    }
  }


  const getReferenceTargetFromSymbol = (symbol: ts.Symbol): EchoType.Reference["target"] | null => {
    if (symbol.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol)

    const internalDeclaration = context.declarationBySymbol.get(symbol);

    if (internalDeclaration) {
      return { type: 'declaration', id: internalDeclaration }
    }

    explorePackageSymbols(symbol);

    const externalReference = context.referenceBySymbol.get(symbol);
    
    if (externalReference) {
      if (context.references.has(externalReference))
        return { type: 'reference', id: externalReference }

      const unusedReference = context.unusedReferences.get(externalReference);
      if (unusedReference) {
        // promoted into main reference
        context.references.set(unusedReference.id, unusedReference);
        return { type: 'reference', id: externalReference }
      }
    }


    return null;
  }

  const getSymbolTarget = (symbol: ts.Symbol): EchoType.Reference["target"] => {
    const existingReference = getReferenceTargetFromSymbol(symbol);
    if (existingReference)
      return existingReference

    // Otherwise, create a new entry in the "external symbols" table.
    const newReference = buildExternalTypeFromSymbol(symbol);
    return { type: 'reference', id: newReference.id }
  }

  return {
    //getReferenceTargetFromSymbol,
    //explorePackageSymbols,
    //buildExternalTypeFromSymbol,
    //findPackageFromSourceFile,
    //findSourceFileForNode,

    getSymbolTarget,
  }
};