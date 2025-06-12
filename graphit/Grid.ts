import { Component, createId, h, ReadonlyRef, useMemo, useState } from "@lukekaalim/act";
import { Vector } from "./vector";

export type GridProps = {
  offset?: Vector<2>,
  scale?: Vector<2>,

  stroke?: string,
  strokeWidth?: number,
  ref?: ReadonlyRef<SVGRectElement>
};

export const Grid: Component<GridProps> = ({
  offset = Vector(2).create(),
  scale = Vector(2).scalar.add(Vector(2).create(), 100),
  stroke = "grey",
  strokeWidth = 1,
  ref = {},
}) => {
  const [gridId] = useState(createId());

  return [
    h('defs', {}, [
      h('pattern', {
        id: gridId,
        width: `${scale.x}px`,
        height: `${scale.y}px`,
        x: offset.x,
        y: offset.y,
        patternUnits: 'userSpaceOnUse'
      }, [
        h('path', {
          d: `M ${scale.x} 0 L 0 0 0 ${scale.y}`,
          fill: 'none',
          stroke,
          'stroke-width': strokeWidth
        })
      ])
    ]),
    h('rect', { ref, width: '100%', height: '100%', fill: `url(#${gridId})` })
  ]
}