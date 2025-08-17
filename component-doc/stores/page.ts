import { RouterPage, RouterPageComponent } from "@lukekaalim/act-router";

export type PageStore = {
  add(path: string, component: RouterPageComponent): PageStore,
  /**
   * Create a PageStore that creates pages with a specified prefix
   * @param pathPrefix 
   */
  prefix(pathPrefix: string): PageStore,
  
  pages: RouterPage[],

  /**
   * Create a "fullepath" from a relative path
   * (Prepending the prefix)
   * @param path 
   */
  fullPath(path: string): string,
};

export const createPageStore = (pages: RouterPage[] = [], prefix: string = ''): PageStore => {

  const store = {
    add(path: string, component: RouterPageComponent) {
      path = store.fullPath(path);
      pages.push({ path, component, display: '' });
      return store;
    },
    prefix(pathPrefix: string) {
      return createPageStore(pages, store.fullPath(pathPrefix));
    },
    fullPath(path: string) {
      return prefix + path;
    },
    pages
  }

  return store;
};

