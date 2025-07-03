import { RouterPage, RouterPageComponent } from "@lukekaalim/act-router";

export type PageStore = {
  add(path: string, component: RouterPageComponent): PageStore,
  /**
   * Create a PageStore that creates pages with a specified prefix
   * @param pathPrefix 
   */
  prefix(pathPrefix: string): PageStore,
  
  pages: RouterPage[],
};

export const createPageStore = (pages: RouterPage[] = [], prefix: string = ''): PageStore => {

  const store = {
    add(path: string, component: RouterPageComponent) {
      path = prefix + path;
      pages.push({ path, component, display: '' });
      return store;
    },
    prefix(pathPrefix: string) {
      return createPageStore(pages, prefix + pathPrefix);
    },
    pages
  }

  return store;
};

