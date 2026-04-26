import { h } from '@lukekaalim/act'; 
import { DocApp, SidePanelContainer } from "@lukekaalim/grimoire";
import { EchoPlugin, EchoView } from '@lukekaalim/grimoire-ts';

import readmeMD from '../README.md?raw';

//import { EchoModule } from '@lukekaalim/echo';
import Sample1JSON from '../sample/1.json';

import reflection from 'echo:@lukekaalim/echo';
//import { ModuleRenderer } from '@lukekaalim/grimoire-ts/components/Module';
import { Article } from '@lukekaalim/grimoire/components/article/Article';

export const buildEchoDocs = (doc: DocApp<[EchoPlugin]>) => {

  const reflectionContext = doc.echo.addModule(reflection)
  doc.article.add('echo.readme', readmeMD, '/packages/@lukekaalim/echo')
  doc.route.add('/test', () => {
    return h(Article, {}, [...doc.echo.moduleContexts.values()].map(context => {
      return h(EchoView, { echo: context.echo, context, debug: true });
    }))
  });

  return;

  for (const externalReference of Object.values(reflection.references)) {
    if (externalReference.module === 'typescript') {
      doc.reference.addExternal(
        `echo:${externalReference.module}:${externalReference.identifier}`,
        new URL(`https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API`)
      )
    }
  }

  doc.route.add('/packages/@lukekaalim/echo/generated-api', h(Article, {}, [
    h(ModuleRenderer, { module: reflection, context: reflectionContext, noId: true })
  ]))
  //doc.echo.addModuleReference('/packages/@lukekaalim/echo/generated-api', reflectionContext);

  
  doc.component.add('Center', ({children}) => {
    return h('span', { style: { display: 'flex', 'justify-content': 'center' } }, children)
  });
}