import { Plugin } from 'vite';
import { createEchoFromSourceFile, createEchoWatcher } from '@lukekaalim/echo';
import ts from 'typescript';

export const DEFAULT_TS_OPTIONS = {
  noEmit: true,
  strict: true,
  allowImportingTsExtensions: true,
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ES2022,
  moduleResolution: ts.ModuleResolutionKind.Bundler,

  types: ["vite/client", "@types/node", "./globals.ts"]
};

export const createEchoPlugin = async (tsOptions: ts.CompilerOptions = DEFAULT_TS_OPTIONS): Promise<Plugin> => {
  const ECHO_PREFIX = `echo:`;
  const RESOLVED_ECHO_PREFIX = `\0echo:`;
  
  const watchedEntrypoints = new Set<string>();
  const generatedIds = new Set<string>();

  const host = ts.createWatchCompilerHost<ts.EmitAndSemanticDiagnosticsBuilderProgram>(
    [],
    tsOptions,
    ts.sys,
    ts.createEmitAndSemanticDiagnosticsBuilderProgram,
    () => {},
    () => {}
  );
  const watcher = ts.createWatchProgram(host)

  return {
    name: '@lukekaalim/echo-rollup',

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        next();
      })
      host.afterProgramCreate = (program) => {
        // Force a reload of all affected nodes
        for (const moduleId of generatedIds) {
          const mod = server.moduleGraph.getModuleById(moduleId)
          if (mod)
            server.moduleGraph.invalidateModule(mod)
        }
      }
    },

    handleHotUpdate(ctx) {
      console.log(ctx.modules.map(m => m.id))
      console.log(ctx.file)
      return ctx.modules;
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

      const entrypoint = id.slice(RESOLVED_ECHO_PREFIX.length)
      this.addWatchFile(entrypoint);
      
      if (!watchedEntrypoints.has(entrypoint)) {
        watchedEntrypoints.add(entrypoint)
        watcher.updateRootFileNames([...watchedEntrypoints])
        generatedIds.add(id);
      }
      console.log(`[EchoPlugin]: Fetching new Program"`)
      
      const builder = watcher.getProgram();
      const program = builder.getProgram();

      const source = program.getSourceFile(entrypoint);
      if (!source)
        return console.warn(`Can't find file: "${entrypoint}"`);

      const mod = createEchoFromSourceFile(name, source, program, host);
      for (const diag of builder.getSemanticDiagnostics())
        mod.diagnostics.push({
          category: 'semantic',
          message: typeof diag.messageText === 'string' &&  diag.messageText || 'Complex error',
          source: diag.source || 'Missing Source'
        })

      console.log(`[EchoPlugin]: New echo for "${mod.moduleName}"`)

      return `export default ${JSON.stringify(mod, null, 2)}`;
    }
  }
}
