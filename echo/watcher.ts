import ts from "typescript";
import { Echo } from "./definitions/module";
import { createEchoFromSourceFile } from "./builders/echo";

export const createEchoWatcher = async (
  entryPoints: string[],
  onModule: (entryPoint: string, module: Echo) => void
) => {
  const tsOptions: ts.CompilerOptions = {
    noEmit: true,
    strict: true,
    allowImportingTsExtensions: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,

    //types: ["vite/client", "@types/node", "./globals.ts"]
    //lib: []
  }

  const host = ts.createWatchCompilerHost<ts.SemanticDiagnosticsBuilderProgram>(
    entryPoints, tsOptions, ts.sys, ts.createSemanticDiagnosticsBuilderProgram,
    diagnostic => {
      //console.warn('[Echo:Typescript:Error]', diagnostic.messageText);
    },
    watchStatus => {
      //console.warn('[Echo:Typescript]', watchStatus.messageText);
    },
    [],
    {
      
    }
  );

  host.afterProgramCreate = (builder) => {
    performance.mark('builder:start')

    const program = builder.getProgram();

    for (const entryPoint of entryPoints) {
      const source = program.getSourceFile(entryPoint);
      if (!source)
        return console.warn(`Can't find file: "${entryPoint}"`);

      console.log("Lets go!")

      // need to be more precise about Host
      const mod = createEchoFromSourceFile(source.fileName.replaceAll('.ts', ''), source, program, host);
      performance.mark('builder:end')
    
      for (const diag of builder.getGlobalDiagnostics())
        console.log('[DIAG (global)]', diag.messageText)
      for (const diag of builder.getOptionsDiagnostics())
        console.log('[DIAG (options)]', diag.messageText)
      for (const diag of builder.getSemanticDiagnostics())
        mod.diagnostics.push({
          category: 'semantic',
          message: typeof diag.messageText === 'string' &&  diag.messageText || 'Complex error',
          source: diag.source || 'Missing Source'
        })

      for (const diag of builder.getSyntacticDiagnostics())
        console.log('[DIAG (syntactic)]', diag.messageText)
      

      onModule(entryPoint, mod);

      const measure = performance.measure('builder', 'builder:start', 'builder:end')
      console.log(`Wrote ${mod.exports.length} exports to mod.json @ ${Date.now()} in ${(measure.duration/1000).toFixed(2)}s`)
      return;
    }
  }

  const watcher = ts.createWatchProgram(host)
  

  return { watcher, host };
};
