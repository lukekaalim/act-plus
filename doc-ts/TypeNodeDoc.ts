// DocTS is about displaying typescript documentation
import { CompilerHost, createCompilerHost, createProgram, createSolutionBuilderHost, createSourceFile, factory, isTypeLiteralNode, ScriptTarget, SymbolFlags, SyntaxKind, TypeNode } from 'typescript';
import { DocNode } from '@microsoft/tsdoc';
import { h, Component } from '@lukekaalim/act';

export type TypeNodeDocProps = {
  type: TypeNode,
  doc: DocNode
};

/**
 * For a given typenode, render both a:
 *  - preview of the type
 *  - documentation summary below the type
 */
export const TypeNodeDoc: Component<TypeNodeDocProps> = ({ type }) => {
  return h(TypeNodePreview, { node: type })
};

export type TypeNodePreviewProps = {
  node: TypeNode,
}

const TypeNodePreview: Component<TypeNodePreviewProps> = ({ node }) => {
  return null;
  if (isTypeLiteralNode(node)) {
    return 'Type literal!';
  }

  console.warn(`Unknown type`, SyntaxKind[node.kind])
  return 'Unknown type';
}


const src = `
/***
 * My cool function 
 *
 */
function myFunc(myParam: MyType) {
  console.log('My function contents');
}
`

const files = [
  createSourceFile('src.ts', src, ScriptTarget.ES2024),
  createSourceFile('default.lib.ts', '', ScriptTarget.ES2024)
]

console.log(SyntaxKind[files[0].statements[0].kind]);

const createMemoryCompilerHost = (): CompilerHost => {
  return {
    getDefaultLibFileName() {
      return 'deafult.lib.ts';
    },
    getSourceFile(filename, target, onError, shouldCreate) {
      return files.find(file => file.fileName === filename);
    },
    writeFile(filename, contents, byteOrderMark) {
      console.log(`writing file`, filename, contents)
    },
    getCurrentDirectory() {
      return '/';
    },
    getCanonicalFileName(fileName) {
      return fileName;
    },
    fileExists(fileName) {
      return false;
    },
    readFile(fileName) {
      return '';
    },
    useCaseSensitiveFileNames() {
      return true;
    },
    getNewLine() {
      return `\n`;
    },
  };
}

const program = createProgram({
  rootNames: ['src.ts'],
  host: createMemoryCompilerHost(),
  options: {}
});

const checker = program.getTypeChecker();

console.log('resolve', checker.resolveName('myFunc', files[0], SymbolFlags.All, false));

