import { MarkdownArticle } from "@lukekaalim/act-doc";

import readmeText from '../readme.md?raw';
import projectJSON from '../out.json';

import { h } from "@lukekaalim/act";
import { DocApp } from "@lukekaalim/act-doc/application/App";
import { TypeDocPlugin } from "@lukekaalim/act-doc-ts/plugin";


export const createSampleDocPages = (doc: DocApp<[TypeDocPlugin]>) => {
  doc.typedoc.addProjectJSON('sample-lib', projectJSON as any);

  doc.article.add('sample_readme', readmeText, '/packages/sample');
  doc.article.add('sample_readme', `# This is a second page \n <TypeDocDebug />`, '/packages/second_page');
};
