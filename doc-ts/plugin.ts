import { DocPlugin, useAppAPI, useAppSetup } from "@lukekaalim/act-doc";
import { DeclarationReflectionRenderer } from "./Reflection";
import { Deserializer, ConsoleLogger, ProjectReflection, JSONOutput, FileRegistry, DeclarationReference, DeclarationReflection } from "typedoc/browser";
import { h } from "@lukekaalim/act";

declare module "@lukekaalim/act-doc" {
  interface DocAppAPIExtension {
    getProject(name: string): null | ProjectReflection;
    addProjectJSON(name: string, json: JSONOutput.ProjectReflection): void;
  }
}

export const createTypeDocPlugin = (): DocPlugin => {
  return {
    register(app) {
      app.MDXComponents.set('TypeDoc', function TypeDoc({ attributes }) {
        const api = useAppAPI();

        const projectName = attributes["project"];
        const reflectionName = attributes["name"];
        if (typeof projectName !== 'string' || typeof reflectionName !== 'string')
          return 'Missing attribute "project" or "name"';

        const project = api.getProject(projectName);
        if (!project)
          return `No project of ${projectName} found`;

        const declaration = project.getChildByName(reflectionName);
        if (!(declaration instanceof DeclarationReflection))
          return `${reflectionName} is not a Declaration in ${projectName}`;

        return h(DeclarationReflectionRenderer, { declarationReflection: declaration })
      })
    },
    augmentAPI(api) {
      const projectJSON = new Map<string, ProjectReflection>();

      const deserializer = new Deserializer(new ConsoleLogger());

      api.addProjectJSON = (name, json) => {
        const project = deserializer.reviveProject(name, json, { projectRoot: "/", registry: new FileRegistry() });
        projectJSON.set(name, project);
      }
      api.getProject = (name) => {
        return projectJSON.get(name) || null;
      }
    },
  }
}