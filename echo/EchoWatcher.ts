import ts from "typescript";
import { createEchoModuleBuilder } from "./ModuleBuilder.ts";
import { EchoModule } from "./reflections.ts";

export const createEchoWatcher = async (entryPoints: string[], onModule: (entryPoint: string, module: EchoModule) => void) => {
  const tsOptions: ts.CompilerOptions = {
    noEmit: true,
    strict: true,
    allowImportingTsExtensions: true,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    //lib: []
  }

  const host = ts.createWatchCompilerHost<ts.SemanticDiagnosticsBuilderProgram>(
    entryPoints, tsOptions, ts.sys, ts.createSemanticDiagnosticsBuilderProgram,
    diagnostic => {
      console.warn('[Echo:Typescript:Error]', diagnostic.messageText);
    },
    watchStatus => {
      console.warn('[Echo:Typescript]', watchStatus.messageText);

    },
    [],
    {
      
    }
  );

  host.afterProgramCreate = (builder) => {
    performance.mark('builder:start')

    const program = builder.getProgram();
    for (const diag of builder.getGlobalDiagnostics())
      console.log('[DIAG]', diag.messageText)
    for (const diag of builder.getOptionsDiagnostics())
      console.log('[DIAG]', diag.messageText)
    for (const diag of builder.getSemanticDiagnostics())
      console.log('[DIAG]', diag.messageText)
    for (const diag of builder.getSyntacticDiagnostics())
      console.log('[DIAG]', diag.messageText)

    const types = program.getTypeChecker();

    for (const entryPoint of entryPoints) {
      const source = program.getSourceFile(entryPoint);
      if (!source)
        return console.warn(`Can't find file: "${entryPoint}"`);

      const echo = createEchoModuleBuilder(types)
      const mod = echo.createModule(source);
      performance.mark('builder:end')

      onModule(entryPoint, mod);

      const measure = performance.measure('builder', 'builder:start', 'builder:end')
      console.log(`Wrote ${mod.exports.length} exports to mod.json @ ${Date.now()} in ${(measure.duration/1000).toFixed(2)}s`)
      return;
    }
  }

  const watcher = ts.createWatchProgram(host)
  

  return watcher;
};
