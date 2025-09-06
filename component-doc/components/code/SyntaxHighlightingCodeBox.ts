import { Component, h, Node, useMemo } from "@lukekaalim/act";
import { createLowlight, common } from "lowlight";
import { Nodes } from 'hast';
import { CodeBox } from "./CodeBox";

export type SyntaxHighlightingCodeBoxProps = {
  language?: string,
  code: string,
}

const lowlight = createLowlight(common);

const renderLowlightNodes = (node: Nodes): Node => {
  switch (node.type) {
    case 'element':
      return h(node.tagName, { className: (node.properties.className as string[]).join(' ') },
        node.children.map(renderLowlightNodes))
    case 'text':
      return node.value;
    case 'root':
      return node.children.map(renderLowlightNodes);
    default:
      return null;
  }
}

export const SyntaxHighlightingCodeBox: Component<SyntaxHighlightingCodeBoxProps> = ({
  language,
  code,
}) => {
  const ast = useMemo(() => {
    if (language)
      return lowlight.highlight(language, code);
    return lowlight.highlightAuto(code);
  }, [language, code]);

  return h(CodeBox, { lines: [renderLowlightNodes(ast)] });
};