import { Component, h, Node } from "@lukekaalim/act";
import { AnalysisFragment } from "./analysis";
import * as tsdoc from "@microsoft/tsdoc";
import { createSyntaxRenderer } from "./syntax";
import { article } from "@lukekaalim/act-doc/components/article/Article";
import { SyntaxHighlightingCodeBox } from "@lukekaalim/act-doc";
import { createMdastRenderer, InlineMarkdown, Markdown } from "@lukekaalim/act-markdown";

import classes from './FragmentRenderer.module.css';
import ts from "typescript";

export type FragmentRendererProps = {
  fragment: AnalysisFragment,
}

/**
 * A FragmentRenderer creates a "canonical" location on a page
 * where a fragment is described. It is assigned a unique HTML Id
 * attribute for linking purposes
 * @param fragment 
 * @returns 
 */
export const getFragmentHtmlId = (fragment: AnalysisFragment) => {
  return `type:${fragment.identifier}`
}

const getFragmentLink = (fragment: AnalysisFragment) => {
  const href = '#' + getFragmentHtmlId(fragment);

  const nodes = [fragment.identifier];

  switch (fragment.syntax.kind) {
    case ts.SyntaxKind.MethodSignature: {
      nodes.push('(')
      for (let i = 0; i < fragment.syntax.parameters.length; i++) {
        nodes.push((fragment.syntax.parameters[i].name as ts.Identifier).text)
        if (i !== fragment.syntax.parameters.length - 1)
          nodes.push(', ')
      }
      nodes.push('): ');
      nodes.push('<RETURN TYPE>')
    }
  }

  return h('a', { href, className: classes.identifier }, nodes);
}

export const FragmentRenderer: Component<FragmentRendererProps> = ({ fragment }) => {
  return [
    h('div', {}, [
      h('dt', { id: getFragmentHtmlId(fragment) },
        h('strong', {}, getFragmentLink(fragment))),

      h('dd', {}, renderer.renderNode(fragment.doc)),
    ]),
    fragment.children.map(fragment => h(FragmentRenderer, { fragment }))
  ]
};

export const createTsDocRenderer = () => {
  const renderComment = (node: tsdoc.DocComment) => {
    return h('div', {}, [
      renderNode(node.summarySection),
      node.params.blocks.map(renderNode),
      node.customBlocks.map(renderNode),
    ])
  }

  const renderNode = (node: tsdoc.DocNode): Node => {
    if (node instanceof tsdoc.DocComment)
      return renderComment(node);
    if (node instanceof tsdoc.DocSection) {
      return h('section', {}, node.nodes.map(renderNode))
    }
    if (node instanceof tsdoc.DocParamBlock) {
      return h('div', { style: { background: '#ebcebeff', margin: '0', 'border-radius': '4px' } }, [
        h('h5', { style: { margin: 0 } }, [node.blockTag.tagName, ' ', node.parameterName]),
        renderNode(node.content)
      ]);
    }
    
    if (node instanceof tsdoc.DocParagraph)
      return h('p', { style: { margin: '14px 0' } }, node.nodes.map(renderNode))
    if (node instanceof tsdoc.DocPlainText)
      return h(InlineMarkdown, { text: node.text.trim() })
    if (node instanceof tsdoc.DocSoftBreak)
      return `\n`;

    if (node instanceof tsdoc.DocCodeSpan)
      return [' ', h(article.inlineCode, {}, node.code.trim()), ' ']
    if (node instanceof tsdoc.DocFencedCode)
      return h(SyntaxHighlightingCodeBox, { code: node.code.trim(), language: node.language })

    if (node instanceof tsdoc.DocBlock)
      return h('div', { style: { background: '#edd3caff', margin: '0', padding: '8px', 'border-radius': '4px' } }, [
        h('h5', { style: { margin: 0 } }, node.blockTag.tagName),
        renderNode(node.content)
      ]);
      
    return `Unknown node: "${node.kind}"`;
  };

  return { renderNode };
};

const renderer = createTsDocRenderer();