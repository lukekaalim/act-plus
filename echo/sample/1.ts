import { ANestedType } from './2';

/**
 * TSDoc for value!
 */
export const aValue = "string";

export const bValue = 100;

/**
 * TSDoc for type!
 */
export type AType = string;
export type BType = string | ANestedType | BType[];

export class CType {
  property: AType = "hello"
}

export function DType(): void {

}

/**
 * Some of the details of this new world!
 */
export type EType = {
  /**
   * Yeah, well don't look into it
   */
  (a: number): void,
}

/**
 * My funky function
 * 
 * @param ref A Value from zero to one
 */
export type FType = (ref: number) => void

export type GType = {
  value: string,

  method(): ReturnType<typeof window.setTimeout>
};

export type HType = ReturnType<GType["method"]>

export type ZtypS = "fllop the greep"

export * from './3';