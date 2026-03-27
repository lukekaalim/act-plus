import { Component, h, Node, useMemo } from "@lukekaalim/act";
import { createLowlight, common } from "lowlight";
import { Nodes } from 'hast';
import { CodeBox } from "./CodeBox";

import { useDocThemeContext } from "../../lib";

export type SyntaxHighlightingCodeBoxProps = {
  language?: string,
  code: string,
  theme?: string,
}

const lowlight = createLowlight(common);

/**
 * Convert LowLight nodes into {@link @lukekaalim/act} Nodes
 */
export const renderLowlightNodes = (node: Nodes): Node => {
  switch (node.type) {
    case 'element':
      const className = (node.properties.className as string[]).join(' ');

      return h(node.tagName, { className },
        node.children.map(c => renderLowlightNodes(c)))
    case 'text':
      return node.value;
    case 'root':
      return node.children.map(c => renderLowlightNodes(c));
    default:
      return null;
  }
}

export const SyntaxHighlightingCodeBox: Component<SyntaxHighlightingCodeBoxProps> = ({
  language,
  code,
}) => {

  const theme = useDocThemeContext()

  const ast = useMemo(() => {
    if (language)
      return lowlight.highlight(language, code);
    return lowlight.highlightAuto(code);
  }, [language, code]);

  return h(CodeBox, { lines: [renderLowlightNodes(ast)] });
};