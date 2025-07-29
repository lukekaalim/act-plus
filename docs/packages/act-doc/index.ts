import { Component, h } from "@lukekaalim/act";
import { MarkdownArticle, SideNav, SidePanelContainer } from "@lukekaalim/act-doc";
import { PageStore } from "@lukekaalim/act-doc/stores";
import { getHeadingId, parser } from "@lukekaalim/act-markdown";

import { Heading, Node, Parent, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';

const markdown = {
  index: (await import('./index.md?raw')).default,
  components: (await import('./components.md?raw')).default,
  guide: (await import('./guide.md?raw')).default,
}

export type HeadingLeaf = {
  text: string,
  link: string,
  depth: number,

  parent: null | HeadingLeaf,
  children: HeadingLeaf[],
}

const buildHeadingMap = (root: Root) => {
  let lastHeading: HeadingLeaf = {
    parent: null,
    children: [],
    depth: 0,
    link: '',
    text: '',
  };
  const rootHeadings: HeadingLeaf[] = [lastHeading];

  const attachHeading = (leafToAttach: HeadingLeaf, targetLeaf: HeadingLeaf) => {
    // At same depth - the last heading is a sibling
    if (leafToAttach.depth === targetLeaf.depth) {
      // add yourself to the parent if possible
      if (targetLeaf.parent) {
        targetLeaf.parent.children.push(leafToAttach)
        leafToAttach.parent = targetLeaf.parent;
      // or otherwise push yourself to the root
      } else {
        rootHeadings.push(leafToAttach);
      }
    }
    // if our depth is "lower" than the target,
    // try again on the parent
    else if (leafToAttach.depth < targetLeaf.depth) {
      if (targetLeaf.parent) {
        attachHeading(leafToAttach, targetLeaf.parent);
      } else {
        // If you are "lower" than zero, something
        // has gone wrong. (no negative-depth headings)
        throw new Error(`No Negative Depth Headings`);
      }
    }
    // If our depth is "higher", then we are either
    // the target's child, or some grand-child
    else if (leafToAttach.depth > targetLeaf.depth) {
      // If we're just one down, attach to the target
      if (leafToAttach.depth === (targetLeaf.depth + 1)) {
        targetLeaf.children.push(leafToAttach);
        leafToAttach.parent = targetLeaf;
      // Otherwise, we need to create a empty
      // intermediatary, and try again there
      } else {
        const intermediate = {
          text: '',
          link: '',
          depth: targetLeaf.depth + 1,
          children: [],
          parent: targetLeaf,
        };
        targetLeaf.children.push(intermediate);
        attachHeading(leafToAttach, intermediate);
      }
    }
  }

  const visit = (entry: Node) => {
    if (entry.type === 'heading') {
      const heading = entry as Heading;
      const id = getHeadingId(heading);
      const text = toString(heading);
      const depth = heading.depth;

      const leaf = { text, link: `#${id}`, depth, children: [], parent: null };
      console.log(`Attempting to attach heading`);
      attachHeading(leaf, lastHeading)
      lastHeading = leaf;
    }

    if ('children' in entry)
      for (const child of (entry as Parent).children)
        visit(child);
  };
  visit(root);

  return rootHeadings;
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
  const mainPageNav = h(SideNav, {}, [
    h(SideNav.List.Anchor, { href: '#@lukekaalim/act-doc' }, '@lukekaalim/act-doc'),
    h(SideNav.List.Anchor, { href: '#install' }, 'Install'),
  ])
  const createHeadings = (markdownText: string) => {
    const root = parser.parse(markdownText);
    const headings = buildHeadingMap(root);

    const Heading: Component<{ heading: HeadingLeaf }> = ({ heading }: { heading: HeadingLeaf }) => {
      if (heading.children.length > 0) {
        if (heading.children.length === 1 && !heading.link) {
          return h('li', { style: {
            paddingLeft: '16px',
          } }, heading.children.map(child => h(Heading, { heading: child })))
        }
        return h(SideNav.List.SubList, { heading: h('a', { href: heading.link }, heading.text) },
          heading.children.map(child => h(Heading, { heading: child })));
      }

      return h(SideNav.List.Anchor, { href: heading.link }, heading.text);
    }

    return h(SideNav, {}, h(SideNav.List, {}, headings.map(heading => h(Heading, { heading }))));
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