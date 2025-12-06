import { DocPlugin, useAppAPI, useAppSetup } from "@lukekaalim/act-doc";
import { DeclarationReflectionRenderer } from "./Reflection";
import { Deserializer, ConsoleLogger, ProjectReflection, JSONOutput, FileRegistry, DeclarationReference, DeclarationReflection, Reflection } from "typedoc/browser";
import { h, useContext } from "@lukekaalim/act";
import { CoreAPI, MDXComponent, MDXComponentEntry } from "@lukekaalim/act-doc/application/Core";
import { DocApp, PluginAPI, PluginIAPI, useDocApp } from "@lukekaalim/act-doc/application";
import { visit } from "unist-util-visit";
import { buildMdxAttributes } from "@lukekaalim/act-markdown";

const findReflectionByName = (parent: Reflection, target: string) => {
  if (parent.name === target)
    return parent;
  let result: Reflection | null = null;
  parent.traverse(child => {
    const childResult = findReflectionByName(child, target)
    if (childResult)
      return (result = childResult, false);
  })
  return result;
}

const getDeclaration = (typedoc: PluginIAPI<TypeDocPlugin>, projectName: string, reflectionName: string) => {
  const project = typedoc.getProject(projectName);
  if (!project)
    throw new Error(`No project with "${projectName}" found`);

  const declaration = findReflectionByName(project, reflectionName);
  if (!(declaration instanceof DeclarationReflection))
    throw new Error(`No reflection with "${reflectionName}" found in project "${projectName}"`);

  return declaration;
}

const TypeDoc: MDXComponent = ({ attributes }) => {
  const api = useDocApp<[TypeDocPlugin]>(["typedoc"])

  const projectName = attributes["project"];
  const reflectionName = attributes["name"];

  try {
    if (typeof projectName !== 'string' || typeof reflectionName !== 'string')
      throw new Error(`Missing attribute "project" or "name"`);
    const declaration = getDeclaration(api.typedoc, projectName, reflectionName);
    return h(DeclarationReflectionRenderer, { declarationReflection: declaration })
  } catch (error) {
    return h('div', {}, (error as Error).message);
  }
}
const TypeDocDebug: MDXComponent = ({ attributes }) => {
  const api = useDocApp<[TypeDocPlugin]>(["typedoc"])

  return h('ul', {}, api.reference.references.map(ref =>
    h('li', {}, h('a', { href: `${ref.location.path}#${ref.location.fragment}` }, ref.key)))
  );
};

export const TypeDocPlugin = {
  key: 'typedoc',
  api: (api: CoreAPI) => {
    const projectJSON = new Map<string, ProjectReflection>();
    const deserializer = new Deserializer(new ConsoleLogger());

    api.component.add('TypeDoc', TypeDoc);
    api.component.add('TypeDocDebug', TypeDocDebug);
    api.article.addArticlePreprocessor(({ path, content }) => {
      if (!path)
        return;

      visit(content, 'mdxJsxFlowElement', (node) => {
        const attributes = buildMdxAttributes(node);
        if (node.name !== 'TypeDoc')
          return;

        try {
          const declaration = getDeclaration(typedoc, attributes["project"], attributes["name"]);
          const id = declaration.project.name + '.' + declaration.getFullName();
          api.reference.add(`${attributes["project"]}.${attributes["name"]}`, path, id);
        } catch {}
      })
    })

    const typedoc = {
      getProject(name: string): null | ProjectReflection {
        return projectJSON.get(name) || null;
      },
      addProjectJSON(name: string, json: JSONOutput.ProjectReflection): void {
        const project = deserializer.reviveProject(name, json, { projectRoot: "/", registry: new FileRegistry() });
        projectJSON.set(name, project);
      },
    }
    return typedoc;
  }
} as const;
export type TypeDocPlugin = typeof TypeDocPlugin;
