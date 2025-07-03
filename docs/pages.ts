import { h } from "@lukekaalim/act";
import { StoredArticle } from "@lukekaalim/act-doc/components/article/StoredArticle";
import { createPageStore } from "@lukekaalim/act-doc/stores/page";
import * as actDoc from './packages/act-doc';

export const pages = createPageStore();

const NotFound = () => h('h1', {}, `Page not found`)

const packagePages = pages.prefix('/packages/@lukekaalim')
  .add('/act-tsdoc', NotFound)
  .add('/act-httpdoc', NotFound)
  .add('/act-graphit', NotFound)
  .add('/act-curve', NotFound)
  .add('/act-markdown', NotFound)
  .add('/act-router', NotFound)
  .add('/act-icons', NotFound)

actDoc.createPages(packagePages.prefix('/act-doc'))

console.log(pages.pages.map(p => p.path));