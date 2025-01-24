import { Component, h } from "@lukekaalim/act";
import { Vector } from "./vector";

export type AxisProps = {
  offset: number,

  axis: Vector<2>,
  size: Vector<2>,
}

export const Axis: Component<AxisProps> = ({ axis, size, offset }) => {
  return h('line', {
    x1: (axis.y * offset),
    x2: (axis.x * size.x) + (axis.y * offset),

    y1: (axis.x * offset),
    y2: (axis.x * offset) + (axis.y * size.y),

    stroke: 'lightblue',
    'stroke-width': '1px'
  })
};