import { Component, useMemo } from "@lukekaalim/act"
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