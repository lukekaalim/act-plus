import { Component, h, Node, useMemo } from "@lukekaalim/act";
import classNames from './VerticalNavMenu.module.css';
import { NavLeaf, NavTree, NavTree2 } from "../../lib";

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

export type VerticalNavMenu2Props = {
  tree: NavTree2,
};

export const VerticalNavMenu2: Component<VerticalNavMenu2Props> = ({ tree }) => {
  const renderLeaf = (leaf: NavLeaf): Node => {
    const children = leaf.children.map(childId => tree.leaves[childId]);

    if (leaf.content)
      return h('div', {}, [
        h(VerticalNavMenuLink, { content: leaf.content, href: leaf.location?.href || '' }),
        children.length > 0 && h(VerticalNavMenuList, {
          entries: children.map(renderLeaf)
        }),
      ]);

    return h('div', {}, [
      children.length > 0 && h(VerticalNavMenuList, {
        entries: children.map(renderLeaf)
      }),
    ]);
  }

  return tree.roots.map(root => {
    const leaf = tree.leaves[root];
    return renderLeaf(leaf);
  });
};

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
