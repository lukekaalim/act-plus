import { Component, h, useMemo } from "@lukekaalim/act";
import { createMdastRenderer, OverrideComponentProps, useRemarkParser } from "@lukekaalim/act-markdown";

import * as YAML from 'yaml';
import { Article, ArticleMetadata } from "./Article";

import classes from './MarkdownArticle.module.css';
import articleClasses from './Article.module.css';
import { useStore } from "../../contexts/stores";
import { useMdxContext } from "./MDXContext";
import { Code } from "mdast";
import { SyntaxHighlightingCodeBox } from "../code";
import { useAppSetup } from "../../plugin/AppSetup";

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
  markdown: string
};

export const StaticMarkdownArticle: Component<StaticMarkdownArticleProps> = ({ markdown, children }) => {
  const root = useRemarkParser(markdown);

  const mdx = useMdxContext()
  const setup = useAppSetup();

  const renderer = useMemo(() => createMdastRenderer({
    classNames: {
      heading: classes.heading,
      code: classes.mkCode,
      inlineCode: classes.inlineCode,
      paragraph: classes.paragraph,
      blockquote: articleClasses.blockQuote,
      image: articleClasses.image,
    },
    components: Object.fromEntries([...mdx.globalComponentMap.entries(), ...setup.MDXComponents]),
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
