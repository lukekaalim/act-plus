# @lukekaalim/act-markdown

Convert markdown text to act nodes! Uses `remark` to
parse text into `mdast`, and then provides an function
to turn `mdast` nodes into act nodes.

## Quickstart

Install via npm.

```sh
npm install @lukekaalim/act-markdown
```

And then use the [`Markdown`](#freesh-avocadoo) component
to render the text.

[somewhere](https://www.anunknownlocation.com)

```ts
import { Markdown } from '@lukekaalim/act-markdown`;

const myMarkdownText = `
# Heading

Some text
`;

const MyApp = () => {
  return <Markdown text={myMarkdownText} />
};
```

## Features

Support for the following features builtin:
  - [ ] Directives
  - [x] MDX support
  - [x] Github-flavored markdown
  - [ ] Frontmatter

## Exports

### Markdown

The component!