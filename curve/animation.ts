import { useEffect } from "@lukekaalim/act";
import { getSpanProgress, Span } from "./time"
import { curve4 } from "./math";

export type BezierAnimation<T = number> = {
  span: Span,
  points: [T, T, T, T],
}

export const useBezierAnimation = (anim: BezierAnimation, onFrame: (point: number) => void) => {
  useEffect(() => {
    const callback = () => {
      const now = performance.now();
      const progress = getSpanProgress(anim.span, now);
      const [a, b, c, d] = anim.points;
      const point = curve4(a, b, c, d, progress);
      onFrame(point);

      id = requestAnimationFrame(callback);
    };
    let id = requestAnimationFrame(callback);
    return () => {
      cancelAnimationFrame(id);
    }
  }, [anim, onFrame])
};