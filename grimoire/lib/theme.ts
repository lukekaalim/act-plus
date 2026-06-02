import { Component, createContext, h, Props, useContext, useMemo, Node } from "@lukekaalim/act";
import * as mdast from "mdast";
import { useDocApp } from "../application";
import { buildNavTreeFromPages, NavTree, NavTree2 } from "./navtree";
import { SidePanelContainer, StaticMarkdownArticle, TableOfContents, TableOfContentsHeading, TableOfContentsLink, TopBanner2 } from "../components";
import { useRouterLocation } from "@lukekaalim/act-router/v2";
import { v2 } from "@lukekaalim/act-router";
import { SimpleTree } from "./tree";
import { createMdastRenderer } from "@lukekaalim/act-markdown";
import { Book } from "./book";
import { Article } from "../components/article/Article";


/**
 * The DocTheme object provides a generic interface
 * to render out different components of a DocSite.
 */
export type DocTheme = {
  // primitives
  Sidebar: Component,
  Header: Component,

  SearchBar: Component,

  Hero: Component,
  Code: Component,
  Markdown: Component<{ root: mdast.Root }>,
  Article: Component<{
    left?: Node,
    right?: Node,
  }>,

  // pages
  Page: Component<{ header: Node, footer: Node }>,

  // page content
  NotFound: Component,
  SearchResults: Component,

  highlightJsTheme: CSSModuleClasses,
}

export type PartialDocTheme = { [prop in keyof DocTheme]?: DocTheme[prop] }

export const DEFAULT_THEME: DocTheme = {
  Sidebar({ children }) {
    return h('div', { style: { 'padding': '16px' } }, children)
  },

  Header({ children }) {
    return h(TopBanner2, {}, children)
  },

  Article({ left, right, children }) {

    return h('div', { style: { 'max-width': '1400px', margin: 'auto' } }, h(SidePanelContainer, {
      left,
      right,
    }, h(Article, {}, children)))
  },

  Markdown({ root }) {
    //const renderer = useMemo(() => createMdastRenderer(), [])
    //const nodes = useMemo(() => renderer(root), [root, renderer]);

    return h(StaticMarkdownArticle, { root });
  },

  NotFound({ children }) {
    const app = useDocApp([]);
    const theme = useContext(themeContext);

    const siteNavTree = buildNavTreeFromPages([...app.page.pages.values()]);

    return h(SidePanelContainer, {
      left: h(theme.Sidebar, { navTree: siteNavTree, location: '/' }),
      right: null,
    }, [h('h1', {}, 'Not Found'), children])
  },

  Page({ children, header, footer }) {
    return h('div', {}, [
      header,
      h('div', {  }, children),
      footer,
    ]);
  },

  highlightJsTheme: {},
}

/**
 * Current "DocTheme" is available via this Act Context. Use it
 * via `useContext(themeContext)` to get the current theme.
 * 
 * Theme Components that create other theme components should use
 * this context to aquire the theme.
 * 
 * If not explicity set by using DocSite or manually creating a
 * `themeContext.Provider` anscestor, the `DEFAULT_THEME` is used.
 */
export const themeContext = createContext(DEFAULT_THEME);