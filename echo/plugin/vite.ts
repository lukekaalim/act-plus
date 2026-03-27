import { Plugin } from 'vite';
import { buildEchoModule, createEchoWatcher } from '@lukekaalim/echo';

export const createEchoPlugin = async (): Promise<Plugin> => {
  const ECHO_PREFIX = `echo:`;
  const RESOLVED_ECHO_PREFIX = `\0echo:`;
  
  const watchedEntrypoints = new Set<string>();
  const { watcher, host } = await createEchoWatcher([], () => {});

  return {
    name: '@lukekaalim/echo-rollup',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        next();
      })
    },

    async resolveId(id, importer, options) {
      if (!id.startsWith(ECHO_PREFIX))
        return null;

      const entrypoint = await this.resolve(id.slice(ECHO_PREFIX.length), importer);
      if (!entrypoint)
        return null;

      return {
        id: RESOLVED_ECHO_PREFIX + entrypoint.id,
        resolvedBy: 'echo',
        meta: {
          'echo': {
            originalId: id.slice(ECHO_PREFIX.length)
          }
        }
      };
    },
    closeWatcher() {
      console.log('[closeWatcher] Closing Watcher')
      watcher.close();
    },
    buildEnd() {
      console.log('[buildEnd] Closing Watcher')
      watcher.close();
    },
    async load(id, options) {
      if (!id.startsWith(RESOLVED_ECHO_PREFIX))
        return null;

      const info = this.getModuleInfo(id);

      const name = info?.meta?.echo?.originalId || id;

      console.log('load', id, name)

      const entrypoint = id.slice(RESOLVED_ECHO_PREFIX.length)
      this.addWatchFile(entrypoint);
      
      if (!watchedEntrypoints.has(entrypoint)) {
        watchedEntrypoints.add(entrypoint)
        watcher.updateRootFileNames([...watchedEntrypoints])
        console.log('Watching', [...watchedEntrypoints])
      }
      
      const builder = watcher.getProgram();
      const program = builder.getProgram();

      const source = program.getSourceFile(entrypoint);
      if (!source)
        return console.warn(`Can't find file: "${entrypoint}"`);

      const mod = buildEchoModule(name, source, program, host);

      console.log(`Returning build for ${name}`)

      return `export default ${JSON.stringify(mod, null, 2)}`;
    }
  }
}
