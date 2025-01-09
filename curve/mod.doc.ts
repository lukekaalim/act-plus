import { h } from "@lukekaalim/act";
import { hs, SVG } from "@lukekaalim/act-web";
import { curve1, lerp } from "./math";

type Vector2 = { x: number, y: number };
const Vector2 = {
  new: (x: number, y: number): Vector2 => ({ x, y }),
  scalar: {
    add: (a: Vector2, b: number) => Vector2.new(a.x + b, a.y + b),
    multiply: (a: Vector2, b: number) => Vector2.new(a.x * b, a.y * b),
  }
}
type Line2 = { start: Vector2, end: Vector2 };
const Line2 = {
  new: (start: Vector2, end: Vector2): Line2 => ({ start, end }),
} 

const lerp2d = (a: Vector2, b: Vector2, t: number): Vector2 => {
  return Vector2.new(
    lerp(a.x, b.x, t),
    lerp(a.y, b.y, t),
  )
}

const drawLine = (draw: (progress: number) => Vector2, resolution: number): Line2[] => {
  return Array.from({ length: resolution }).map((_, index) => {
    const startProgress = index/resolution;
    const endProgress = (index+1)/resolution;
    return Line2.new(
      draw(startProgress),
      draw(endProgress),
    );
  })
}

export default () => {
  const start = Vector2.new(0, 0);
  const mid = Vector2.new(0, 50);
  const end = Vector2.new(50, 50);

  const lines = drawLine((p) => {
    let v = Vector2.new(
      curve1(start.x, mid.x, end.x, p),
      curve1(start.y, mid.y, end.y, p)
    )
    v = Vector2.scalar.add(v, 20);

    return v;
  }, 100);

  return h(SVG, {}, h('svg', { className: '' }, [
    lines.map(line => h('line', {
      stroke: 'black',
      x1: line.start.x,
      y1: line.start.y,
      x2: line.end.x,
      y2: line.end.y
    }))
  ]))
};
