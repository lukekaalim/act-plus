import { Component, h, useMemo } from '@lukekaalim/act';
import { CodeBox, renderMarkdown, StaticMarkdownArticle } from '@lukekaalim/act-doc';
import { Markdown, parser } from '@lukekaalim/act-markdown';
import { Comment, CommentDisplayPart, DeclarationReflection } from 'typedoc';
import { renderTypeSyntax, TypeRenderer } from './TypeRenderer';

export type DeclarationReflectionRendererProps = {
  declarationReflection: DeclarationReflection,
  headingLevel?: number
}

export const DeclarationReflectionRenderer: Component<DeclarationReflectionRendererProps> = ({
  declarationReflection,
  headingLevel = 2
}) => {
  const lines = useMemo(() => declarationReflection.type && renderTypeSyntax(declarationReflection.type), []);
  const id = declarationReflection.project.name + '.' + declarationReflection.getFullName();

  return [
    h(`h${headingLevel}`, { id }, h('a', { href: `#${id}` }, declarationReflection.name)),
    !!lines && h(CodeBox, { lines }),
    !!declarationReflection.comment && h(CommentRenderer, { comment: declarationReflection.comment })
  ];
};

type CommentRendererProps = {
  comment: Comment,
}

const CommentRenderer = ({ comment }: CommentRendererProps) => {
  return [
    h('p', {}, [
      comment.summary.map(part => h(CommentDisplayPartRenderer, { part })),
    ]),
    comment.blockTags.map(block =>
      h('p', { style: { margin: '8px 0' }}, [
        h('strong', {}, block.tag), ' ',
        block.content.map(part => h(CommentDisplayPartRenderer, { part }))
      ])),
  ]
}

type CommentDisplayPartRendererProps = {
  part: CommentDisplayPart
}

const CommentDisplayPartRenderer = ({ part }: CommentDisplayPartRendererProps) => {
  switch (part.kind) {
    case 'code':
      return renderMarkdown(parser.parse(part.text))
    case 'text':
      return renderMarkdown(parser.parse(part.text))
    case 'inline-tag':
      return h('a', {}, [part.tag, part.text]);
    case 'relative-link':
      return h('a', {  }, part.text)
  }
};
