import { h } from "@lukekaalim/act";
import { StoredArticle } from "@lukekaalim/act-doc/components/article/StoredArticle";
import { createPageStore } from "@lukekaalim/act-doc/stores/page";
import * as actDoc from './packages/act-doc';
import { createDocTsPages } from "@lukekaalim/act-doc-ts/doc";
import { createSampleDocPages } from "../sample-lib/docs";
import { createDocApp } from "@lukekaalim/act-doc/application";
import { TypeDocPlugin } from "@lukekaalim/act-doc-ts/plugin";
import { DocAppRenderer } from "@lukekaalim/act-doc/render";

export const pages = createPageStore();

const NotFound = () => h('h1', {}, `Page not found`)

const packagePages = pages.prefix('/packages/@lukekaalim')
  .add('/act-httpdoc', NotFound)
  .add('/act-graphit', NotFound)
  .add('/act-curve', NotFound)
  .add('/act-markdown', NotFound)
  .add('/act-router', NotFound)
  .add('/act-icons', NotFound)

actDoc.createPages(packagePages.prefix('/act-doc'))
createDocTsPages(packagePages.prefix('/act-doc-ts'))

const doc = createDocApp([TypeDocPlugin]);
createSampleDocPages(doc);

pages.add('/packages/sample', () => h(DocAppRenderer, { doc }))
