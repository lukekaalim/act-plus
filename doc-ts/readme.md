# @lukekaalim/grimoire-ts

A plugin for [grimoire](/packages/@lukekaalim/grimoire) that adds support for reading
TypeDoc JSON outputs, and allows you to reference them inside
your documentation - essentially allowing you to use your typescript
project as a source of documentation itself.

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
