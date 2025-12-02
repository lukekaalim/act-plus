import { Node } from '@lukekaalim/act';

export type DocPage = {
  path: string,
  content: DocPageContent
};

export type DocPageContent =
  | { type: 'node', node: Node }
  | { type: 'article', articleId: string }

export const renderDocPageContent = (pageContent: DocPageContent) => {
  switch (pageContent.type) {
    case 'article':
      return pageContent.articleId;
    case 'node':
      return pageContent.node;
  }
};