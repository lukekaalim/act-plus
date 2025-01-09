export const lerp = (start: number, end: number, progress: number): number => {
  return start + ((end - start) * progress);
}

export const curve1 = (a: number, b: number, c: number, progress: number): number => {
  return lerp(
    lerp(a, b, progress),
    lerp(b, c, progress),
    progress,
  )
}