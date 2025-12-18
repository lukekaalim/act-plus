import { BannerLink, CodeBox, DocApp, MarkdownArticle, renderLowlightNodes, SyntaxHighlightingCodeBox, TopBanner } from "@lukekaalim/grimoire";
import { TypeDocPlugin } from "@lukekaalim/grimoire-ts";

import readmeMd from '../readme.md?raw';
import coreMd from '../application/readme.md?raw';
import componentsMd from '../components/components.md?raw';
import utilitiesMd from '../lib/lib.md?raw';

import typedoc from 'typedoc:../index.ts';

import adventureIconURL from './adventure-icon.svg';

import { PrismaticComponent } from "./demos";
import { h } from "@lukekaalim/act";

export const buildGrimoireDocs = (doc: DocApp<[TypeDocPlugin]>) => {
  doc.typedoc.addProjectJSON('@lukekaalim/grimoire', typedoc);

  doc.article.add('grimoire.readme', readmeMd, '/packages/@lukekaalim/grimoire');
  doc.article.add('grimoire.componentsMd', componentsMd, '/packages/@lukekaalim/grimoire/components');
  doc.article.add('grimoire.core', coreMd, '/packages/@lukekaalim/grimoire/core');
  doc.article.add('grimoire.utils', utilitiesMd, '/packages/@lukekaalim/grimoire/utilities');

  doc.component.add('PrismaticComponent', PrismaticComponent);

  const sampleURL = new URL(`https://example.com`);

  doc.demos.add('TopBanner', () => h(TopBanner, {
    logoLink: {
      display: [h('img', { src: adventureIconURL, style: { 'padding': '2px 14px 0 0' } }),
        h('span', {}, 'Adventure')],
      location: sampleURL},
    topLevelLinks: [
      { display: h(BannerLink, {}, "First Nav Item"), location: sampleURL },
      { display: h(BannerLink, {}, "Second Nav Item"), location: sampleURL },
    ],
    endContext: h(BannerLink, {}, "a final element")
  }));
  doc.demos.add('MarkdownArticle', () => h(MarkdownArticle, {
    content: `# I am a Sample Markdown Article\nWith different kinds of **text**!`
  }))
  doc.demos.add('CodeBox', () => h(SyntaxHighlightingCodeBox, { code: `export const buildGrimoireDocs = ${buildGrimoireDocs.toString()}` }))

  doc.demos.add('Prismatic', () => h(PrismaticComponent));
}