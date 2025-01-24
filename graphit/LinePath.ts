import { Component, h, useMemo } from "@lukekaalim/act"
import { Vector } from "./vector"

export type LinePathProps = {
  calcPoint: (progress: number) => Vector<2>,
  resolution?: number,

  stroke?: string,
  strokeWidth?: number,
}

export const LinePath: Component<LinePathProps> = ({
  calcPoint,
  resolution = 20,
  stroke = 'black',
  strokeWidth = 1,
}) => {
  const points = useMemo(() => {
    const points = [];
    for (let i = 0; i < resolution+1; i++) {
      const progress = i/resolution;
      points.push(calcPoint(progress));
    }
    return points;
  }, [calcPoint]);

  return h('polyline', {
    points: points.map(({ x, y }) => `${x.toFixed(4)},${y.toFixed(4)}`).join(' '),
    stroke,
    'stroke-width': strokeWidth,
    fill: 'none'
  })
}