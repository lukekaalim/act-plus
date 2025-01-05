import { Node, Ref, useEffect, useMemo, useState } from '@lukekaalim/act';

/**
 * Represents a visitable piece of content that is
 * hosted on its own path.
 */
export type DocPage = {
  element: Node,
  path: string,
  link: Node,
};
export const DocPage = {
  create(path: string, element: Node, link: Node = null): DocPage {
    return { path, element, link };
  },
}