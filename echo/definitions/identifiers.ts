import { OpaqueID } from "../utils";
import { TypeID } from "./type";

export type IdentifierID = OpaqueID<"IdentifierID">

/**
 * @expand
 */
export type DefineIdentifier<Discriminator extends string, Props extends {}> = {
  id:  IdentifierID,
  type: Discriminator,

  name: string,
} & Props

export type TypeParameterIdentifier = DefineIdentifier<'type-parameter', {
  constraint: null | TypeID,
  default: null | TypeID,
}>
export type TypeIdentifier = DefineIdentifier<'type', {
  parameters: IdentifierID[],
  typeId: TypeID,
}>;
export type ValueIdentifier = DefineIdentifier<'value', {
  typeId: TypeID,
}>;
export type ExternalIdentifier = DefineIdentifier<'external', {
  moduleName: string,
}>

export type Identifier =
  | TypeParameterIdentifier
  | TypeIdentifier
  | ValueIdentifier
  | ExternalIdentifier