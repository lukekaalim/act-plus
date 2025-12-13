import { Component, h, useMemo } from "@lukekaalim/act"
import { CodeBox, createHLJSBuilder, HLJSBuilder } from "@lukekaalim/act-doc";
import { DeclarationReference, DeclarationReflection, ParameterReflection, ReflectionKind, SignatureReflection, TypeParameterReflection } from "typedoc/browser"
import { renderTypeSyntax2 } from "./TypeRenderer";
import { DocApp, useDocApp } from "@lukekaalim/act-doc/application";
import { TypeDocPlugin } from "./plugin";

export type DeclarationPreviewRendererProps = {
  declaration: DeclarationReflection,
}

export const DeclarationPreviewRenderer: Component<DeclarationPreviewRendererProps> = ({ declaration }) => {
  const doc = useDocApp([TypeDocPlugin]);

  const lines = useMemo(() => {
    if (declaration.type) {
      const builder = createHLJSBuilder();
      
      switch (declaration.kind) {
        case ReflectionKind.TypeAlias:
          builder
            .keyword('type ')
            .type(declaration.name)
            .text(' = ')
          break;
        case ReflectionKind.Variable:
          builder
            .keyword('let ')
            .type(declaration.name)
            .text(': ')
          break;
      }

      
      renderTypeSyntax2(builder, doc, declaration.type);
      builder.text(';')

      return builder.output();
    }

    const syntax = createHLJSBuilder();
    createDeclarationPreviewSyntax(doc, syntax, declaration);
    return syntax.output();
  }, [doc, declaration]);

  return h(CodeBox, { lines });
}

export const createDeclarationPreviewSyntax = (doc: DocApp<[TypeDocPlugin]>, syntax: HLJSBuilder, declaration: DeclarationReflection) => {
  const buildProperties = (properties: DeclarationReflection[]) => {
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
  
      syntax.titleClass(property.name)
      if (property.type) {
        syntax
          .text(': ')
          
        renderTypeSyntax2(syntax, doc, property.type);
      }
      if (i !== properties.length - 1) {
        syntax
          .text(',')
          .newLine(0)
      }
    }
  }
  const buildTypeParameters = (typeParameters: TypeParameterReflection[] = []) => {
    if (typeParameters.length < 1)
      return;

    const multiline = typeParameters.length > 1;
    syntax.text('<')
    
    if (multiline)
      syntax.newLine(1);
    for (let i = 0; i < typeParameters.length; i++) {
      const parameter = typeParameters[i];
      syntax.titleClass(parameter.name)
      if (parameter.type) {
        syntax.keyword(' extends ')
        renderTypeSyntax2(syntax, doc, parameter.type);
      }
      if (parameter.default) {
        syntax.text(' = ')
        renderTypeSyntax2(syntax, doc, parameter.default);
      }
      if (i !== typeParameters.length - 1) {
        syntax.text(',')
        if (multiline)
          syntax.newLine()
      }
    }

    if (multiline)
      syntax.newLine(-1);

    syntax.text('>')
  }
  const buildFunctionParameters = (parameters: ParameterReflection[] = [], forceMultiline = false) => {
    const multiline = parameters.length > 1 || forceMultiline;

    syntax.text('(')
    if (multiline)
      syntax.newLine(1);

    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i];
      
      syntax.params(parameter.name)
      if (parameter.type) {
        syntax.text(': ')
        renderTypeSyntax2(syntax, doc, parameter.type);
      }
      if (i !== parameters.length - 1) {
        syntax.text(',')
        if (multiline)
          syntax.newLine()
      }
    }
    if (multiline)
      syntax.newLine(-1);

    syntax.text(')')
  }

  const buildObject = () => {
    syntax
      .keyword('type ')
      .type(declaration.name)
      
    buildTypeParameters(declaration.typeParameters);

    syntax.keyword(' = ')
      .text('{')
      .newLine(1)
    
    buildProperties(declaration.getProperties());
  
    syntax
      .newLine(-1)
      .text('}')
  }
  const buildSignature = (signature: SignatureReflection) => {
    syntax.keyword('function ')
    if (signature.name !== '__type')
      syntax.titleClass(signature.name)
      
    buildTypeParameters(signature.typeParameters);
    buildFunctionParameters(signature.parameters, !!signature.typeParameters);
    if (signature.type) {
      syntax.text(': ');
      renderTypeSyntax2(syntax, doc, signature.type);
    }
  }

  if (declaration.kind === ReflectionKind.TypeAlias) {
    buildObject();
  }
  if (declaration.kind === ReflectionKind.Function) {
    const signatures = declaration.getAllSignatures();
    for (const signature of signatures)
      buildSignature(signature);
  }
  if (declaration.kind === ReflectionKind.TypeLiteral) {
    const signatures = declaration.getAllSignatures();
    
    for (const signature of signatures)
      buildSignature(signature);
  }
}