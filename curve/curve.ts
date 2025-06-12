import { lerp } from "./math"
import { VectorAPI } from "./vectors"

/**
 * A simple curve-function factory, so you can build curve interpolations
 * for different _types_ of values (like number and n-dimentional vectors)
 */
export const createCurveAPI = <T>(
  VectorAPI: VectorAPI<T>,
): CurveAPI<T> => {
  const curve3 = (a: T, b: T, c: T, progress: number): T => {
    return VectorAPI.interpolate(
      VectorAPI.interpolate(a, b, progress),
      VectorAPI.interpolate(b, c, progress),
      progress,
    )
  }
  const curve4 = (a: T, b: T, c: T, d: T, progress: number): T => {
    return VectorAPI.interpolate(
      curve3(a, b, c, progress),
      curve3(b, c, d, progress),
      progress,
    )
  }

  return { curve3, curve4, VectorAPI };
}

export type CurveAPI<T> = {
  VectorAPI: VectorAPI<T>,
  curve3(start: T, middle: T, end: T, progress: number): T,
  curve4(start: T, startControl: T, endControl: T, end: T, progress: number): T,
}
