import ts from "typescript"
import { EchoDeclaration, EchoType } from "./reflections"
import { TypeBuildContext } from "./types"
import { discoverModule, DiscoveryContext } from "./discovery/symbols"
import { generateDeclarationFromDiscovery } from "./discovery/reflections"
import { EchoExternalReference, EchoExternalReferenceID } from "./types/external"

/**
 * The output of analysis of a module.
 * 
 * Includes all the things Echo detected
 * as "exported declaration", as well
 * as references to things that weren't
 * exported, such as internal, hidden
 * types or types from other packages.
 */
export type EchoModule = {
  name: string,

  types: Record<EchoType.ID, EchoType>,
  declarations: Record<EchoDeclaration.ID, EchoDeclaration>,
  references: Record<EchoExternalReferenceID, EchoExternalReference>,

  exports: EchoDeclaration.ID[],
}

/**
 * All the of service objects for interacting with the typescript system.
 */
export type TypescriptContext = {
  source: ts.SourceFile,
  program: ts.Program,
  host: ts.ProgramHost<ts.BuilderProgram>,
  checker: ts.TypeChecker,
}

/**
 * Build Echo Module
 * 
 * @param name The name that will be given to the module. Ideally, it should
 *  be the name of the package (or module), that can be used to find the relevant
 *  file it was from.
 * @param source The sourceFile that will act as the root of analysis. All it's
 * exports will be analyzed to build the EchoModule.
 * @param program The entire Typescript program, used to get the TypeChecker
 * @param host Typescript's "Host" object, for interacting with the filesystem (finding package.json files)
 * for packages
 */
export const buildEchoModule = <T extends ts.BuilderProgram>(
  name: string,
  source: ts.SourceFile,
  program: ts.Program,
  host: ts.ProgramHost<T>
): EchoModule => {
  const typescriptContext: TypescriptContext = {
    checker: program.getTypeChecker(),
    program,
    source,
    // cheating here a little. dont tell anyone
    host: host as unknown as ts.ProgramHost<ts.BuilderProgram>,
  }
  const discoverContext: DiscoveryContext = {
    ts: typescriptContext,
    declarations: [],
  }
  const moduleSymbol = typescriptContext.checker.getSymbolAtLocation(source);
  if (!moduleSymbol)
    throw new Error();

  const moduleExports = typescriptContext.checker.getExportsOfModule(moduleSymbol);

  discoverModule(discoverContext, moduleExports);

  const typeBuilderContext: TypeBuildContext = {
    ts: typescriptContext,

    types: new Map(),
    packages: new Map(),
    unusedReferences: new Map(),
    declarations: new Map(),
    references: new Map(),

    declarationBySymbol: new Map(discoverContext.declarations.map(d => [d.symbol, d.id])),
    referenceBySymbol: new Map(),
    typeByTypescript: new Map(),
    exploredSymbols: new Set(),
  }

  for (const discoveredDeclaration of discoverContext.declarations) {
    const declaration = generateDeclarationFromDiscovery(discoveredDeclaration, typeBuilderContext);
    typeBuilderContext.declarations.set(declaration.id, declaration);
  }
  
  return {
    name,
    types: Object.fromEntries(typeBuilderContext.types),
    references: Object.fromEntries(typeBuilderContext.references),
    declarations: Object.fromEntries(typeBuilderContext.declarations),

    exports: moduleExports
      .map(symbol => typeBuilderContext.declarationBySymbol.get(symbol))
      .filter((x): x is EchoDeclaration.ID => !!x),
  };
}