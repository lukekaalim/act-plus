import { h } from '@lukekaalim/act'; 
import { DocApp } from "@lukekaalim/grimoire";
import { EchoDeclarationRenderer, EchoPlugin } from '@lukekaalim/grimoire-ts';

import readmeMD from '../README.md?raw';

import { EchoModule } from '@lukekaalim/echo';
import Sample1JSON from '@lukekaalim/echo/sample/1.json';

import reflection from 'echo:@lukekaalim/echo/index.ts';

const Sample1 = Sample1JSON as unknown as EchoModule;

export const buildEchoDocs = (doc: DocApp<[EchoPlugin]>) => {
  doc.echo.modules.set('@lukekaalim/echo', reflection)

  doc.article.add('echo.readme', readmeMD, '/@lukekaalim/echo')
  doc.route.add('/@lukekaalim/echo/test', h('div', {}, [
    Sample1.exports.map(id => {
      return h(EchoDeclarationRenderer, { module: Sample1, declaration: Sample1.declarations[id] })
    })
  ]))

  doc.component.add('Center', ({children}) => {
    return h('span', { style: { display: 'flex', 'justify-content': 'center' } }, children)
  });
}