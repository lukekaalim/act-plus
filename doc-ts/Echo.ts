import { CodeBox, CoreAPI, createHLJSBuilder, createPlugin, HLJSBuilder, InlineErrorBox, MDXComponent } from "@lukekaalim/grimoire";
import { EchoDeclaration, EchoModule, EchoType } from "@lukekaalim/echo";
import { Component, h, Node, useMemo } from "@lukekaalim/act";

import { DocNode, TSDocParser, DocNodeKind, DocComment, DocSection, DocParagraph, DocPlainText } from '@microsoft/tsdoc';

import "./simpleStyles.css";

const createTypeRenderer = (module: EchoModule) => {
  const renderTypeParameters = (syntax: HLJSBuilder, typeParameters: EchoType.Any[]) => {
    if (typeParameters.length === 0)
      return syntax;

    syntax.text('<')
    for (const parameter of typeParameters) {
      renderType(syntax, parameter)
      syntax.text(', ')
    }
    syntax.text('>')
    return syntax;
  }
  const renderTypeParametersDeclaration = (syntax: HLJSBuilder, typeParameterDeclarations: Record<string, EchoDeclaration.TypeParameter>) => {
    const parameters = Object.entries(typeParameterDeclarations);
    if (parameters.length === 0)
      return syntax;

    syntax.text('<')
    for (const [name, parameter] of parameters) {
      syntax.title(name);
      if (parameter.extends) {
        syntax.type(' extends ');
        renderType(syntax, parameter.extends)
      }
      if (parameter.default) {
        syntax.type(' = ');
        renderType(syntax, parameter.default)
      }
      syntax.text(', ')
    }
    syntax.text('>')
    return syntax;
  }

  const renderType = (syntax: HLJSBuilder, echoType: EchoType.Any): HLJSBuilder => {
    switch (echoType.type) {
      case 'builtin':
        return syntax.builtIn(echoType.builtin);
      case 'keyword':
        return syntax.keyword(echoType.keyword);
      case 'unsupported':
        return syntax.comment(`Unsupported(Reflector) type [${echoType.message}] />`);
      case 'literal':
        switch (typeof echoType.value) {
          default:
          case 'object':
            return syntax.keyword('null');
          case 'string':
            return syntax.string(`"` + (echoType.value as string).toString() + `"`);
          case 'number':
            return syntax.number((echoType.value).toString());
          case 'boolean':
            return syntax.literal((echoType.value).toString());
        }
      case 'intersection':
        if (echoType.branches.length < 3) {
          renderType(syntax, echoType.branches[0])
          syntax.text(' & ')
          renderType(syntax, echoType.branches[1])
          return syntax;
        } else {
          syntax.indent(1)
          for (const branch of echoType.branches) {
            syntax.newLine().text('& ')
            renderType(syntax, branch)
          }
          syntax.newLine(-1)
          return syntax;
        }
      case 'union':
        if (echoType.branches.length < 3) {
          renderType(syntax, echoType.branches[0])
          syntax.text(' | ')
          renderType(syntax, echoType.branches[1])
          return syntax;
        } else {
          syntax.indent(1)
          for (const branch of echoType.branches) {
            syntax.newLine().text('| ')
            renderType(syntax, branch)
          }
          syntax.newLine(-1)
          return syntax;
        }
      case 'array':
        return renderType(syntax, echoType.element)
          .text('[]')
      case 'indexed-access':
        renderType(syntax, echoType.target)
        syntax.text('[')
        renderType(syntax, echoType.accessor);
        syntax.text(']')
        return syntax;
      case 'reference':
        if (echoType.target.type === 'internal') {
          syntax.titleClass(module.identifiers[echoType.target.id])
        } else {
          syntax.titleClass('(Still working on it)')
        }
        renderTypeParameters(syntax, echoType.typeParameters);
        return syntax;
      case 'callable':
        renderCallableSignature(syntax, echoType, false);
        return syntax;
      default:
        return syntax.comment(`<Unsupported(Renderer) type "${echoType.type}" />`)
      case 'object': {
        syntax.text('{').newLine(1);
        for (const [key, property] of Object.entries(echoType.properties)) {
          if (property.type === 'callable') {
            syntax.titleClass(key);
            renderCallableSignature(syntax, property, true);
            syntax.text(', ').newLine()
          } else {
            syntax.text(key).text(': ');
            renderType(syntax, property);
            syntax.text(', ').newLine()
          }
        }
        syntax.newLine(-1).text('}')
        return syntax;
      }
    }
  }

  const renderCallableSignature = (syntax: HLJSBuilder, callable: EchoType.Callable, isMethod: boolean) => {
    renderTypeParametersDeclaration(syntax, callable.typeParameters);
    syntax.text('(');
    for (const param of callable.parameters) {
      syntax.titleClass(param.name)
      if (param.optional) {
        syntax.text('?: ')
      } else {
        syntax.text(': ')
      }
      renderType(syntax, param.type);
      syntax.text(', ')
    }
    if (isMethod)
      syntax.text('): ');
    else
      syntax.text(') => ');
    renderType(syntax, callable.returns)
  }

  const renderDeclaration = (syntax: HLJSBuilder, echoDeclaration: EchoDeclaration.Any) => {
    switch (echoDeclaration.type) {
      case 'type':
        syntax
          .keyword('export type ')
          .title(echoDeclaration.identifier);
        //renderTypeParametersDeclaration(syntax, echoDeclaration.parameters);
        syntax.text(' = ');

        renderType(syntax, echoDeclaration.declares);
        return syntax;
      case 'namespace':
        syntax.keyword("namespace ").titleClass(echoDeclaration.identifier);
        return syntax;
      case 'function':
        syntax.keyword('function ').titleClass(echoDeclaration.identifier)
        renderCallableSignature(syntax, echoDeclaration.signature, true);
        return syntax;
      case 'unsupported':
        return syntax.comment(`<Unsupported(Reflector) declaration "${echoDeclaration.message}" />`)
      case 'variable':
        syntax.keyword('export var ')
          .title(echoDeclaration.identifier);
        if (echoDeclaration.typeof) {
          syntax.text(': ')
          renderType(syntax, echoDeclaration.typeof);
        }
        return syntax;
      default:
        return syntax
          .comment(`<Unsupported(Renderer) declaration "${echoDeclaration.type}" />`);
    }
  }

  const renderDocCommentNode = (node: DocNode): Node => {
    switch (node.kind) {
      case DocNodeKind.Comment:
        const comment = node as DocComment;
        console.log({ comment })
        return h('article', {}, [
          renderDocCommentNode(comment.summarySection)
        ])
      case DocNodeKind.Paragraph:
        const paragraph = node as DocParagraph;
        return h('p', {}, paragraph.nodes.map(renderDocCommentNode));
      case DocNodeKind.Section:
        const section = node as DocSection;
        return h('section', {}, section.nodes.map(renderDocCommentNode))
      case DocNodeKind.PlainText:
        const plainText = node as DocPlainText;
        return plainText.text
      case DocNodeKind.SoftBreak:
        return h('br');
      default:
        return `Unsupported (${node.kind})`
    }
  }

  const parser = new TSDocParser();

  return {
    renderCallableSignature,
    renderDeclaration,
    renderDocCommentNode,
    renderType,
    renderTypeParameters,
    renderTypeParametersDeclaration,
    parser
  }
}


type EchoDeclarationRendererProps = { module: EchoModule, declaration: EchoDeclaration, headingElement?: string };
const EchoDeclarationRenderer: Component<EchoDeclarationRendererProps> = ({ module, declaration, headingElement = 'h3', children }) => {
  const renderer = useMemo(() => createTypeRenderer(module), [module]);

  const syntax = useMemo(() => {
    const syntax = createHLJSBuilder();
    
    return renderer.renderDeclaration(syntax, declaration);
  }, [renderer, declaration]);

  const comment = useMemo(() => {
    switch (declaration.type) {
      case 'function':
      case 'class':
      case 'interface':
      case 'namespace':
      case 'type':
      case 'variable':
        if (!declaration.doc)
          return null;
        return renderer.parser.parseString(declaration.doc).docComment;
      default:
        return null;
    }
  }, [renderer, declaration])

  return [
    h(headingElement, { id: `echo:${module.identifiers[declaration.id]}` }, [module.identifiers[declaration.id] || '?', ` (${declaration.id})`]),
    children,
    h(CodeBox, { lines: syntax.output() }),
    comment && renderer.renderDocCommentNode(comment),

    declaration.type === "namespace" && [
      declaration.exports.map(declaration => h(EchoDeclarationRenderer, { module, declaration, headingElement }))
    ]

  ];
}
const EchoExternalDeclarationRenderer: Component<EchoDeclarationRendererProps> = ({ module, declaration, headingElement = 'h3', children }) => {
  if (declaration.type !== 'external')
    return null;

  return [
    h(headingElement, { id: `echo:${module.identifiers[declaration.id]}` }, [declaration.identifier]),
    children,
  ];
}

export type EchoPlugin = typeof EchoPlugin;
export const EchoPlugin = createPlugin('echo', (core) => {
  const modules = new Map<string, EchoModule>()

  const EchoMDXRenderer: MDXComponent = ({ attributes, children }) => {
    const moduleId = attributes['module'] as string;
    const declarationId = attributes['name'] as string;

    const module = modules.get(moduleId);
    if (!module)
      return h(InlineErrorBox, {}, `No module of id "${moduleId}" found`)

    const declaration = module.exports.find(d => d.identifier === declarationId)
    if (!declaration)
      return h(InlineErrorBox, {}, `No declaration of id "${declarationId}" found`)

    return h(EchoDeclarationRenderer, { declaration, module }, children);
  }

  const EchoModuleMDXRenderer: MDXComponent = ({ attributes, children }) => {
    const moduleId = attributes['module'] as string;
    const module = modules.get(moduleId);
    if (!module)
      return h(InlineErrorBox, {}, `No module of id "${moduleId}" found`)
    
    const headingText = attributes['heading'] as string || moduleId;
    const headingElement = attributes['headingElement'] as string || 'h2';

    const declarationHeadingElement = attributes['declarationHeadingElement'] as string;

    const externalsByModule = new Map(module.references.map(ref => [ref.filename, [] as EchoDeclaration.External[]]))
    for (const ref of module.references)
      (externalsByModule.get(ref.filename) as EchoDeclaration.External[]).push(ref)
      
    return [
      h(headingElement, { id: `echo:${moduleId}` }, headingText),

      h('table', {}, [
        Object.entries(module.identifiers).map(([name, typeID]) => {
          return h('tr', {}, [
            h('td', {}, name),
            h('td', {}, typeID),
          ])
        })
      ]),

      children,
      module.exports
        .map(declaration => h(EchoDeclarationRenderer, { module, declaration, headingElement: declarationHeadingElement })),
      h(headingElement, {}, `${headingText} Externals`),
      [...externalsByModule.entries()]
        .map(([filename, declarations]) => [
          h('h2', {}, filename),
          declarations.map(declaration => h(EchoExternalDeclarationRenderer, { module, declaration, headingElement: declarationHeadingElement }))
        ])
    ]
  }

  core.component.add('Echo', EchoMDXRenderer)
  core.component.add('EchoModule', EchoModuleMDXRenderer)

  return {
    modules,
  }
});