# Guides

  - [Quickstart](#quickstart)

## Quickstart

  1. [Scaffold Project](#1-scaffold-project)
  2. [Install Deps](#2-install-deps)
  3. [Create Entrypoint](#3-create-entrypoint)
  4. [Add Content](#4-add-content)

Lets get everything setup so you can
get to writing docs as quickly as possible!

### 1. Scaffold Project

Lets make a subfolder for the docs site. Make a
new directory called `docs`. Initialize a new
npm package inside there.

```bash
mkdir docs;
cd docs;
npm init -y;
```

> If you are using a monorepo of some sort,
> you probably also want to register this folder
> as a separate package or module.

### 2. Install Deps

Lets install Act and Grimoire, and a bundler
to actually turn our code into a website: [vite](https://vite.dev)!

```bash
# inside docs/
npm i -D vite

npm i @lukekaalim/{act,act-web,grimoire}
```

### 3. Create entrypoint

We just need to create two files: a HTML entrypoint
and a typescript one.

```html
<!DOCTYPE html>
<!--  docs/index.html /-->
<html>
  <head>
    <title>My Doc Page</title>
    <script type="module" src="/main.ts"></script>
  </head>
  <body> </body>
</html>
```

```ts
// docs/main.ts
import { render } from '@lukekaalim/act-web';
import { h } from '@lukekaalim/act';
import { createDocApp, SimpleDocTheme } from '@lukekaalim/grimoire';

// A simple DocApp instance with no content or plugins
const doc = createDocApp();

// Render into "document.body" with the "SimpleDocTheme"
render(h(SimpleDocTheme, { doc }), document.body);
```

<Demo demo="Quickstart.3" />

### 4. Add Content

We can expand on our entrypoint by adding some Markdown Articles
to give it a bit of page structure inside our
`docs/main.ts` file.


```ts
// ...

import readmeMd from '../README.md?raw';

const doc = createDocApp();

// Add the "readme" file as the root page
doc.markdown.add('readme', readmeMd, '/');

// ...
```

<Demo demo="Quickstart.4" />

### 5. All Done!

You've now gotten your markdown file rendered into
the website, but there's a whole lot more you can do to
kick off from here!

Customize the app with your own custom TopNavBar and/or SideNavBar,
redo the colors by editing the Color Scheme Variables.

Consider adding some [Interactive Demos](), creating a splashy
[Landing Page](), designing some [Custom Components]() to spice
up your documents, or adding in some [Typescript]() or [HTTP]() plugins.

If you write up some useful bits of re-usable code, then maybe consider
your hand at adding it into a Plugin yourself!

<Demo demo="Quickstart.5" />