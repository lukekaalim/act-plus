import { Component, h, useEffect, useMemo, useState } from "@lukekaalim/act";
//import { DynamicModule } from "../../lib/Module";
import { createMdastRenderer, useRemarkParser } from "@lukekaalim/act-markdown";
import { srcFile, TypeNodeDoc } from "@lukekaalim/act-doc-ts";

import * as YAML from 'yaml';
import { Article, ArticleMetadata } from "./Article";

import classes from './MarkdownArticle.module.css';
import { useStore } from "../../contexts/stores";
import { findIdentifiersInFile } from "@lukekaalim/act-doc-ts/registry";

const ids = findIdentifiersInFile(srcFile)

export const renderMarkdown = createMdastRenderer({
  classNames: {
    heading: classes.heading,
    code: classes.mkCode,
    inlineCode: classes.inlineCode,
    paragraph: classes.paragraph
  },
  components: {
    CoolComponent() {
      return h('button', { onClick: () => alert('Hell yea') }, `I'm cool!`)
    },
    PropDoc(props) {
      const componentName = props.attributes.component as string;
      const component = ids.functions.get(componentName);
      if (!component)
        return `Cant find component: "${componentName}"`
      return h(TypeNodeDoc, { type: component, doc: null });
    }
  }
});

export type MarkdownArticleProps = {
  content: string | Promise<DynamicModule<string>>
};

export const MarkdownArticle: Component<MarkdownArticleProps> = ({ content }) => {
  if (typeof content !== 'string')
    return h(DynamicMarkdownArticle, { module: content });

  return h(StaticMarkdownArticle, { markdown: content });
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

const StaticMarkdownArticle: Component<StaticMarkdownArticleProps> = ({ markdown }) => {
  const root = useRemarkParser(markdown);

  const nodes = useMemo(() => renderMarkdown(root), [markdown]);

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
    ]);
  }

  return h(Article, {}, nodes);
}
