import { h } from "@lukekaalim/act";
import { createNavTreeFromExpression, MarkdownArticle, NavTree, NavTreeCompactExpression, SideNav, SidePanelContainer } from "@lukekaalim/act-doc";
import { DocTsRegistry } from "@lukekaalim/act-doc-ts";
import { VerticalNavMenu } from "@lukekaalim/act-doc/components/vertical_nav_menu/VerticalNavMenu";
import { PageStore } from "@lukekaalim/act-doc/stores";
import { getHeadingId, parser } from "@lukekaalim/act-markdown";

import { Heading, Node, Parent, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';


const markdown = {
  index: (await import('./index.md?raw')).default,
  components: (await import('./components.md?raw')).default,
  api: (await import('./api.md?raw')).default,
  guide: (await import('./guide.md?raw')).default,
}

const code = {
  DocumentationApp: (await import('@lukekaalim/act-doc/DocumentationApp.ts?raw')).default,
  DocPage: (await import('@lukekaalim/act-doc/DocPage.ts?raw')).default,
  CodeBox: (await import('@lukekaalim/act-doc/components/code/CodeBox.ts?raw')).default,
  Article: (await import('@lukekaalim/act-doc/components/article/Article.ts?raw')).default,
}


const buildNavTreeFromMarkdown = (markdownRoot: Root) => {
  const treeRoot = new NavTree();
  let currentLeaf: NavTree = treeRoot;
  let currentDepth = 1;

  const visitNode = (node: Node) => {
    if (node.type === 'heading') {
      const heading = node as Heading;
      if (heading.depth > currentDepth) {
        // if the heading is "deeper" than our leaf,
        // we make some empty leaves until our depths are equal
        for (let i = 0; i < heading.depth - currentDepth; i++) {
          currentLeaf = currentLeaf.skip();
        }
        currentDepth = heading.depth;
      }
      if (heading.depth < currentDepth) {
        // if the heading is "shallower" than our leaf,
        // climp our tree to get to the right hight
        for (let i = 0; i < currentDepth - heading.depth; i++) {
          if (currentLeaf.parent)
            currentLeaf = currentLeaf.parent;
        }
        currentDepth = heading.depth;
      }
      const newLeaf = currentLeaf.push(new NavTree(currentLeaf))
      newLeaf.link = {
        content: toString(heading),
        href: `#${getHeadingId(heading)}`
      };
    }
    if ('children' in node) {
      (node as Parent).children.forEach(visitNode);
    }
  }
  visitNode(markdownRoot);

  return treeRoot;
}

export const createPages = (pages: PageStore) => {

  const createMarkdownLink = (name: string, path: string, markdown: string): NavTreeCompactExpression => {
    const fullPath = pages.fullPath(path)
    const root = parser.parse(markdown);
    const tree = buildNavTreeFromMarkdown(root).map(nav => {
      nav.link.href = fullPath + nav.link.href
    });
    return [name, fullPath, [tree]]
  }

  const tree = createNavTreeFromExpression([[
    createMarkdownLink('Main', '/', markdown.index),
    createMarkdownLink('Components', '/components', markdown.components),
    createMarkdownLink('Api', '/api', markdown.api),
    createMarkdownLink('Guides', '/guides', markdown.guide),
  ]]);

  const calcDepth = (tree: NavTree) => {
    let depth = 0;
    let anscestor = tree;
    while (anscestor.parent) {
      depth++;
      anscestor = anscestor.parent;
    }
    return depth;
  }

  const packageNav = h(SideNav, {}, [
    h(VerticalNavMenu, { tree: tree.map(tree => {
      const depth = calcDepth(tree);
      const clone = tree.clone();
      if (depth > 1) {
        clone.children = [];
      }
      return clone;
    }) })
  ]);

  pages.add('/', () => h(SidePanelContainer, {
      left: packageNav,
    }, h(MarkdownArticle, { content: markdown.index })),
  );
  
  DocTsRegistry.global.loadCode('@lukekaalim/act-doc', code.DocumentationApp);
  DocTsRegistry.global.loadCode('@lukekaalim/act-doc', code.DocPage);
  DocTsRegistry.global.loadCode('@lukekaalim/act-doc', code.CodeBox);
  DocTsRegistry.global.loadCode('@lukekaalim/act-doc', code.Article);

  DocTsRegistry.global.loadArticleReferences(
    new URL(pages.fullPath('/components'), location.href),
    parser.parse(markdown.components)
  );
  
  pages.add('/components', () => h(SidePanelContainer, {
      left: packageNav,
      right: h(SideNav, {}, h(VerticalNavMenu, {
        tree: tree.find(t => !!t.link.href?.endsWith('#components')) as NavTree
      }))
    }, [
      h(MarkdownArticle, { content: markdown.components })
    ]),
  );
  DocTsRegistry.global.loadArticleReferences(
    new URL(pages.fullPath('/api'), location.href),
    parser.parse(markdown.api)
  );
  pages.add('/api', () =>
    h(SidePanelContainer, { left: packageNav, }, 
      h(MarkdownArticle, { content: markdown.api })
    ),
  );

  pages.add('/guides', () => h(SidePanelContainer, {
      left: packageNav,
    }, h(MarkdownArticle, { content: markdown.guide })),
  );
}

