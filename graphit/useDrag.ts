import { ReadonlyRef, useEffect, useState } from "@lukekaalim/act";
import { Vector } from "./vector";

type EventMap = {
  [K in keyof (HTMLElementEventMap & SVGElementEventMap)]?:
    (event: (HTMLElementEventMap & HTMLElementEventMap)[K]) => void
};

/**
 * Subscribe to a lot of events on an element,
 * and then unsubscribe to them all at once
 * when you are done.
 * 
 * @param element The element you want to subscribe to events for
 * @param eventMap A object where every key is the "type" of event and the value is
 * the event handler function itself
 * @returns An object with an "unsubscribe" function attached. Call that function
 * to remove all event listeners
 * 
 * @throws If the provided element is null
 */
export const subscribeMap = (
  element: HTMLElement | SVGElement | null,
  eventMap: EventMap
) => {
  type K = keyof EventMap;

  if (!element)
    throw new Error();
  
  for (const key in eventMap) {
    element.addEventListener(key as K, eventMap[key as K] as any);
  }
  return {
    unsubscribe() {
      for (const key in eventMap) {
        element.removeEventListener(key as K, eventMap[key as K] as any);
      }
    }
  }
};

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

    const sub = subscribeMap(ref.current, {
      wheel(event) {
        if (event.defaultPrevented)
          return;
        event.preventDefault();
        onElementMove({ x: -event.deltaX, y: -event.deltaY });
      },
      pointerdown(event) {
        if (event.defaultPrevented)
          return;
        if (!shouldStartDrag(event))
          return;
        if (event.button > 1)
          return;
        event.preventDefault();
        setDragging(true);
        dragging = true;
        el.setPointerCapture(event.pointerId);
      },
      pointermove(event) {
        if (!dragging || event.defaultPrevented)
          return;
  
        event.preventDefault();
        onElementMove({ x: event.movementX, y: event.movementY });
      },
      pointerup(event) {
        onElementMove({ x: event.movementX, y: event.movementY });
        setDragging(false);
        dragging = false;
        el.releasePointerCapture(event.pointerId);
      },
    })

    return () => {
      sub.unsubscribe();
    }
  }, [onElementMove]);

  return dragging;
}