import { DocComment } from "@microsoft/tsdoc";
import { createId, OpaqueID } from "./utils";
import { EchoExternalReferenceID } from "./types/external";

export namespace EchoType {
  /**
   * Create a new EchoType (with the appropriate discriminator and ID types)
   */
  type Define<Discriminator extends string, Props extends {}> = {
    type: Discriminator,
    id: EchoType.ID,
  } & Props;

  export type CallableParameter = {
    name: string,
    type: ID,
    optional: boolean,
  }

  export type Literal = Define<"literal", {
    value: string | number | boolean | null,
  }>;

  export type Builtin = Define<"builtin", {
    builtin: 'string' | 'number' | 'boolean'
  }>

  export type Keyword = Define<"keyword", {
    keyword: 'void' | 'unknown' | 'never' | 'any' | 'undefined',
  }>

  export type Array = Define<"array", {
    element: ID
  }>
  export type Tuple = Define<"tuple", {
    values: ID[]
  }>
  export type InternalAlias = Define<"internal-alias", {
    alias: ID,
  }>
  export type Temporary = Define<"temporary", {}>

  export type Object = Define<"object", {
    properties: Record<string, ID>,
  }>
  export type IndexedAccess = Define<"indexed-access", {
    target: ID,
    accessor: ID,
  }>

  export type Callable = Define<"callable", {
    parameters: CallableParameter[],
    typeParameters: EchoDeclaration.ID[],
    returns: ID,
  }>

  export type Reference = Define<"reference", {
    typeParameters: ID[],
    id: EchoType.ID,

    target:
      | { type: 'declaration', id: EchoDeclaration.ID }
      | { type: 'reference', id: EchoExternalReferenceID }
  }>

  export type Union = Define<"union", {
    branches: ID[]
  }>
  export type Intersection = Define<"intersection", {
    branches: ID[]
  }>
  export type Unsupported = Define<"unsupported", {
    message: string
  }>

  export const create = <T extends Any["type"]>(type: T, id: ID, props: Omit<ByType<T>, "id" | "type">): ByType<T> => {
    return { ...(props), id, type } as ByType<T>;
  }


  export type Any =
    | Literal
    | Builtin
    | Keyword
    | Array
    | Tuple
    | Object
    | Callable
    | Reference
    | Union
    | Unsupported
    | Intersection
    | IndexedAccess
    | InternalAlias
    | Temporary

  export type ByType<T extends Any["type"]> = Extract<Any, { type: T }>

  export type ID = OpaqueID<"EchoTypeID">
}
export type EchoType = EchoType.Any;

export namespace EchoDeclaration {
  export type CommentPart = {
    kind: string,
    text: string,
  }


  type Define<Discriminator extends string, Props extends {}> = {
    type: Discriminator,
    id: ID,
  } & Props;

  export type Generic = Define<'generic', {
    identifier: string,

    extends: null | EchoType.ID,
    default: null | EchoType.ID
  }>

  export type Variable = Define<"variable", {
    doc: null | CommentPart[],
    identifier: string,
    typeof: null | EchoType.ID,
  }>;
  export type Function = Define<"function", {
    doc: null | CommentPart[],
    identifier: string,
    signature: EchoType.ID,
  }>;
  export type Type = Define<"type", {
    doc: null | CommentPart[],
    identifier: string,
    declares: EchoType.ID,
    parameters: ID[],
  }>;
  export type Class = Define<"class", {
    doc: null | CommentPart[],
    identifier: string,
  }>;
  export type Interface = Define<"interface", {
    doc: null | CommentPart[],
    identifier: string,
    parameters: ID[],
  }>;
  export type Unsupported = Define<"unsupported", {
    doc: null | CommentPart[],
    identifier: string,
    message: string,
  }>;
  export type Namespace = Define<"namespace", {
    doc: null | CommentPart[],
    identifier: string,
    exports: ID[]
  }>;

  export const create = <T extends Any["type"]>(id: ID, type: T, props: Omit<ByType<T>, "id" | "type">): ByType<T> => {
    return { ...(props), id, type } as ByType<T>;
  }

  export type Any =
    | Variable
    | Type
    | Class
    | Unsupported
    | Interface
    | Namespace
    | Function
    | Generic

  export type ByType<T extends Any["type"]> = Extract<Any, { type: T }>

  export type ID = OpaqueID<"EchoDeclarationID">;
}

export type EchoDeclaration = EchoDeclaration.Any;

