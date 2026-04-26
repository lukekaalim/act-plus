import { h } from "@lukekaalim/act";
import { DocApp } from "@lukekaalim/grimoire";
import { EchoPlugin } from "@lukekaalim/grimoire-ts";

//import actReflection from 'echo:../../act-typescript/core';

export const createSandboxDocs = (docApp: DocApp<[EchoPlugin]>) => {
  return;
  
  docApp.route.add('/sandbox-test', [
    actReflection.exports.map(exportedId => {
      const declaration = actReflection.declarations[exportedId];

      return null;//h(EchoDeclarationRenderer, { declaration, module: actReflection });
    }),
    h('pre', {}, JSON.stringify(actReflection, null, 2))
  ])
};
