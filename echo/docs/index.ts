import { h } from '@lukekaalim/act'; 
import { DocApp } from "@lukekaalim/grimoire";
import { EchoPlugin } from '@lukekaalim/grimoire-ts';

import readmeMD from '../README.md?raw';

import mod from '../mod.json';
import { EchoModule } from '@lukekaalim/echo';

import reflection from 'echo:@lukekaalim/echo/index.ts';

export const buildEchoDocs = (doc: DocApp<[EchoPlugin]>) => {
  doc.echo.modules.set('@lukekaalim/echo', reflection)

  doc.article.add('echo.readme', readmeMD, '/@lukekaalim/echo')

  doc.component.add('Center', ({children}) => {
    return h('span', { style: { display: 'flex', 'justify-content': 'center' } }, children)
  });
}