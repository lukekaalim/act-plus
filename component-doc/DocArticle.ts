export type DocArticle = {
  id: string,
  content: DocArticleContent,
}

export type DocArticleContent =
  | { type: 'markdown', markdown: string }
