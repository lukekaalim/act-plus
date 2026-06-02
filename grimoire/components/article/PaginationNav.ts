import { Component, h, Node } from "@lukekaalim/act";
import classes from './index.module.css';

export type PaginationNavProps = {
  left?: Node,
  right?: Node,
};

export const PaginationNav: Component<PaginationNavProps> & { Link: typeof PaginationNavLink } = ({
  left,
  right,
}) => {
  return h('nav', { className: classes.paginationNav }, [
    !!left && h('div', { className: classes.left }, left),
    !!right && h('div', { className: classes.right }, right),
  ])
};

export type PaginationNavLinkProps = {
  href: string,
  direction: Node,

  title: string,
  shortDescription?: Node,
}

export const PaginationNavLink: Component<PaginationNavLinkProps> = ({
  href,
  direction,
  title,
  shortDescription
}) => {
  return h('a', { href, className: classes.paginationNavLink }, [
    h('span', { className: classes.paginationLinkDirection }, direction),
    h('span', { className: classes.paginationLinkTitle }, title),
    !!shortDescription && h('span', { className: classes.paginationDirection }, shortDescription),
  ])
}

PaginationNav.Link = PaginationNavLink;