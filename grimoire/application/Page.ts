import { createId, Node, OpaqueID } from "@lukekaalim/act"
import { Book, BookBuilder, BookPageRef } from "../lib/book"
import { CoreAPI } from "./Core"
import { kebabCase } from 'change-case';
import { LandingPage } from "./page/landing";

type PageContentValues = 
  | { type: 'node', node: Node }
  | { type: 'article', articleKey: string }

export type PageContent<
T extends PageContentValues["type"] = PageContentValues["type"]
> = Extract<PageContentValues, { type: T }>

export type Page = {
  path: string,
  content: PageContent
}

export type PageLink = {
  name: Node,
  path: string,
}

export type PageAPI = {
  add(path: string, content: PageContent): PageAPI,
  addNodePage(path: string, node: Node): PageAPI,
  addArticlePage(path: string, articleKey: string): Page,
  pages: ReadonlyMap<Page["path"], Page>,

  addBook(name: string, basePath?: string): BookBuilder,
  bookRefByPath: Map<string, BookPageRef>,
  books: Book[],

  addLanding(path: string, name: string, content: PageContent): PageAPI,
  landings: LandingPage[],

  topLevelNavLinks: PageLink[],
  addTopLevelNavLink(name: Node, path: string): PageAPI,
}

export const createPageAPI = (core: () => CoreAPI): PageAPI => {
  const pages = new Map<Page["path"], Page>();

  const makeValidURL = (path: string) => {
    return path.split('/').filter(Boolean).map(part => kebabCase(part)).join('/')
  }

  const api: PageAPI = {
    pages,
    books: [],
    landings: [],
    bookRefByPath: new Map(),
    add(path, content) {
      pages.set(path, { path, content });
      if (content.type === 'article') {
        core().reference.add(`article:${content.articleKey}`, path);
      }
      return api;
    },
    addBook(name, basePath = makeValidURL(name)) {
      const builder = new BookBuilder(core(), name, basePath);
      api.books.push(builder.result);
      return builder;
    },
    addNodePage(path, node) {
      const pathLower = path.toLocaleLowerCase()
      const page: Page = { path: pathLower, content: { type: 'node', node } }
      pages.set(page.path, page);
      return api;
    },
    addArticlePage(path, articleKey) {
      const pathLower = path.toLocaleLowerCase()
      const page: Page = { path: pathLower, content: { type: 'article', articleKey } }

      core().reference.add(`article:${articleKey}`, pathLower)
      pages.set(page.path, page);
      return page;
    },
    addLanding(path, name, content) {
      this.landings.push({ name, path, content });
      pages.set(path, { path, content });

      return api;
    },

    topLevelNavLinks: [],
    addTopLevelNavLink(name, path) {
      api.topLevelNavLinks.push({ name, path });
      return api;
    },
  }
  return api;
}