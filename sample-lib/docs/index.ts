import readmeText from '../readme.md?raw';
import projectJSON from '../out.json';

import { h } from "@lukekaalim/act";
import { DocApp } from "@lukekaalim/grimoire";
import { TypeDocPlugin } from "@lukekaalim/grimoire-ts";


export const createSampleDocPages = (doc: DocApp<[TypeDocPlugin]>) => {
  doc.typedoc.addProjectJSON('sample-lib', projectJSON as any);

  doc.article.add('sample_readme', readmeText, '/packages/sample');
  doc.article.add('sample_readme.2', `# This is a second page \n <TypeDocDebug />`, '/packages/second_page');
};
