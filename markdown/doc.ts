import { DocApp } from "@lukekaalim/grimoire";
import { TypeDocPlugin } from "@lukekaalim/grimoire-ts";

import projectJSON from 'typedoc:mod.ts';
import readmeMd from './readme.md?raw';

export const buildMarkdownDocs = (doc: DocApp<[TypeDocPlugin]>) => {
  doc.typedoc.addProjectJSON('@lukekaalim/act-markdown', projectJSON);
  doc.article.add('markdown.readme', readmeMd, '/packages/@lukekaalim/act-markdown');
  doc.reference.addExternal('ts:@types/mdast.Nodes', new URL(`https://github.com/syntax-tree/mdast?tab=readme-ov-file#content-model`));
  doc.reference.addExternal('ts:@types/mdast.Root', new URL(`https://github.com/syntax-tree/mdast?tab=readme-ov-file#root`));
}