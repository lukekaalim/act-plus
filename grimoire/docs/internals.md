# Internals

Grimoire doesn't do too much in terms of novel features. A lot
of the interesting problems are solved in other packages, listed here.

## Markdown Parsing

`@lukekaalim/act-markdown` is used for rendering markdown,
with the [mdast](https://github.com/syntax-tree/mdast)/`uinst` ecosystem for the parsing of markdown
documents.

We use a few mdast parsing plugins by default, including the MDX
parser, which we don't execute traditionally but instead just
do a simple map to components we know.

## Routing

We use `@lukekaalim/act-router` for routing.

## Syntax Highlighting

[Lowlight](https://github.com/wooorm/lowlight) is used to read
code blocks and generate [hast](https://github.com/syntax-tree/hast) trees
from them, which are converted into act elements.

Theme default theme and the themes listed are taken from
the [highlight.js](https://github.com/highlightjs/highlight.js/) styles
repository.