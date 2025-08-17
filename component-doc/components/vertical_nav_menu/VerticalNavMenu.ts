import { Component, h, Node } from "@lukekaalim/act";
import classNames from './VerticalNavMenu.module.css';
import { NavTree } from "../../lib";

export type VerticalNavMenuProps = {
  tree: NavTree,
};

export const VerticalNavMenu: Component<VerticalNavMenuProps> = ({ tree }) => {
  if (!tree.children.length) {
    return h(VerticalNavMenuLink, {
      content: tree.link.content,
      href: tree.link.href
    });
  }

  if (!tree.link.content) {
    return h(VerticalNavMenuList, {
      entries: tree.children.map(tree => h(VerticalNavMenu, { tree }))
    });
  }

  return h('div', {}, [
    h(VerticalNavMenuLink, { content: tree.link.content, href: tree.link.href }),
    h(VerticalNavMenuList, {
      entries: tree.children.map(tree => h(VerticalNavMenu, { tree }))
    }),
  ]);
}

export type VerticalNavMenuListProps = {
  entries: Node[],
}

export const VerticalNavMenuList: Component<VerticalNavMenuListProps> = ({ entries }) => {
  return h('ol', { className: classNames.list },
    entries.map(entry => h('li', {}, entry))
  );
}

export type VerticalNavMenuLinkProps = {
  content: Node,
  href: null | string,
}

export const VerticalNavMenuLink: Component<VerticalNavMenuLinkProps> = ({ content, href }) => {
  if (href)
    return h('a', { href }, content);
  return content;
}
