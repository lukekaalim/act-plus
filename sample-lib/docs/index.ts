import { AppAPI, MarkdownArticle, PageStore } from "@lukekaalim/act-doc";
import { ConsoleLogger, Deserializer, FileRegistry, JSONOutput, ProjectReflection } from 'typedoc/browser';

import readmeText from '../readme.md?raw';
import projectJSON from '../out.json';
import { h } from "@lukekaalim/act";

export const createSampleDocPages = (pages: PageStore, api: AppAPI) => {
  api.addProjectJSON('sample-lib', projectJSON as any);

  pages.add('/', () => [
    h(MarkdownArticle, { content: readmeText }),
  ])
};