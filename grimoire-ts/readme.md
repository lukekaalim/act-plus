# @lukekaalim/grimoire-ts

***Let your code document itself!***

This is a plugin for [grimoire](/packages/@lukekaalim/grimoire) that
lets your documentation reference functions,
types, aliases, classes, and interfaces from your own code - annotated
with **TSDOC** for full control!


```bash
npm i -D @lukekaalim/grimoire-ts
```

```ts
import { TypeDocPlugin } from '@lukekaalim/grimoire-ts';
import projectJSON from 'echo:../src/index.ts';

const doc = createDocApp([TypeDocPlugin])

doc.typedoc.loadProjectJson('MyProject', projectJSON);

render(h(DocAppRenderer, { doc }), document.body)
```
