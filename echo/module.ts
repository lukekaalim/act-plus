import ts from "typescript"
import { EchoDeclaration } from "./reflections"
import { createEchoDeclaration, findTSExportableDeclarations, TSExportableDeclaration } from "./declaration"
import { createId } from "./utils"
import { PackageFileReferenceInfo } from "./types"

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

  references: EchoDeclaration.External[],
  exports: EchoDeclaration[],
  identifiers: Record<EchoDeclaration.ID, string>,
}

/**
 * @private
 * 
 * ModuleBuildContext is a utility data structure
 * to keep track of discovered ts-specific information
 * as the build function generates all the declarations.
 */
export type ModuleBuildContext = {
  source: ts.SourceFile,
  program: ts.Program,
  host: ts.ProgramHost<ts.SemanticDiagnosticsBuilderProgram>,

  checker: ts.TypeChecker,

  internalDeclarations: TSExportableDeclaration[] | null,

  /**
   * These symbols belong to literal exports of the current module,
   * so you can confidently link to them
   */
  internalSymbols: Map<ts.Symbol, EchoDeclaration.ID>,
  /**
   * These symbols belong to some external module or unexported
   * type/value. External symbols are explicitly _referenced_
   * by some declaration or type.
   */
  externalSymbols: Map<ts.Symbol, EchoDeclaration.ID>,

  /**
   * Explored Symbols are recorded when a type includes
   * a reference to a different module.
   * 
   * These symbols may or may not be explicitly referenced.
   * Once they are confirmed to be references, make sure to
   * add the declaration to the context.references array.
   */
  exploredSymbols: Map<ts.Symbol, EchoDeclaration.External>,
  exploredPackagesModules: Set<ts.Symbol>,

  identifiers: Map<EchoDeclaration.ID, string>,
  declarations: EchoDeclaration[] | null,
  references: EchoDeclaration.External[],
}

export const buildEchoModule = (
  name: string,
  source: ts.SourceFile,
  program: ts.Program,
  host: ts.ProgramHost<ts.SemanticDiagnosticsBuilderProgram>
): EchoModule => {
  const context: ModuleBuildContext = {
    source,
    program,
    host,

    checker: program.getTypeChecker(),

    internalDeclarations: null,
    internalSymbols: new Map(),
    externalSymbols: new Map(),
    exploredSymbols: new Map(),
    exploredPackagesModules: new Set(),

    identifiers: new Map(),
    declarations: null,
    references: [],
  }

  context.internalDeclarations = findTSExportableDeclarations(source.statements, source.fileName, context);

  console.log(`Found ${context.internalDeclarations.length} declarations for ${name} in ${source.fileName}`)

  // give every declaration symbol a unique "Declaration ID"
  for (const declaration of context.internalDeclarations) {
    const symbol = context.checker.getSymbolAtLocation(declaration);
    if (!symbol)
      continue;

    context.internalSymbols.set(symbol, createId());
  }
  
  context.declarations = context.internalDeclarations.map(dec => createEchoDeclaration(dec, context))

  return {
    name,
    references: context.references,
    exports: context.declarations,
    identifiers: Object.fromEntries(context.identifiers)
  }
}