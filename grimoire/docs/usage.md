# Usage

Depending on how much of the library you want to use,
or how much of Grimoire's biases you share, you can use as little
or as much of the Grimoire systems and services as you need.

## Installation

Grimoire can be used both as a front-end component library,
and as part of your build process. If you use it in your website bundle,
make sure to install it as a regular dependency.

```bash
npm install @lukekaalim/grimoire
```

If you only use the static generation components, then it can be installed as
a developer dependency instead.

```bash
npm install -D @lukekaalim/grimoire
```

## Including in your project

<TODO m="I really need to fix this" />

For cursed reasons, Grimoire is currently published as a _Typescript_
package with CSS import statements. This means both you _must_ use
a bundler or transforming tool to execute the code both in the browser
as well as locally, _and_ it needs to be able to handle CSS Module imports.

Eventually, this should export a regular javascript file and a CSS style
sheet separately.

## As a Component library

The simplest way to use Grimoire is to import components that you
find useful.

```ts
import { NavBar, Article, TableOfContents } from '@lukekaalim/grimoire';

const MyDocumentationSite = () => {
  return h('main', {}, [
    h(NavBar, { }, [
      h(Navbar.Link, { href: '/' }, 'Home'),
      h(Navbar.Link, { href: '/blog', }, 'Blog'),
    ]),
    h(TableOfContents, {}, [
      h(TableOfContents.Link, { href: '#welcome' }, 'Welcome'),
    ])
    h(Article, {}, [
      h('h1', { id: 'welcome' }, 'Welcome to my Webbed Site!'),
      h('p', {}, loremIpsum.generate({ paragraphs: 3 }))
    ]),
  ])
};

```

> You can find details (props/style contents) about the exported components on
> the [Components API Page](/packages/grimoire/api/components).

## As a Builder

In a documentation site, you are managing different kinds of articles
with different content, rendering special demo or example components,
handling specific kinds of data.

You may want to use Grimoire to keep track of all that with the DocBuilder
object, to help ergonomically define parts of your website (within what Grimoire's
opinion of a documentation website is.)

```ts
import { builder } from '@lukekaalim/grimoire';

const buildWebsiteData = () => {
  const doc = builder();

  // pull off some properties for conciseness
  const { page, demos, article: { markdown } } = doc;

  page
    .add('/', 'Home', h(HomePage))
    .add('/about', 'About', h(AboutPage))
    .add('/api', 'API', markdown(myMarkdownAPIDocument))
    .book('/tutorials', 'Tutorials')
      .index(markdown(myIntroductionTutorial)))
      .page('Part One', markdown(firstTutorial)))

  demos
    .add('http-call-demo', h(HTTPCallDemo))

  console.log(
    'All paths: ',
    doc.page.list.map(page => page.path)
  )
  console.log(
    'All content: ',
    doc.article.list.map(article => article.metadata)
  )

  return doc;
}
```

> You can find all the details about what the builder can manage
> in the [Builder API Page](/packages/grimoire/api/builders).

## As a Top Level Component

If you've fed Grimoire all the details of how your
documentation is laid out using the builder, you
can also just ask it to render
out all the elements as described.

It uses the same component library as seen previously,
but you can also customize it with [Themes](/packages/grimoire/guides/themes)
to swap out components or styles to your liking.

```ts
import { render } from '@lukekaalim/act-web';
import { DocSite, BuiltinThemes } from '@lukekaalim/grimoire';

// See "As a Builder" for this function.
const doc = buildWebsiteData();

// DocSite doesn't have to sit at the root level, you can put it
// wherever.
render(
  h(DocSite, { doc, theme: BuiltinThemes.Terminal }),
  documentation.body
)

```

> You can learn about the different ways you can customize the DocSite
> component at the [DocSite API Page](/packages/grimoire/api/site).

## As a Static Site Generator

Similarly to using it as a Top Level Component, you can use
all the data you've accumulated during the builder
phase to both generate a variety of static data at build time,
such as search indexes or reference maps (thus reducing the amount
of work that is needed to be done at runtime), or even
generate the entire application statically.

```ts
import { writeFile } from 'node:fs/promises';
import { rehype } from 'rehype';

import { renderHAST } from '@lukekaalim/act-web';
import { SingleDocPage } from '@lukekaalim/grimoire';

const Root = ({ children }) => {
  return h('html', {}, [
    h('head', {}, [
      h('script', { src: '/bundled-code.js' }),
      h('link', { href: '/bundled-styles.css' }),
    ]),
    h('body', {},
      children
    )
  ])
}

const generateDocs = async () => {
  const doc = buildWebsiteData();

  // Write a HTML file for every page
  for (const page of doc.pages.list) {
    const node = h(Root, {}, 
      h(SingleDocPage, { doc, page, options: { ssr: true } }));
    const hast = renderHAST(node);
    const htmlContent = rehype().stringify(hast);

    await writeFile(`./dist/${page.path || 'index'}.html`, htmlContent);
  }

};
```

> Read more about our SSG support at the
> [Static Generation Guide](/packages/grimoire/guides/static-generation)