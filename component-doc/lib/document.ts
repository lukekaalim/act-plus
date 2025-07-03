import { createId, Node } from "@lukekaalim/act"
import { Root } from "mdast"
import { createMdastRenderer, parser } from "@lukekaalim/act-markdown"
import * as YAML from 'yaml';
import { renderMarkdown } from "../components";

export type Document = {
  id: string,
  content: Node,
  meta: DocumentMetadata,
}

/**
 * All kinds of optional data to describe a document.
 */
export type DocumentMetadata = {
  title?: string,
  author?: string,
  description?: string,
  published?: Date,
  tagKeys?: string[],
}


export const Document = {
  fromMarkdownString(content: string): Document {
    return Document.fromMarkdown(parser.parse(content))
  },
  fromMarkdown(root: Root): Document {

    const [firstNode] = root.children;

    if (firstNode.type !== 'yaml') {
      const id = createId().toString();
      return { id, content: renderMarkdown(root), meta: {} };
    }

    const { id, meta } = DocumentMetadata.parseFrontmatter(YAML.parse(firstNode.value));

    return {
      id: id || createId().toString(),
      content: renderMarkdown(root),
      meta
    }
  },
}

export const DocumentMetadata = {
  parseFrontmatter(frontmatter: Record<string, string>): { meta: DocumentMetadata, id?: string } {   
    const rawId = frontmatter['id'];

    const rawTitle = frontmatter['title'];
    const rawTagKeys = frontmatter['tags'];
    const rawAuthor = frontmatter['author'];
    const rawPublished = frontmatter['published'];
    const rawDescription = frontmatter['description'];

    const id = typeof rawId === 'string' && rawId || undefined;
    const title = typeof rawTitle === 'string' && rawTitle || undefined;
    const tagKeys = typeof rawTagKeys === 'string' && rawTagKeys.split(',').map(tag => tag.trim().toLocaleLowerCase()) || undefined;
    const author = typeof rawAuthor === 'string' && rawAuthor || undefined;
    const description = typeof rawDescription === 'string' && rawDescription || undefined;
    const published = typeof rawPublished === 'string' && new Date(rawPublished) || undefined;

    return {
      meta: { title, tagKeys, author, published, description },
      id,
    };
  }
}