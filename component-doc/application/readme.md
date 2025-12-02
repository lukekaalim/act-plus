# DocSetup

The application instance is a collection
of data representing some common properties
of your traversible documentation website.

It includes details such as a lookup map
for resolving references to URLs, a list of
MDX components.

## Creation

You can create an instance with the
`createDocSetup` function.

## Rendering

The `DocRenderer` accepts a DocSetup instance
as a prop.

## Example Setup

```ts
const doc = createDocApp();

doc.addPlugin(typedocPlugin);
doc.addPlugin(httpPlugin);

doc.addPage("/", "Home", () => [
  h(Hero, { title: "My Projects" }),
  h(LinkGrid, { links: [] })
]);
doc.addSubApp("/package", packagesApp);

render(h(DocRenderer, { doc }));
```

## Documenting a Monorepo

```ts
// src/packages/my_package/docs.ts
const createMyPackageDocs = (doc: DocApp) => {
  doc.addPage("/mypackage/subdirectory");
  doc.addArticle("MyArticle", myArticleMd);
}

// src/docs.ts
import { createMyPackageDocs } from './packages/my_package/docs.ts';


const doc = createDocApp({ plugins });
createMyPackageDocs(doc);


render(h(DocRenderer, { doc }));
```

## Writing a Plugin

You can extend the DocApp system

```ts

type TypeDocAPI = {
  addJSONProject(key: string): void,
}

declare module "@lukekaalim/grimore" {
  interface DocAppExtensions {
    typedoc: TypeDocAPI
  }
}

doc.typedoc.addJSONProject("", "");
doc.typedoc.addProject();

```