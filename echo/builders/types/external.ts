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

  const visitedModules = new Set<string>();

  const getIdentifierFromSymbol = (symbol: ts.Symbol): null | IdentifierID => {
    if (symbol.flags & ts.SymbolFlags.Alias) {
      symbol = cx.ts.checker.getAliasedSymbol(symbol);
    }

    if (cx.identifierBySymbol.has(symbol)) {
      return cx.identifierBySymbol.get(symbol) as IdentifierID;
    }
    const id: IdentifierID =createId();

    let identifier: Identifier;

    const declaration = (symbol.declarations || [])[0] as ts.Declaration;
    if (!declaration) {
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
    // check if sourcefile has been visited
    if (visitedModules.has(sourceFile.fileName))
      return;
    visitedModules.add(sourceFile.fileName);

    const packageInfo = findPackageFromSourceFile(sourceFile);
    if (!packageInfo)
      return;
    
    // check if package has been visited
    const packageSourceFile = getSourcefileFromName(packageInfo.package);
    // visit symbols for package
    if (!packageSourceFile || visitedModules.has(packageSourceFile.fileName))
      return;
    visitedModules.add(packageSourceFile.fileName);

    const visitSymbols = (qualifiers: string[], symbols: ts.Symbol[]) => {
      for (const symbol of symbols) {
        const declaration = (symbol.declarations || [])[0];

        if (declaration) {
          switch (declaration.kind) {
            case ts.SyntaxKind.ModuleDeclaration: {
              const namespace = declaration as ts.ModuleDeclaration;
              const namespaceSymbol = checker.getSymbolAtLocation(namespace.name);
              if (namespaceSymbol) {
                const symbols = checker.getExportsOfModule(namespaceSymbol);
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

    const packageSymbol = cx.ts.checker.getSymbolAtLocation(packageSourceFile);
    if (packageSymbol) {
      const symbols = checker.getExportsOfModule(packageSymbol);
      visitSymbols([], symbols);
    }
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
      // There are cases where a legit file is resolvable, but not included in the typescript
      // program (because it was never directly referenced).
      return null;
    }

    return packageSourceFile;
  }

  builder.getIdentifierFromSymbol = getIdentifierFromSymbol;
};