import { ReadonlyRef, useEffect, useState } from "@lukekaalim/act";
import { Vector } from "./vector";

export const useDrag = (
  ref: ReadonlyRef<null | HTMLElement | SVGElement>,
  onElementMove: (positionDelta: Vector<2>) => void,
  shouldStartDrag: (event: PointerEvent) => boolean = () => true,
) => {
  const [dragging, setDragging] = useState(false);
  
  useEffect(() => {
    const el = ref.current as HTMLElement;
    if (!el)
      return;
    let dragging = false;
    const onPointerDown = (event: PointerEvent) => {
      if (event.defaultPrevented)
        return;
      if (!shouldStartDrag(event))
        return;
      event.preventDefault();
      setDragging(true);
      dragging = true;
      el.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || event.defaultPrevented)
        return;
      event.preventDefault();
      onElementMove({ x: event.movementX, y: event.movementY });
    };
    const onPointerUp = (event: PointerEvent) => {
      onElementMove({ x: event.movementX, y: event.movementY });
      setDragging(false);
      dragging = false;
      el.releasePointerCapture(event.pointerId);
    };
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
    }
  }, [onElementMove]);

  return dragging;
}