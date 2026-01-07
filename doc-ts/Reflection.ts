import { Component, h, useMemo } from '@lukekaalim/act';
import { parser } from '@lukekaalim/act-markdown';
import { Comment, CommentDisplayPart, DeclarationReflection, ReflectionKind } from 'typedoc/browser';
import { useDocApp, renderMarkdown, useGrimoireMdastRenderer } from '@lukekaalim/grimoire';
import { TypeDocPlugin } from './plugin';
import { DeclarationPreviewRenderer } from './DeclarationPreview';

export type DeclarationReflectionRendererProps = {
  declaration: DeclarationReflection,

  extraDeclarations?: DeclarationReflection[],

  headingLevel?: number
}

/**
 * Render a DeclarationReflection into a HTML section
 * with a heading, type preview, summary and other
 * comment boxes.
 * @param param0 
 * @returns 
 */
export const DeclarationReflectionRenderer: Component<DeclarationReflectionRendererProps> = ({
  declaration,
  extraDeclarations,
  headingLevel = 3
}) => {
  const doc = useDocApp([TypeDocPlugin]);

  const id = declaration.project.name + '.' + declaration.getFullName();

  const comment = getDeclarationComment(declaration);

  return [
    h(`h${headingLevel}`, { id, style: { 'margin-bottom': 0 } },
      h('a', { href: `#${id}` },
        declaration.name)),
    h('i', {}, ReflectionKind[declaration.kind]),
    h(DeclarationPreviewRenderer, { declaration, extraDeclarations }),
    !!comment && h(CommentRenderer, { comment })
  ];
};

const getDeclarationComment = (declaration: DeclarationReflection): null | Comment => {
  if (declaration.comment)
    return declaration.comment;
  if (declaration.signatures) {
    const sig = declaration.signatures.find(s => s.comment);
    if (sig && sig.comment)
      return sig.comment;
  }

  return null;
}

type CommentRendererProps = {
  comment: Comment,
}

const CommentRenderer = ({ comment }: CommentRendererProps) => {
  const renderer = useGrimoireMdastRenderer()

  return [
    renderer(parser.parse(processCommentParts(comment.summary))),
    comment.blockTags.map(block =>
      h('p', { style: { margin: '8px 0' }}, [
        h('strong', {}, block.tag), ' ',
        renderer(parser.parse(processCommentParts(block.content)))
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