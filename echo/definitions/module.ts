import ts from "typescript"
import { Comment } from "./comments"
import { Diagnostic } from "./disgnostic"
import { Identifier, IdentifierID } from "./identifiers"
import { Type } from "./type"

export type Echo = {
  moduleName: string,

  types: Type[],
  identifiers: Identifier[],
  comments: Comment[],
  
  exports: IdentifierID[],

  diagnostics: Diagnostic[],
}