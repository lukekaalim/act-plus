import { createDocumentStore } from "@lukekaalim/act-doc/stores";

export const documents = createDocumentStore();

const globs = {
  markdown: import.meta.glob<string>('./**.md', { query: 'raw', eager: true, import: 'default' }),
}

documents.addMarkdownGlob(globs.markdown);

console.log(documents.documents);
