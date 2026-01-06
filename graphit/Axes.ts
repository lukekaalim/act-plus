import { Component, Deps, h, Node, useEffect, useRef, useState } from "@lukekaalim/act"
import { Vector } from "./vector"
import { Group, Line, Rect } from "./elements"
import { Vector2D } from "@lukekaalim/act-curve"
import { assertRefs } from "./ResizingSpace"

export type PositiveAxesProps = {
  size: Vector<2>,
  position: Vector<2>,
  axes?: { x: Node, y: Node }
}

export const PositiveAxes: Component<PositiveAxesProps> = ({ size, position, children, axes }) => {
  return [
    !!axes && h(Group, { position }, [
      h('text', { fill: 'red', x: 0, y: -30 }, axes.x),
      h('text', { fill: 'blue', x: 0, y: -30, transform: `rotate(-90)`, 'text-anchor': 'end' }, axes.y),
    ]),
    h(Line, {
      start: { x: position.x, y: position.y },
      end: { x: size.x + position.x, y: position.y },
      stroke: 'red',
    }),
    h(Line, {
      start: { x: position.x, y: position.y },
      end: { x: position.x, y: size.y + position.y },
      stroke: 'blue',
    }),
    h(Rect, { position: { x: position.x + size.x - 3, y: position.y - 3 }, size: { x: 6, y: 6 }, fill: 'red', stroke: 'none' }),
    h(Rect, { position: { x: position.x - 3, y: position.y + size.y - 3 }, size: { x: 6, y: 6 }, fill: 'blue', stroke: 'none' }),
    h(Group, { position }, children)
  ]
}

export type ZeroBasedAxesProps = {
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
      start: { x: position.x, y: position.y + (size.y / 2) },
      end: { x: size.x + position.x, y: position.y + (size.y / 2) },
      stroke: 'red',
    }),
    h(Line, {
      start: { x: position.x + (size.x / 2), y: position.y },
      end: { x: position.x + (size.x / 2), y: size.y + position.y },
      stroke: 'blue',
    }),

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