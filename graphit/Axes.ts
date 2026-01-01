import { Component, Deps, h, useEffect, useRef, useState } from "@lukekaalim/act"
import { Vector } from "./vector"
import { Line } from "./elements"
import { Vector2D } from "@lukekaalim/act-curve"
import { assertRefs } from "./ResizingSpace"

export const PositiveAxes = () => {

}

export type ZeroBasedAxesProps = {
  /**
   * Absolute size of the axes (in SVG units),
   * extending from zero in both positive and
   * negative directions.
   */
  size: Vector<2>,
  position: Vector<2>,
}

export const ZeroBasedAxes: Component<ZeroBasedAxesProps> = ({
  size,
  position,
  children,
}) => {
  return [
    h(Line, {
      start: { x: (size.x * -1) + position.x, y: position.y },
      end: { x: size.x + position.x, y: position.y },
      stroke: 'red',
    }),
    h(Line, {
      start: { x: position.x, y: (size.y * -1) + position.y },
      end: { x: position.x, y: size.y + position.y },
      stroke: 'blue',
    }),
    h('rect', { x: position.x + size.x - 2, y: position.y - 2, fill: 'red', width: 4, height: 4 }),
    h('rect', { x: position.x - size.x - 2, y: position.y - 2, fill: 'red', width: 4, height: 4 }),
    h('rect', { x: position.x - 2, y: position.y + size.y - 2, fill: 'blue', width: 4, height: 4 }),
    h('rect', { x: position.x - 2, y: position.y - size.y - 2, fill: 'blue', width: 4, height: 4 }),
    h('g', { transform: `translate(${position.x} ${position.y})` },
      children
    ),
  ]
}


export type UnitSizeProps = {
  size: Vector<2>,
  deps?: Deps,
}

export const UnitSize: Component<UnitSizeProps> = ({ size, children, deps = [] }) => {
  const ref = useRef<SVGGElement | null>(null);

  useEffect(() => {
    const { group } = assertRefs({ group: ref });
    const svg = group.ownerSVGElement;
    const parent = group.parentNode;
    if (!svg || !(parent instanceof SVGElement))
      return;


    group.transform.baseVal.clear();

    const parentSpace = parent.getBoundingClientRect();
    const bounds = group.getBoundingClientRect();

    const scale = svg.createSVGTransform();
    const translate = svg.createSVGTransform();
    
    scale.setScale(
      (1 / bounds.width) * size.x,
      (1 / bounds.height) * size.y
    )
    translate.setTranslate(
      bounds.x - parentSpace.x,
      bounds.y - parentSpace.y
    )
    console.log(parent, {
      x: bounds.x - parentSpace.x,
      y: bounds.y - parentSpace.y
    })
    
    group.transform.baseVal.appendItem(translate);
    group.transform.baseVal.appendItem(scale);
  }, deps)

  return h('g', { ref }, children)
}