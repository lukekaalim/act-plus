// DocTS is about displaying typescript documentation
import {  createSourceFile, factory, FunctionDeclaration, isFunctionDeclaration, isIdentifier, isTypeLiteralNode, isVariableDeclaration, Node, ScriptTarget, SourceFile, SymbolFlags, SyntaxKind, TypeNode } from 'typescript';
import { DocNode } from '@microsoft/tsdoc';
import { h, Component } from '@lukekaalim/act';

export type TypeNodeDocProps = {
  type: Node,
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
  node: Node,
}

const TypeNodePreview: Component<TypeNodePreviewProps> = ({ node }) => {
  const sourceFile = node.getSourceFile();

  if (isVariableDeclaration(node) && node.type && isIdentifier(node.name)) {
    return h(Code, {
      content: `${'const'} ${node.name.text}: ${node.type.getText(sourceFile)};`,
      language: 'typescript'
    })
  }
    
  return [
    h(Code, { content: node.getText(sourceFile), language: 'typescript' })
  ];
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
