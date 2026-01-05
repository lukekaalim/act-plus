import { createAnimationAPI } from "./animation"
import { createCurveAPI } from "./curve"
import { lerp } from "./math"

/**
 * An API that lets you perform operations on the components of a vector
 */
export type VectorComponentsAPI<T> = {
  create: (operation: (key: keyof T, index: number) => number) => T,
  unary: (left: T, operation: (left: number) => number) => T,
  binary: (left: T, right: T, operation: (left: number, right: number) => number) => T,

  components: (vector: T) => number[],

  nary: <
    Args extends ReadonlyArray<T>,
    Output
  >(operation: (...args: { [K in keyof Args]: number }) => Output, ...args: Args) => { [K in keyof T]: Output },
}


export type VectorScalarAPI<T> = {
  length(vector: T): number,
  add(left: T, right: number): T,
  multiply(left: T, right: number): T,
}

export type VectorAPI<T> = {
  ZERO: T,
  ONE: T,

  create: (...args: number[]) => T,
  interpolate(start: T, end: T, progress: number): T,

  add(left: T, right: T): T,
  subtract(left: T, right: T): T,
  multiply(left: T, right: T): T,
  divide(left: T, right: T): T,

  ComponentsAPI: VectorComponentsAPI<T>,
  ScalarAPI: VectorScalarAPI<T>,

  components: VectorComponentsAPI<T>,
  scalar: VectorScalarAPI<T>,
}

export const createVectorScalarAPI = <T>(
  unaryOperation: (left: T, operation: (left: number) => number) => T,
): VectorScalarAPI<T> => {
  return {
    length(vector) {
      let sum = 0;
      unaryOperation(vector, left => {
        sum += Math.pow(left, 2);
        return 0;
      })
      return Math.sqrt(sum);
    },
    add(left, right) {
      return unaryOperation(left, left => left + right)
    },
    multiply(left, right) {
      return unaryOperation(left, left => left * right)
    },
  }
}

export const createVectorAPI = <T>(ComponentsAPI: VectorComponentsAPI<T>) => {
  const scalar = createVectorScalarAPI(ComponentsAPI.unary);
  const components = ComponentsAPI;

  const VectorAPI: VectorAPI<T> = {
    ScalarAPI: createVectorScalarAPI(ComponentsAPI.unary),
    ComponentsAPI,

    components,
    scalar,

    ZERO: ComponentsAPI.create(() => 0),
    ONE: ComponentsAPI.create(() => 1),
    create: (...args) => ComponentsAPI.create((_, index) => args[index]),

    interpolate(start, end, progress) {
      return ComponentsAPI.binary(start, end, (l, r) => lerp(l, r, progress))
    },

    add(left, right) {
      return ComponentsAPI.binary(left, right, (l, r) => l + r)
    },
    subtract(left, right) {
      return ComponentsAPI.binary(left, right, (l, r) => l - r)
    },
    multiply(left, right) {
      return ComponentsAPI.binary(left, right, (l, r) => l * r)
    },
    divide(left, right) {
      return ComponentsAPI.binary(left, right, (l, r) => l / r)
    },
  }

  return VectorAPI;
}

export type Vector1D = {
  x: number
}
export const Vector1D = createVectorAPI<Vector1D>({
  create: value => ({
    x: value('x', 0),
  }),
  unary: (left, operation) => ({
    x: operation(left.x)
  }),
  binary: (left, right, operation) => ({
    x: operation(left.x, right.x)
  }),
  nary: (operation, ...args) => ({
    x: operation(...args.map(a => a.x) as any)
  }),
  components: v => [v.x]
});

export type Vector2D = {
  x: number,
  y: number,
}
export const Vector2D = createVectorAPI<Vector2D>({
  create: value => ({
    x: value('x', 0),
    y: value('y', 1),
  }),
  unary: (left, operation) => ({
    x: operation(left.x),
    y: operation(left.y),
  }),
  binary: (left, right, operation) => ({
    x: operation(left.x, right.x),
    y: operation(left.y, right.y),
  }),
  nary: (operation, ...args) => ({
    x: operation(...args.map(a => a.x) as any),
    y: operation(...args.map(a => a.y) as any)
  }),
  components: v => [v.x, v.y]
});

export type Vector3D = {
  x: number,
  y: number,
  z: number,
}
export const Vector3D = createVectorAPI<Vector3D>({
  create: value => ({
    x: value('x', 0),
    y: value(`y`, 1),
    z: value(`z`, 2),
  }),
  unary: (left, operation) => ({
    x: operation(left.x),
    y: operation(left.y),
    z: operation(left.z),
  }),
  binary: (left, right, operation) => ({
    x: operation(left.x, right.x),
    y: operation(left.y, right.y),
    z: operation(left.z, right.z),
  }),
  nary: (operation, ...args) => ({
    x: operation(...args.map(a => a.x) as any),
    y: operation(...args.map(a => a.y) as any),
    z: operation(...args.map(a => a.z) as any)
  }),
  components: v => [v.x, v.y, v.z]
});

export type Vector4D = {
  x: number,
  y: number,
  z: number,
  w: number,
}

// I think this is cute - but do I really need this...?
export type Vector<D extends 1 | 2 | 3 | 4> =
  | (D extends 1 ? Vector1D : never)
  | (D extends 2 ? Vector2D : never)
  | (D extends 3 ? Vector3D : never)
  | (D extends 4 ? Vector4D : never)

export const Curve1D = createCurveAPI(Vector1D);
export const Animation1D = createAnimationAPI(Curve1D);

export const Curve2D = createCurveAPI(Vector2D);
export const Animation2D = createAnimationAPI(Curve2D);

export const Curve3D = createCurveAPI(Vector3D);
export const Animation3D = createAnimationAPI(Curve3D);