import { Component, h, Node } from "@lukekaalim/act";
import classes from './SideNav.module.css';

export type SideNav = {
  direction?: 'left' | 'right',
  children: Node,
}

const directionClasses = {
  left: classes.left,
  right: classes.right,
}

export const SideNav = ({ children, direction = 'left' }: SideNav) => {
  return h('div', { className: [classes.sideNav, directionClasses[direction]].join(' ') }, children);
}
