import { h } from "@lukekaalim/act";
import { MarkdownArticle, PageStore } from "@lukekaalim/act-doc";
import { DocTsRegistry } from "@lukekaalim/act-doc-ts";
import { parser } from "@lukekaalim/act-markdown";

const markdown = {
  index: await import('./index.md?raw').then(m => m.default)
}
const code = {
  analysis: await import('../analysis.ts?raw').then(m => m.default),
  DocTs: await import('../DocTs.ts?raw').then(m => m.default),
  fragment: await import('../fragment.ts?raw').then(m => m.default),
  registry: await import('../registry.ts?raw').then(m => m.default),
  syntax: await import('../syntax.ts?raw').then(m => m.default)
}

DocTsRegistry.global.addReference('global', 'Map',
  `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map`);
DocTsRegistry.global.addReference('ts', 'SourceFile',
  `https://github.com/search?q=repo%3Amicrosoft/TypeScript%20SourceFile&type=code`);
DocTsRegistry.global.addReference('global', 'DocComment',
  `https://typedoc.org/documents/Doc_Comments.html`);

export const createDocTsPages = (pages: PageStore) => {
  for (const [name, sourceCode] of Object.entries(code)) {
    DocTsRegistry.global.loadCode(`@lukekaalim/act-doc-ts`, sourceCode, `${name}.ts`);
  }
  DocTsRegistry.global.loadArticleReferences(
    new URL(pages.fullPath('/'), location.href),
    parser.parse(markdown.index)
  )

  pages.add('/', () => h(MarkdownArticle, { content: markdown.index }))
};