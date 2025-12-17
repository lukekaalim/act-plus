import { DocApp } from "@lukekaalim/grimoire";
import { TypeDocPlugin } from "@lukekaalim/grimoire-ts";

import readmeMd from '../readme.md?raw';
import projectJSON from 'typedoc:../mod.ts';

export const buildIconDocs = (doc: DocApp<[TypeDocPlugin]>) => {
  doc.typedoc.addProjectJSON('@lukekaalim/act-icons', projectJSON);
  
  doc.article.add('icons.readme', readmeMd, '/packages/@lukekaalim/act-icons');
}