import { AnyVector, Vector } from "@lukekaalim/act-graphit";
import { Vector1D, Vector2D, Vector3D, VectorAPI } from "./vectors";

export type Polynomial<V extends AnyVector> = {
  [key in keyof V]: [number, number, number, number]
}

export const createCubicBezierAPI = <V extends AnyVector>(
  vectorAPI: VectorAPI<V>
) => {
  const computePolynomials = (a: V, b: V, c: V, d: V): Polynomial<V> => {
    return vectorAPI.ComponentsAPI.nary((a, b, c, d) => {
      return [
        a,
        (-3 * a) + (3 * b),
        (3 * a) + (-6 * b) + (3 * c),
        (-a) + (3 * b) + (-3 * c) + d,
      ] as const;
    }, a, b, c, d);
  }

  const pointFromPolynomials = (progress: number, polynomial: Polynomial<V>) => {
    return vectorAPI.ComponentsAPI.create((key) => {
      const polynomialComponents = polynomial[key];
      return (
        polynomialComponents[0] +
        (progress * polynomialComponents[1]) +
        (Math.pow(progress, 2) * polynomialComponents[2]) +
        (Math.pow(progress, 3) * polynomialComponents[3])
      )
    });
  }

  const point = (a: V, b: V, c: V, d: V, progress: number) => {
    return vectorAPI.ComponentsAPI.nary((a, b, c, d) => {
      return (
        a +
        (progress * ((-3 * a) + (3 * b))) +
        (Math.pow(progress, 2) * ((3 * a) + (-6 * b) + (3 * c))) +
        (Math.pow(progress, 3) * ((-a) + (3 * b) + (-3 * c) + d))
      )
    }, a, b, c, d)
  };

  const polynomial = (t: number) => {
    const cubed = Math.pow(t, 3);
    const squared = Math.pow(t, 2);

    const p0 = (-cubed + (3 * squared) - (3 * t) + 1);
    const p1 = ((3 * cubed) - (6 * squared) + (3 * t));
    const p2 = ((-3 * cubed) + (3 * squared))
    const p3 = (cubed)

    return { p0, p1, p2, p3 }
  }

  const position = (a: V, b: V, c: V, d: V, t: number): V => {
    return vectorAPI.ComponentsAPI.nary((a, b, c, d) => {
      const cubed = Math.pow(t, 3);
      const squared = Math.pow(t, 2);

      const p0 = a * (-cubed + (3 * squared) - (3 * t) + 1);
      const p1 = b * ((3 * cubed) - (6 * squared) + (3 * t));
      const p2 = c * ((-3 * cubed) + (3 * squared))
      const p3 = d * (cubed)

      return (p0 + p1 + p2 + p3);
    }, a, b, c, d) as V;
  }

  const velocity = (a: V, b: V, c: V, d: V, progress: number): V => {
    const squared = Math.pow(progress, 2);

    return vectorAPI.ComponentsAPI.nary((a, b, c, d) => {
      return (
        + (a * ((- 3 * squared) + (6 * progress) - 3 ))
        + (b * ((9 * squared) - (12 * progress) + 3 ))
        + (c * ((- 9 * squared) + (6 * progress)))
        + (d * (3 * squared))
      );
    }, a, b, c, d) as V;
  }
  const acceleration = (a: V, b: V, c: V, d: V, progress: number): V => {
    return vectorAPI.ComponentsAPI.nary((a, b, c, d) => {
      return (
        + a * (6 * progress + 6 )
        + b * (18 * progress - 12)
        + c * (- 18 * progress + 6)
        + d * (6 * progress)
      );
    }, a, b, c, d) as V;
  }

  return { acceleration, velocity, position, polynomial };
}

export const bezier = {
  cubic: {
    '1D': createCubicBezierAPI(Vector1D),
    '2D': createCubicBezierAPI(Vector2D),
    '3D': createCubicBezierAPI(Vector3D)
  }
}
