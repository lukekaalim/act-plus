import { h, Node } from "@lukekaalim/act";

/**
 * A map of 
 * 
 * As defined by:
 * {@link https://highlightjs.readthedocs.io/en/latest/css-classes-reference.html}
 */
export const classMap = {
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
  selectorPseudo: 'hljs-selector-pseudo',
  addition: 'hljs-addition',
  templateTag: 'hljs-template-tag',
  templateVariable: 'hljs-template-variable',
  class: 'hljs-class',
  titleClass: 'hljs-title class_',

  params: 'hljs-params',

  
  comment: 'hljs-comment',
  quote: 'hljs-quote',
  deletion: 'hljs-deletion',
  meta: 'hljs-meta',

  doctag: 'hljs-doctag',
} as const;
export type HLJSClassKey = keyof typeof classMap;

export type HLJSElementBuilderFuncMap = { [key in HLJSClassKey]: (text: string) => HLJSBuilder }

/**
 * Core API for composing syntax-highlighted text.
 * 
 * @example
 * ```ts
 * const builder = createHLJSBuilder();
 * 
 * builder.function('MyFunction').text('() {')
 *  .newLine().keyword('return').space().number('100')
 * 
 * render(builder.output());
 * ```
 */
export type HLJSBuilderAPI = {
  newLine(indent?: number): HLJSBuilder,

  text(text: string): HLJSBuilder,
  space(): HLJSBuilder,

  node(node: Node): HLJSBuilder,

  output(): Node[],
}

/**
 * Utility object for composing HLJS-style element trees.
 * Call either a HLJS classname as a function, or some of the
 * utility methods on {@link HLJSBuilderAPI}.
 * 
 * Once you are done, call the {@link HLJSBuilderAPI.output} function
 * to retrieve an array of lines of syntax highlighted code in
 * {@link Node|Nodes}
 */
export type HLJSBuilder = HLJSBuilderAPI & HLJSElementBuilderFuncMap;

export const createHLJSBuilder = (): HLJSBuilder => {
  const lines: Node[][] = [];
  let depth = 0;

  lines.push([]);
  
  const append = (...items: Node[]) => {
    const lastLine = lines[lines.length - 1];
    lastLine.push(...items);
  }

  const classKeys = Object.keys(classMap) as HLJSClassKey[];
  const classAPI = Object.fromEntries(classKeys.map(key => {
    return [key, (text: string) => (append(h('span', { className: classMap[key] }, text)), builder)]
  })) as HLJSElementBuilderFuncMap;
  
  const builder: HLJSBuilder =  {
    ...classAPI,
    newLine(indent = 0) {
      depth += indent;
      lines.push([]);
      for (let i = 0; i < depth; i++)
        append('  ');
      return builder;
    },
    space() {
      append(' ');
      return builder;
    },
    text(text) {
      append(text);
      return builder;
    },
    node(node) {
      append(node);
      return builder;
    },
    output() {
      return lines;
    },
  }

  return builder;
}
