type PluginI<Key extends string, API> = { key: Key, api: () => API }; 


const createPlugin = <Name extends string, API>(name: Name, api: () => API): PluginI<Name, API> => {
  throw new Error();
};

type AnyPluginArray = PluginI<string, unknown>[];

export type DocApp<Plugins extends AnyPluginArray> = {
  [Plugin in Plugins[number] as Plugin["key"]]: ReturnType<Plugin["api"]>
};

const createDocApp = <Plugins extends AnyPluginArray>(plugins: Plugins): DocApp<Plugins> => {
  throw new Error();
}

const coolPlugin = createPlugin("cool", () => ({
  createCool() {
    return null;
  }
}))
const coolerPlugin = createPlugin("cooler", () => ({
  createCooler() {
    return null;
  }
}))

const app = createDocApp([coolPlugin, coolerPlugin]);
