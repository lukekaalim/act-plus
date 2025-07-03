import { Tag, UnimplementedError } from "../lib";
import { Document } from "../lib/document";
import { TagStore } from "./tag";

export type DocumentStore = {
  add(docs: Document | Document[]): DocumentStore,
  addMarkdownGlob(docs: Record<string, string>): DocumentStore,

  getById(id: string): Document | null,
  getByTitle(title: string): Document | null,
  getByTag(tagKey: string, store: TagStore): Document[],

  documents: Document[],
};

export const createDocumentStore = (documents: Document[] = []): DocumentStore => {
  const store: DocumentStore = {
    add(docs) {
      if (Array.isArray(docs))
        documents.push(...docs);
      else
        documents.push(docs);
      return store;
    },
    addMarkdownGlob(docs) {
      documents.push(...Object.values(docs)
        .map(doc => Document.fromMarkdownString(doc)));

      return store;
    },
    getByTitle(title) {
      return documents.find(doc => doc.meta.title === title) || null;
    },
    getById(id) {
      return documents.find(doc => doc.id === id) || null;
    },
    getByTag(tagKey, tagStore) {
      const tag = tagStore.get(tagKey);
      if (!tag)
        throw new Error();
      return documents.filter(doc => {
        const docTags = (doc.meta.tagKeys || []).map(tagStore.get).filter((x): x is Tag => !!x);
        return docTags.some(docTag => docTag.key === tag.key)
      })
    },
    documents,
  }

  return store;
};
