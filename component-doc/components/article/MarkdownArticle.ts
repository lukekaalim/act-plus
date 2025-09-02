import { Component, h, useEffect, useMemo, useState } from "@lukekaalim/act";
//import { DynamicModule } from "../../lib/Module";
import { createMdastRenderer, useRemarkParser } from "@lukekaalim/act-markdown";
import { srcFile, TypeNodeDoc } from "@lukekaalim/act-doc-ts";

import { SyntaxKind } from 'typescript';

import * as YAML from 'yaml';
import { Article, ArticleMetadata } from "./Article";

import classes from './MarkdownArticle.module.css';
import { useStore } from "../../contexts/stores";
import { CodeBox } from "./CodeBox";
import { useMdxContext } from "./MDXContext";

export const renderMarkdown = createMdastRenderer({
  classNames: {
    heading: classes.heading,
    code: classes.mkCode,
    inlineCode: classes.inlineCode,
    paragraph: classes.paragraph
  },
  components: {
  }
});

export type MarkdownArticleProps = {
  content: string | Promise<DynamicModule<string>>
};

export const MarkdownArticle: Component<MarkdownArticleProps> = ({ content, children }) => {
  if (typeof content !== 'string')
    return h(DynamicMarkdownArticle, { module: content }, children);

  return h(StaticMarkdownArticle, { markdown: content }, children);
};

type DynamicMarkdownArticleProps = {
  module: Promise<DynamicModule<string>>
};


const DynamicMarkdownArticle: Component<DynamicMarkdownArticleProps> = ({ module }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    module.then(({ default: content }) => setContent(content));
  }, []);

  return h(StaticMarkdownArticle, { markdown: content });
}

type StaticMarkdownArticleProps = {
  markdown: string
};

const StaticMarkdownArticle: Component<StaticMarkdownArticleProps> = ({ markdown, children }) => {
  const root = useRemarkParser(markdown);

  const mdx = useMdxContext()

  const renderer = useMemo(() => createMdastRenderer({
    classNames: {
      heading: classes.heading,
      code: classes.mkCode,
      inlineCode: classes.inlineCode,
      paragraph: classes.paragraph
    },
    components: Object.fromEntries(mdx.globalComponentMap.entries())
  }), [mdx]);

  const nodes = useMemo(() => renderer(root), [markdown, renderer]);

  const { tags } = useStore()

  if (root.children[0] && root.children[0].type === 'yaml') {
    const child = root.children[0];
    const frontmatter = YAML.parse(child.value);
    
    return h(Article, {}, [
      h(ArticleMetadata, {
        hiddenTagKeys: [],
        tagStore: tags,
        meta: {
          title: frontmatter.title,
          published: frontmatter.date,
          author: frontmatter.author,
          description: frontmatter.description,
          tagKeys: frontmatter.tags && frontmatter.tags.split(',') || []
        }
      }),
      nodes,
      children,
    ]);
  }

  return h(Article, {}, nodes);
}
