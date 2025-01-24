import { Component, h, useMemo, useRef } from "@lukekaalim/act"
import { Vector } from "./vector"
import { HTML } from "@lukekaalim/act-web"
import { useDrag } from "./useDrag"

export type EditablePointProps = {
  point: Vector<2>,
  onPointEdit?: (updater: (prev: Vector<2>) => Vector<2>) => void,
}

export const EditablePoint: Component<EditablePointProps> = ({
  point,
  onPointEdit = () => {}
}) => {
  const ref = useRef<SVGCircleElement | null>(null);

  const onDrag = useMemo(() => {
    return (delta: Vector<2>) => {
      onPointEdit(prev => Vector(2).add(prev, delta))
    }
  }, [])

  // so stupid...
  useDrag(ref, onDrag);

  return [
    h('circle', { cx: point.x, cy: point.y, r: 5, ref }),
  ]
}