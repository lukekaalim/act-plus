import { Component, h, StateSetter, useMemo, useState } from "@lukekaalim/act"
import { AnyVector, Circle, Line, Vector } from "@lukekaalim/act-graphit"
import { Animation2D, bezier, lerp, Vector2D, VectorAPI } from "../mod"

export type EditableCubicBezier<V extends AnyVector> = {
  points: {
    a: V,
    b: V,
    c: V,
    d: V,
  },
  set: {
    a: StateSetter<V>,
    b: StateSetter<V>,
    c: StateSetter<V>,
    d: StateSetter<V>,
  }
}

export const useEditableCubicBezier = <V extends AnyVector>(
  initial: [V, V, V, V],
): EditableCubicBezier<V> => {
  const [a, setA] = useState<V>(() => initial[0]);
  const [b, setB] = useState<V>(() => initial[1]);
  const [c, setC] = useState<V>(() => initial[2]);
  const [d, setD] = useState<V>(() => initial[3]);

  return {
    points: { a, b, c, d },
    set: {
      a: setA,
      b: setB,
      c: setC,
      d: setD,
    }
  }
}


export const EditableCubicBezierRenderer = () => {

};

export const useCubicBezier2DMidpoints = (
  a: Vector<2>, b: Vector<2>, c: Vector<2>, d: Vector<2>,
  t: number
) => {
  return useMemo(() => {
    const ab = Vector2D.interpolate(a, b, t);
    const bc = Vector2D.interpolate(b, c, t);
    const cd = Vector2D.interpolate(c, d, t);

    const abc = Vector2D.interpolate(ab, bc, t);
    const bcd = Vector2D.interpolate(bc, cd, t);

    const abcd = Vector2D.interpolate(abc, bcd, t);

    return {
      ab,
      bc,
      cd,
      abc,
      bcd,
      abcd
    }
  }, [a, b, c, d, t]);
}

type CubicBezier2DConstructionLinesProps = {
  bezierPoints: [Vector<2>,Vector<2>,Vector<2>,Vector<2>],
  progress: number,
}

export const CubicBezier2DConstructionLines: Component<CubicBezier2DConstructionLinesProps> = ({
  bezierPoints: [a, b, c, d],
  progress,
}) => {
  const { ab, bc, cd, abc, bcd, abcd } = useCubicBezier2DMidpoints(a, b, c, d, progress);

  const styles = {
    control: { stroke: 'black', strokeWidth: 1 },
    midpoint1: { stroke: 'black', strokeWidth: 1, strokeDashArray: [4] },
    midpoint2: { stroke: 'grey', strokeWidth: 1, strokeDashArray: [8] },
  }

  return [
    // Basic
    h(Line, { start: a, end: b, ...styles.control }),
    h(Line, { start: b, end: c, ...styles.control }),
    h(Line, { start: c, end: d, ...styles.control }),


    // Midpoints (1st)
    h(Line, { start: ab, end: bc, ...styles.midpoint1 }),
    h(Line, { start: bc, end: cd, ...styles.midpoint1 }),

    // Midpoints (2nd)
    h(Line, { start: abc, end: bcd, ...styles.midpoint2 }),
  ]
}

export const PointTextHOC = <V extends AnyVector>(v: VectorAPI<V>) =>
  ({ point }: { point: V }) => {
    return h('text', {}, v.ComponentsAPI.components(point).join(' '))
  }

export const PointText2D = PointTextHOC(Vector2D);