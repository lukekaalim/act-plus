import { Component, h, useMemo } from '@lukekaalim/act';
import { renderMarkdown } from '@lukekaalim/act-doc';
import { parser } from '@lukekaalim/act-markdown';
import { Comment, CommentDisplayPart, DeclarationReflection, ReflectionKind } from 'typedoc/browser';
import { useDocApp } from '@lukekaalim/act-doc/application';
import { TypeDocPlugin } from './plugin';
import { DeclarationPreviewRenderer } from './DeclarationPreview';

export type DeclarationReflectionRendererProps = {
  declaration?: DeclarationReflection,

  declarations?: DeclarationReflection[],

  headingLevel?: number
}

export const DeclarationReflectionRenderer: Component<DeclarationReflectionRendererProps> = ({
  declaration,
  declarations,
  headingLevel = 3
}) => {
  const doc = useDocApp([TypeDocPlugin]);

  if (declarations) {

  }
  if (declaration) {
    const id = declaration.project.name + '.' + declaration.getFullName();
  
    return [
      h(`h${headingLevel}`, { id, style: { 'margin-bottom': 0 } },
        h('a', { href: `#${id}` },
          declaration.name)),
      h('i', {}, ReflectionKind[declaration.kind]),
      h(DeclarationPreviewRenderer, { declaration }),
      !!declaration.comment && h(CommentRenderer, { comment: declaration.comment })
    ];
  }

  throw new Error();
};

type CommentRendererProps = {
  comment: Comment,
}

const CommentRenderer = ({ comment }: CommentRendererProps) => {
  return [
    renderMarkdown(parser.parse(processCommentParts(comment.summary))),
    comment.blockTags.map(block =>
      h('p', { style: { margin: '8px 0' }}, [
        h('strong', {}, block.tag), ' ',
        renderMarkdown(parser.parse(processCommentParts(block.content)))
      ])),
  ]
}

const processCommentParts = (parts: CommentDisplayPart[]) => {
  return parts.map(part => {
    switch (part.kind) {
      case 'code':
      case 'text':
        return part.text;
      case 'inline-tag':
        return `<InlineTag>${part.text}</InlineTag>`;
      case 'relative-link':
        return `<RelativeLink>${part.text}</RelativeLink>`;
    }
  }).join("")
}