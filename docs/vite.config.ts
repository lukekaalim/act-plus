import { defineConfig } from 'vite';

import { tsImport } from 'tsx/esm/api'
//import { createEchoPlugin } from "@lukekaalim/echo/plugin"

const { createEchoPlugin } = await tsImport('@lukekaalim/echo/plugin', import.meta.url)

export default defineConfig({
  build: {
    target: ["esnext"],
  },
  plugins: [createEchoPlugin()]
});
