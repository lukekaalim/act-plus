import { DocComment } from "@microsoft/tsdoc";
import { createId, OpaqueID } from "./utils";

export namespace EchoType {
  export type CallableParameter = {
    name: string,
    type: Any,
    optional: boolean,
  }

  export type Literal = OfEchoType<"literal", {
    value: string | number | boolean | null,
  }>;

  export type Builtin = OfEchoType<"builtin", {
    builtin: 'string' | 'number' | 'boolean'
  }>

  export type Keyword = OfEchoType<"keyword", {
    keyword: 'void' | 'unknown' | 'never' | 'any' | 'undefined',
  }>

  export type Array = OfEchoType<"array", {
    element: Any
  }>
  export type Tuple = OfEchoType<"tuple", {
    values: Any[]
  }>

  export type Object = OfEchoType<"object", {
    properties: Record<string, Any>,
  }>
  export type IndexedAccess = OfEchoType<"indexed-access", {
    target: Any,
    accessor: Any,
  }>

  export type Callable = OfEchoType<"callable", {
    parameters: CallableParameter[],
    typeParameters: Record<string, EchoDeclaration.TypeParameter>,
    returns: Any,
  }>

  export type Reference = OfEchoType<"reference", {
    name: string,
    typeParameters: Any[],
    id: EchoTypeID,
  }>

  export type Union = OfEchoType<"union", {
    branches: Any[]
  }>
  export type Intersection = OfEchoType<"intersection", {
    branches: Any[]
  }>
  export type Unsupported = OfEchoType<"unsupported", {
    message: string
  }>

  export const create = <T extends Any["type"]>(type: T, props: Omit<ByType<T>, "id" | "type">): ByType<T> => {
    return { ...(props), id: createId(), type } as ByType<T>;
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

  export type ByType<T extends Any["type"]> = Extract<Any, { type: T }>
}
export type EchoType = EchoType.Any;

export namespace EchoDeclaration {
  export type TypeParameter = {
    extends: null | EchoType.Any,
    default: null | EchoType.Any
  }

  export type Variable = OfEchoDeclaration<"variable", {
    doc: null | string,
    identifier: string,
    typeof: null | EchoType,
  }>;
  export type Function = OfEchoDeclaration<"function", {
    doc: null | string,
    identifier: string,
    signature: EchoType.Callable
  }>;
  export type Type = OfEchoDeclaration<"type", {
    doc: null | string,
    identifier: string,
    declares: EchoType,
    parameters: Record<string, TypeParameter>
  }>;
  export type Class = OfEchoDeclaration<"class", {
    doc: null | string,
    identifier: string,
  }>;
  export type Interface = OfEchoDeclaration<"interface", {
    doc: null | string,
    identifier: string,
  }>;
  export type Unsupported = OfEchoDeclaration<"unsupported", {
    doc: null | string,
    identifier: string,
    message: string,
  }>;

  export const create = <T extends Any["type"]>(type: T, props: Omit<ByType<T>, "id" | "type">): ByType<T> => {
    return { ...(props), id: createId(), type } as ByType<T>;
  }

  export type Any =
    | Variable
    | Type
    | Class
    | Unsupported
    | Interface
    | Function

  export type ByType<T extends Any["type"]> = Extract<Any, { type: T }>
}

export type EchoDeclaration = EchoDeclaration.Any;

export type EchoTypeID = OpaqueID<"EchoTypeID">;
export type EchoDeclarationID = OpaqueID<"EchoDeclarationID">;

/**
 * Create a new EchoType (with the appropriate discriminator and ID types)
 */
export type OfEchoType<Discriminator extends string, Props extends {}> = {
  type: Discriminator,
  id: EchoTypeID,
} & Props;
export type OfEchoDeclaration<Discriminator extends string, Props extends {}> = {
  type: Discriminator,
  id: EchoDeclarationID,
} & Props;

export type EchoModule = {
  exports: EchoDeclaration[]
}