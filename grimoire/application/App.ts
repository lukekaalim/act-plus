import { createContext, useContext } from "@lukekaalim/act";
import { CoreAPI, createCoreAPI } from "./Core";
import { AnyPluginArray, createPlugin, PluginAPI, PluginKeyArray } from "./Plugin";

/**
 * The DocApp type represents a collection of data that describes a
 * documentation website. It collects things such as:
 * 
 *  {@link DocApp|This is the original text}
 * 
 *  - Routing
 *  - Demo Components
 *  - Markdown Articles
 *  - Reference Lookups
 *  - Custom Display Components
 * 
 * You can create a new instance of this object by called the
 * `createDocApp` function.
 * 
 */
export type DocApp<Plugins extends AnyPluginArray = []> = PluginAPI<Plugins> & CoreAPI;

/**
 * Create a new DocApp object.
 * 
 * @param plugins An array of plugins that can extend functionality
 * @returns 
 */
export const createDocApp = <Plugins extends AnyPluginArray>(plugins: Plugins = ([] as unknown as Plugins)): DocApp<Plugins> => {
  const coreAPI = createCoreAPI();
  const pluginAPI: Record<string, unknown> = {}

  console.info(`Creating DocApp`)

  for (const plugin of plugins) {
    console.info(`Loading plugin "${plugin.key}"`)
    pluginAPI[plugin.key] = plugin.api(coreAPI);
  }

  return { ...coreAPI, ...(pluginAPI as PluginAPI<Plugins>) };
}

export const DocAppContext = createContext<DocApp<AnyPluginArray> | null>(null);

/**
 * Get an instance of the DocApp used in the application.
 * @param requiredPlugins A list of plugins that this DocApp instance _requires_
 * for this hook to function. A runtime check is performed on the context-provided
 * DocApp instance to validate that the requested plugins are actually present (via their Key property).
 * 
 * @returns The context-shared DocApp instance used across the application. If required plugins
 * were provided, the plugin types are added to the return interface.
 */
export const useDocApp = <Plugins extends AnyPluginArray>(requiredPlugins: Plugins): DocApp<Plugins> => {
  const doc = useContext(DocAppContext);
  if (!doc)
    throw new Error(`Missing AppDoc context`);

  const docKeys = Object.keys(doc);

  if (requiredPlugins.every(requiredPlugin => docKeys.includes(requiredPlugin.key)))
    return doc as DocApp<Plugins>;

  throw new Error()
}
