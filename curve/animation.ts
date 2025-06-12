import { useEffect } from "@lukekaalim/act";
import { getSpanProgress, Span } from "./time"
import { CurveAPI } from "./curve";

export type Bezier4Animation<T> = {
  span: Span,
  points: [start: T, startControl: T, endControl: T, end: T],
}

export type Bezier4AnimationState<T> = {
  point: T,
  velocity: T,
}

export type Bezier4AnimationAPI<T> = {
  useAnimation(anim: Bezier4Animation<T>, onFrame: (point: T) => void): void,

  calcState(anim: Bezier4Animation<T>, time: DOMHighResTimeStamp): Bezier4AnimationState<T>,
}

export type AnimationAPI<T> = {
  CurveAPI: CurveAPI<T>,
  Bezier4: Bezier4AnimationAPI<T>
}

export const createAnimationAPI = <T>(CurveAPI: CurveAPI<T>) => {
  const { VectorAPI } = CurveAPI;
  const { ScalarAPI } = VectorAPI;

  const Bezier4: Bezier4AnimationAPI<T> = {
    useAnimation(anim, onFrame) {
      useEffect(() => {
        const callback = () => {
          const now = performance.now();
          const progress = getSpanProgress(anim.span, now);
          const [a, b, c, d] = anim.points;
          const point = CurveAPI.curve4(a, b, c, d, progress);
          onFrame(point);
    
          id = requestAnimationFrame(callback);
        };
        let id = requestAnimationFrame(callback);
        return () => {
          cancelAnimationFrame(id);
        }
      }, [anim, onFrame])
    },
    calcState(anim, time) {
      const progress = getSpanProgress(anim.span, time);
      const [a, b, c, d] = anim.points;

      const abc = CurveAPI.curve3(a, b, c, progress);
      const bcd = CurveAPI.curve3(b, c, d, progress);

      const point = VectorAPI.interpolate(abc, bcd, progress);
      const velocity = VectorAPI.subtract(point, bcd);
      
      return {
        point,
        velocity,
      }
    }
  }

  return { Bezier4, CurveAPI };
}
