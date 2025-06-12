import { Node } from '@lukekaalim/act';
import { RouterPageComponent } from "./component";

/**
 * A single, navigatable target. Only when the
 * path
 */
export type RouterPage = {
  path: string,
  display: Node,
  component: RouterPageComponent,
};

export const RouterPage = {
  EMPTY: { path: '/', display: '', component: () => null },

  map(pageMap: Record<string, { display?: Node, component: RouterPageComponent }>): RouterPage[] {
    const pages = Object.entries(pageMap).map(([path, { display, component }]) => {
      const defaultDisplay = path.split('/').filter(Boolean).join('-') || '/'
      return {
        path,
        display: display === undefined ? defaultDisplay : display,
        component
      }
    })

    return pages;
  }
}
