import { Component, h, Ref, useMemo, useRef } from "@lukekaalim/act";
import { Vector } from "./vector";
import { assertRefs } from "./ResizingSpace";

export type AxisProps = {
  offset: number,

  axis: Vector<2>,
  size: Vector<2>,

  ref?: Ref<null | SVGLineElement>,
  controllerRef?: Ref<null | AxisController>,
}

export type AxisController = {
  offset: number,
  size: Vector<2>,
  update(): void,
}

export const Axis: Component<AxisProps> = ({ axis, size, offset, ref, controllerRef }) => {
  const localRef = useRef<SVGLineElement | null>(null);

  const finalRef = ref || localRef;

  const controller = useMemo(() => {
    const controller = {
      offset,
      size,
      update() {
        const { line } = assertRefs({ line: finalRef });

        line.x1.baseVal.value = (axis.y * controller.offset)
        line.x2.baseVal.value = (axis.x * controller.size.x) + (axis.y * controller.offset)

        line.y1.baseVal.value = (axis.x * controller.offset)
        line.y2.baseVal.value = (axis.x * controller.offset) + (axis.y * controller.size.y)
      }
    }
    
    if (controllerRef)
      controllerRef.current = controller;

    return controller;
  }, []);

  return h('line', {
    x1: (axis.y * controller.offset),
    x2: (axis.x * controller.size.x) + (axis.y * controller.offset),

    y1: (axis.x * controller.offset),
    y2: (axis.x * controller.offset) + (axis.y * controller.size.y),

    stroke: 'lightblue',
    'stroke-width': '4px',
    ref: finalRef,
  })
};