import { DeclarationReflectionRenderer } from "./Reflection";
import { Deserializer, ConsoleLogger, ProjectReflection, JSONOutput, FileRegistry, DeclarationReflection, Reflection, ReflectionKind, SomeReflection, ContainerReflection, DocumentReflection, SomeType, ReferenceType } from "typedoc/browser";
import { h } from "@lukekaalim/act";
import { ArticlePreprocessor, CoreAPI, MDXComponent, PluginIAPI, useDocApp } from "@lukekaalim/grimoire";
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

  const declaration = project.getChildByName(reflectionName);
  if (!(declaration instanceof DeclarationReflection))
    throw new Error(`No reflection with "${reflectionName}" found in project "${projectName}"`);

  return declaration;
}

const TypeDoc: MDXComponent = ({ attributes }) => {
  const api = useDocApp([TypeDocPlugin])

  const projectName = attributes["project"];
  const reflectionName = attributes["name"];
  const extraDeclarationsNames = (attributes["extras"] || '').split(" ");

  try {
    if (typeof projectName !== 'string' || typeof reflectionName !== 'string')
      throw new Error(`Missing attribute "project" or "name"`);
    const declaration = getDeclaration(api.typedoc, projectName, reflectionName);
    const extraDeclarations = extraDeclarationsNames.map(name => {
      try {
        return getDeclaration(api.typedoc, projectName, name)
      } catch { return null }
    }).filter(x => !!x);

    return h(DeclarationReflectionRenderer, { declaration, extraDeclarations })
  } catch (error) {
    return h('div', {}, (error as Error).message);
  }
}

/**
 * (Does not include itself in the final array)
 * @param reflection 
 * @returns 
 */
const flattenDeclarations = (reflection: ContainerReflection | DocumentReflection): SomeReflection[] => {
  if (reflection.isDocument())
    return [];

  if (reflection.childrenIncludingDocuments) {
    return reflection.childrenIncludingDocuments.map(child => {
      return [child, ...flattenDeclarations(child)];
    }).flat(1);
  }

  return [];
} 

const TypeDocDebug: MDXComponent = ({ attributes }) => {
  const api = useDocApp([TypeDocPlugin]);

  const projectEntries = [...api.typedoc.projects.entries()];

  return [
    h('h3', { id: `TypeDebugProject` }, 'Projects'),
    h('ol', {}, projectEntries.map(([name, project]) => h('li', {}, name))),
    projectEntries.map(([projectName, project]) => [
      h('h3', { id: `TypeDebug:Project:${projectName}` }, projectName),
      h('table', { style: { 'border-collapse': 'collapse', display: 'block', 'overflow': 'auto', 'font-size': '14px' }}, [
        h('tr', {}, [
          h('th', {}, 'Name'),
          h('th', {}, 'Kind'),
          h('th', {}, 'Reference'),
        ]),
        flattenDeclarations(project).map(reflection => {
          const key = `ts:${projectName}.${reflection.getFullName()}`;
          const location = api.reference.resolveKey(key);
          const link = location && `${location.path}#${location.fragment}`;

          return h('tr', { }, [
            h('td', { style: { border: '1px solid black' } }, reflection.getFullName()),
            h('td', { style: { border: '1px solid black' } }, ReflectionKind[reflection.kind]),
            h('td', { style: { border: '1px solid black' } }, link ? h('a', { href: link }, key) : key),
          ])
        })
      ])
    ])
  ]
};

const createArticlePreprocessor = (core: CoreAPI, typedoc: PluginIAPI<TypeDocPlugin>): ArticlePreprocessor => {
  return (article) => {
    visit(article.content, 'mdxJsxFlowElement', (node) => {
      const attributes = buildMdxAttributes(node);
      if (node.name !== 'TypeDoc')
        return;

      try {
        const declaration = getDeclaration(typedoc, attributes["project"], attributes["name"]);
        const id = declaration.project.name + '.' + declaration.getFullName();

        const key = `ts:${attributes["project"]}.${attributes["name"]}`;

        console.info(`Adding indirect for ${key}`);

        core.reference.addIndirect(key, `article:${article.key}`, id);
      } catch (error) {
        console.error(error);
      }
    })
  }
};

export const TypeDocPlugin = {
  key: 'typedoc',
  api: (core: CoreAPI) => {
    const projects = new Map<string, ProjectReflection>();
    const deserializer = new Deserializer(new ConsoleLogger());

    core.component.add('TypeDoc', TypeDoc);
    core.component.add('TypeDocDebug', TypeDocDebug);

    const typedoc = {
      projects,
      getProject(name: string): null | ProjectReflection {
        return projects.get(name) || null;
      },
      addProjectJSON(name: string, json: unknown): void {
        const project = deserializer.reviveProject(name, json as JSONOutput.ProjectReflection, { projectRoot: "/", registry: new FileRegistry() });
        projects.set(name, project);
      },
      getLinkForType(type: ReferenceType) {
        // Externally defined type, maybe
        if (type.package) {
          const exteral = core.reference.resolveRouteLink(`ts:${type.package}.${type.qualifiedName}`);
          if (exteral)
            return exteral;
        }
        for (const [projectName, project] of projects.entries()) {
          for (const reflection of flattenDeclarations(project)) {
            if (reflection.isDeclaration() && reflection.getFullName() === type.qualifiedName) {
              return core.reference.resolveRouteLink(`ts:${projectName}.${reflection.name}`)
            }
          }
        }
        return null;
      }
    }

    core.article.addArticlePreprocessor(createArticlePreprocessor(core, typedoc))
    return typedoc;
  }
} as const;
export type TypeDocPlugin = typeof TypeDocPlugin;
