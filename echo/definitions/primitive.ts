import { DefineType } from "./meta";

export type KeywordType = DefineType<'keyword', {
  keyword: 
    | 'symbol'
    | 'string'
    | 'number'
    | 'boolean'
    | 'undefined'
    | 'void'
    | 'null'
    | 'unknown'
    | 'never'
    | 'any'
}>
export type LiteralType = DefineType<'literal', {
  literal: string | number | boolean
}>;
