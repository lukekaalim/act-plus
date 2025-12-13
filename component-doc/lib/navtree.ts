import { createId, Node } from "@lukekaalim/act";

export type NavTreeLink = {
  content: null | string,
  href: null | string
};

/**
 * The "NavTree" structure describes
 * some recursive set of heiarchical navigation.
 */
export class NavTree {
  parent: null | NavTree = null;
  link: NavTreeLink = { content: null, href: null };
  children: NavTree[] = [];

  constructor(parent: null | NavTree = null) {
    this.parent = parent;
  }

  push(child: NavTree) {
    this.children.push(child);
    return child;
  }
  skip() {
    const skipTree = new NavTree(this);
    this.push(skipTree);
    return skipTree;
  }
  map(func: (tree: NavTree) => void | NavTree): NavTree {
    const newTree = func(this) || this;
    newTree.children = newTree.children.map(child => child.map(func));
    return newTree;
  }
  find(func: (tree: NavTree) => boolean): NavTree | void {
    if (func(this))
      return this;
    for (const child of this.children) {
      const result = child.find(func);
      if (result)
        return result;
    }
  }
  clone() {
    const clone = new NavTree();
    clone.parent = this.parent;
    clone.link = { ...this.link };
    clone.children = [...this.children];
    return clone;
  }
}

export type NavTreeCompactExpression = (
  | NavTree
  | [
    content: string,
    link: string,
    children: NavTreeCompactExpression[],
  ]
  | [
    content: string,
    children: NavTreeCompactExpression[],
  ]
  | [
    children: NavTreeCompactExpression[],
  ]
);

export const createNavTreeFromExpression = (expression: NavTreeCompactExpression): NavTree => {
  if (expression instanceof NavTree)
    return expression;
  const tree = new NavTree();
  const [first, second, third] = expression;
  const addChildren = (children: NavTreeCompactExpression[]) => {
    children.map(createNavTreeFromExpression).map(child => {
      tree.push(child)
      child.parent = tree;
    });
  }

  switch (expression.length) {
    case 1: {
      addChildren(first as NavTreeCompactExpression[] || []);
      return tree;
    }
    case 2: {
      tree.link = {
        content: first as string,
        href: null
      }
      addChildren(second as NavTreeCompactExpression[] || []);
      return tree;
    }
    case 3: {
      tree.link = {
        content: first as string,
        href: second as string
      }
      addChildren(third as NavTreeCompactExpression[] || []);
      return tree;
    }
    default:
      throw new Error();
  }
}

export type NavTree2 = {
  leaves: Record<NavLeafID, NavLeaf>,
  roots: NavLeafID[],
}


export type NavLeafID = string;
export type NavLeaf = {
  id: NavLeafID,
  parent: null | NavLeafID,
  children: NavLeafID[],

  content?: null | string,
  location?: URL,
};

export type NavTreeBuilder = {
  tree: NavTree2,

  leaf(id: NavLeafID, parent?: NavLeafID, content?: string, location?: URL): NavLeaf,
  add(id: NavLeafID, depth: number, content?: string, location?: URL): NavLeaf,
  trim(): void,
};

export const createNavTreeBuilder = (): NavTreeBuilder => {
  const tree: NavTree2 = { leaves: {}, roots: [] };

  function findOrCreateParent(currentLeaf: NavLeaf, currentDepth: number, targetDepth: number) {
    if (targetDepth === currentDepth) {
      return currentLeaf;
    }
    if (targetDepth > currentDepth) {
      const childId = currentLeaf.children[currentLeaf.children.length - 1];
      if (childId)
        return findOrCreateParent(tree.leaves[childId], currentDepth + 1, targetDepth);

      const newLeaf = builder.leaf(createId().toString(), currentLeaf.id);

      return findOrCreateParent(newLeaf, currentDepth + 1, targetDepth);
    }
    if (targetDepth < currentDepth) {
      const parentId = currentLeaf.parent;
      if (parentId) {
        return findOrCreateParent(tree.leaves[parentId], currentDepth - 1, targetDepth);
      }
      throw new Error(`No more parents`);
    }
    throw new Error(`Impossible case`);
  }

  const builder: NavTreeBuilder = {
    leaf(id, parent, content, location) {
      const leaf: NavLeaf = { id, content, location, parent: parent || null, children: [] };
      tree.leaves[leaf.id] = leaf;
      
      if (parent) {
        tree.leaves[parent].children.push(leaf.id);
      } else {
        tree.roots.push(leaf.id);
      }
      return leaf;
    },
    add(id, depth, content, location) {
      if (depth === 0) {
        const leaf: NavLeaf = { id, content, location, parent: null, children: [] };
        tree.roots.push(leaf.id);
        tree.leaves[leaf.id] = leaf;
        return leaf;
      }
      const root = tree.roots[tree.roots.length - 1] || builder.leaf(createId().toString()).id;

      const parent = findOrCreateParent(tree.leaves[root], 0, depth);
      return builder.leaf(id, parent.id, content, location);
    },
    trim() {
      if (tree.roots.length === 1) {
        const root = tree.leaves[tree.roots[0]];
        if (root.content)
          return;
        
        tree.roots = [];
        for (const childId of root.children) {
          const child = tree.leaves[childId];
          child.parent = null;
          tree.roots.push(child.id);
        }
        builder.trim();
      }
    },
    tree,
  }

  return builder;
}

const headingMap: Record<string, number> = {
  'H1': 1,
  'H2': 2,
  'H3': 3,
  'H4': 4,
  'H5': 5,
  'H6': 6,
}

export const buildNavTreeFromDOM = (builder: NavTreeBuilder, element: Element) => {
  const depth = headingMap[element.tagName] || null;

  if (depth) {
    const id = element.id;
    if (id) {
      const url = new URL(document.location.href);
      url.hash = id;
      builder.add(element.id, depth, element.textContent || '', url);
    }
  }
  for (const child of element.children) {
    buildNavTreeFromDOM(builder, child);
  }
}