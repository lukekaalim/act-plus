import { Component, h, Node } from "@lukekaalim/act";
import classes from './index.module.css';

export type TableOfContentsProps = {
  sections: { heading: Node, links: Node[] }[],

  indent?: boolean,
}

/**
 * 
 * @param param0 
 * @returns 
 */
export const TableOfContents: Component<TableOfContentsProps> = ({ sections }) => {
  return h('ol', { className: classes.tableOfContents }, sections.map(section => {
    return h('li', {}, h('div', { className: classes.section }, [
      section.heading,
      h('ol', {}, section.links.map(link => {
        return h('li', {}, link)
      }))
    ]))
  }));
}

export type TableOfContentsHeadingProps = {
  href?: string | null,
}

export const TableOfContentsTitle: Component<TableOfContentsHeadingProps> = ({ href = null, children }) => {
  if (!href)
    return h('div', { className: classes.title }, children)

  return h('a', { href, className: classes.title }, children)
}

export const TableOfContentsHeading: Component<TableOfContentsHeadingProps> = ({ href = null, children }) => {
  if (!href)
    return h('div', { className: classes.heading }, children)

  return h('a', { href, className: classes.heading }, children)
}

export type TableOfContentsLink = {
  href: string,
  isAtLink?: boolean
}

export const TableOfContentsLink: Component<TableOfContentsLink> = ({ href, children }) => {
  return h('a', { href, className: classes.link }, children)
};
