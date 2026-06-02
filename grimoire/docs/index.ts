import {
  BannerLink, DocApp,
  MarkdownArticle, SyntaxHighlightingCodeBox,
  TableOfContents, TableOfContentsHeading,
  TableOfContentsLink, TopBanner
} from "@lukekaalim/grimoire";
import { EchoPlugin } from "@lukekaalim/grimoire-ts";

import readmeMd from '../readme.md?raw';
import usageMd from     './usage.md?raw';
import internalsMd from     './internals.md?raw';

import guidesIndexMd from     './guides/0.index.md?raw';
import quickstartMd from      './guides/1.quickstart.md?raw';
import buildersGuideMd from   './guides/2.builders.md?raw';
import siteMd from            './guides/3.site.md?raw';
import themesMd from          './guides/4.themes.md?raw';
import staticGenerationMd from './guides/5.static-generation.md?raw';
import monorepoMd from         './guides/6.monorepo.md?raw';
import pluginsMd from          './guides/7.plugins.md?raw';

import apiIndexMd from    './api/0.index.md?raw';
import componentsMd from  './api/1.components.md?raw';
import buildersAPIMd from './api/2.builders.md?raw';
import siteAPIMd from     './api/3.site.md?raw';
import utilitiesMd from   './api/4.utilities.md?raw';

import reflection from 'echo:@lukekaalim/grimoire';

import adventureIconURL from './adventure-icon.svg';

import { PrismaticComponent, VerticalNavMenuDemo } from "./demos";
import { h } from "@lukekaalim/act";
import { TaskList } from "../../docs/TaskPage";

import { quickstart } from "./guides/1.quickstart";

export const buildGrimoireDocs = (doc: DocApp<[EchoPlugin]>) => {
  doc.echo.addModule(reflection);

  quickstart(doc);

  const { page, article: { markdown } } = doc;
  doc.component.add('grimoire.tasks', () => h(TaskList, { filter: t => t.id.startsWith('grimoire') }))

  page.addBook('Grimoire', 'packages/grimoire')
    .index(                     markdown(readmeMd))
    .page('Usage',              markdown(usageMd))
    .page('Internals',          markdown(internalsMd))
    .section('Guides')
      .index(                   markdown(guidesIndexMd))
      .page('Quickstart',       markdown(quickstartMd))
      .page('Builders',         markdown(buildersGuideMd))
      .page('Site',             markdown(siteMd))
      .page('Themes',           markdown(themesMd))
      .page('Static Generation',markdown(staticGenerationMd))
      .page('Monorepo',         markdown(monorepoMd))
      .page('Plugins',          markdown(pluginsMd))
    .section('API')
      .index(                   markdown(apiIndexMd))
      .page('Components',       markdown(componentsMd))
      .page('Builders',         markdown(buildersAPIMd))
      .page('Site',             markdown(siteAPIMd))
      .page('Utilities',        markdown(utilitiesMd))

  const sampleURL = new URL(`https://example.com`);

  doc.demos.add('TopBanner', () => h(TopBanner, {
    logoLink: {
      display: [h('img', { src: adventureIconURL, style: { 'padding': '2px 14px 0 0' } }),
        h('span', {}, 'Adventure')],
      location: sampleURL
    },
    topLevelLinks: [
      { display: h(BannerLink, { link: "/" }, "First Nav Item"), location: sampleURL },
      { display: h(BannerLink, { link: "/" }, "Second Nav Item"), location: sampleURL },
    ],
    endContext: h(BannerLink, { link: "/" }, "a final element")
  }));
  doc.demos.add('MarkdownArticle', () => h(MarkdownArticle, {
    content: `# I am a Sample Markdown Article\nWith different kinds of **text**!`
  }))
  const code = `
    export const buildGrimoireDocs = ${buildGrimoireDocs.toString()}
  `.trim();

  doc.demos.add('CodeBox', () => h(SyntaxHighlightingCodeBox, { code, language: 'typescript' }))
  doc.demos.add('Prismatic', () => h(PrismaticComponent));
  doc.demos.add('VerticalNavMenu', () => h(VerticalNavMenuDemo))

  
  doc.demos.add('TableOfContents', () => h(TableOfContents, { sections: [
    { heading: h(TableOfContentsHeading, {}, 'Components'), links: [
      h(TableOfContentsLink, { href: '/' }, 'Article'),
      h(TableOfContentsLink, { href: '/tasks' }, 'Page'),
      h(TableOfContentsLink, { href: '/code' }, 'Code'),
    ] },
    { heading: h(TableOfContentsHeading, {}, 'Tasks'), links: [
      h(TableOfContentsLink, { href: '/' }, 'A'),
      h(TableOfContentsLink, { href: '/tasks' }, 'B'),
      h(TableOfContentsLink, { href: '/code' }, 'C'),
    ] },
  ] }))
}