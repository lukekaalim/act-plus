export type Span = {
  start: DOMHighResTimeStamp,
  end: DOMHighResTimeStamp
};

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