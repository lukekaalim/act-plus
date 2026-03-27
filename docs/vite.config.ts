import path from 'node:path';
import { defineConfig, Plugin } from 'vite';
import * as td from "typedoc";
import ts from 'typescript';

import type * as echo from '@lukekaalim/echo';

import { tsImport } from 'tsx/esm/api'

const TYPEDOC_PREFIX = 'typedoc:';
const RESOLVED_TYPEDOC_ID_PREFIX = `\0${TYPEDOC_PREFIX}`

const createEchoPlugin = async (): Promise<Plugin> => {
  const { buildEchoModule, createEchoWatcher } = await tsImport('@lukekaalim/echo', import.meta.url) as typeof echo;

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

const plugin: Plugin = {
  name: 'typedoc',
  resolveId(id, importer) {
    if (id.startsWith(TYPEDOC_PREFIX)) {
        const pathWithoutPrefix = id.slice(TYPEDOC_PREFIX.length);

      if (importer) {
        const resolvedPath = path.resolve(path.dirname(importer), pathWithoutPrefix);

        return RESOLVED_TYPEDOC_ID_PREFIX + resolvedPath;
      } else {
        return RESOLVED_TYPEDOC_ID_PREFIX + pathWithoutPrefix;
      }
    }
    return null;
  },
  async load(id, options) {
    if (id.startsWith(RESOLVED_TYPEDOC_ID_PREFIX)) {
      const pathWithoutPrefix = id.slice(RESOLVED_TYPEDOC_ID_PREFIX.length);

      const app = await td.Application.bootstrapWithPlugins({
        entryPoints: [pathWithoutPrefix],
        sort: ['source-order']
      });

      const project = await app.convert();
      if (project) {
        const sources = new Set<string>();
        project.traverse(refl => {
          if (refl.isDeclaration()) {
            if (refl.sources)
              for (const source of refl.sources)
                sources.add(source.fullFileName)
          }
        })
        for (const source of sources)
          this.addWatchFile(source);

        const projectJSON = app.serializer.projectToObject(project, '/');
        return `export default ` + JSON.stringify(projectJSON, null, 2);
      }
      return `export default "ERROR"`
    }
  },
}

export default defineConfig({
  build: {
    target: ["esnext"],
  },
  plugins: [createEchoPlugin()]
});
