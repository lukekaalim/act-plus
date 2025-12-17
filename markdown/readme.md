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

```tsx
import { Markdown } from '@lukekaalim/act-markdown';

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
  - [x] MDX support
  - [x] Github-flavored markdown
  - [ ] Frontmatter

## API

<TypeDoc project="@lukekaalim/act-markdown" name="createMdastRenderer" extras="MarkdownRendererOptions" />
<TypeDoc project="@lukekaalim/act-markdown" name="MdastRenderer" />

<TypeDoc project="@lukekaalim/act-markdown" name="Markdown" />
<TypeDoc project="@lukekaalim/act-markdown" name="useRemarkParser" />
<TypeDoc project="@lukekaalim/act-markdown" name="parser" />