import { CoreAPI } from "./Core";

export type PluginI<Key extends string, API> = { key: Key, api: (core: CoreAPI) => API }; 
export type PluginIAPI<Plugin extends PluginI<string, unknown>> = ReturnType<Plugin["api"]>;

export const createPlugin = <Key extends string, API>(key: Key, api: (core: CoreAPI) => API): PluginI<Key, API> => {
  return { key, api };
};

export type AnyPluginArray = ReadonlyArray<PluginI<string, unknown>>;

/**
 * Every plugin included in a DocApp can create an API object, which is
 * attached to the PluginAPI object on via it's "key" property.
 * 
 * @example
 * 
 * ```ts
 * const MyPlugin = createPlugin("sample", () => ({ hello: () => "world" }));
 * const doc = createDocApp([MyPlugin]);
 * 
 * doc.sample.hello() // == "world"
 * ```
 */
export type PluginAPI<Plugins extends AnyPluginArray> = {
  [Plugin in Plugins[number] as Plugin["key"]]: ReturnType<Plugin["api"]>
}

export type PluginKeyArray<Plugins extends AnyPluginArray> = {
  [Index in keyof Plugins]: Plugins[Index]["key"]
}