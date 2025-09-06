import { Component, h } from '@lukekaalim/act';
import classes from './Article.module.css';
import { TagRow } from '../tag/TagRow';
import { DocumentMetadata, Tag } from '../../lib';
import { TagStore } from '../../stores';
import { useStore } from '../../contexts/stores';

// Kinda weird hack
import mkClasses from './MarkdownArticle.module.css';

export const articleClassNames = {
  heading: mkClasses.heading,
  code: mkClasses.mkCode,
  inlineCode: mkClasses.inlineCode,
  paragraph: mkClasses.paragraph
}
const articleElementTypes = {
  code: 'code',
  inlineCode: 'code',
  paragraph: 'p',
} as Record<keyof typeof articleClassNames, string>
export const article = Object.fromEntries(Object.keys(articleClassNames).map(key => {
  return [key, ({ children }) => h(articleElementTypes[key], { className: articleClassNames[key] }, children)]
})) as Record<keyof typeof articleClassNames, Component>;


export type ArticleProps = {
  meta?: DocumentMetadata,
  hiddenTagKeys?: string[],
};

export const Article: Component<ArticleProps> = ({ children, meta, hiddenTagKeys }) => {
  const { tags } = useStore();
  return [
    h('article', { className: classes.container }, [
      !!meta && h(ArticleMetadata, { meta, tagStore: tags, hiddenTagKeys }),
      children,
    ])
  ]
};


export type ArticleMetadataProps = {
  tagStore: TagStore,
  meta: DocumentMetadata,

  hiddenTagKeys?: string[],
}

export const ArticleMetadata: Component<ArticleMetadataProps> = ({ meta: { title, published, author, description, tagKeys = [] }, tagStore, hiddenTagKeys = [] }) =>  {
  const tags = tagKeys
    .map(tagStore.get)
    .filter((x): x is Tag => !!x)
    .filter(tag => !hiddenTagKeys.includes(tag.key))

  return [
    !!title && h('h1', { className: classes.title }, title),
    !!(published || author) && h('div', { className: classes.details }, [
      !!published && h('time', { className: classes.date, datetime: published }, published.toString()),
      !!author && h('a', { rel: 'author', className: classes.author }, author),
    ]),
    tags.length > 0 && h(TagRow, { tags }),
    !!description && h('details', {}, [h('summary', {}, 'Description'), h('blockquote', { className: classes.description }, description)]),
  ];
}