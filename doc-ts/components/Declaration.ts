import { Component, h, Node, useMemo } from "@lukekaalim/act"
import { EchoDeclaration, EchoModule } from "@lukekaalim/echo"
import { CodeBox, createHLJSBuilder, useDocApp } from "@lukekaalim/grimoire";
import * as tsdoc from '@microsoft/tsdoc';

import { EchoPlugin } from "../Echo";
import { createTypeRenderer } from "../utils/TypeRenderer";
import { EchoModuleContext } from "../utils/ModuleContext";
import { renderDocCommentNode } from "../comment";

export type DeclarationProps = {
  declaration: EchoDeclaration,
  context: EchoModuleContext,

  header?: Node,
  noId?: boolean,
}

/**
 * Render a EchoDeclaration
 * 
 * @param param0 DeclarationProps 
 * @returns 
 */
export const Declaration: Component<DeclarationProps> = ({
  declaration,
  context,
  header,
  noId = false,
  children
}) => {
  const docApp = useDocApp([EchoPlugin]);
  const renderer = useMemo(() => createTypeRenderer(context, docApp), [context.module]);

  const syntax = useMemo(() => {
    const syntax = createHLJSBuilder();
    
    return renderer.renderDeclaration(syntax, declaration);
  }, [renderer, declaration]);

  const comment = useMemo(() => {
    const comment = context.commentByDeclaration.get(declaration.id);
    if (!comment)
      return null;
    
    const parser = new tsdoc.TSDocParser();
    return parser.parseString(comment.comment).docComment;
  }, [renderer, declaration]);

  const namespaces = context.namespacesByDeclarations.get(declaration.id) || [];

  const fullyQualifiedName = context.fullyQualifiedName.get(declaration.id) as string;

  return [
    header || h('h3', { id: !noId && `echo:${context.module.name}:${fullyQualifiedName}` }, [
      namespaces.map(n => {
        const qualifiedNamespace = context.fullyQualifiedName.get(n.id);
        return [
          h('a', { href: `#echo:${context.module.name}:${qualifiedNamespace}` }, n.identifier),
          '.'
        ]
      }),
      h('a', { href: `#echo:${context.module.name}:${fullyQualifiedName}` }, declaration.identifier)
    ]),

    children,
    h(CodeBox, { lines: syntax.output() }),
    comment && renderDocCommentNode(comment),

    declaration.type === "namespace" && [
      declaration.exports.map(namespaceExport =>
        h(Declaration, {
          noId,
          context,
          declaration: context.module.declarations[namespaceExport],
        }))
    ]
  ];
}