import { Component, h } from "@lukekaalim/act";
import { Markdown, MarkdownComponent, MarkdownRendererOptions, OverrideComponent } from "@lukekaalim/act-markdown";

import classes from './DocMark.module.css';
import { Heading } from "mdast";
import { toString } from 'mdast-util-to-string'
import { snakeCase } from 'change-case';

export type DocMarkProps = {
  text: string,
  options?: MarkdownRendererOptions & { inlineComponents?: Record<string, MarkdownComponent> }
};

export const DocMark: Component<DocMarkProps> = ({ text, options = {} }) => {
  
  const finalOptions: MarkdownRendererOptions = {
    ...defaultOptions,
    ...options,
    components: Object.fromEntries([
      options.components && Object.entries(options.components)
        .map(([key, component]) => [key, wrapMarkdownComponent(component)]) || [],
      Object.entries(options.inlineComponents || []),
    ].flat(1))
  };

  return h('article', { className: classes.article },
    h(Markdown, { text, options: finalOptions }))
}

const wrapMarkdownComponent = (inner: MarkdownComponent): MarkdownComponent => {
  return (props) => {
    return h('div', { className: classes.component }, h(inner, props))
  }
}

const DocMarkHeading: OverrideComponent = ({ node, renderer }) => {
  const heading = node as Heading;

  const children = heading.children.map(renderer);
  const id = snakeCase(toString(heading.children));

  if (heading.depth <= 1)
    return h('h1', { id, className: classes.heading },
      h('a', { className: classes.anchor, href: './' }, children));

  return h(`h${heading.depth}`, { className: classes.heading },
    h('a', { className: classes.anchor, href: `#${id}` }, [
      h('span', { className: classes.anchorHash }, '# '),
      h('span', { className: classes.anchorText }, children),
    ]))
}

const defaultOptions: MarkdownRendererOptions = {
  classNames: {
    inlineCode: classes.inlineCode,
    code: classes.code,
    paragraph: classes.paragraph,
    checkbox: classes.checkbox,
    blockquote: classes.blockquote,
    link: classes.anchor,
    table: classes.table,
    tableCell: classes.tableCell,
  },
  overrides: {
    'heading': DocMarkHeading
  }
}

