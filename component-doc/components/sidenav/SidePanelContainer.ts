import { Component, h, Node } from "@lukekaalim/act";
import classes from './SidePanelContainer.module.css';

export type SidePanelContainerProps = {
  left?: Node,
  right?: Node,
}

export const SidePanelContainer: Component<SidePanelContainerProps> = ({
  left,
  right,
  children,
}) => {
  return h('div', { className: classes.container }, [
    h('div', { className: classes.left }, left),
    h('div', { className: classes.main }, children),
    h('div', { className: classes.right }, right),
  ])
}