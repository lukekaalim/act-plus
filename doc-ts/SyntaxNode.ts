import { Component, h } from "@lukekaalim/act"
import { FunctionDeclaration, Identifier, isFunctionDeclaration, isIdentifier, SyntaxKind, TypeNode } from "typescript"

export type SyntaxNodeProps<T = TypeNode> = {
  indent: number,
  node: T,
}

export const SyntaxNode: Component<SyntaxNodeProps> = ({ indent, node }) => {
  if (isFunctionDeclaration(node))
    return h(FunctionSyntaxNode, { indent, node })

  return `Unknown node: ${SyntaxKind[node.kind]}`;
}


const FunctionSyntaxNode: Component<SyntaxNodeProps<FunctionDeclaration>> = ({ node }) => {
  const name = (node.name as Identifier).text;

  return h('span', {}, [
    `function `, h('span', {}, name), ` (`,
    node.parameters.map(parameter => {
      if (isIdentifier(parameter.name))
        return parameter.name.text;

      return `<unknown param>`;
    }),
    `): unknown`
  ])
}