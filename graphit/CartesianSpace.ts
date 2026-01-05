import { Component, h, Node, Ref, useEffect, useMemo, useRef, useState } from "@lukekaalim/act"
import { SVG } from "@lukekaalim/act-web"
import { useElementSize } from "./useElementSize";
import { Axis, AxisController } from "./Axis";

import classes from './CartesianSpace.module.css';
import { Grid } from "./Grid";
import { Vector } from "./vector";
import { off } from "process";
import { useDrag } from "./useDrag";
import { Vector2D } from "@lukekaalim/act-curve";
import { assertRefs } from "./ResizingSpace";

export type CartesianSpaceController = {
  position: Vector<2>,
  size: Vector<2>,

  update(): void,
};

export type CartesianSpaceProps = {
  offset?: Vector<2>,

  style?: unknown,
  overlay?: Node,
  initialPosition?: Vector<2>,
  onDragComplete?: (position: Vector<2>) => void,

  refs?: {
    controller?: Ref<null | CartesianSpaceController>,
    axisX?: Ref<null | SVGLineElement>,
    axisY?: Ref<null | SVGLineElement>,
    pattern?: Ref<null | SVGPatternElement>,
  }
}

const createSpaceController = () => {

};

export const CartesianSpace: Component<CartesianSpaceProps> = ({
  children, offset = Vector(2).create(), style, overlay,
  onDragComplete, initialPosition,
  refs: { controller: controllerRef } = {},
  ...props
}) => {
  const ref = useRef<SVGSVGElement | null>(null);

  const size = useElementSize(ref);

  const onDrag = useMemo(() => {
    return (delta: Vector<2>) => {
      controller.position.x += delta.x;
      controller.position.y += delta.y;
      controller.update();
    }
  }, [onDragComplete])

  const patternRef = useRef<SVGPatternElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null);
  const XAxisRef = useRef<AxisController | null>(null);
  const YAxisRef = useRef<AxisController | null>(null);

  useEffect(() => {
      const { xAxis, yAxis } = assertRefs({ xAxis: XAxisRef, yAxis: YAxisRef });
      xAxis.size = size;
      yAxis.size = size;
      xAxis.update();
      yAxis.update();
  }, [size])

  const controller = useMemo(() => {
    const controller = {
      position: Vector2D.ZERO,
      size: Vector2D.ZERO,
      update() {
        const { pattern, group, svg, xAxis, yAxis } = assertRefs({
          pattern: patternRef, group: groupRef, svg: ref, xAxis: XAxisRef, yAxis: YAxisRef
        });

        pattern.x.baseVal.value = controller.position.x;
        pattern.y.baseVal.value = controller.position.y;

        const transform = svg.createSVGTransform()
        transform.setTranslate(controller.position.x, controller.position.y);

        group.transform.baseVal.initialize(transform);
        xAxis.offset = controller.position.y;
        yAxis.offset = controller.position.x;

        xAxis.update();
        yAxis.update();
      },
    }
    if (controllerRef)
      controllerRef.current = controller;

    return controller;
  }, [])

  const dragging = useDrag(ref, onDrag, event => {
    if (event.target instanceof HTMLElement)
      switch (event.target.tagName) {
        case 'BUTTON':
        case 'INPUT':
        case 'A':
          return false;
      }
    return true;
  })

  //const combinedOffset = Vector(2).add(dragOffset, offset);

  return h(SVG, {}, h('svg', { ...props, ref, class: [classes.cartesianSpace, dragging && classes.dragging].join(' '), style }, [
    h(Grid, { offset: controller.position, strokeWidth: 1, scale: { x: 50, y: 50 }, refs: { pattern: patternRef } }),
    h(Axis, { axis: { x: 1, y: 0 }, size, offset: 0, controllerRef: XAxisRef }),
    h(Axis, { axis: { x: 0, y: 1 }, size, offset: 0, controllerRef: YAxisRef }),
    h('g', { transform: `translate(${controller.position.x} ${controller.position.y})`, ref: groupRef }, [
      children,
    ]),
    overlay || null,
  ]))
}