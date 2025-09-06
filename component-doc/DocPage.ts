import { Node } from '@lukekaalim/act';

/**
 * Represents a visitable piece of content that is
 * hosted on its own path.
 */
export type DocPage = {
  /**
   * The element that will be rendered when the page has been navigated to 
   * */
  element: Node,
  /**
   * 
   */
  path: string,
  /**
   * An node that represent a `Link` to this page.
   * 
   * @example
   * ```ts
   * console.log('Some Sample code!')
   * console.log('Two lines!')
   * ```
   */
  link: Node,
};
export const DocPage = {
  create(path: string, element: Node, link: Node = null): DocPage {
    return { path, element, link };
  },
}