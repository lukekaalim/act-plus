import { Component, h, Node, useEffect, useMemo, useRef } from "@lukekaalim/act"
import { Vector } from "./vector"
import { HTML } from "@lukekaalim/act-web"
import { useDrag } from "./useDrag"
import { Animation1D, Animation2D, Curve2D, useAnimatedValue } from "@lukekaalim/act-curve"

export type EditablePointProps = {
  point: Vector<2>,
  onPointEdit?: (updater: (prev: Vector<2>) => Vector<2>) => void,
}

export const EditablePoint: Component<EditablePointProps> = ({
  point,
  onPointEdit = () => {},
  children
}) => {
  const ref = useRef<SVGCircleElement | null>(null);
  const dottedRef = useRef<SVGCircleElement | null>(null);
  const [value, setValue] = useAnimatedValue(5, 150);

  const onDrag = useMemo(() => {
    return (delta: Vector<2>) => {
      onPointEdit(prev => Vector(2).add(prev, delta))
    }
  }, [])

  // so stupid...
  useDrag(ref, onDrag);

  useEffect(() => {
    const draggable = ref.current;
    const dotted = dottedRef.current;
    if (!dotted || !draggable)
      return;

    const onPointerEnter = () => {
      setValue(15, performance.now())
    }
    const onPointerLeave = () => {
      setValue(5, performance.now())
    }

    draggable.addEventListener('pointerenter', onPointerEnter)
    draggable.addEventListener('pointerleave', onPointerLeave)
    return () => {
      draggable.removeEventListener('pointerenter', onPointerEnter)
      draggable.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  Animation1D.Bezier4.useAnimation(value, point => {
    const dotted = dottedRef.current;
    if (!dotted)
      return;

    dotted.setAttribute('r', Math.max(0, point.x).toFixed())
  })

  return [
    h('circle', { cx: point.x, cy: point.y, ref: dottedRef, style:
      { 'pointer-events': 'none' }, fill: 'none', stroke: 'black', 'stroke-dasharray': 4 }),
    h('circle', { cx: point.x, cy: point.y, r: 15, ref, fill: 'none', stroke: 'none' }),
    h('circle', { cx: point.x, cy: point.y, r: 6, style: { 'pointer-events': 'none' } }),
    isEmptyNode(children) && h('g', { transform: `translate(${point.x + 15} ${point.y - 15})` }, children)
  ]
}

const isEmptyNode = (node: Node) => {
  switch (typeof node) {
    case 'object':
      if (Array.isArray(node))
        return node.length > 0;
      return true;
    default:
      return true;
    case 'boolean':
      return node;
    case 'string':
    case 'number':
      return !!node;
    case 'undefined':
      return false;
  }
}