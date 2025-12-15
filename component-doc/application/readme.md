# Application

To manage the entire documentation website, there is
a parent object called the `DocApp`.

<TypeDoc project="@lukekaalim/grimoire" name="DocApp" />
<TypeDoc project="@lukekaalim/grimoire" name="CoreAPI" />
<TypeDoc project="@lukekaalim/grimoire" name="PluginAPI" />

## Creation

You can create an instance with the
`createDocApp` function.

<TypeDoc project="@lukekaalim/grimoire" name="createDocApp" />

## Rendering

The `DocRenderer` accepts a DocSetup instance
as a prop.

<TypeDoc project="@lukekaalim/grimoire" name="DocAppRenderer" extras="DocAppRendererProps" />

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

<TypeDoc project="@lukekaalim/grimoire" name="createPlugin" />