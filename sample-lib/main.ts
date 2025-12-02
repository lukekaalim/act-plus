/**
 * Important export of this package
 * 
 * @version 1.0.0
 * 
 * @external
 * 
 * @param Alpha The description for Alpha parameter {@link Foo.Bar}
 * 
 * @example
 * ```ts
 * Some code, demonstrating it's function
 * ```
 */
export const my_export: string = "A cool Export";


/**
 * This is a cool type that is also exported
 */
export type My_Type<T extends true> = { prop: string | T };