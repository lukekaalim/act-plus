import { IntersectionType, UnionType } from './combinations';
import { FunctionType, ObjectType } from './objects';

export * from './type';
export * from './module';
export * from './identifiers';
export * from './comments'

export * from './meta';

export namespace Type {
  export type Function = FunctionType;
  export type Object = ObjectType;
  export type Union = UnionType;
  export type Intersection = IntersectionType

}
export type { Type } from './type';