# @lukekaalim/grimoire-ts

***Let your code document itself!***

This is a plugin for [grimoire](/packages/@lukekaalim/grimoire) that
lets your documentation reference functions,
types, aliases, classes, and interfaces from your own code - annotated
with **TSDOC** for full control!

Functionally, it adds support for reading
TypeDoc JSON outputs, and allows you to reference them inside
your documentation.

```bash
npm i -D @lukekaalim/grimoire-ts
```

```ts
import { TypeDocPlugin } from '@lukekaalim/grimoire-ts';
import projectJSON from 'typedoc:../src/index.ts';

const doc = createDocApp([TypeDocPlugin])

doc.typedoc.loadProjectJson('MyProject', projectJSON);

render(h(DocAppRenderer, { doc }), document.body)
```

## Todo

I sure love writing these lists. I just wish I loved
filling when with checkboxes as much too.

  - [ ] TypeDoc
    - [ ] should probably have "type" prop instead of "name" for consitency.
    - [ ] should maybe be renamed to "Reflection" to match TypeDoc ?
    - [ ] should have option to select kind of reflection: "Type" or "Variable" (since names can conflict)