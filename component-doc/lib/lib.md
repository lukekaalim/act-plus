# Utilities

## Syntax Highlighting

Syntax Highlighting is handled one of two ways: [Manually](#manually) or [Automatically](#automatically).

### Automatically

When the App is presented with a random set of text that might be code
(such as the content of a markdown code element, or the props for the
`CodeBox` element), we feed it to the [lowlight](https://github.com/wooorm/lowlight) parser,
which spits out elements in HLJS syntax as a tree, which we convert to
regular HTML via [renderLowlightNodes](#@lukekaalim/act-doc.index.renderLowlightNodes).

```ts
import { createLowlight, common } from "lowlight";
import { renderLowlightNodes } from '@lukekaalim/grimoire';
import { render } from '@lukekaalim/act-web';

const lowlight = createLowlight(common);


const lowLightTree = lowlight.highlight(language, code);
const actNodes = renderLowlightNodes(lowLightTree);

render(actNodes, document.body);
```

<TypeDoc project="@lukekaalim/grimoire" name="renderLowlightNodes" />

### Manually

In cases where we either want to have more specific control over the
output, don't want to be sending strings through two levels of parsing,
or have some special annotations that we want to preserve, we can use the
[HLJSBuilder](#@lukekaalim/act-doc.index.HLJSBuilder) to give us
methods to manually construct a set of syntax-highlighted elements.

<TypeDoc project="@lukekaalim/grimoire" name="HLJSBuilder" />
<TypeDoc project="@lukekaalim/grimoire" name="createHLJSBuilder" />


<TypeDoc project="@lukekaalim/grimoire" name="HLJSBuilderAPI" />
<TypeDoc project="@lukekaalim/grimoire" name="HLJSElementBuilderFuncMap" extras="HLJSClassKey classMap" />

## Markdown

As one of the primary focuses of Grimoire is to allow
you do describe the content of your documentation
using markdown, there are some utility functions
that allow more common patterns to be used concisely. 

<TypeDoc project="@lukekaalim/grimoire" name="useGrimoireMdastRenderer" />

## NavTree

A "NavTree" is a tree-based structure that describes visitable locations,
and their parent locations.

They can both display things like different routes - highlighting the
relationship with parent and child routes, as well as different
headings on a page where subheadings are considered children
of their overarching headings.

<TypeDoc project="@lukekaalim/grimoire" name="NavTree2" />
