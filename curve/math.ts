export const lerp = (start: number, end: number, progress: number): number => {
  return start + ((end - start) * progress);
}

export const curve3 = (a: number, b: number, c: number, progress: number): number => {
  return lerp(
    lerp(a, b, progress),
    lerp(b, c, progress),
    progress,
  )
}

export const curve4 = (a: number, b: number, c: number, d: number, progress: number): number => {
  return lerp(
    curve3(a, b, c, progress),
    curve3(b, c, d, progress),
    progress,
  )
}


type Bezier4Point = [start: number, control1: number, control2: number, end: number];
