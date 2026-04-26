import { OpaqueID } from "../utils";
import { IntersectionType, OperationType, UnionType } from "./combinations";
import { MissingType } from "./meta";
import { NamespaceType } from "./namespace";
import { ArrayType, ClassType, FunctionType, InterfaceType, ObjectType, TupleType } from "./objects";
import { KeywordType, LiteralType } from "./primitive";
import { IndexAccessType, ReferenceType } from "./reference";

export type TypeID = OpaqueID<'TypeID'>;

export type Type =
  // primitive.ts
  | LiteralType
  | KeywordType
  // object.ts
  | ObjectType
  | ArrayType
  | TupleType
  | ClassType
  | InterfaceType
  | FunctionType
  // combinations.ts
  | IntersectionType
  | UnionType
  | OperationType
  // reference.ts
  | ReferenceType
  | IndexAccessType
  // module.ts
  | NamespaceType
  // meta.ts
  | MissingType

