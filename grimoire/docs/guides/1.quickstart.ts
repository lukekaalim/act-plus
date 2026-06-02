import { h } from "@lukekaalim/act";
import { createDocApp, DEFAULT_THEME, DocApp } from "@lukekaalim/grimoire";
import { DocSite } from "../../DocSite";

export const quickstart = (doc: DocApp) => {
  doc.demos.add('Quickstart.3', () => {
    const app = createDocApp();

    // Add some sample content to the hopepage
    app.page.add('/', { type: 'node', node: [
      h('h1', {}, 'Welcome to my docs!'),
      h('p', {}, 'This is some test content. Hope you enjoy the page :D')
    ] })

    // Render into "document.body" with the default doc theme
    return h(DocSite, { app, theme: DEFAULT_THEME })
  })
}