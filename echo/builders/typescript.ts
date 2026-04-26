import ts from "typescript"

export type Host = ts.ModuleResolutionHost & { getCurrentDirectory(): string; }

/**
 * All the of service objects for interacting with the typescript system.
 */
export type TypescriptContext = {
  program: ts.Program,
  host: Host,
  checker: ts.TypeChecker,
}

export const createTypescriptContext = (program: ts.Program, host: Host): TypescriptContext => {
  const checker = program.getTypeChecker();

  return {
    checker,
    program,
    host
  }
}