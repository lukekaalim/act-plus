import { Component, h, Node } from "@lukekaalim/act";
import classes from './Content.module.css';

export type ContentProps = {
  main: Node,
  leftSidebar: Node,
  rightSidebar: Node,
};

export const Content: Component<ContentProps> = ({ main, leftSidebar, rightSidebar }) => {
  return h('div', { className: classes.content }, [
    leftSidebar,
    main,
    rightSidebar,
  ])
};
