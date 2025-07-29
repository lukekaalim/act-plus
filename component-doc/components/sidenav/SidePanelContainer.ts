import { Component, h, Node, ReadonlyRef, useEffect, useRef } from "@lukekaalim/act";
import classes from './SidePanelContainer.module.css';

export type SidePanelContainerProps = {
  left?: Node,
  right?: Node,

  scrollWindowRef?: ReadonlyRef<HTMLElement | null>,
}

export const SidePanelContainer: Component<SidePanelContainerProps> = ({
  left,
  right,
  children,
  scrollWindowRef,
}) => {
  const leftRef = useRef<HTMLElement | null>(null);
  const rightRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const scrollWindow = scrollWindowRef && scrollWindowRef.current || document.body;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!scrollWindow || !left || !right)
      return;

    const calculateMaxHeight = () => {
      const windowRect = scrollWindow.getBoundingClientRect();
      const leftMaxHeight = windowRect.bottom - left.getBoundingClientRect().top;
      const rightMaxHeight = windowRect.bottom - right.getBoundingClientRect().top;
      
      left.style.maxHeight = leftMaxHeight + 'px';
      right.style.maxHeight = rightMaxHeight + 'px';
    }

    calculateMaxHeight();
    scrollWindow.addEventListener('scroll', () => {
      calculateMaxHeight();
    }, { passive: true })
    const observer = new ResizeObserver(() => {
      calculateMaxHeight();
    })
    observer.observe(scrollWindow);
  }, [])


  return h('div', { className: classes.container }, [
    h('div', { className: classes.left, ref: leftRef },
      left),
    h('div', { className: classes.main }, children),
    h('div', { className: classes.right, ref: rightRef },
      right),
  ])
}