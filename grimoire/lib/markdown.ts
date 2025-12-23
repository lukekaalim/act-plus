import { h, useMemo } from "@lukekaalim/act";
import { MDXComponent, MDXComponentEntry, useDocApp } from "../application";
import { createMdastRenderer, getHeadingId, MarkdownComponent, MdastRenderer, OverrideComponentProps } from "@lukekaalim/act-markdown";
import { markdownClasses, SyntaxHighlightingCodeBox } from '@lukekaalim/grimoire'
import { Code, Heading } from "mdast";

/**
 * Create an MDAST renderer that hooks into the DocApp context
 * to load the extra defined components there.
 * @returns an MDAST renderer - a function that accepts MDAST nodes and returns ACT nodes
 */
export const useGrimoireMdastRenderer = (extraComponents?: MDXComponentEntry[]): MdastRenderer => {
  const doc = useDocApp([]);

  const render = useMemo(() => {
    const componentEntries = [...doc.component.components, ...(extraComponents || [])];
    const components = Object.fromEntries(componentEntries.map(c => [c.name, c.component as MarkdownComponent]))

    return createMdastRenderer({
      classNames: markdownClasses,
      components,
      overrides: {
        heading: ({ node, renderer, className }) => {
          const headingNode = node as Heading;
          const id = getHeadingId(headingNode);
          const url = new URL(document.location.href);
          url.hash = id;
          return h(`h${headingNode.depth}`, { className, id }, [
            h('a', { href: url.href, className: markdownClasses.headingAnchor }, [
              ''
            ]),
            ' ',
            headingNode.children.map(renderer)]);
        },
        code: ({ node }: OverrideComponentProps) => {
          const codeNode = node as Code;
          return h(SyntaxHighlightingCodeBox, {
            language: codeNode.lang || undefined,
            code: codeNode.value.trim()
          });
        }
      }
    })
  }, [doc, extraComponents]);

  return render;
};
