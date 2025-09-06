import { Component, useMemo } from "@lukekaalim/act"
import { Parent } from 'mdast';
import { useRemarkParser } from "./useRemark"
import { createMdastRenderer, MarkdownRendererOptions } from "./components";

export type MarkdownProps = {
  text: string,
  options?: MarkdownRendererOptions,
}

export const Markdown: Component<MarkdownProps> = ({ text, options }) => {
  const root = useRemarkParser(text);

  const renderer = useMemo(() => {
    return createMdastRenderer(options)
  }, [options]);
  
  return useMemo(() => {
    return renderer(root);
  }, [renderer, root]);
}

export const InlineMarkdown: Component<MarkdownProps> = ({ text, options }) => {
  const root = useRemarkParser(text);

  const renderer = useMemo(() => {
    return createMdastRenderer(options)
  }, [options]);
  
  return useMemo(() => {
    const parent = root.children[0] as Parent
    return parent.children.map(renderer);
  }, [renderer, root]);
}