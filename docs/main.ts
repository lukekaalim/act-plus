import { Component, h } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';
import { useRemarkParser, createMdastRenderer, MarkdownProps } from '@lukekaalim/act-markdown';

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
`
const CoolComponent: Component<MarkdownProps> = ({ attributes, children }) => {
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
const mdastToNode = createMdastRenderer({
  components: { CoolComponent },
  styles: {
    table: { borderCollapse: 'collapse' },
    tableCell: { border: '1px solid black', padding: '4px' },
    blockquote: { background: 'darkgrey', borderLeft: '12px solid lightgrey' , padding: '12px'}
  }
})

const App = () => {
  const root = useRemarkParser(md);

  return h('div', {}, [
    mdastToNode(root)
  ])
}

const main = () => {
  render(h(App), document.body);
};

main();