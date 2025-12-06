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

<TypeDoc project="@lukekaalim/grimoire" name="DocAppRenderer" />

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

const MyPlugin = {
  key: 'my_plugin',
  api(core) {
    // register a new component to be displayed in MDX articles
    core.components.add('NoiseMaker', () => h('audio', { src: 'my-audio' }))

    return {
      doThing() {
        console.log('A thing is done!');
      }
    }
  }
}

const doc = createDocApp([MyPlugin]);

doc.my_plugin.doThing();

```