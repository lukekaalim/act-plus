import { Component, h, ReadonlyRef, Ref, useEffect, useRef } from "@lukekaalim/act";
import { Grid } from "./Grid";

type AssertRefsExtends =
  { [key: string]: ReadonlyRef<unknown | null> };

type AssertRefsReturn<T> =
  { [K in keyof T]: T[K] extends Ref<infer X> ? NonNullable<X> : never };

export const assertRefs = <T extends AssertRefsExtends>(
  refs: T
): AssertRefsReturn<T> => {
  const values: Partial<AssertRefsReturn<T>> = {};
  for (const key in refs) {
    const value = refs[key].current;
    if (!value)
      throw new Error();

    values[key] = value as any;
  }

  return values as AssertRefsReturn<T>;
}

export const ResizingSpace: Component = ({ children }) => {
  const gRef = useRef<null | SVGGElement>(null);
  const svgRef = useRef<null | SVGSVGElement>(null);

  useEffect(() => {
    const { group, svg } = assertRefs({ group: gRef, svg: svgRef });
    
    const rect = group.getBoundingClientRect();

    svg.viewBox.baseVal.width = rect.width;
    svg.viewBox.baseVal.height = rect.height;

    svg.viewBox.baseVal.x = rect.x;
    svg.viewBox.baseVal.y = rect.y;
  }, []);

  return h('svg', { ref: svgRef }, [
    h('g', { ref: gRef }, children),
    h(Grid, {  }),
  ])
};

