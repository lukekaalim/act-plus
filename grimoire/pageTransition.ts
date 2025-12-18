import { Bezier4Animation, createTransitionAPI, Vector1D, Animation1D } from "@lukekaalim/act-curve";
import { Component, createId, h, OpaqueID, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import classes from './PageTransition.module.css';
import { RouterPage } from "@lukekaalim/act-router";

type PageTransitionState = {
  id: OpaqueID<'page-id'>,
  page: RouterPage,
  animation: Bezier4Animation<Vector1D>,
}

const DURATION = 500;

export const SimpleTransition1D = createTransitionAPI<{
  Value: RouterPage,
  Key: string,
  ValueState: PageTransitionState
}>({
  calculateKey(value) {
    return value.path;
  },
  createState(value, index) {
    const now = performance.now();
    return {
      id: createId(),
      page: value,
      animation: {
        span: { start: now, end: now + DURATION },
        points: [
          Vector1D.create(-1),
          Vector1D.create(-1),
          Vector1D.create(0),
          Vector1D.create(0)
        ]
      }
    }
  },
  updateState(prevState, page) {
    return { id: prevState.id, page, animation: prevState.animation };
  },
  removeState(prevState) {
    const now = performance.now();
    const animState = Animation1D.Bezier4.calcState(prevState.animation, now);
    return {
      id: prevState.id,
      page: prevState.page,
      animation: {
        span: { start: now, end: now + DURATION },
        points: [
          animState.point,
          Vector1D.add(animState.point, animState.velocity),
          Vector1D.create(1),
          Vector1D.create(1),
        ]
      }
    };
  },
  stateFilter(state) {
    const now = performance.now();
    const animState = Animation1D.Bezier4.calcState(state.animation, now);
    return animState.point.x < 1;
  },
  moveState(prevState, nextIndex, next) {
    return prevState;
  },
});

export const usePageTransition = (currentPage: RouterPage): PageTransitionState[] => {
  const stateRef = useRef(SimpleTransition1D.start());
  const [counter,setCounter] = useState(0); 

  const states = useMemo(() => {
    SimpleTransition1D.update(stateRef.current, [currentPage]);

    return SimpleTransition1D.get(stateRef.current);
  }, [currentPage, counter])

  useEffect(() => {
    const now = performance.now()
    const recalcTime = states
      .map(state => state.animation.span.end - now)
      .reduce((left, right) => Math.max(left, right), 0);

    const timeout = setTimeout(() => {
      setCounter(n => n + 1);
    }, recalcTime)

    return () => clearTimeout(timeout);
  }, [currentPage])

  return states;
}

export const PageTransitionDriver: Component<{ state: PageTransitionState }> = ({ state, key }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  Animation1D.Bezier4.useAnimation(state.animation, point => {
    const el = (ref.current as HTMLDivElement);
    //el.style.opacity = (1 + point.x).toString();

    el.style.transform = `translate(${-point.x * 100}%, 0px)`;

    el.style.pointerEvents = point.x === 0 ? 'all' : 'none'
  })

  return h('div', { ref, className: classes.pageTransitionDriver },
    h(state.page.component, { onReady() {} }))
}