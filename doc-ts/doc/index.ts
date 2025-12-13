import { DocApp } from "@lukekaalim/act-doc";
import { TypeDocPlugin } from "../plugin";

import docIndex from './index.md?raw';
import { Comment, CommentTag, DeclarationReflection, IntrinsicType, ParameterReflection, ReflectionKind, SignatureReflection } from "typedoc/browser";
import { DeclarationReflectionRenderer } from "../Reflection";
import { h } from "@lukekaalim/act";


export const buildDocs = async (doc: DocApp<[TypeDocPlugin]>) => {
  doc.article.add('typedoc.index', docIndex, '/packages/@lukekaalim/grimoire-ts');

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
    return h(DeclarationReflectionRenderer, { declaration: myFunctionDeclaration })
  })
}