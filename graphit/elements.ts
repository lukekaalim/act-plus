import { Component, h } from "@lukekaalim/act";
import { Vector } from "./vector";

export type StrokeProps = {
  stroke?: string,
  strokeWidth?: number,
  strokeDashArray?: number[],

  fill?: string,  
}

export const convertStrokeToSVGAttributes = (stroke: StrokeProps): Record<string, string> => {
  const attributes: Record<string, string> = {};

  if (stroke.stroke)
    attributes['stroke'] = stroke.stroke;
  else
    attributes['stroke'] = 'black';
  
  if (stroke.strokeWidth)
    attributes['stroke-width'] = stroke.strokeWidth.toString();
  else
    attributes['stroke-width'] = '1';

  if (stroke.fill) {
    attributes['fill'] = stroke.fill;
  }
  if (stroke.strokeDashArray) {
    attributes['stroke-dasharray'] = stroke.strokeDashArray.join(' ');
  }

  return attributes;
}

export type LineProps = (
  | { x1: number, y1: number, x2: number, y2: number }
  | { start: Vector<2>, end: Vector<2> }
) & StrokeProps;

export const Line: Component<LineProps> = (props) => {
  if ('x1' in props) {
    const { x1, x2, y1, y2, ...extraProps } = props
    return h('line', { x1, x2, y1, y2, ...convertStrokeToSVGAttributes(extraProps) });
  } else {
    const { start, end, ...extraProps } = props
    return h('line', { x1: start.x, x2: end.x, y1: start.y, y2: end.y, ...convertStrokeToSVGAttributes(extraProps)  });
  }
}

export type CircleProps = (
  | { cx: number, cy: number, r: number, }
  | { center: Vector<2>, radius: number }
) & StrokeProps

export const Circle: Component<CircleProps> = (props) => {
  if ("center" in props) {
    const { center, radius, ...otherProps } = props;
    return h('circle', {
      cx: center.x,
      cy: center.y,
      r: radius,
      ...convertStrokeToSVGAttributes(otherProps),
    })
  } else {
    const { cx, cy, r, ...otherProps } = props
    return h('circle', { cx, cy, r, ...convertStrokeToSVGAttributes(otherProps) })
  }
}