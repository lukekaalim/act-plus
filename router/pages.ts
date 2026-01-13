import { Node } from '@lukekaalim/act';
import { RouterPageComponent } from "./component";

/**
 * A single, navigatable target. Only when the
 * path
 */
export type RouterPage = {
  path: string,
  component: RouterPageComponent,
};

export const RouterPage = {
  EMPTY: { path: '/', component: () => 'EMPTY' },

  map(pageMap: Record<string, { component: RouterPageComponent }>): RouterPage[] {
    const pages = Object.entries(pageMap).map(([path, { component }]) => {
      return {
        path,
        component
      }
    })

    return pages;
  }
}
