import { useMemo } from "@lukekaalim/act";
import { useDocApp } from "../application";
import { createMdastRenderer, MarkdownComponent, MdastRenderer } from "@lukekaalim/act-markdown";

/**
 * Create an MDAST renderer that hooks into the DocApp context
 * to load the extra defined components there.
 * @returns an MDAST renderer - a function that accepts MDAST nodes and returns ACT nodes
 */
export const useGrimoireMdastRenderer = (): MdastRenderer => {
  const doc = useDocApp([]);

  const render = useMemo(() => {
    return createMdastRenderer({
      components: Object.fromEntries(doc.component.components.map(entry =>
        [entry.name, entry.component as MarkdownComponent])),
      classNames: {},
      overrides: {
        
      }
    })
  }, [doc]);

  return render;
};
