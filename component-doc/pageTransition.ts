import { BezierAnimation, createTransitionHook } from "@lukekaalim/act-curve";
import { DocPage } from './DocPage';

type PageTransitionState = {
  page: DocPage,
  animation: BezierAnimation,
}

export const usePageTransition = createTransitionHook<DocPage, string, PageTransitionState>({
  calculateKey(value) {
    return value.path;
  },
  createState(value, index) {
    const now = performance.now();
    return {
      page: value,
      animation: {
        span: { start: now, end: now + 250 },
        points: [-1, -1, 0, 0]
      }
    }
  },
  updateState(prevState, next) {
    return { ...prevState, page: next };
  },
  removeState(prevState) {
    return { type: 'exiting' };
  },
  stateFilter(state) {
    
  },
});