import { CompilerHost, createSourceFile, ScriptTarget } from "typescript"

export const createVirtualTypescriptCompilerHost = async (
  files: Map<string, string>
): Promise<CompilerHost> => {
  const sourceFiles = new Map();
  const host: CompilerHost = {
    getSourceFile(fileName, options, onError) {
      console.log(`Someone wants ${fileName}`)
      if (sourceFiles.has(fileName))
        return sourceFiles.get(fileName);
      if (files.has(fileName)) {
        const contents = files.get(fileName) as string;
        const file = createSourceFile(fileName, contents, ScriptTarget.Latest);
        sourceFiles.set(fileName, file);
        return file;
      }
      if (onError)
        onError(`No sourcefile with name ${fileName} found`);
    },
    getDefaultLibFileName() {
      return '';
    },
    writeFile(filename, text) {
      throw new Error(`Virtual Typescript Compiler Host cannot write files`)
    },
    getCurrentDirectory() {
      return '/'
    },
    getCanonicalFileName(filename) {
      return filename;
    },
    useCaseSensitiveFileNames() {
      return false;
    },
    getNewLine() {
      return '/n';
    },
    fileExists(fileName) {
      console.info(`Checking if real: ${fileName}`)
      return sourceFiles.has(fileName);
    },
    readFile(fileName) {
      return files.get(fileName)
    },
  };

  return host;
}