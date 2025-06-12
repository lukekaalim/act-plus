import { useEffect, useMemo, useState } from "@lukekaalim/act"
import { getSpanProgress } from "./time";
import { Bezier4Animation } from "./animation";
import { Animation1D, Vector1D } from "./vectors";

const kick = 50;

export const useAnimatedValue = (initial: number, duration: number) => {
  const [anim, setAnim] = useState<Bezier4Animation<Vector1D>>({
    span: { start: 0, end: 0 },
    points: [{x:initial},{x:initial},{x:initial},{x:initial}],
  });

  const setValue = useMemo(() => (newValue: number, now: DOMHighResTimeStamp) => {
    setAnim(prevAnim => {
      const newVector = { x: newValue };

      const progress = getSpanProgress(prevAnim.span, now);
      const [a, b, c, d] = prevAnim.points;

      const { curve3, VectorAPI } = Animation1D.CurveAPI;
      const { interpolate } = VectorAPI;

      const e = curve3(a, b, c, progress);
      const f =  curve3(b, c, d, progress);
      const point = interpolate(e, f, progress);

      const distance = newVector.x - point.x;
      const direction = distance === 0 ? 0 : distance / Math.abs(distance);
      
      return {
        span: { start: now, end: now + duration },
        points: [point, {x:f.x + (direction * kick)}, newVector, newVector]
      }
    })
  }, [duration]);

  return [anim, setValue] as const;
}
