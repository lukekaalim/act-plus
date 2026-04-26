import { DocApp } from "@lukekaalim/grimoire";
//import { Declaration, EchoPlugin } from "@lukekaalim/grimoire-ts";

import readmeMd from '../readme.md?raw';
import apiMd from './api.md?raw';
import guideMd from './guides.md?raw';
import reflection from 'echo:@lukekaalim/grimoire-ts';

import { h } from "@lukekaalim/act";
//import { createModuleContext } from "../utils/ModuleContext";
//import { EchoDeclaration, EchoModule, EchoTSDocComment, EchoType } from "@lukekaalim/echo";
import { createId } from "../../echo/utils";

export const buildGrimoireTSDocs = (doc: DocApp<[EchoPlugin]>) => {
  doc.echo.addModule(reflection);

  doc.article.add('ts.readme', readmeMd, '/packages/@lukekaalim/grimoire-ts');
  doc.article.add('ts.api', apiMd, '/packages/@lukekaalim/grimoire-ts/api');
  doc.article.add('ts.guide', guideMd, '/packages/@lukekaalim/grimoire-ts/guides');

  doc.reference.addExternal(`ts:typedoc.DeclarationReflection`, new URL('https://typedoc.org/api/classes/Models.DeclarationReflection.html'));
  doc.reference.addExternal(`ts:typedoc.ProjectReflection`, new URL('https://typedoc.org/api/classes/Models.ProjectReflection.html'));
  doc.reference.addExternal(`ts:typedoc.ReferenceType`, new URL('https://typedoc.org/api/classes/Models.ReferenceType.html'));

  return;

  const stringType = EchoType.create('builtin', createId(), { builtin: 'string' })
  const numberType = EchoType.create('builtin', createId(), { builtin: 'number' })

  const signature = EchoType.create('callable', createId(), {
    parameters: [
      { name: 'my_param', type: numberType.id, optional: false }
    ],
    typeParameters: [],
    returns: stringType.id
  });

  const declaration = EchoDeclaration.create(createId(), 'function', {
    identifier: 'MyFunction',
    signature: signature.id
  })
  const commentText = `
  /**
 * My function is very cool!
 * @param my_param This parameter isn't used, yet!
 * @alpha
 * @public
 */`.trim();

  const comment: EchoTSDocComment = {
    id: createId(),
    target: { type: 'declaration', id: declaration.id },
    comment: commentText
  }

  const module: EchoModule = {
    name: 'sample',
    types: {
      [signature.id]: signature,
      [numberType.id]: numberType,
      [stringType.id]: stringType
    },
    declarations: {
      [declaration.id]: declaration
    },
    references: {},
    comments: {
      [comment.id]: comment
    },
    exports: []
  }

  const context = createModuleContext(module);


  doc.demos.add('typedoc-myfunction-def', () => {
    return [
      h('h1', {}, 'My Super Cool API'),
      h(Declaration, { context, declaration })
    ]
  })
}