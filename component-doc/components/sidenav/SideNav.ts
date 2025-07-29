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

export const SideNavList = ({ children }: { children: Node }) => {
  return h('ol', { className: classes.sideNavList }, children)
};

export type SideNavAnchorListEntryProps = {
  href: string
};

export const SideNavAnchorEntry: Component<SideNavAnchorListEntryProps> = ({ href, children }) => {
  return h('li', { className: classes.sideNavAnchor }, h('a', { href }, children))
};

export type SideNavAnchorSubListEntryProps = {
  heading: Node
};

export const SideNavAnchorSubListEntry: Component<SideNavAnchorSubListEntryProps> = ({ heading, children }) => {
  return h('li', { className: classes.sideNavSubList }, [
    h('div', {}, heading),
    h('ol', { className: classes.sideNavSubList }, children)
  ])
};

SideNav.List = SideNavList;
SideNavList.Anchor = SideNavAnchorEntry
SideNavList.SubList = SideNavAnchorSubListEntry;

h(SideNav, {}, [
  h('div', {}),
  h(SideNav.List, {}, [
    h(SideNav.List.Anchor, { href: '/' }, 'Index'),
    h(SideNav.List.Anchor, { href: '/guide' }, 'Guide'),
    h(SideNav.List.Anchor, { href: '/components' }, 'Components'),
    h(SideNav.List.SubList, { heading: 'Demos' }, [
      h(SideNav.List.Anchor, { href: '/cool-demo' }, 'Cool Demo'),
    ])
  ])
])