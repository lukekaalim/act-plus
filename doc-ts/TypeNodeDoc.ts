// DocTS is about displaying typescript documentation
import { CompilerHost, createCompilerHost, createProgram, createSolutionBuilderHost, createSourceFile, factory, FunctionDeclaration, isFunctionDeclaration, isTypeLiteralNode, ScriptTarget, SymbolFlags, SyntaxKind, TypeNode } from 'typescript';
import { DocNode } from '@microsoft/tsdoc';
import { h, Component } from '@lukekaalim/act';
import { findIdentifiersInFile } from './registry';
import { SyntaxNode } from './SyntaxNode';
import { CodeBox } from '@lukekaalim/act-doc/components/article/CodeBox';

const srcs = import.meta.glob('../**/*.ts', { query: 'raw' });

console.log(srcs);

export type TypeNodeDocProps = {
  type: TypeNode,
  doc: DocNode | null
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
  return h(CodeBox, {}, h(SyntaxNode, { node, indent: 0 }))
}


const src = `
/**
 * This is a tsdoc comment on the component
 */
export const MyCoolComponent: Component<CoolProps> = () => {
  return 'cool';
};

/**
 * This is a tsdoc comment on the props
 * 
 */
export type CoolProps = {
  value: string,
  otherValue: DistantIdentifier,
};

export function MyOtherComponent({ value, otherValue }: CoolProps) {
  return 'cool';
}
`

export const srcFile = createSourceFile('src.ts', src, ScriptTarget.ES2024);

srcFile.statements.map(statement => {
  console.log(SyntaxKind[statement.kind], statement);
})

console.log(findIdentifiersInFile(srcFile));