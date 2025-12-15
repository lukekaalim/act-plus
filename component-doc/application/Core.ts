import { Component, h, Node, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { parser } from "@lukekaalim/act-markdown";
import { Root } from "mdast";
import { Article } from "../components/article/Article";
import { MarkdownArticle, SidePanelContainer, StaticMarkdownArticle } from "../components";
import { CoreDebug } from "../components/debug/CoreDebug";
import { DefaultDemoFrame, DemoMDX } from "../components/demo/Demo";
import { VerticalNavMenu, VerticalNavMenu2 } from "../components/vertical_nav_menu/VerticalNavMenu";
import { buildNavTreeFromDOM, createNavTreeBuilder, NavLeaf, NavTree2 } from "../lib";

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
  getNavTree(): NavTree2,
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
  indirect_references: IndirectReference[],

  add(key: ReferenceKey, path: string, fragment?: string): Reference,
  addIndirect(source: ReferenceKey, destination: ReferenceKey, fragment?: string): IndirectReference,

  resolveKey(key: ReferenceKey): null | ReferenceLocation,
  resolveRouteLink(key: ReferenceKey): null | URL,
};

export type ReferenceKey = string;
export type ReferenceLocation = { path: string, fragment?: string };
export type Reference = {
  key: ReferenceKey,
  location: ReferenceLocation,
};
export type IndirectReference = {
  source: ReferenceKey,
  destination: ReferenceKey,

  fragment?: string,
}

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
   */
  add(key: string, markdownContent: string, path?: string): Article,
  addRawRoot(key: string, root: Root, path?: string): Article,

  addArticlePreprocessor(preprocessor: ArticlePreprocessor): void,
};
export type ArticlePreprocessor = (article: Article) => void;
export type ArticleKey = string;
export type Article = {
  key: ArticleKey,

  content: Root,
}

export type Demo = {
  key: string,
  frame?: string,
  component: Component<{}>
};
export type DemoFrame = {
  key: string,
  component: Component<{}>
}
export type DemoAPI = {
  demos: Demo[],
  frames: DemoFrame[],
  defaultFrame: DemoFrame,

  add(key: string, component: Component<{}>, frame?: string): Demo,
  addFrame(key: string, frameComponent: Component<{}>): DemoFrame,
  setDefaultFrame(frame: DemoFrame): void,
};

export const createCoreAPI = (): CoreAPI => {
  const articles: Article[] = [];
  const article_preprocessors: ArticlePreprocessor[] = [];
  const components: MDXComponentEntry[] = [];
  const routes: Route[] = [];
  const demos: Demo[] = [];
  const demo_frames: DemoFrame[] = [];
  const references: Reference[] = [];
  const indirect_references: IndirectReference[] = []

  const core: CoreAPI = {
    route: {
      routes,
      add(path, content) {
        const route = { path, content };
        routes.push(route);
        return route;
      },
      getNavTree() {
        const root: NavLeaf = { id: '/', parent: null, children: [] };
        const tree: NavTree2 = { leaves: { [root.id]: root }, roots: [root.id] };
        
        for (const route of core.route.routes) {
          const segments = route.path.split('/').filter(Boolean);
          let leaf = root;
          console.log(route, segments);
          for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const pathSoFar = segments.slice(0, i + 1).join('/');
            // for each segment, find/create the appropriate
            // leaf/root
            const nextLeaf = leaf.children.find(childId => {
              return childId === pathSoFar;
            })
            if (!nextLeaf) {
              const parent = leaf;
              leaf = { id: pathSoFar, children: [], parent: leaf.id }
              tree.leaves[leaf.id] = leaf;
              parent.children.push(leaf.id);
              console.log('Creating new Leaf', pathSoFar)
            } else {
              leaf = tree.leaves[nextLeaf];
            }
          }
          console.log(`Leaf ${leaf.id} is route ${route.path}`)
          leaf.content = route.content;
          leaf.location = new URL(document.location.href);
          leaf.location.pathname = route.path;
          leaf.location.hash = "";
          leaf.location.search = "";
        }
        console.log({ tree })
        return tree;
      },
    },
    reference: {
      references,
      indirect_references,
      add(key, path, fragment) {
        const reference = { key, location: { path, fragment } };
        references.push(reference);
        return reference;
      },
      addIndirect(source, destination, fragment) {
        const indirect_reference = { source, destination, fragment };
        indirect_references.push(indirect_reference);
        return indirect_reference;
      },
      resolveKey(key) {
        const direct_reference = core.reference.references.find(ref => ref.key === key);
        if (direct_reference)
          return direct_reference.location;
        const indirect_reference = core.reference.indirect_references.find(ref => ref.source === key);
        if (indirect_reference) {
          const resolvedReference = core.reference.resolveKey(indirect_reference.destination);
          if (!resolvedReference)
            return null;

          if (indirect_reference.fragment)
            return { path: resolvedReference.path, fragment: indirect_reference.fragment };
          return resolvedReference;
        }
        return null;
      },
      resolveRouteLink(key) {
        const location = core.reference.resolveKey(key)
        if (!location)
          return null;
        if (!core.route.routes.find(route => route.path !== location.path))
          return null;
        const url = new URL(document.location.href);
        url.pathname = location.path;
        if (location.fragment)
          url.hash = location.fragment;
        return url;
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


        if (article.path) {
          const Component = () => {
            const ref = useRef<HTMLElement | null>(null)
            const [tree, setTree] = useState<NavTree2 | null>(null);

            useEffect(() => {
              const builder = createNavTreeBuilder();
              buildNavTreeFromDOM(builder, ref.current as HTMLElement);
              builder.trim();
              setTree(builder.tree);
            }, []);

            const routeTree = useMemo(() => core.route.getNavTree(), [])

            const node = h(SidePanelContainer, {
              left: routeTree && h(VerticalNavMenu2, { tree: routeTree }),
              right: tree && h(VerticalNavMenu2, { tree }),
            }, h(StaticMarkdownArticle, { root: content }))
  
            return h('div', { ref }, node);
          }
          core.route.add(article.path, h(Component))
          core.reference.add(`article:${article.key}`, article.path)
        }

        articles.push(article);
        return article;
      },
    },
    demos: {
      demos,
      frames: demo_frames,
      defaultFrame: { key: 'default', component: DefaultDemoFrame },
      add(key, component, frame) {
        const demo = { key, component, frame };
        demos.push(demo);
        return demo;
      },
      addFrame(key, frameComponent) {
        const frame = { key, component: frameComponent };
        demo_frames.push(frame);
        return frame;
      },
      setDefaultFrame(newFrame) {
        core.demos.defaultFrame = newFrame;
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

  core.component.add('CoreDebug', CoreDebug);
  core.component.add('Demo', DemoMDX);

  return core;
}