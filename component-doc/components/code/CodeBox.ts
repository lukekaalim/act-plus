import { Component, h, Node, useEffect, useRef, useState } from '@lukekaalim/act';
import { common, createLowlight } from 'lowlight';
import { Nodes } from 'hast';

import 'highlight.js/styles/an-old-hope.css'
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
  titleClass: 'hljs-title class_',

  
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

export type CodeBoxProps = {
  lineStart?: number,
  lines: Node[],
};

/**
 * The Code component renders out a pre-formatted
 * string as if it were code, applying _syntax highlighting_.
 */
export const CodeBox: Component<CodeBoxProps> = ({ lines, lineStart = 0 }) => {
  const ref = useRef<null | HTMLElement>(null);
  const [lineGuess, setLineGuess] = useState(1);

  useEffect(() => {
    if (!ref.current)
      return;
    const lineCount = ref.current.textContent.match(/\n/g);
    if (lineCount)
      setLineGuess(lineCount.length + 1);
  }, [lines.length])

  if (lines.length < 2) {
    return h('code', { className: classes.codeBox }, h('table', {}, [
      h('tbody', {}, Array.from({ length: lineGuess }).map((_, lineOffset) => {
        const lineIndex = lineStart + lineOffset
        return h('tr', {}, [
          h('td', { className: classes.lineNumber }, lineIndex + '.'),
          lineOffset === 0 && h('td', { rowSpan: lineGuess },
            h('pre', { ref, className: classes.unknownLineGuessBox }, lines[0]))
        ])
      }))
    ]))
  }

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