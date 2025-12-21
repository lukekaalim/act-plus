import { Component, h, useMemo, useRef, useState } from "@lukekaalim/act"
import { SVG } from "@lukekaalim/act-web"
import { useElementSize } from "./useElementSize";
import { Axis } from "./Axis";

import classes from './CartesianSpace.module.css';
import { Grid } from "./Grid";
import { Vector } from "./vector";
import { off } from "process";
import { useDrag } from "./useDrag";

export type CartesianSpaceProps = {
  offset?: Vector<2>,
  style?: unknown,
}

export const CartesianSpace: Component<CartesianSpaceProps> = ({ children, offset = Vector(2).create(), style }) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const size = useElementSize(ref);

  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const onDrag = useMemo(() => {
    return (delta: Vector<2>) => setDragOffset(prev => Vector(2).add(prev, delta))
  }, [])
  const dragging = useDrag(ref, onDrag, event => {
    if (event.target instanceof HTMLElement)
      if (event.target.tagName === 'BUTTON')
        return false;
    return true;
  })

  const combinedOffset = Vector(2).add(dragOffset, offset);

  return h(SVG, {}, h('svg', { ref, class: [classes.cartesianSpace, dragging && classes.dragging].join(' '), style }, [
    h(Grid, { offset: combinedOffset, strokeWidth: 1, scale: { x: 50, y: 50 } }),
    //h(Grid, { offset: combinedOffset, scale: Vector(2).scalar.add(Vector(2).create(), 50), stroke: 'grey' }),
    h(Axis, { axis: { x: 1, y: 0 }, size, offset: combinedOffset.y }),
    h(Axis, { axis: { x: 0, y: 1 }, size, offset: combinedOffset.x }),
    h('g', { transform: `translate(${combinedOffset.x} ${combinedOffset.y})` }, [
      children,
    ])
  ]))
}