import { Component, h } from '@lukekaalim/act';
import classes from './index.module.css';

export type BreadcrumbsProps = {
  links: { name: string, path: string }[]
}

export const Breadcrumbs: Component<BreadcrumbsProps> = ({ links }) => {
  return h('nav', { className: classes.breadcrumbNav },
    h('ol', { className: classes.breadcrumbList }, links.map((link, i) => {
      const lastBreadcrumb = i === links.length - 1;
      return [
        h('li', {}, h('a', { className: classes.breadcrumbLink, href: '/' + link.path }, link.name)),
        !lastBreadcrumb && h('span', {}, ' > ')
      ]
  })))
}