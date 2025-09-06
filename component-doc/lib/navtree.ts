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