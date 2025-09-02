import { Component, h, Node } from '@lukekaalim/act';
import { common, createLowlight } from 'lowlight';
import { Nodes } from 'hast';

import 'highlight.js/styles/monokai.css'
import classes from './CodeBox.module.css';

/**
 * As defined by:
 * {@link https://highlightjs.readthedocs.io/en/latest/css-classes-reference.html}
 */
export const hljsClassNames = {
  root: 'hljs',
  tag: 'hljs-tag',
  keyword: 'hljs-keyword',
  selectorTag: 'hljs-selector-tag',
  literal: 'hljs-literal',
  number: 'hljs-number',
  name: 'hljs-name',

  code: 'hljs-code',

  attribute: 'hljs-attribute',
  attr: 'hljs-attr',
  symbol: 'hljs-symbol',
  regexp: 'hljs-regexp',
  link: 'hljs-link',

  string: 'hljs-string',
  bullet: 'hljs-bullet',
  subst: 'hljs-subst',
  title: 'hljs-title',
  section: 'hljs-section',
  emphasis: 'hljs-emphasis',
  type: 'hljs-type',
  builtIn: 'hljs-built_in',
  selectorAttr: 'hljs-selector-attr',
  selectorPsudo: 'hljs-selector-pseudo',
  addition: 'hljs-addition',
  templateTag: 'hljs-template-tag',
  templateVariable: 'hljs-template-variable',
  class: 'hljs-class',

  
  comment: 'hljs-comment',
  quote: 'hljs-quote',
  deletion: 'hljs-deletion',
  meta: 'hljs-meta',

  doctag: 'hljs-doctag',
} as const;

export type HLJSClassName = keyof typeof hljsClassNames;

export const hljs = Object.fromEntries(
  Object.keys(hljsClassNames)
    .map((key) => {
      return [key, ({ children }) => h('span', { className: hljsClassNames[key as HLJSClassName] }, children)]
    })
) as Record<HLJSClassName, Component>;

const lowlight = createLowlight(common)

const renderLowlight = (element: Nodes): Node => {
  switch (element.type) {
    case 'root':
      return element.children.map(renderLowlight);
    case 'element':
      return h(element.tagName, {
        classList: element.properties['className']
      }, element.children.map(renderLowlight));
      return (console.log(element), element.type);
    case 'text':
      return element.value;
    default:
      console.warn(element);
      return 'none';
  }
}

export type CodeBoxProps = {
  lineStart?: number,
  lines: Node[],
};

/**
 * The Code component renders out a pre-formatted
 * string as if it were code, applying _syntax highlighting_.
 */
export const CodeBox: Component<CodeBoxProps> = ({ lines, lineStart = 0 }) => {
  return h('code', { className: classes.codeBox }, h('table', {}, [
    h('tbody', {}, lines.map((line, lineOffset) => {
      const lineIndex = lineStart + lineOffset
      return h('tr', {}, [
        h('td', { className: classes.lineNumber }, lineIndex + '.'),
        h('td', {}, h('pre', { style: { margin: 0 } }, line))
      ])
    }))
  ]))
};