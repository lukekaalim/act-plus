import { Component, h } from "@lukekaalim/act";
import { Article, ArticleMetadata } from "./Article";
import { useStore } from "../../contexts/stores";

export type StoredArticleProps = {
  title?: string,
  id?: string,
};

export const StoredArticle: Component<StoredArticleProps> = ({ title, id }) => {
  const store = useStore();

  const document = (title && store.document.getByTitle(title)) || (id && store.document.getById(id));

  if (!document)
    throw new Error();

  return h(Article, { key: document.id }, [
    h(ArticleMetadata, { meta: document.meta, tagStore: store.tags }),
    document.content,
  ]);
}