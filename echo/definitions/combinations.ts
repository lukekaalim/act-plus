import { IdentifierID } from "./identifiers";
import { DefineType } from "./meta";
import { TypeID } from "./type";

export type IntersectionType = DefineType<'intersection', {
  intersections: TypeID[]
}>;

export type UnionType = DefineType<'union', {
  unions: TypeID[]
}>;

export type ConditionalType = DefineType<'conditional', {
  target: TypeID,
  extends: TypeID,

  // for `X extends Y<infer A, infer B> ? ...`
  // inferences is `[A, B]`
  inferences: IdentifierID[],

  trueCase: TypeID,
  falseCase: TypeID,
}>;

export type OperationType = DefineType<'operation', {
  operation: 'keyof' | 'unique' | 'readonly'
  target: TypeID,
}>