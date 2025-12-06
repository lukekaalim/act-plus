import { Component, h, Node } from "@lukekaalim/act";
import { parser } from "@lukekaalim/act-markdown";
import { Root } from "mdast";
import { Article } from "../components/article/Article";
import { MarkdownArticle, StaticMarkdownArticle } from "../components";

/**
 * The CoreAPI is a list of API objects that contain
 * data and functions that handle specific features.
 * 
 * Each key lists a sub-api. This object is typically
 * merged with a PluginAPI object to form the DocApp
 */
export type CoreAPI = {
  route: RoutesAPI,
  component: ComponentsAPI,
  article: ArticleAPI,
  reference: ReferenceAPI,
  demos: DemoAPI,
}

/**
 * The RoutesAPI is a system to organize the visitable pages
 * for your application.
 */
export type RoutesAPI = {
  routes: Route[],

  add(path: string, content: Node): Route,
}

export type Route = {
  path: string,
  content: Node
};

export type MDXComponent = Component<{ attributes: Record<string, string | void> }>;
export type MDXComponentEntry = {
  name: string,
  module?: string,
  component: MDXComponent,
};

/**
 * The ComponentsAPI allows you to insert new MDX components
 * to be rendered into pages.
 */
export type ComponentsAPI = {
  components: MDXComponentEntry[],

  add(name: string, component: Component<{ attributes: Record<string, string | void> }>): MDXComponentEntry,
}

/**
 * A "Reference" is a linkable piece of content
 * identifiable by some key. For instance, you might
 * want to build a canonical reference for a set of
 * typescript types, so you might build a set of
 * references that follow the following format:
 * 
 *   key = "@lkaalim/mypackage:MyExportedType.Property"
 */
export type ReferenceAPI = {
  references: Reference[],

  add(key: string, path: string, fragment?: string): Reference,
};

export type ReferenceKey = string;
export type ReferenceLocation = { path: string, fragment?: string };
export type Reference = {
  key: ReferenceKey,
  location: ReferenceLocation,
};

/**
 * An Article is a kind of rich text document. Is specifically
 * a markdown document right now.
 */
export type ArticleAPI = {
  articles: Article[],

  /**
   * Add some markdown content as an Article.
   * @param key 
   * @param markdownContent 
   * @param path 
   */
  add(key: string, markdownContent: string, path?: string): Article,
  addRawRoot(key: string, root: Root, path?: string): Article,

  addArticlePreprocessor(preprocessor: ArticlePreprocessor): void,
};
export type ArticlePreprocessor = (article: Article) => void;
export type ArticleKey = string;
export type Article = {
  key: ArticleKey,
  path?: string,

  content: Root,
}

export type Demo = {
  key: string,
  frame?: string,
  component: Component<{}>
};
export type DemoAPI = {
  demos: Demo[],

  add(key: string, component: Component<{}>, frame?: string): Demo,
};

export const createCoreAPI = (): CoreAPI => {
  const articles: Article[] = [];
  const article_preprocessors: ArticlePreprocessor[] = [];
  const components: MDXComponentEntry[] = [];
  const routes: Route[] = [];
  const demos: Demo[] = [];
  const references: Reference[] = [];

  const core: CoreAPI = {
    route: {
      routes,
      add(path, content) {
        const route = { path, content };
        routes.push(route);
        return route;
      },
    },
    reference: {
      references,
      add(key, path, fragment) {
        const reference = { key, location: { path, fragment } };
        references.push(reference);
        return reference;
      },
    },
    article: {
      articles,
      add(key, markdownContent, path) {
        const content = parser.parse(markdownContent)
        return core.article.addRawRoot(key, content, path);
      },
      addArticlePreprocessor(preprocessor) {
        article_preprocessors.push(preprocessor);
      },
      addRawRoot(key, content, path) {
        const article = { key, content, path };

        for (const preprocessor of article_preprocessors)
          preprocessor(article);

        if (article.path)
          core.route.add(article.path, h(StaticMarkdownArticle, { root: content }))

        articles.push(article);
        return article;
      },
    },
    demos: {
      demos,
      add(key, component, frame) {
        const demo = { key, component, frame };
        demos.push(demo);
        return demo;
      },
    },
    component: {
      components,
      add(name, component) {
        const entry = { name, component };
        components.push(entry);
        return entry;
      },
    }
  }

  core.article.addArticlePreprocessor((article) => {

  });

  return core;
}