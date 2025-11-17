import { MarkdownArticle, PageStore } from "@lukekaalim/act-doc";
import { ConsoleLogger, Deserializer, FileRegistry, JSONOutput, ProjectReflection } from 'typedoc/browser';

import readmeText from '../readme.md?raw';
import projectJSON from '../out.json';
import { h } from "@lukekaalim/act";
import { DeclarationReflectionRenderer } from "@lukekaalim/act-doc-ts/Reflection";

export const createSampleDocPages = (pages: PageStore) => {
  const project = new Deserializer(new ConsoleLogger())
    .reviveProject('MyProject', projectJSON, { projectRoot: "/", registry: new FileRegistry() })

  pages.add('/', () => [
    h(MarkdownArticle, { content: readmeText }),
    h(DeclarationReflectionRenderer, { declarationReflection: project.getChildByName('my_export') })
  ])
};