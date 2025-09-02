import { Component, h } from "@lukekaalim/act";
import { AnalysisFragment } from "./analysis";
import { TypeNodeDoc } from "./TypeNodeDoc";
import { Node, SourceFile } from "typescript";
import { defaultMdxComponentMap } from "@lukekaalim/act-doc/components/article/MDXContext";
import { CodeBox } from "@lukekaalim/act-doc";
import { createSyntaxRenderer, flattenSyntaxRendererOutput } from "./syntax";

export type DocTsProps = {
  fragment: AnalysisFragment,
};

const renderer = createSyntaxRenderer();

export const DocTs: Component<DocTsProps> = ({ fragment }) => {
  return [
    h(CodeBox, { lines: flattenSyntaxRendererOutput(renderer.renderNode(fragment.syntax)) }),
    //h(TypeNodeDoc, { doc: null, type: node }),
  ]
};

defaultMdxComponentMap.set('DocTs', () => {
  return null;
})