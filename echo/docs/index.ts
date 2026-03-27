import { h } from '@lukekaalim/act'; 
import { DocApp } from "@lukekaalim/grimoire";
import { EchoDeclarationRenderer, EchoPlugin } from '@lukekaalim/grimoire-ts';

import readmeMD from '../README.md?raw';

import { EchoModule } from '@lukekaalim/echo';
import Sample1JSON from '../sample/1.json';

import reflection from 'echo:@lukekaalim/echo';

const Sample1 = Sample1JSON as unknown as EchoModule;

export const buildEchoDocs = (doc: DocApp<[EchoPlugin]>) => {
  doc.echo.modules.set('@lukekaalim/echo', reflection)
  for (const externalReference of Object.values(reflection.references)) {
    if (externalReference.module === 'typescript') {
      doc.reference.addExternal(
        `echo:${externalReference.module}:${externalReference.identifier}`,
        new URL(`https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API`)
      )
    }
  }

  doc.article.add('echo.readme', readmeMD, '/packages/@lukekaalim/echo')

  doc.component.add('Center', ({children}) => {
    return h('span', { style: { display: 'flex', 'justify-content': 'center' } }, children)
  });
}