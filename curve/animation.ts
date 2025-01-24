import { Span } from "./time"

export type BezierAnimation<T = number> = {
  span: Span,
  points: [T, T, T, T],
}