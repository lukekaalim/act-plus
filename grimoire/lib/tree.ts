import { OpaqueID } from "@lukekaalim/act"

export type SimpleTreeLeafID = OpaqueID<string>;
export type SimpleTreeLeaf<T extends {}> = { parent: null | SimpleTreeLeafID, children: SimpleTreeLeafID[] } & T;

/**
 * The SimpleTree data structure lets us describe
 * some hierarchial data generically.
 */
export type SimpleTree<T extends {}> = {
  leaves: Map<SimpleTreeLeafID, SimpleTreeLeaf<T>>,
  root: null | SimpleTreeLeafID
}

