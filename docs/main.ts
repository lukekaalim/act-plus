import { Component, h, useEffect, useRef } from '@lukekaalim/act';
import { HTML, render } from '@lukekaalim/act-web';
import { MarkdownComponent, MarkdownRendererOptions, Markdown } from '@lukekaalim/act-markdown';
import { DocPage, DocumentationApp } from '@lukekaalim/act-doc';

import markdownReadmeMd from '../markdown/readme.md?raw';

import { DocMark } from '@lukekaalim/act-doc/DocMark';
import { SVGRepo } from '@lukekaalim/act-icons';
import { AsyncNode } from '@lukekaalim/act-doc/AsyncComponent';

const md = `
# Hello World

Im luke

## Testing da tools

\`\`\`
Cool code!
\`\`\`

Or maybe some \`inline code\`

Or how about a list:
  - with one
  - and two
  - and three
    But it kind of keeps going

Or a list with checkboxes
  - [ ] TODO
  - [X] Done

> Yeah, well. Whatever.

|here|is|
|-|-|
|a|table|

<CoolComponent />

But what it

it kept going

longer

and longer

and longer

and longer

and longer

and longer

<Demo />

`
const CoolComponent: MarkdownComponent = ({ attributes, children }) => {
  const style = {
    border: '3px solid green',
    background: 'lightgreen',
    borderRadius: '8px',
    padding: '8px',
    margin: '8px',
    display: 'inline-block'
  }
  return h('pre', { style }, [`Hell yea, ${attributes.name || 'Cool Dude'}!`, children]);
}

const SubPage = () => {
  return 'subpage!';
}

const Demo = () => {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el)
      return;
    const animate = () => {
      el.style.background = `hsl(${Date.now() / 5 % 360}deg, 100%, 90%)`;
      id = requestAnimationFrame(animate);
    };
    let id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [])

  return h('div', { ref, style: {
    padding: '2em',
  } }, 'A prismatic component!');
};

const components = {
  Demo,
}

const options: MarkdownRendererOptions = {
  components: { CoolComponent, Demo },
  styles: {
    table: { borderCollapse: 'collapse' },
    tableCell: { border: '1px solid black', padding: '4px' },
    blockquote: { background: 'darkgrey', borderLeft: '12px solid lightgrey' , padding: '12px'}
  }
}

const pages = [
  DocPage.create('/',
    h(AsyncNode, {
      nodeKey: 'act-doc/mod.doc',
      loadNode: () => import('@lukekaalim/act-doc/mod.doc').then(m => m.default)
    }), [
      h(SVGRepo, { key: '530508/front-page' }),
      '@lukekaalim/act-doc'
    ]),


  // markdown
  DocPage.create(
    '/markdown',
    h(DocMark, { text: markdownReadmeMd, options: { components } }),
    [h(SVGRepo, { key: '530516/document' }), '@lukekaalim/act-markdown']
  ),
  DocPage.create('/markdown/test', h(Markdown, { text: md, options }), [
    h(SVGRepo, { key: '437819/corner-down-right' }),
    'markdown-test-page'
  ]),

  DocPage.create(
    '/icons',
    h(AsyncNode, {
      nodeKey: 'act-icons/mod.doc',
      loadNode: () => import('@lukekaalim/act-icons/mod.doc').then(m => m.default)
    }),
    [h(SVGRepo, { key: '530511/picture' }), '@lukekaalim/act-icons']
  ),
  // test subpages
  DocPage.create('/subpages', h(SubPage)),
  DocPage.create('/subpages/another/imaginary/subpage', h(SubPage)),
  DocPage.create('/subpages/another/pagewithashared/root', h(SubPage)),
];

const main = () => {
  render(h(HTML, {}, h(DocumentationApp, { pages })), document.body);
};

main();