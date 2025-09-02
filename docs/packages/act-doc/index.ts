import { Component, h } from "@lukekaalim/act";
import { createNavTreeFromExpression, MarkdownArticle, NavTree, NavTreeCompactExpression, SideNav, SidePanelContainer } from "@lukekaalim/act-doc";
import { DocTs } from "@lukekaalim/act-doc-ts";
import { analyzeString } from "@lukekaalim/act-doc-ts/analysis";
import { DocTsRegistry } from "@lukekaalim/act-doc-ts/registry";
import { VerticalNavMenu } from "@lukekaalim/act-doc/components/vertical_nav_menu/VerticalNavMenu";
import { PageStore } from "@lukekaalim/act-doc/stores";
import { getHeadingId, parser } from "@lukekaalim/act-markdown";

import { Heading, Node, Parent, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';


const markdown = {
  index: (await import('./index.md?raw')).default,
  components: (await import('./components.md?raw')).default,
  guide: (await import('./guide.md?raw')).default,
}

const docFragments = analyzeString(
  await import('@lukekaalim/act-doc/DocumentationApp.ts?raw')
    .then(m => m.default)
)

const appFrag = docFragments.find(frag => frag.identifier === 'DocumentationApp')

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
    createMarkdownLink('Guides', '/guides', markdown.guide),
  ]]);

  const packageNav = h(SideNav, {}, [
    h(VerticalNavMenu, { tree })
  ]);

  pages.add('/', () => h(SidePanelContainer, {
      left: packageNav,
      right: h(SideNav, {}, h(VerticalNavMenu, { tree: tree.find(tree => tree.link.content == 'Main') }))
    }, h(MarkdownArticle, { content: markdown.index })),
  );
  const sampleFunc = docFragments.find(f => f.identifier === 'SampleFunc');
  pages.add('/components', () => h(SidePanelContainer, {
      left: packageNav,
      right: h(SideNav, {}, h(VerticalNavMenu, { tree:  tree.find(tree => tree.link.content == 'Components') }))
    }, [
      h(MarkdownArticle, { content: markdown.components }, [
        !!appFrag && h(DocTs, { fragment: appFrag }),
        !!sampleFunc && h(DocTs, { fragment: sampleFunc }),
      ])
    ]),
  );

  pages.add('/guides', () => h(SidePanelContainer, {
      left: packageNav,
      right: h(SideNav, {}, h(VerticalNavMenu, { tree:  tree.find(tree => tree.link.content == 'Guides') }))
    }, h(MarkdownArticle, { content: markdown.guide })),
  );
}

