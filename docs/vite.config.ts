import path from 'node:path';
import { defineConfig, Plugin } from 'vite';
import * as td from "typedoc";

const TYPEDOC_PREFIX = 'typedoc:';
const RESOLVED_TYPEDOC_ID_PREFIX = `\0${TYPEDOC_PREFIX}`

const plugin: Plugin = {
  name: 'typedoc',
  resolveId(id, importer) {
    if (id.startsWith(TYPEDOC_PREFIX)) {
        const pathWithoutPrefix = id.slice(TYPEDOC_PREFIX.length);

      if (importer) {
        const resolvedPath = path.resolve(path.dirname(importer), pathWithoutPrefix);

        return RESOLVED_TYPEDOC_ID_PREFIX + resolvedPath;
      } else {
        return RESOLVED_TYPEDOC_ID_PREFIX + pathWithoutPrefix;
      }
    }
    return null;
  },
  async load(id, options) {
    if (id.startsWith(RESOLVED_TYPEDOC_ID_PREFIX)) {
      const pathWithoutPrefix = id.slice(RESOLVED_TYPEDOC_ID_PREFIX.length);

      const app = await td.Application.bootstrapWithPlugins({
        entryPoints: [pathWithoutPrefix],
      });

      const project = await app.convert();
      if (project) {
        const sources = new Set<string>();
        project.traverse(refl => {
          if (refl.isDeclaration()) {
            if (refl.sources)
              for (const source of refl.sources)
                sources.add(source.fullFileName)
          }
        })
        for (const source of sources)
          this.addWatchFile(source);

        const projectJSON = app.serializer.projectToObject(project, '/');
        return `export default ` + JSON.stringify(projectJSON, null, 2);
      }
      return `export default "ERROR"`
    }
  },
}

export default defineConfig({
  build: {
    target: ["esnext"],
  },
  plugins: [plugin]
});
