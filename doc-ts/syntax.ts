import { h, Node } from "@lukekaalim/act"
import { hljs } from "@lukekaalim/act-doc"
import ts from "typescript"

export type SyntaxRendererOutput = {
  mode: 'append' | 'new-line',
  node: Node,
  children: SyntaxRendererOutput[]
}

export const flattenSyntaxRendererOutput = (output: SyntaxRendererOutput): Node[] => {
  console.log('FLATTENING', output)
  let currentLine: Node[] = [];
  const nodeList: Node[][] = [
    currentLine,
  ];

  const flatten = (output: SyntaxRendererOutput) => {
    if (output.mode === 'new-line') {
      currentLine = [];
      nodeList.push(currentLine);
    }
    currentLine.push(output.node);
    for (const child of output.children)
      flatten(child);
  }
  flatten(output);

  return nodeList;
}

export type SyntaxRenderer = {
  renderNode(node: ts.Node): SyntaxRendererOutput,
}

export const createSyntaxRenderer = (): SyntaxRenderer => {
  const renderFunction = (node: ts.FunctionDeclaration): SyntaxRendererOutput => {
    const name = (node.name as ts.Identifier).text;

    return {
      mode: 'append',
      node: [
        h(hljs.keyword, {}, 'function'),
        ` ${name} (`
      ],
      children: [
        ...node.parameters.map((param, index): SyntaxRendererOutput => {
          const isLastParam = node.parameters.length - 1 === index;
          if (!ts.isIdentifier(param.name))
            return { mode: 'new-line', node: 'unknown', children: [] }

          return { mode: 'new-line', node: h(hljs.attr, {}, param.name.text),
            children: param.type && [
              { mode: 'append', node: ': ', children: [] },
              renderNode(param.type),
              { mode: 'append', node: !isLastParam && ', ', children: [] },
            ] || [],
          };
        }),
        { mode: 'new-line', node: ')', children: [] },
        node.type && { mode: 'append', node: ': ', children: [renderNode(node.type)] },
      ].filter((x): x is SyntaxRendererOutput=> !!x)
    }
  };
  const renderIdentifier = (node: ts.Identifier): SyntaxRendererOutput => {
    return { mode: 'append', node: h(hljs.title, {}, node.text), children: [] }
  };
  const renderTypeReference = (node: ts.TypeReferenceNode): SyntaxRendererOutput => {
    if (!node.typeArguments || node.typeArguments.length < 1)
      return renderNode(node.typeName);

    return { mode: 'append', node: [], children: [
      renderNode(node.typeName),
      { mode: 'append', node: '<', children: [] },
      ...node.typeArguments.map(typeArgument => {
        return renderNode(typeArgument);
      }),
      { mode: 'append', node: '>', children: [] },
    ] }
  };
  const renderVariableDeclaration = (node: ts.VariableDeclaration): SyntaxRendererOutput => {
    const identifier = (node.name as ts.Identifier);
    
    return { mode: 'append', node: [h(hljs.title, {}, identifier.text)],
      children: node.type ? [
        { mode: 'append', node: ': ', children: [] },
        renderNode(node.type),
      ] : []
    }
  };
  const renderToken = (node: ts.Token<ts.SyntaxKind>): SyntaxRendererOutput => {
    const syntaxMap = {
      [ts.SyntaxKind.StringKeyword]: 'string',
      [ts.SyntaxKind.NumberKeyword]: 'number',
      [ts.SyntaxKind.BooleanKeyword]: 'boolean',
    } as Record<ts.SyntaxKind, Node>;
    return { mode: 'append', node: syntaxMap[node.kind] || '<unknown keyword>', children: [] };
  }
  const renderNode = (node: ts.Node): SyntaxRendererOutput => {
    if (ts.isFunctionDeclaration(node))
      return renderFunction(node);
    if (ts.isIdentifier(node))
      return renderIdentifier(node);
    if (ts.isVariableDeclaration(node))
      return renderVariableDeclaration(node);
    if (ts.isTypeReferenceNode(node))
      return renderTypeReference(node);
    if (ts.isToken(node))
      return renderToken(node as ts.Token<ts.SyntaxKind>);

    console.warn(node);
    return {
      mode: 'append',
      node: `[UnknownNode]${ts.SyntaxKind[node.kind]}`,
      children: []
    }
  }

  return { renderNode };
};