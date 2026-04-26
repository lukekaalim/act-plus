import {IdentifierID } from "./identifiers";
import { DefineType } from "./meta";
import { TypeID } from "./type";

export type ReferenceType = DefineType<'reference', {
  target: IdentifierID,

  parameters: TypeID[],
}>;

export type IndexAccessType = DefineType<'index-access', {
  target: TypeID,
  index: TypeID,
}>;