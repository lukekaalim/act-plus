/**
 * The SimpleTree data structure lets us describe
 * some hierarchial data generically.
 * 
 * Doubly-linked upwards and downwards.
 */
export class SimpleTree<ID extends keyof any = string> {
  leaves: Record<ID, { parent: ID | null, children: ID[] }> = {} as any;
  root: ID;

  constructor(root: ID) {
    this.root = root;
    this.leaves[root] = { parent: null, children: [] };
  }

  append(leaf: ID, parent: ID) {
    this.leaves[leaf] = { parent, children: [] };
    this.leaves[parent].children.push(leaf);
  }
}
