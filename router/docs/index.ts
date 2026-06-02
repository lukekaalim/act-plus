import { DocApp } from "@lukekaalim/grimoire";
import { EchoPlugin } from "@lukekaalim/grimoire-ts";

import routerEcho from 'echo:@lukekaalim/act-router';
import readme from '../README.md?raw';
import api from './api.md?raw';

export const routerDocs = (doc: DocApp<[EchoPlugin]>) => {
  doc.echo.addModule(routerEcho);
  doc.page.addBook('Router', 'packages/router')
    .index(doc.article.markdown(readme))
    .page('API', doc.article.markdown(api))
}