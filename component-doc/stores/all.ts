import { DocumentStore } from "./document"
import { PageStore } from "./page"
import { TagStore } from "./tag"

export type AllStore = {
  document: DocumentStore,
  tags: TagStore,
  page: PageStore,
};

