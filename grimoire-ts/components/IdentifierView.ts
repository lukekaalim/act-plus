import { Component, h, Node, useMemo } from "@lukekaalim/act"
import { EchoReadingContext, Identifier, TypeIdentifier, ValueIdentifier } from "@lukekaalim/echo"
import { CodeBox, createHLJSBuilder, useDocApp } from "@lukekaalim/grimoire";
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
  noId = false,
  children
}) => {
  const docApp = useDocApp([EchoPlugin]);
  const renderer = useMemo(() => createTypeRenderer(context, docApp), [context]);

  const syntax = useMemo(() => {
    const syntax = createHLJSBuilder();
    
    return renderer.renderIdentifier(syntax, identifier);
  }, [renderer, identifier]);

  const comment = useMemo(() => {
    const type = context.getTypeOrThrow(identifier.typeId);
    const commentID = context.commentByTypeID.get(type.id);
    const comment = commentID && context.comments.get(commentID);
    if (!comment)
      return null;
    
    const parser = new tsdoc.TSDocParser();
    return parser.parseString(comment.text).docComment;
  }, [context, identifier]);

  const fullyQualifiedName = context.qualifiedNameByIdentifier.get(identifier.id) as string;

  return [
    header || h('h3', { id: !noId && `echo:${context.echo.moduleName}:${fullyQualifiedName}` }, fullyQualifiedName),

    children,
    h(CodeBox, { lines: syntax.output() }),
    comment && renderDocCommentNode(comment),
  ];
}