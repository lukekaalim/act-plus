import { useEffect, useMemo, useState } from "@lukekaalim/act"
import { BezierAnimation } from "./animation";
import { curve3, curve4, lerp } from "./math";
import { getSpanProgress } from "./time";

const kick = 50;

export const useAnimatedValue = (initial: number, duration: number) => {
  const [anim, setAnim] = useState<BezierAnimation>({
    span: { start: 0, end: 0 },
    points: [initial,initial,initial,initial],
  });

  const setValue = useMemo(() => (newValue: number, now: DOMHighResTimeStamp) => {
    setAnim(prevAnim => {
      const progress = getSpanProgress(prevAnim.span, now);
      const [a, b, c, d] = prevAnim.points;

      const e = curve3(a, b, c, progress);
      const f = curve3(b, c, d, progress);
      const point = lerp(e, f, progress);

      const distance = newValue - point;
      const direction = distance === 0 ? 0 : distance / Math.abs(distance);
      
      return {
        span: { start: now, end: now + duration },
        points: [point, f + (direction * kick), newValue, newValue]
      }
    })
  }, [duration]);

  return [anim, setValue] as const;
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