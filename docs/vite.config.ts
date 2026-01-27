import path from 'node:path';
import { defineConfig, Plugin } from 'vite';
import * as td from "typedoc";
import { nanoid } from 'nanoid';

import expand from 'brace-expansion';
import { createEchoModuleBuilder, createEchoWatcher, EchoModule } from '@lukekaalim/echo';
import ts from 'typescript';

const TYPEDOC_PREFIX = 'typedoc:';
const RESOLVED_TYPEDOC_ID_PREFIX = `\0${TYPEDOC_PREFIX}`

const createEchoPlugin = async (): Promise<Plugin> => {
  const ECHO_PREFIX = `echo:`;
  const RESOLVED_ECHO_PREFIX = `\0echo:`;
  
  const watchedEntrypoints = new Set<string>();
  const watcher: ts.WatchOfFilesAndCompilerOptions<ts.SemanticDiagnosticsBuilderProgram> = await createEchoWatcher([], () => {});

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

      return RESOLVED_ECHO_PREFIX + entrypoint.id;
    },
    closeWatcher() {
      watcher.close();
    },
    async load(id, options) {
      if (!id.startsWith(RESOLVED_ECHO_PREFIX))
        return null;

      const entrypoint = id.slice(RESOLVED_ECHO_PREFIX.length)
      this.addWatchFile(entrypoint);
      
      if (!watchedEntrypoints.has(entrypoint)) {
        watchedEntrypoints.add(entrypoint)
        watcher.updateRootFileNames([...watchedEntrypoints])
        console.log('Watching', [...watchedEntrypoints])
      }
      
      const builder = watcher.getProgram();
      const program = builder.getProgram();
      const checker = program.getTypeChecker();

      const source = program.getSourceFile(entrypoint);
      if (!source)
        return console.warn(`Can't find file: "${entrypoint}"`);

      const echo = createEchoModuleBuilder(checker);
      const mod = echo.createModule(source);

      console.log(`Returning build for ${entrypoint}`)

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
