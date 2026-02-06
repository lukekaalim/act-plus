import ts from 'typescript';
import { ANestedType } from './2';

/**
 * Hi! this is my export!
 * 
 * @example
 * ```ts
 * import { MyExport } from './1.ts';
 * 
 * ```
 */
export type MyExport =
  | number
  | ANestedType
  | ts.TypeChecker