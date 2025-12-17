# Guides

Check out [Quickstart]($Quickstart) to get your hands on
some type-aware documentation!

## Quickstart

First, make sure your project has some annotations so
we can document something interesting:

```ts
/**
 * My function is very cool!
 * @param my_param This parameter isn't used, yet!
 * @alpha
 * @public
 */
export function MyFunction(my_param: number): string {
  return "Hello, world!";
}

```

Next, generate a TypeDoc JSON project from your code code.

```bash
npx typedoc index.ts --json ./my-project.typedoc.json
```

This should make a JSON file in the path you specified.

Add the plugin to your app, and load your project under some key.

```ts
import { h } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';
import { DocAppRenderer } from '@lukekaalim/grimoire';
import { TypeDocPlugin } from '@lukekaalim/grimoire-ts';

import myProjectJSON from './my-project.typedoc.json';

const doc = createDocApp([TypeDocPlugin]);
doc.typedoc.loadProjectJSON('MyCoolAPI', myProjectJSON);

render(h(DocAppRenderer, { doc }), document.body)
```

Then, inside article, you can instantly create a component
that prints out information about a particular type or variable:

```markdown
# My Super Cool API

<TypeDoc project="MyCoolAPI" type="MyFunction" />
```

<Demo demo="typedoc-myfunction-def" />
