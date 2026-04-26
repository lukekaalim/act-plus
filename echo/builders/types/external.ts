import ts from "typescript";
import { TypeBuilder } from "./builder";
import { Identifier, IdentifierID } from "../../definitions/identifiers";
import { ModuleBuildContext } from "../echo";
import { createId } from "../../utils";
import { isSupportedDeclaration } from "../symbols";

export type PackageFileReferenceInfo = {
  package: string,
  packagePath: string,
  relativePath?: null | string,
}

export type ExternalTypeBuilder = {
  getIdentifierFromSymbol(symbol: ts.Symbol): null | IdentifierID,
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
export const createExternalTypeBuilder = (cx: ModuleBuildContext, builder: TypeBuilder) => {
  const { checker, host, program } = cx.ts;

  // for a given symbol, what module is it a part of
  const moduleNameFromSymbol = new Map<ts.Symbol, string>();
  // for a given symbol, what it it's qualified name
  const qualifiedNameForSymbol = new Map<ts.Symbol, string>();

  const visitedModules = new Set<ts.Symbol>();

  const getIdentifierFromSymbol = (symbol: ts.Symbol): null | IdentifierID => {
    const id: IdentifierID = cx.identifierBySymbol.get(symbol) || createId();

    if (cx.identifiers.has(id))
      return id;

    let identifier: Identifier;

    const declaration = (symbol.declarations || [])[0] as ts.Declaration;
    if (!declaration) {
      console.warn(`Requested reference for undeclared symbol (${symbol.name})`)
      identifier = {
        id,
        type: 'external',
        name: symbol.name,
        moduleName: 'A Mystery',
      };
      cx.identifiers.set(id, identifier);
      cx.identifierBySymbol.set(symbol, id);
      return identifier.id;
    }

    const sourceFile = declaration.getSourceFile();

    visitModule(sourceFile);

    if (moduleNameFromSymbol.has(symbol) && qualifiedNameForSymbol.has(symbol)) {
      const name = qualifiedNameForSymbol.get(symbol) as string;
      const moduleName = moduleNameFromSymbol.get(symbol) as string;

      identifier = {
        id,
        type: 'external',
        name,
        moduleName,
      };
    } else {
      // this symbol is not from a "nice" export, i.e. the
      // export of a package (might be an internal export from
      // a different file).
      const packageInfo = findPackageFromSourceFile(sourceFile);
      switch (declaration.kind) {
        case ts.SyntaxKind.ImportSpecifier: {
          const importSpecifier = declaration as ts.ImportSpecifier;
          const importDeclaration = importSpecifier.parent.parent.parent;
          if (importDeclaration.kind === ts.SyntaxKind.JSDocImportTag)
            throw new Error(`JSDOC not supported yet`);

          const importExpression = importDeclaration.moduleSpecifier as ts.StringLiteral;
          
          identifier = {
            id,
            type: 'external',
            name: importSpecifier.name.text,
            moduleName: importExpression.text
          }
          break;
        }
        default: {
          if (!isSupportedDeclaration(declaration))
            return null;
          if (!packageInfo) {
            identifier = {
              id,
              type: 'external',
              name: symbol.name,
              moduleName: sourceFile.fileName,
            };
          } else {
            identifier = {
              id,
              type: 'external',
              name: symbol.name,
              // need to get more specific info if in package
              moduleName: [packageInfo.package, packageInfo.relativePath].join('/'),
            };
          }
        }
      }
    }

    cx.identifiers.set(id, identifier);
    cx.identifierBySymbol.set(symbol, id);
    return id;
  }


  const visitModule = (sourceFile: ts.SourceFile) => {

    // get symbol for sourcefile
    const moduleSymbol = cx.ts.checker.getSymbolAtLocation(sourceFile);

    if (!moduleSymbol) {
      console.warn(`Missing module symbol for "${sourceFile.fileName}"`)
      return;
    }

    // check if sourcefile has been visited
    if (visitedModules.has(moduleSymbol))
      return;
    visitedModules.add(moduleSymbol);

    const packageInfo = findPackageFromSourceFile(sourceFile);
    if (!packageInfo)
      return;
    
    // check if package has been visited
    const packageSourceFile = getSourcefileFromName(packageInfo.package);
    const packageSymbol = cx.ts.checker.getSymbolAtLocation(packageSourceFile) as ts.Symbol;
    // visit symbols for package
    if (visitedModules.has(packageSymbol))
      return;
    visitedModules.add(packageSymbol);

    const visitSymbols = (qualifiers: string[], symbols: ts.Symbol[]) => {
      for (const symbol of symbols) {
        const declaration = (symbol.declarations || [])[0];

        if (declaration) {
          switch (declaration.kind) {
            case ts.SyntaxKind.ModuleDeclaration: {
              const namespace = declaration as ts.ModuleDeclaration;
              const namespaceSymbol = checker.getSymbolAtLocation(namespace.name);
              if (namespaceSymbol) {
                const symbols = checker.getExportsOfModule(moduleSymbol);
                visitSymbols([...qualifiers, namespace.name.text], symbols);
              }
            }
            default:
              const name = [...qualifiers, symbol.name].join('.');
              qualifiedNameForSymbol.set(symbol, name);
              moduleNameFromSymbol.set(symbol, packageInfo.package);
              break;
          }
        }
      }
    }

    const symbols = checker.getExportsOfModule(packageSymbol);
    visitSymbols([], symbols);
  }

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

  const getSourcefileFromName = (moduleName: string) => {
    const moduleReference = ts.resolveModuleName(
      moduleName,
      cx.ts.host.getCurrentDirectory() + '/' + cx.source.fileName,
      program.getCompilerOptions(),
      host,
      undefined,
      undefined,
    );
    if (!moduleReference.resolvedModule) {
      console.warn(moduleReference)
      throw new Error(`Could not resolve module "${moduleName}" from "${cx.source.fileName}"`)
    }
    const packageSourceFile = program.getSourceFile(moduleReference.resolvedModule.resolvedFileName)
    if (!packageSourceFile) {
      throw new Error(`Could not find source file "${moduleReference.resolvedModule.resolvedFileName}"`)
    }

    return packageSourceFile;
  }

  builder.getIdentifierFromSymbol = getIdentifierFromSymbol;
};