import ts from "typescript";
import { Echo } from "../definitions/module";
import { discoverExportableSymbols, TSExportableDeclaration } from "./symbols";
import { createTypescriptContext, Host, TypescriptContext } from "./typescript";
import { Identifier, IdentifierID } from "../definitions/identifiers";
import { buildIdentifiers } from "./identifiers";
import { Type, TypeID } from "../definitions/type";
import { Comment, CommentID } from "../definitions/comments";
import { buildComments, findSymbolsToExpand } from "./comments";

/**
 * @internal
 * 
 * The data structure used internally to construct
 * an Echo of a module, using the Typescript API.
 * 
 * Most parts of echo take in this context object,
 * filling out and reading from variable maps. At different
 * stages of generation, some maps will be filled and others
 * empty.
 */
export type ModuleBuildContext = {
  ts: TypescriptContext,
  source: ts.SourceFile,

  types: Map<TypeID, Type>,
  identifiers: Map<IdentifierID, Identifier>,
  comments: Map<CommentID, Comment>,

  typeByInstance: Map<ts.Symbol, TypeID>,
  identifierBySymbol: Map<ts.Symbol, IdentifierID>,

  visitedModules: Set<ts.Symbol>,

  symbolsToExpand: Set<ts.Symbol>,
  symbolsByNamespaceSymbol: Map<ts.Symbol, ts.Symbol[]>,
  exportableDeclarationNodeBySymbol: Map<ts.Symbol, TSExportableDeclaration>,
};

const createContext = (ts: TypescriptContext, source: ts.SourceFile): ModuleBuildContext => {
  return {
    ts,
    source,

    types: new Map(),
    identifiers: new Map(),
    comments: new Map(),

    typeByInstance: new Map(),
    identifierBySymbol: new Map(),

    visitedModules: new Set(),

    symbolsToExpand: new Set(),
    symbolsByNamespaceSymbol: new Map(),
    exportableDeclarationNodeBySymbol: new Map(),
  }
}

/**
 * Create an Echo of a module
 * 
 * Hi
 * 
 * @experimental
 * @public
 */
export const createEchoFromSourceFile = (
  name: string,
  source: ts.SourceFile,
  program: ts.Program,
  host: Host
): Echo => {
  const cx = createContext(createTypescriptContext(program, host), source);

  discoverExportableSymbols(cx);
  findSymbolsToExpand(cx);
  buildIdentifiers(cx);
  buildComments(cx);

  const moduleSymbol = cx.ts.checker.getSymbolAtLocation(cx.source) as ts.Symbol;
  const exportedSymbols = cx.symbolsByNamespaceSymbol.get(moduleSymbol) as ts.Symbol[];
  const exportedIdentifiers = exportedSymbols.map(symbol => {
    const identifier = cx.identifierBySymbol.get(symbol);
    if (!identifier)
      throw new Error(`Cannot find identifier for symbol ${symbol.name} in ${moduleSymbol.name} (${cx.source.fileName})`);
    return identifier;
  });

  return {
    moduleName: name,
    types: [...cx.types.values()],
    identifiers: [...cx.identifiers.values()],
    comments: [...cx.comments.values()],
    exports: exportedIdentifiers,
    diagnostics: []
  }
};
