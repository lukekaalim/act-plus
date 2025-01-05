import { Component, h, Node, ReadonlyRef, Ref } from "@lukekaalim/act"
import { hs } from "@lukekaalim/act-web";
import classes from './DocLayout.module.css';

export type DocLayoutProps = {
  ref?: Ref<HTMLElement | null>,
  navPanel: Node,
  content: Node,
}

export const DocLayout: Component<DocLayoutProps> = ({ navPanel, content, ref }) => {
  return hs('div', { className: classes.docLayoutRoot, ref }, [
    hs('section', { className: classes.docLayoutNavPanel }, navPanel),
    h('section', { className: classes.docLayoutMainContent }, content)
  ])
}