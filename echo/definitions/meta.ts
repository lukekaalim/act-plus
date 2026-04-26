import { Type, TypeID } from "./type";

/**
 * @expand Am I really a custom block?
 */
export type DefineType<Discriminator extends string, Props extends {}> = {
  id: TypeID,
  type: Discriminator,

  meta?: Record<string, string>,
} & Props;

export type MissingType = DefineType<'parser-error', { message: string }>;

export type ExtractTypePropsByName<T extends Type["type"]> =
  Omit<Extract<Type, { type: T }>, "id" | "type">
