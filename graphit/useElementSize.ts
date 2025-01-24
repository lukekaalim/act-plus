import { ReadonlyRef, Ref, useEffect, useState } from "@lukekaalim/act";
import { Vector } from "./vector";

export const useElementSize = (ref: ReadonlyRef<Element | null>) => {
  const [size, setSize] = useState(Vector(2).create());

  useEffect(() => {
    const element = ref.current;
    if (!element)
      return;

    const observer = new ResizeObserver(() => {
      const rect = element.getBoundingClientRect();
      setSize(prev => {
        if (prev.x !== rect.width && prev.y !== rect.height)
          return { x: rect.width, y: rect.height };
        return prev;
      })
    });
    observer.observe(element, { });
    return () => {
      observer.disconnect()
    }
  }, []);

  return size;
};