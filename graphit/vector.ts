import { Dimension } from "./dimensions";

// THESE VECTORS SUCK
// YOU JUST NEED 2D VECTORS

type VectorDimensions = {
  [1]: 1,
  [2]: 1 | 2,
  [3]: 1 | 2 | 3,
  [4]: 1 | 2 | 3 | 4,
  [5]: 1 | 2 | 3 | 4 | 5,
};

export type Vector<D extends Dimension> = {
  [key in Dimension.Name[VectorDimensions[D]]]: number
};

export type VectorOps<D extends Dimension> = {
  create(): Vector<D>,
  operate(vector: Vector<D>, op: (value: number, field: Dimension.Name[VectorDimensions[D]]) => number): Vector<D>,

  add(a: Vector<D>, b: Vector<D>): Vector<D>,
  mult(a: Vector<D>, b: Vector<D>): Vector<D>,

  scalar: {
    add(a: Vector<D>, b: number): Vector<D>,
    mult(a: Vector<D>, b: number): Vector<D>,
  }
}

export const Vector = <D extends Dimension>(d: D): VectorOps<D> => {
  const create = (): Vector<D> => {
    switch (d) {
      case 1:
        return { x: 0 } as Vector<D>;
      case 2:
        return { x: 0, y: 0 } as Vector<D>;
      case 3:
        return { x: 0, y: 0, z: 0 } as Vector<D>;
      case 4:
        return { x: 0, y: 0, z: 0, u: 0 } as Vector<D>;
      case 5:
        return { x: 0, y: 0, z: 0, u: 0, v: 0 } as Vector<D>;
      default:
        const _: never = d;
        throw new Error();
    }
  }
  
  const operate = (v: Vector<D>, op: (field: number, axis: Dimension.Name[VectorDimensions[D]]) => number): Vector<D> => {
    const result = create();
    switch (d) {
      case 5:
        (result as Vector<5>).v = op((v as Vector<5>).v, 'v' as Dimension.Name[VectorDimensions[D]]);
      case 4:
        (result as Vector<4>).u = op((v as Vector<4>).u, 'u' as Dimension.Name[VectorDimensions[D]]);
      case 3:
        (result as Vector<3>).z = op((v as Vector<3>).z, 'z' as Dimension.Name[VectorDimensions[D]]);
      case 2:
        (result as Vector<2>).y = op((v as Vector<2>).y, 'y' as Dimension.Name[VectorDimensions[D]]);
      case 1:
        (result as Vector<1>).x = op((v as Vector<1>).x, 'x' as Dimension.Name[VectorDimensions[D]]);
        return result;
      default:
        const _: never = d;
        throw new Error();
    }
  }
  return {
    create,
    operate,
    add(a, b) {
      return operate(a, (v1, f) => v1 + b[f]);
    },
    mult(a, b) {
      return operate(a, (v1, f) => v1 * b[f]);
    },
    scalar: {
      add(a, b) {
        return operate(a, (v1) => v1 + b);
      },
      mult(a, b) {
        return operate(a, (v1) => v1 * b);
      },
    }
  }
}