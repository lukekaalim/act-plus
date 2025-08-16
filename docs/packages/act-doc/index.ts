import { Component, h } from "@lukekaalim/act";
import { MarkdownArticle, NavTree, SideNav, SidePanelContainer } from "@lukekaalim/act-doc";
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
  const packageNav = h(SideNav, {}, [
    h(SideNav.List, {}, [
      h(SideNav.List.Anchor, { href: pages.fullPath('/') }, 'Main'),
      h(SideNav.List.Anchor, { href: pages.fullPath('/components')}, 'Components'),
      h(SideNav.List.Anchor, { href: pages.fullPath('/guides') }, 'Guides'),
      h(SideNav.List.SubList, { heading: "A list" }, [
        h(SideNav.List.Anchor, { href: "" }, 'List Entry'),
      ]),
    ])
  ]);
  const createHeadings = (markdownText: string) => {
    const root = parser.parse(markdownText);
    const tree = buildNavTreeFromMarkdown(root);

    return h(VerticalNavMenu, { tree });
  }

  pages.add('/', () => h(SidePanelContainer, {
      left: packageNav,
      right: createHeadings(markdown.index)
    }, h(MarkdownArticle, { content: markdown.index })),
  );
  pages.add('/components', () => h(SidePanelContainer, {
      left: packageNav,
      right: createHeadings(markdown.components)
    }, h(MarkdownArticle, { content: markdown.components })),
  );
  pages.add('/guides', () => h(SidePanelContainer, {
      left: packageNav,
      right: createHeadings(markdown.guide)
    }, h(MarkdownArticle, { content: markdown.guide })),
  );

  console.log(pages.pages)
}