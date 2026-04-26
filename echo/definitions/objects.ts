import { IdentifierID } from "./identifiers";
import { DefineType } from "./meta";
import { TypeID } from "./type";

export type Property = {
  identifier: string,
  typeof: TypeID
};
export type Parameter = {
  identifier: string,
  typeof: TypeID
};
export type TupleElement = {
  name: null | string
  typeof: TypeID
}

export type ObjectType = DefineType<'object', {
  properties: Property[],
}>

export type ArrayType = DefineType<'array', {
  element: TypeID,
}>

export type TupleType = DefineType<'tuple', {
  elements: TupleElement[],
}>

export type ClassType = DefineType<'class', {
  properties: Property[],

  abstract: boolean,
  implements: TypeID[],
  extends: null | TypeID
}>

export type InterfaceType = DefineType<'interface', {
  properties: Property[],
  
  extends: TypeID[]
}>

export type FunctionType = DefineType<'function', {
  parameters: Parameter[],
  typeParameters: IdentifierID[],
  returns: TypeID
}>
