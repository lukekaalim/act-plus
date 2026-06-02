import { Node, Root } from "mdast";
import { buildMdxAttributes, parser } from "@lukekaalim/act-markdown";

import { PageContent } from "../Page";
import { createId } from "@lukekaalim/act";
import { visit, CONTINUE, SKIP } from "unist-util-visit";
import { toString } from "mdast-util-to-string";
import { kebabCase } from "change-case";
import { ComponentsAPI, CoreAPI, MDXComponentEntry } from "../Core";

export type ArticlePreprocessor = (article: Article) => void;
export type ArticleKey = string;
export type Article = {
  key: ArticleKey,
  name: string,

  content: Root,
}

export type ArticleDestination = {
  /**
   * This name is used to be displayed
   * in links to the destination.
   */
  name: string,
  /**
   * An article destination is functionally a
   * HTML element in the article with an "id"
   * attribute that we can build a URL for.
   */
  fragment: string,

  depth: number,
};
export type ArticleMap = {
  key: ArticleKey,

  /**
   * When we visit an article to map it, we might
   * come across some nodes (i.e. custom MDX components)
   * that _might_ have destinations in them, but we don't
   * know yet. We record these nodes, and when the MDX component
   * loads in and declares its destinations
   */
  unvisitedMDXNames: Set<string>,

  destinations: ArticleDestination[]
}

export const buildArticleMap = (key: string, root: Root, components: MDXComponentEntry[]) => {
  const articleMap: ArticleMap = { key, unvisitedMDXNames: new Set(), destinations: [] };

  const calculateComponentDestinations = new Map(components.map(c => [c.name, c.calculateArticleDestinations || null]));

  visit(root, (node) => {
    switch (node.type) {
      case 'heading':
        articleMap.destinations.push({
          fragment: kebabCase(toString(node)),
          name: toString(node),
          depth: node.depth
        })
        return SKIP;
      case 'mdxJsxFlowElement':
        if (!node.name)
          return CONTINUE;
        if (!calculateComponentDestinations.has(node.name)) {
          articleMap.unvisitedMDXNames.add(node.name);
          return CONTINUE;
        }
        const calculateComponentDestination = calculateComponentDestinations.get(node.name);
        if (!calculateComponentDestination) {
          return CONTINUE;
        }
        const attributes = buildMdxAttributes(node);
        articleMap.destinations.push(...calculateComponentDestination(attributes))
        return CONTINUE;
      default:
        return CONTINUE;
    }
  })

  return articleMap;
}

/**
 * An Article is a kind of rich text document. Is specifically
 * a markdown document right now.
 */
export type ArticleAPI = {
  articles: Article[],
  maps: Map<ArticleKey, ArticleMap>,
  article_preprocessors: ArticlePreprocessor[],

  /**
   * Parse a markdown string into an Article, and
   * add it to the "articles" list.
   * 
   * Returns a valid "PageContent" object with the created
   * articles unique ID (for ergonomic usage in making pages)
   * 
   * @param contentString 
   * @param options 
   */
  markdown(contentString: string, options?: {}): PageContent<"article">,

  /**
   * Add some markdown content as an Article.
   * @param key 
   * @param markdownContent
   */
  add(key: string, markdownContent: string, path?: string, name?: string): ArticleAPI,

  addRawRoot(key: string, root: Root, path?: string, name?: string): ArticleAPI,

  addArticlePreprocessor(preprocessor: ArticlePreprocessor): ArticleAPI,

  /**
   * Rebuild an Article Map, usually because something changed
   * (a new MDX component was loaded, etc...)
   * @param key 
   */
  reScan(key: ArticleKey): ArticleAPI,
};

export const createArticleAPI = (core: () => CoreAPI): ArticleAPI => {
  
  const api: ArticleAPI =  {
    articles: [],
    maps: new Map(),
    article_preprocessors: [],
    add(key, markdownContent, path, name) {
      const content = parser.parse(markdownContent)
      return api.addRawRoot(key, content, path, name);
    },
    markdown(contentString, options) {
      const root = parser.parse(contentString);

      // TODO: search for frontmatter to get ID, only calling createId as fallback
      const articleKey = createId('article:markdown') as unknown as string;

      api.addRawRoot(articleKey, root);

      return { type: 'article', articleKey }
    },
    addArticlePreprocessor(preprocessor) {
      api.article_preprocessors.push(preprocessor);
      return api;
    },
    addRawRoot(key, content, path, name) {
      const article = { key, content, path, name: name || key };

      for (const preprocessor of api.article_preprocessors)
        preprocessor(article);

      api.maps.set(key, buildArticleMap(key, content, core().component.components));
      api.articles.push(article);
      return api
    },
    reScan(key) {
      return api;
    },
  };

  return api;
}