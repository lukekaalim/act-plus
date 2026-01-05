import { Component, h, Ref } from "@lukekaalim/act";
import { Vector } from "./vector";

export type SVGCoreProps<T extends SVGElement = SVGElement> = {
  ref?: Ref<null | T>,
  stroke?: string,
  strokeWidth?: number,
  strokeDashArray?: number[],

  fill?: string,  
}

export const remapCoreProps = <T extends SVGElement>(props: SVGCoreProps<T>): Record<string, unknown> => {
  const attributes: Record<string, unknown> = {};

  if (props.stroke)
    attributes['stroke'] = props.stroke;
  else
    attributes['stroke'] = 'black';
  
  if (props.strokeWidth)
    attributes['stroke-width'] = props.strokeWidth.toString();
  else
    attributes['stroke-width'] = '1';

  if (props.fill) {
    attributes['fill'] = props.fill;
  }
  if (props.strokeDashArray) {
    attributes['stroke-dasharray'] = props.strokeDashArray.join(' ');
  }
  if (props.ref)
    attributes['ref'] = props.ref;

  return attributes;
}

export type LineProps = (
  | { x1: number, y1: number, x2: number, y2: number }
  | { start: Vector<2>, end: Vector<2> }
) & SVGCoreProps<SVGLineElement>;

export const Line: Component<LineProps> = (props) => {
  if ('x1' in props) {
    const { x1, x2, y1, y2, ...extraProps } = props
    return h('line', { x1, x2, y1, y2, ...remapCoreProps(extraProps) });
  } else {
    const { start, end, ...extraProps } = props
    return h('line', { x1: start.x, x2: end.x, y1: start.y, y2: end.y, ...remapCoreProps(extraProps)  });
  }
}

export type CircleProps = (
  | { cx: number, cy: number, r: number, }
  | { center: Vector<2>, radius: number }
) & SVGCoreProps<SVGCircleElement>

export const Circle: Component<CircleProps> = (props) => {
  if ("center" in props) {
    const { center, radius, ...otherProps } = props;
    return h('circle', {
      cx: center.x,
      cy: center.y,
      r: radius,
      ...remapCoreProps(otherProps),
    })
  } else {
    const { cx, cy, r, ...otherProps } = props
    return h('circle', { cx, cy, r, ...remapCoreProps(otherProps) })
  }
}

export type RectProps = (
  | { x: number, y: number, width: number, height: number }
  | { position: Vector<2>, size: Vector<2> }
) & SVGCoreProps<SVGRectElement>

export const Rect: Component<RectProps> = (props) => {
  if ("position" in props) {
    const { position, size, ...otherProps } = props;
    return h('rect', {
      x: position.x,
      y: position.y,
      width: size.x,
      height: size.y,
      ...remapCoreProps(otherProps)
    })
  } else {
    const { x, y, width, height, ...otherProps } = props
    return h('circle', { x, y, width, height, ...remapCoreProps(otherProps) })
  }
}

export type GroupProps = {
  position: Vector<2>,
} & SVGCoreProps

export const Group: Component<GroupProps> = ({ position, children }) => {
  return h('g', { transform: `translate(${position.x} ${position.y})` }, children)
}