import { Component, h, useMemo } from "@lukekaalim/act";
import { createMdastRenderer, getHeadingId, OverrideComponentProps, useRemarkParser } from "@lukekaalim/act-markdown";

import * as YAML from 'yaml';
import { Article, ArticleMetadata } from "./Article";

import classes from './MarkdownArticle.module.css';
import articleClasses from './Article.module.css';
import { Code, Heading, Root } from "mdast";
import { SyntaxHighlightingCodeBox } from "../code";
import { useDocApp } from "../../application";

export const markdownClasses = {
  heading: classes.heading,
  code: classes.mkCode,
  inlineCode: classes.inlineCode,
  paragraph: classes.paragraph,
  blockquote: articleClasses.blockQuote,
  headingAnchor: classes.headingAnchor
}

export const renderMarkdown = createMdastRenderer({
  classNames: markdownClasses,
  components: {
    InlineTag({ children, attributes }) {
      return h('strong', {}, children);
    },
    RelativeLink({ children }) {
      return h('strong', {}, children);
    }
  }
});

export type MarkdownArticleProps = {
  content: string
};

/**
 * Given some markdown text as a string, convert it into a markdown article.
 */
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

  const app = useDocApp([]);

  const renderer = useMemo(() => createMdastRenderer({
    classNames: {
      heading: classes.heading,
      code: classes.mkCode,
      inlineCode: classes.inlineCode,
      paragraph: classes.paragraph,
      blockquote: articleClasses.blockQuote,
      image: articleClasses.image,
    },
    components: Object.fromEntries([...app.component.components.map(c => [c.name, c.component])]),
    overrides: {
      heading: ({ node, renderer, className }) => {
        const headingNode = node as Heading;
        const id = getHeadingId(headingNode);
        const url = new URL(document.location.href);
        url.hash = id;
        return h(`h${headingNode.depth}`, { className, id }, [
          h('a', { href: url.href, className: classes.headingAnchor }, [
            ''
          ]),
          ' ',
          headingNode.children.map(renderer)]);
      },
      code: ({ node }: OverrideComponentProps) => {
        const codeNode = node as Code;
        return h(SyntaxHighlightingCodeBox, {
          language: codeNode.lang || undefined,
          code: codeNode.value.trim()
        });
      }
    }
  }), []);

  const nodes = useMemo(() => renderer(finalRoot), [markdown, renderer]);

  if (finalRoot.children[0] && finalRoot.children[0].type === 'yaml') {
    const child = finalRoot.children[0];
    const frontmatter = YAML.parse(child.value);
    
    return h(Article, {}, [
      h(ArticleMetadata, {
        hiddenTagKeys: [],
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
