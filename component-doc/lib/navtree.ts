/**
 * The "NavTree" structure describes
 * some recursive set of heiarchical navigation.
 */
export class NavTree {
  parent: null | NavTree = null;
  link: null | NavTreeLink = null;
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
}

export type NavTreeLink = {
  content: string,
  href: null | string
};