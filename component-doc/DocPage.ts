import { Node } from '@lukekaalim/act';

export type DocPage = {
  path: string,
  content: DocPageContent
};

export type DocPageContent =
  | { type: 'node', node: Node }
  | { type: 'markdown', markdown: string }
