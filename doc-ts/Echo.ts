import { CodeBox, CoreAPI, createHLJSBuilder, createPlugin, HLJSBuilder, InlineErrorBox, MDXComponent } from "@lukekaalim/grimoire";
import { EchoDeclaration, EchoModule, EchoType } from "@lukekaalim/echo";
import { Component, h, Node, useMemo } from "@lukekaalim/act";

import { DocNode, TSDocParser, DocNodeKind, DocComment, DocSection, DocParagraph, DocPlainText } from '@microsoft/tsdoc';

import "./simpleStyles.css";
import { EchoExternalReference } from "@lukekaalim/echo/types/external";

export const createTypeRenderer = (module: EchoModule, namespace?: string) => {
  const visitedTypes = new Set<EchoType.ID>();

  const renderDelimitedList = <T>(elements: T[], renderElement: (element: T) => void, renderDelimiter: () => void) => {
    for (let i = 0; i < elements.length; i++) {
      renderElement(elements[i]);
      if (i !== elements.length - 1)
        renderDelimiter()
    }
  }


  const renderTypeParameters = (syntax: HLJSBuilder, typeParameters: EchoType.Any[]) => {
    if (typeParameters.length === 0)
      return syntax;

    syntax.text('<')
    renderDelimitedList(typeParameters, parameter => renderType(syntax, parameter), () => syntax.text(', '))
    syntax.text('>')
    return syntax;
  }
  const renderTypeParametersDeclaration = (syntax: HLJSBuilder, parameters: EchoDeclaration.Generic[]) => {
    if (parameters.length === 0)
      return syntax;

    syntax.text('<')
    renderDelimitedList(parameters, parameter => {
      syntax.title(parameter.identifier);
      if (parameter.extends) {
        syntax.type(' extends ');
        renderType(syntax, module.types[parameter.extends])
      }
      if (parameter.default) {
        syntax.type(' = ');
        renderType(syntax, module.types[parameter.default])
      }
    }, () => syntax.text(', '))
    syntax.text('>')
    return syntax;
  }

  const renderType = (syntax: HLJSBuilder, echoType: EchoType.Any): HLJSBuilder => {
    if (!echoType)
      debugger;
    if (visitedTypes.has(echoType.id)) {
      return syntax.comment(`<Recursive id="${echoType.id}" />`);
    }

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
          renderType(syntax, module.types[echoType.branches[0]])
          syntax.text(' & ')
          renderType(syntax, module.types[echoType.branches[1]])
          return syntax;
        } else {
          syntax.indent(1)
          for (const branch of echoType.branches) {
            syntax.newLine().text('& ')
            renderType(syntax, module.types[branch])
          }
          syntax.newLine(-1)
          return syntax;
        }
      case 'union':
        if (echoType.branches.length < 3) {
          renderType(syntax, module.types[echoType.branches[0]])
          syntax.text(' | ')
          renderType(syntax, module.types[echoType.branches[1]])
          return syntax;
        } else {
          syntax.indent(1)
          for (const branch of echoType.branches) {
            syntax.newLine().text('| ')
            renderType(syntax, module.types[branch])
          }
          syntax.newLine(-1)
          return syntax;
        }
      case 'array':
        return renderType(syntax, module.types[echoType.element])
          .text('[]')
      case 'indexed-access':
        renderType(syntax, module.types[echoType.target])
        syntax.text('[')
        renderType(syntax, module.types[echoType.accessor]);
        syntax.text(']')
        return syntax;
      case 'reference':
        if (echoType.target.type === 'declaration') {
          const declaration = module.declarations[echoType.target.id]
          if (!declaration)
            syntax.titleClass(`<ReferenceNotFound id="${echoType.target.id}" />`)
          else
            syntax.titleClass(declaration.identifier)
        } else if (echoType.target.type === 'reference') {
          const reference = module.references[echoType.target.id]
          if (!reference)
            syntax.comment(`<ReferenceNotFound id="${echoType.target.id}" />`)
          else
            syntax.titleClass(reference.identifier);
        }
        renderTypeParameters(syntax, echoType.typeParameters.map(id => module.types[id]));
        return syntax;
      case 'callable':
        visitedTypes.add(echoType.id);
        renderCallableSignature(syntax, echoType, false);
        return syntax;
      default:
        return syntax.comment(`<Unsupported(Renderer) type "${echoType.type}" />`)
      case 'object': {
        visitedTypes.add(echoType.id);
        syntax.text('{').newLine(1);
        renderDelimitedList(Object.entries(echoType.properties), ([key, propertyId]) => {
          const property = module.types[propertyId];
          if (property.type === 'callable') {
            syntax.titleClass(key);
            renderCallableSignature(syntax, property, true);
          } else {
            syntax.text(key).text(': ');
            renderType(syntax, property);
          }
        }, () => syntax.text(', ').newLine())
        syntax.newLine(-1).text('}')
        return syntax;
      }
    }
  }

  const renderCallableSignature = (syntax: HLJSBuilder, callable: EchoType.Callable, isMethod: boolean) => {
    renderTypeParametersDeclaration(syntax, callable.typeParameters.map(id => module.declarations[id]).filter(d => d.type === 'generic'));
    syntax.text('(');
    syntax.indent(1).newLine()
    renderDelimitedList(callable.parameters, param => {
      syntax.params(param.name)
      if (param.optional) {
        syntax.text('?: ')
      } else {
        syntax.text(': ')
      }
      renderType(syntax, module.types[param.type]);
    }, () => syntax.text(', ').newLine())
    syntax.indent(-1).newLine()
    if (isMethod)
      syntax.text('): ');
    else
      syntax.text(') => ');
    renderType(syntax, module.types[callable.returns])
  }

  const renderDeclaration = (syntax: HLJSBuilder, echoDeclaration: EchoDeclaration.Any) => {
    const identifier = [namespace, echoDeclaration.identifier].filter(Boolean).join('.');
    switch (echoDeclaration.type) {
      case 'type':
        syntax
          .keyword('type ')
          .title(identifier);
        //renderTypeParametersDeclaration(syntax, echoDeclaration.parameters);
        syntax.text(' = ');

        renderType(syntax, module.types[echoDeclaration.declares]);
        return syntax;
      case 'namespace':
        syntax.keyword("namespace ").titleClass(identifier);
        return syntax;
      case 'function':
        syntax.keyword('function ').titleClass(identifier)
        renderCallableSignature(syntax, module.types[echoDeclaration.signature] as EchoType.Callable, true);
        return syntax;
      case 'unsupported':
        return syntax.comment(`<Unsupported(Reflector) declaration "${echoDeclaration.message}" />`)
      case 'variable':
        syntax.keyword('let ')
          .title(identifier);
        if (echoDeclaration.typeof) {
          syntax.text(': ')
          renderType(syntax, module.types[echoDeclaration.typeof]);
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


export type EchoDeclarationRendererProps = {
  module: EchoModule,
  declaration: EchoDeclaration,
  namespace?: string,
  headingElement?: string
};
export const EchoDeclarationRenderer: Component<EchoDeclarationRendererProps> = ({
  module,
  declaration,
  namespace,
  headingElement = 'h3',
  children
}) => {
  const renderer = useMemo(() => createTypeRenderer(module, namespace), [module]);

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
        return [
          declaration.doc.map(d => d.text),
          h('pre', {}, JSON.stringify(declaration.doc))
        ]
      default:
        return null;
    }
  }, [renderer, declaration])

  return [
    h(headingElement, { id: `echo:${declaration.identifier}` }, [declaration.identifier || '?', ` (${declaration.id})`]),
    children,
    h(CodeBox, { lines: syntax.output() }),
    comment,// && renderer.renderDocCommentNode(comment),

    declaration.type === "namespace" && [
      declaration.exports.map(namespaceExport =>
        h(EchoDeclarationRenderer, {
          module,
          namespace: [namespace, declaration.identifier].filter(Boolean).join('.'),
          declaration: module.declarations[namespaceExport],
          headingElement: 'h4'
        }))
    ]
  ];
}
export type EchoExternalDeclarationRendererProps = {
  module: EchoModule,
  declaration: EchoExternalReference,
  headingElement?: string
};
export const EchoExternalDeclarationRenderer: Component<EchoExternalDeclarationRendererProps> = ({
  module, declaration,
  headingElement = 'h4',
  children
}) => {

  return [
    h(headingElement, { id: `echo:${declaration.module}:${declaration.identifier}` }, [declaration.identifier]),
    children,
  ];
}

export type EchoPlugin = typeof EchoPlugin;
export const EchoPlugin = createPlugin('echo', (core) => {
  const modules = new Map<string, EchoModule>()

  const EchoMDXRenderer: MDXComponent = ({ attributes, children }) => {
    const moduleId = attributes['module'] as string;
    const declarationId = attributes['name'] as string;
    return null;

    const module = modules.get(moduleId);
    if (!module)
      return h(InlineErrorBox, {}, `No module of id "${moduleId}" found`)

    const declaration = module.declarations[declarationId]
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

    const externalsByModule = new Map(Object.values(module.references).map(ref => [ref.module, [] as EchoExternalReference[]]))
    for (const ref of Object.values(module.references))
      (externalsByModule.get(ref.module) as EchoExternalReference[]).push(ref)

      
    return [
      h(headingElement, { id: `echo:${moduleId}` }, headingText),

      h('table', {}, [
        Object.values(module.exports).map(ex => module.declarations[ex]).map((declaration) => {
          return h('tr', {}, [
            h('td', {}, declaration.identifier),
            h('td', {}, declaration.id),
          ])
        })
      ]),

      children,
      module.exports.map(id => module.declarations[id])
        .map(declaration => h(EchoDeclarationRenderer, { module, declaration, headingElement: declarationHeadingElement })),
      h(headingElement, { id: 'Externals' }, `${headingText} Externals`),
      [...externalsByModule.entries()]
        .map(([filename, declarations]) => [
          h('h3', { id: `echo:${filename}`}, filename),
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