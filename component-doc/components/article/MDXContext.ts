import { createContext, useContext } from "@lukekaalim/act";
import { MarkdownComponent } from "@lukekaalim/act-markdown";

export type MDXContextValue = {
  globalComponentMap: Map<string, MarkdownComponent>,
};

export const defaultMdxComponentMap = new Map<string, MarkdownComponent>();

export const mdxContext = createContext<MDXContextValue>({
  globalComponentMap: defaultMdxComponentMap
});

export const useMdxContext = () => {
  return useContext(mdxContext);
}