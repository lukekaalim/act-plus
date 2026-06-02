import { IntersectionType, UnionType } from './combinations';
import { FunctionType, ObjectType } from './objects';

export * from './type';
export * from './module';
export * from './identifiers';
export * from './comments'

export * from './meta';

import * as objects from './objects'

/**
 * Fancy ergonomic access for various types.
 */
export namespace Type {
  export type Function = FunctionType;
  export type Object = ObjectType;
  export type Union = UnionType;
  
  export namespace Object {
    export type Property = objects.Property;
  }
  export namespace Class {
    export type Member = objects.Member;
  }
  export namespace Function {
    export type Parameter = objects.Parameter;
  }
 
}
export type { Type } from './type';