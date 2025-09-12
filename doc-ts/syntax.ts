import { h, Node } from "@lukekaalim/act"
import { hljs } from "@lukekaalim/act-doc"
import ts, { isIdentifier } from "typescript"
import { AnalysisReference } from "./registry";

export type SyntaxRenderer = {
  renderNode(node: ts.Node): void,
  getLines(): Node[],
}

export const createSyntaxRenderer = (
  getIdentifierReference: (identifier: string, namespace?: string) => null | AnalysisReference,
  indentString: string = '  '
): SyntaxRenderer => {
  let indent = 0;
  let currentLine: Node[] = [];
  const lines: Node[] = [
    currentLine,
  ];

  const startLine = () => {
    const indentNode = Array.from({ length: indent }).map(() => indentString).join('');
    currentLine = [indentNode];
    lines.push(currentLine);
  }
  const addToLine = (...nodes: Node[]) => {
    currentLine.push(...nodes);
  }
  const getLinkNode = (node: Node, identifier: string, namespace = '') => {
    const link = getIdentifierReference(identifier, namespace);

    if (link)
      return h('a', { href: link.href, style: { color: 'inherit' } }, node)
    else
      return node;
  };
  const renderParameters = (parameters: ts.NodeArray<ts.ParameterDeclaration>) => {
    const lineBreak = parameters.length > 1;

    addToLine('(')
    if (lineBreak)
      indent++;
    for (let i = 0; i < parameters.length; i++) {
      const param = parameters[i];
      const isLastParam = parameters.length - 1 === i;

      if (lineBreak)
        startLine();

      const paramName = param.name as ts.Identifier;
      addToLine(h(hljs.attr, {}, paramName.text));
      if (param.type) {
        addToLine(': ')
        renderNode(param.type)
      }
      if (!isLastParam) {
        addToLine(',');
      }
    }
    if (lineBreak) {
      indent--;
      startLine();
    }
    addToLine(')')
  }
  const renderFunction = (node: ts.FunctionDeclaration | ts.ArrowFunction) => {
    const name = node.name && ts.isIdentifier(node.name) && node.name;

    const isArrow = node.kind === ts.SyntaxKind.ArrowFunction;

    if (!isArrow)
      addToLine(h(hljs.keyword, {}, 'function '));
    if (name)
      addToLine(name.text)
    renderParameters(node.parameters)
    if (node.type) {
      if (isArrow) {
        addToLine(' => ')
      } else {
        addToLine(': ')
      }
      renderNode(node.type)
    }
  };
  const renderIdentifier = (node: ts.Identifier) => {
    addToLine(h(hljs.title, {}, getLinkNode(node.text, node.text)))
  };
  const renderTypeReference = (node: ts.TypeReferenceNode) => {
    renderNode(node.typeName)
    if (node.typeArguments && node.typeArguments.length > 0) {
      addToLine('<')
      for (let i = 0; i < node.typeArguments.length; i++) {
        const lastArgument = node.typeArguments.length - 1 === i;
        renderNode(node.typeArguments[i]);
        if (!lastArgument)
          addToLine(', ');
      }
      addToLine('>')
    }
  };
  const renderVariableDeclaration = (node: ts.VariableDeclaration) => {
    const identifier = (node.name as ts.Identifier);

    const parent = (node.parent as ts.VariableDeclarationList);
    const declarationKeyword = parent.flags && ts.NodeFlags[parent.flags] || 'var';

    addToLine(h(hljs.keyword, {}, declarationKeyword.toLocaleLowerCase()), ' ');
    addToLine(h(hljs.titleClass, {}, identifier.text));
    if (node.type) {
      addToLine(': ');
      renderNode(node.type);
    } else if (node.initializer) {
      addToLine(' = ');
      renderNode(node.initializer, `${identifier.text}.`);
    }
  };
  const renderToken = (node: ts.Token<ts.SyntaxKind>) => {
    const syntaxMap = {
      [ts.SyntaxKind.StringKeyword]: 'string',
      [ts.SyntaxKind.NumberKeyword]: 'number',
      [ts.SyntaxKind.BooleanKeyword]: 'boolean',
      [ts.SyntaxKind.UndefinedKeyword]: 'undefined',
      [ts.SyntaxKind.VoidKeyword]: 'void',
      [ts.SyntaxKind.NullKeyword]: 'null',
    } as Record<ts.SyntaxKind, Node>;

    const tokenText = syntaxMap[node.kind] || `<unknown keyword [${ts.SyntaxKind[node.kind]}]>`;

    addToLine(h(hljs.builtIn, {}, tokenText));
  }
  const renderTypeAliasDeclaration = (node: ts.TypeAliasDeclaration) => {
    const identifier = (node.name as ts.Identifier);

    addToLine(
      h(hljs.keyword, {}, 'type '),
      h(hljs.titleClass, {}, identifier.text),
      ' = '
    );
    renderNode(node.type, `${identifier.text}.`);
  }
  const renderTypeLiteralNode = (node: ts.TypeLiteralNode, identifierPrefix: string = '') => {
    const oneLiner = node.members.length < 2;
    addToLine('{ ')
    if (!oneLiner) {
      indent++;
      startLine();
    }
    for (let i = 0; i < node.members.length; i++) {
      const lastMember = node.members.length - 1 === i;
      const member = node.members[i];

      if (ts.isPropertySignature(member) && member.type) {
        if ((ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))) {
          addToLine(h(hljs.attr, {}, member.name.text));
          addToLine(': ');
          renderNode(member.type)
        }
      } else if (ts.isMethodSignature(member)) {
        renderMethodSignature(member, identifierPrefix)
      }

      if (!lastMember) {
        addToLine(',');
      }

      addToLine(' ');
      if (!oneLiner && !lastMember)
        startLine();
    }
    if (!oneLiner) {
      indent--;
      startLine();
    }
    addToLine('}')
  }
  const renderMethodSignature = (node: ts.MethodSignature, identifierPrefix: string = '') => {
    renderPropertyName(node.name, identifierPrefix);
    renderParameters(node.parameters);
    if (node.type) {
      addToLine(': ');
      renderNode(node.type);
    }
  }
  const renderPropertyName = (node: ts.PropertyName, identifierPrefix: string = '') => {
    if (isIdentifier(node)) {
      addToLine(h(hljs.attr, {}, getLinkNode(node.text, identifierPrefix + node.text)));
    } else {
      console.error(`Cant handle this property name`)
    }
  }
  const renderArrayTypeNode = (node: ts.ArrayTypeNode) => {
    renderNode(node.elementType);
    addToLine('[]')
  }
  const renderUnionTypeNode = (node: ts.UnionTypeNode) => {
    const oneLine = node.types.length < 3;
    if (!oneLine) {
      indent++;
      startLine();
    }

    for (let i = 0; i < node.types.length; i++) {
      const isLast = i === node.types.length - 1;
      const isFirst = i === 0;
      if (!oneLine || !isFirst) {
        addToLine(' | ')
      }
      renderNode(node.types[i]);
      if (!oneLine && !isLast) {
        startLine();
      }
    }
    if (!oneLine) {
      indent--;
    }
  }
  const renderLiteralTypeNode = (node: ts.LiteralTypeNode) => {
    renderToken(node.literal)
  }
  const renderQualifiedName = (node: ts.QualifiedName) => {
    if (ts.isIdentifier(node.left) && isIdentifier(node.right)) {
      // Special case: ask for a namespace
      addToLine(h(hljs.title, {},
        getLinkNode(
          `${node.left.text}.${node.right.text}`,
          node.right.text,
          node.left.text
        )))
    } else {
      renderNode(node.left);
      addToLine('.')
      renderNode(node.right);
    }
  }
  const renderNode = (node: ts.Node, identifierPrefix: string = ''): void => {
    if (ts.isFunctionDeclaration(node))
      return renderFunction(node);

    if (ts.isIdentifier(node))
      return renderIdentifier(node);

    if (ts.isVariableDeclaration(node))
      return renderVariableDeclaration(node);

    if (ts.isArrowFunction(node))
      return renderFunction(node);

    if (ts.isTypeReferenceNode(node))
      return renderTypeReference(node);

    if (ts.isToken(node))
      return renderToken(node as ts.Token<ts.SyntaxKind>);

    if (ts.isTypeAliasDeclaration(node))
      return renderTypeAliasDeclaration(node);

    if (ts.isTypeLiteralNode(node))
      return renderTypeLiteralNode(node, identifierPrefix)

    if (ts.isArrayTypeNode(node))
      return renderArrayTypeNode(node);

    if (ts.isQualifiedName(node))
      return renderQualifiedName(node);

    if (ts.isUnionTypeNode(node))
      return renderUnionTypeNode(node);

    if (ts.isLiteralTypeNode(node))
      return renderLiteralTypeNode(node);

    console.warn(`Unsupported node: ${ts.SyntaxKind[node.kind]}`, node);
    return addToLine(`Unsupported node: ${ts.SyntaxKind[node.kind]}`)
  }

  const getLines = () => {
    return lines
  }

  return { renderNode, getLines };
};