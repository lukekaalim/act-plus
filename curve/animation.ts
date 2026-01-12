import { Ref, useEffect, useRef } from "@lukekaalim/act";
import { getSpanProgress, Span } from "./time"
import { CurveAPI } from "./curve";
import { AnyVector, Vector } from "@lukekaalim/act-graphit";
import { Dimension } from "@lukekaalim/act-graphit/dimensions";
import { bezier } from "./bezier";
import { VectorAPI } from "./mod";

export type Bezier4Animation<V extends AnyVector> = {
  span: Span,
  points: [start: V, startControl: V, endControl: V, end: V],
}

export type Bezier4AnimationState<T extends AnyVector> = {
  progress: number,
  point: T,
  velocity: T,
}

export type Anim<V extends AnyVector> = Bezier4Animation<V>;

export const Anim = {
  createStatic<V extends AnyVector>(point: V): Anim<V> {
    return {
      span: { start: 0, end: 0 },
      points: [point, point, point, point],
    }
  },
  smooth<V extends AnyVector>(api: Bezier4AnimationAPI<V>, anim: Anim<V>, endPosition: V, duration: number): Anim<V> {
    const now = performance.now();
    const state = api.calcState(anim, now);

    return {
      span: { start: now, end: now + duration },
      points: [
        state.point,
        api.CurveAPI.VectorAPI.add(state.point, api.CurveAPI.VectorAPI.ScalarAPI.multiply(state.velocity, 0.3)),
        endPosition,
        endPosition,
      ],
    }
  },
  kick<V extends AnyVector>(api: Bezier4AnimationAPI<V>, anim: Anim<V>, endPosition: V, duration: number): Anim<V> {
    const now = performance.now();
    const state = api.calcState(anim, now);

    return {
      span: { start: now, end: now + duration },
      points: [
        state.point,
        endPosition,
        endPosition,
        endPosition,
      ],
    }
  },
  bounce<V extends AnyVector>(api: Bezier4AnimationAPI<V>, anim: Anim<V>, endPosition: V, duration: number): Anim<V> {
    const now = performance.now();
    const state = api.calcState(anim, now);

    return {
      span: { start: now, end: now + duration },
      points: [
        state.point,
        endPosition,
        endPosition,
        endPosition,
      ],
    }
  },
}

export type Bezier4AnimationAPI<V extends AnyVector> = {
  CurveAPI: CurveAPI<V>,

  useAnimation(anim: Bezier4Animation<V>, onFrame: (point: V) => void): void,

  calcState(anim: Bezier4Animation<V>, time: DOMHighResTimeStamp): Bezier4AnimationState<V>,
}

export type AnimationAPI<T extends AnyVector> = {
  CurveAPI: CurveAPI<T>,
  Bezier4: Bezier4AnimationAPI<T>
}

export const createAnimationAPI = <T extends AnyVector>(CurveAPI: CurveAPI<T>) => {
  const { VectorAPI } = CurveAPI;
  const { ScalarAPI } = VectorAPI;

  const Bezier4: Bezier4AnimationAPI<T> = {
    CurveAPI,
    useAnimation(anim, onFrame) {
      useEffect(() => {
        const callback = () => {
          const now = performance.now();
          const progress = getSpanProgress(anim.span, now);
          const [a, b, c, d] = anim.points;
          const point = CurveAPI.curve4(a, b, c, d, progress);
          onFrame(point);
    
          if (progress < 1)
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
        progress,
      }
    }
  }

  return { Bezier4, CurveAPI };
}
