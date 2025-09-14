import { Node } from '@lukekaalim/act';

export type DocPage = {
  path: string,
  content: DocPageContent
};

export type DocPageContent =
  | { type: 'node', node: Node }
  | { type: 'article', articleId: string }
