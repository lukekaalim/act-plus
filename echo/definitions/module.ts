import ts from "typescript"
import { Comment } from "./comments"
import { Diagnostic } from "./disgnostic"
import { Identifier, IdentifierID } from "./identifiers"
import { Type } from "./type"

/**
 * The main top-level product of `@lukekaalim/echo`.
 * 
 * Represents the reflected data of a particular source
 * file, detailing it's exports, their types and tsdoc comments,
 * plus any error occurred during parsing.
 */
export type Echo = {
  moduleName: string,

  types: Type[],
  identifiers: Identifier[],
  comments: Comment[],
  
  exports: IdentifierID[],

  diagnostics: Diagnostic[],
}