//type ThingFunc = () => { myValue: Map<any, any> }

import ts from "typescript";

type A_Declared_Type = 10;

/**
 * I DEMAND DOCUMENTATION
 * 
 * @returns 
 */
export const myFunction = <TY>() => {
  const myValue = new Map<"yes", "no">();


  return {
    otherValue: 10 as A_Declared_Type,
    myMethod({ get }: typeof myValue) {
      get;
      return 'thing' as 'thing2';
    },
    myValue,
    jenny<T>(a: T, b: TY): void {
      return;
    },
    oooo: () => myFunction,
    forrest(checker: ts.ProgramHost<ts.BuilderProgram>): void {

    }
  }
}


export const A = "hello";

export const b = A;

/** whoah! */
export let e = "whoah",
/** mama! */
f = "mama"

export namespace CustomNamespace {
  export namespace NestedNamespace {
    export const C = A; 

    export type Hello = "World";
  }

  export function D() {
    
  }
}