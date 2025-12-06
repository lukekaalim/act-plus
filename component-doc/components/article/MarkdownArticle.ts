import { Component, h, useMemo } from "@lukekaalim/act";
import { createMdastRenderer, OverrideComponentProps, useRemarkParser } from "@lukekaalim/act-markdown";

import * as YAML from 'yaml';
import { Article, ArticleMetadata } from "./Article";

import classes from './MarkdownArticle.module.css';
import articleClasses from './Article.module.css';
import { useStore } from "../../contexts/stores";
import { useMdxContext } from "./MDXContext";
import { Code, Root } from "mdast";
import { SyntaxHighlightingCodeBox } from "../code";
import { useAppSetup } from "../../plugin/AppSetup";
import { useDocApp } from "../../application";

export const renderMarkdown = createMdastRenderer({
  classNames: {
    heading: classes.heading,
    code: classes.mkCode,
    inlineCode: classes.inlineCode,
    paragraph: classes.paragraph,
    blockquote: articleClasses.blockQuote
  },
  components: {
  }
});

export type MarkdownArticleProps = {
  content: string
};

export const MarkdownArticle: Component<MarkdownArticleProps> = ({ content, children }) => {
  return h(StaticMarkdownArticle, { markdown: content }, children);
};


type StaticMarkdownArticleProps = {
  markdown?: string,
  root?: Root,
};

export const StaticMarkdownArticle: Component<StaticMarkdownArticleProps> = ({ markdown, root, children }) => {
  const stringRoot = useRemarkParser(markdown || '');
  const finalRoot = root || stringRoot;

  const mdx = useMdxContext()
  const setup = useAppSetup();

  const app = useDocApp();

  const renderer = useMemo(() => createMdastRenderer({
    classNames: {
      heading: classes.heading,
      code: classes.mkCode,
      inlineCode: classes.inlineCode,
      paragraph: classes.paragraph,
      blockquote: articleClasses.blockQuote,
      image: articleClasses.image,
    },
    components: Object.fromEntries([...mdx.globalComponentMap.entries(), ...setup.MDXComponents, ...app.component.components.map(c => [c.name, c.component])]),
    overrides: {
      code: ({ node }: OverrideComponentProps) => {
        const codeNode = node as Code;
        return h(SyntaxHighlightingCodeBox, {
          language: codeNode.lang || undefined,
          code: codeNode.value.trim()
        });
      }
    }
  }), [mdx]);

  const nodes = useMemo(() => renderer(finalRoot), [markdown, renderer]);

  const { tags } = useStore()

  if (finalRoot.children[0] && finalRoot.children[0].type === 'yaml') {
    const child = finalRoot.children[0];
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
