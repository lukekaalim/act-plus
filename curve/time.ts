import { useEffect } from "@lukekaalim/act";

export type Span = {
  start: DOMHighResTimeStamp,
  end: DOMHighResTimeStamp
};

export const Span = {
  point(value: DOMHighResTimeStamp): Span {
    return { start: value, end: value }
  },

  ZERO: { start: 0, end: 0 },
  ONE: { start: 1, end: 1 },
  UNIT: { start: 0, end: 1 },
}

export const getSpanProgress = (span: Span, now: DOMHighResTimeStamp) => {
  const length = span.end - span.start;
  const elapsed = now - span.start;
  if (length === 0)
    return elapsed > 0 ? 1 : 0;
  return clamp(0, 1, elapsed / length);
}

export const clamp = (min: number, max: number, value: number) => {
  return Math.min(max, Math.max(min, value));
}

export const useSpan = (span: Span, onFrame: (progress: number, now: DOMHighResTimeStamp) => unknown) => {
  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now();
      const progress = getSpanProgress(span, now);
      onFrame(progress, now);
    }, 50);
    return () => clearInterval(id);
  }, [onFrame, span])
}