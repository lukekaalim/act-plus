import { DocComment } from "@microsoft/tsdoc";
import { createId, OpaqueID } from "./utils";

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
    typeParameters: EchoDeclaration.TypeParameter[],
    returns: ID,
  }>

  export type Reference = Define<"reference", {
    typeParameters: ID[],
    id: EchoType.ID,

    target:
      | { type: 'internal', id: EchoDeclaration.ID }
      | { type: 'external', id: EchoDeclaration.ID }
      | { type: 'generic', id: EchoDeclaration.ID }
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
  type Define<Discriminator extends string, Props extends {}> = {
    type: Discriminator,
    id: EchoDeclaration.ID,
  } & Props;


  export type External = Define<'external', {
    module: string,
    identifier: string,
  }>;

  export type TypeParameter = {
    identifier: string,
    id: EchoDeclaration.ID,

    extends: null | EchoType.ID,
    default: null | EchoType.ID
  }

  export type Variable = Define<"variable", {
    doc: null | string,
    identifier: string,
    typeof: null | EchoType.ID,
  }>;
  export type Function = Define<"function", {
    doc: null | string,
    identifier: string,
    signature: EchoType.ID,
  }>;
  export type Type = Define<"type", {
    doc: null | string,
    identifier: string,
    declares: EchoType.ID,
    parameters: TypeParameter[],
  }>;
  export type Class = Define<"class", {
    doc: null | string,
    identifier: string,
  }>;
  export type Interface = Define<"interface", {
    doc: null | string,
    identifier: string,
    parameters: TypeParameter[],
  }>;
  export type Unsupported = Define<"unsupported", {
    doc: null | string,
    identifier: string,
    message: string,
  }>;
  export type Namespace = Define<"namespace", {
    doc: null | string,
    identifier: string,
    exports: EchoType.ID[]
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
    | External

  export type ByType<T extends Any["type"]> = Extract<Any, { type: T }>

  export type ID = OpaqueID<"EchoDeclarationID">;
}

export type EchoDeclaration = EchoDeclaration.Any;

