import { Component, createContext, useContext, useMemo } from "@lukekaalim/act";
import { MarkdownComponent } from "@lukekaalim/act-markdown";
import { DocPlugin } from "./DocPlugin";

/**
 * "Merge Declarations" with this interface
 * to enable extra functions on the "AppAPI"
 * object
*/
export interface DocAppAPIExtension {}

export type AppAPI = {} & DocAppAPIExtension;

/**
 * The "App Setup" is a option containing
 * all the extra bits that can be added via plugins
 * and read by services
 */
export type AppSetup = {
  MDXComponents: Map<string, MarkdownComponent>,
  markdownDocuments: Map<string, string>,
  referenceLinks: Map<string, URL>,

  api: AppAPI,
};

export const AppSetupContext = createContext<AppSetup | null>(null);

export const intializeApplication = (plugins: DocPlugin[]): AppSetup => {
  const setup = {
    MDXComponents: new Map(),
    markdownDocuments: new Map(),
    referenceLinks: new Map(),
    api: {} as any,
  }

  for (const plugin of plugins) {
    plugin.register(setup);
    plugin.augmentAPI(setup.api);
  }

  return setup;
}


export const useApplicationInit = (plugins: DocPlugin[]) => {
  return useMemo(() => intializeApplication(plugins), [plugins]);
};

export class MissingAppSetupContextError extends Error {}

export const useAppSetup = () => {
  const setup = useContext(AppSetupContext);
  if (!setup)
    throw new MissingAppSetupContextError();
  return setup;
}
export const useAppAPI = () => {
  return useAppSetup().api;
}