import { h } from "@lukekaalim/act";
import { MarkdownArticle } from "@lukekaalim/act-doc";
import { PageStore } from "@lukekaalim/act-doc/stores";

const markdown = {
  index: (await import('./index.md?raw')).default,
  components: (await import('./components.md?raw')).default,
  guide: (await import('./guide.md?raw')).default,
}

export const createPages = (pages: PageStore) => {
  pages.add('/', () => h(MarkdownArticle, { content: markdown.index }))
  pages.add('/component', () => h(MarkdownArticle, { content: markdown.components }))
  pages.add('/guide', () => h(MarkdownArticle, { content: markdown.guide }))
}