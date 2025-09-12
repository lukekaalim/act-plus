import { defineConfig } from 'vite';
import { createSourceFilesPlugin } from '@lukekaalim/act-doc';

defineConfig({
  plugins: [createSourceFilesPlugin()]
})
