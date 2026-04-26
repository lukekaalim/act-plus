import { IdentifierID } from "./identifiers"
import { DefineType } from "./meta"

export type NamespaceType = DefineType<'namespace', {
  name: string,
  
  exports: IdentifierID[]
}>