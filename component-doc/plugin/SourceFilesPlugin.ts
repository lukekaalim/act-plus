import { NormalizedInputOptions, ObjectHook, Plugin, PluginContext } from 'rollup';

export const createSourceFilesPlugin = (): Plugin<{}> => {
  return {
    name: 'SourceFilesPlugin',
    buildStart(options) {
      
    },
  }
}