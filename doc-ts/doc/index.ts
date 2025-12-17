import { DocApp } from "@lukekaalim/grimoire";
import { TypeDocPlugin } from "@lukekaalim/grimoire-ts";

import readmeMd from '../readme.md?raw';
import apiMd from './api.md?raw';
import guideMd from './guides.md?raw';
import projectJSON from 'typedoc:../index.ts';

import {
  Comment, CommentTag, DeclarationReflection, IntrinsicType,
  ParameterReflection, ReflectionKind, SignatureReflection
} from "typedoc/browser";
import { DeclarationReflectionRenderer } from "../Reflection";
import { h } from "@lukekaalim/act";

export const buildGrimoireTSDocs = (doc: DocApp<[TypeDocPlugin]>) => {
  doc.typedoc.addProjectJSON('@lukekaalim/grimoire-ts', projectJSON);

  doc.article.add('ts.readme', readmeMd, '/packages/@lukekaalim/grimoire-ts');
  doc.article.add('ts.api', apiMd, '/packages/@lukekaalim/grimoire-ts/api');
  doc.article.add('ts.guide', guideMd, '/packages/@lukekaalim/grimoire-ts/guides');

  doc.reference.addExternal(`ts:typedoc.DeclarationReflection`, new URL('https://typedoc.org/api/classes/Models.DeclarationReflection.html'));
  doc.reference.addExternal(`ts:typedoc.ProjectReflection`, new URL('https://typedoc.org/api/classes/Models.ProjectReflection.html'));
  doc.reference.addExternal(`ts:typedoc.ReferenceType`, new URL('https://typedoc.org/api/classes/Models.ReferenceType.html'));


  const myFunctionDeclaration = new DeclarationReflection('MyFunction', ReflectionKind.Function);
  const mySignatureReflection = new SignatureReflection('MyFunction', ReflectionKind.CallSignature, myFunctionDeclaration);
  myFunctionDeclaration.addChild(mySignatureReflection);

  myFunctionDeclaration.comment = new Comment([
    { kind: "text", text: "My function is very cool!" },
  ], [
    new CommentTag('@alpha', []),
    new CommentTag('@public', [])
  ])

  const param = new ParameterReflection("my_param", ReflectionKind.Parameter, mySignatureReflection);
  param.type = new IntrinsicType("number");

  mySignatureReflection.parameters = [param];
  mySignatureReflection.type = new IntrinsicType("string");

  doc.demos.add('typedoc-myfunction-def', () => {
    return [
      h('h1', {}, 'My Super Cool API'),
      h(DeclarationReflectionRenderer, { declaration: myFunctionDeclaration })
    ]
  })
}