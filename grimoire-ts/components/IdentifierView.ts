import { Component, h, Node, useMemo } from "@lukekaalim/act"
import { EchoReadingContext, Identifier, TypeIdentifier, ValueIdentifier } from "@lukekaalim/echo"
import { CodeBox, createHLJSBuilder, Pill, PillList, useDocApp } from "@lukekaalim/grimoire";
import * as tsdoc from '@microsoft/tsdoc';

import { EchoPlugin } from "../Echo";
import { createTypeRenderer } from "../utils/TypeRenderer";
import { renderDocCommentNode } from "../comment";

/**
 * @expand
 */
export type IdentifierViewProps = {
  identifier: ValueIdentifier | TypeIdentifier,
  context: EchoReadingContext,

  extras?: TypeIdentifier[],

  header?: Node,
  noId?: boolean,
}

/**
 * Render a Identifier
 * 
 * @param param0 DeclarationProps 
 * @returns 
 */
export const IdentifierView: Component<IdentifierViewProps> = ({
  identifier,
  context,
  header,
  extras = [],
  noId = false,
  children
}) => {
  const docApp = useDocApp([EchoPlugin]);
  const renderer = useMemo(() => createTypeRenderer(context, docApp), [context]);

  const syntax = useMemo(() => {
    const syntax = createHLJSBuilder();
    
    renderer.renderIdentifier(syntax, identifier);

    for (const extra of extras) {
      syntax.newLine().newLine();
      renderer.renderIdentifier(syntax, extra);
    }

    return syntax;
  }, [renderer, identifier, extras]);

  const comment = useMemo(() => {
    const commentID = context.commentByIdentifier.get(identifier.id);
    const comment = commentID && context.comments.get(commentID);
    if (!comment)
      return null;
    
    const parser = new tsdoc.TSDocParser();
    return parser.parseString(comment.text).docComment;
  }, [context, identifier]);

  const fullyQualifiedName = context.qualifiedNameByIdentifier.get(identifier.id) as string;

  return [
    header || h('h3', { id: !noId && `echo:${context.echo.moduleName}:${fullyQualifiedName}`, style: { 'margin-bottom': 0 } }, fullyQualifiedName),
    comment &&
      h(PillList, { pills: comment.modifierTagSet.nodes.map(node => {
          return h('li', {}, h(Pill, { text: node.tagName }))
        }) }),

    children,
    h('div', { className: 'nord' }, h(CodeBox, { lines: syntax.output() })),
    comment && renderDocCommentNode(comment),
  ];
}