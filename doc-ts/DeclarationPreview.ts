import { Component, h, useMemo } from "@lukekaalim/act"
import { CodeBox, createHLJSBuilder, HLJSBuilder, DocApp, useDocApp } from "@lukekaalim/grimoire";
import { DeclarationReflection, ParameterReflection, ReflectionKind, SignatureReflection, SomeReflection, TypeParameterReflection } from "typedoc/browser"
import { renderTypeSyntax2 } from "./TypeRenderer";
import { TypeDocPlugin } from "./plugin";

export type DeclarationPreviewRendererProps = {
  declaration: DeclarationReflection,

  extraDeclarations?: DeclarationReflection[]
}

export const DeclarationPreviewRenderer: Component<DeclarationPreviewRendererProps> = ({
  declaration, extraDeclarations = []
}) => {
  const doc = useDocApp([TypeDocPlugin]);

  const lines = useMemo(() => {
    const syntax = createHLJSBuilder();

    renderDeclaration(declaration, syntax, doc);
    for (const extraDeclaration of extraDeclarations) {
      syntax.newLine().newLine();
      renderDeclaration(extraDeclaration, syntax, doc);
    }

    return syntax.output();
  }, [doc, declaration, extraDeclarations]);

  return h(CodeBox, { lines });
}

const renderDeclaration = (declaration: DeclarationReflection, syntax: HLJSBuilder, doc: DocApp<[TypeDocPlugin]>) => {
  switch (declaration.kind) {
    case ReflectionKind.TypeAlias:
      syntax
        .keyword('type ')
        .type(declaration.name)
      renderTypeParameters(declaration.typeParameters, syntax, doc);
      syntax.text(' = ')
      break;
    case ReflectionKind.Variable:
      syntax
        .keyword('let ')
        .type(declaration.name)
        .text(': ')
      break;
    case ReflectionKind.Class:
      syntax
        .keyword('class ')
        .type(declaration.name)

      if (declaration.typeParameters) {
        renderTypeParameters(declaration.typeParameters, syntax, doc)
      }

      syntax.space()

      if (declaration.extendedTypes) {
        syntax.keyword('extends ');
        for (let i = 0; i < declaration.extendedTypes.length; i++) {
          renderTypeSyntax2(syntax, doc, declaration.extendedTypes[i]);
          if (i !== declaration.extendedTypes.length - 1)
            syntax.text(', ')
          else 
            syntax.space()
        }
      }
      break;
    case ReflectionKind.Function:
      syntax.keyword('function ').titleClass(declaration.name)
      break;
    default:
      console.warn(`Unhandled decleration kind: "${ReflectionKind[declaration.kind]}"`)
  }

  renderReflectionContent(declaration, syntax, doc);

  syntax.text(';');
}

export const renderReflectionContent = (reflection: SomeReflection, syntax: HLJSBuilder, doc: DocApp<[TypeDocPlugin]>) => {
  if (reflection.isSignature()) {
    renderTypeParameters(reflection.typeParameters, syntax, doc);
    renderParameters(reflection.parameters, !!reflection.typeParameters, syntax, doc);
    if (reflection.type) {
      syntax.text(': ');
      renderTypeSyntax2(syntax, doc, reflection.type)
    }
    return;
  }
  if (reflection.isDeclaration()) {
    if (reflection.type) {
      renderTypeSyntax2(syntax, doc, reflection.type)
      return;
    }
    if (reflection.signatures) {
      for (const signature of reflection.signatures)
        renderReflectionContent(signature, syntax, doc);
      return;
    }
    if (reflection.children) {
      renderProperties(reflection.children, syntax, doc);
    }
  }
}
const renderProperties = (properties: DeclarationReflection[], syntax: HLJSBuilder, doc: DocApp<[TypeDocPlugin]>) => {
  const multiline = properties.length > 2;

  syntax.text('{ ')
  if (multiline)
    syntax.newLine(1);

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    // need to decide if property has type or method.

    if (property.signatures) {
      for (let o = 0; o < property.signatures.length; o++) {
        syntax.titleClass(property.name);

        const signature = property.signatures[o];
        renderReflectionContent(signature, syntax, doc);
        if (o !== property.signatures.length - 1 || i !== properties.length -1) {
          syntax.text(',')
          if (multiline)
            syntax.newLine()
          else
            syntax.space()
        }
      }
    }
    else if (property.type) {
      syntax.titleClass(property.name)

      if (property.flags.isOptional)
        syntax.text('?: ')
      else
        syntax.text(': ')
        
      renderTypeSyntax2(syntax, doc, property.type);
      if (i !== properties.length - 1) {
        syntax.text(',')
        if (multiline)
          syntax.newLine()
        else
          syntax.space()
      }
    }
    
  }

  if (multiline)
    syntax.newLine(-1)
  else
    syntax.space()

  syntax.text('}')
}
const renderParameters = (
  parameters: undefined | ParameterReflection[] = [],
  forceMultiline: boolean,
  syntax: HLJSBuilder,
  doc: DocApp<[TypeDocPlugin]>,
) => {
  const multiline = parameters.length > 2 || forceMultiline;

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
      syntax.text(', ')
      if (multiline)
        syntax.newLine()
    }
  }
  if (multiline)
    syntax.newLine(-1);

  syntax.text(')')
    
}
const renderTypeParameters = (typeParameters: undefined | TypeParameterReflection[] = [], syntax: HLJSBuilder, doc: DocApp<[TypeDocPlugin]>) => {
  if (typeParameters.length < 1)
    return;

  const multiline = typeParameters.length > 2;
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
      else
        syntax.space()
    }
  }

  if (multiline)
    syntax.newLine(-1);

  syntax.text('>')
}

export const createDeclarationPreviewSyntax = (
  doc: DocApp<[TypeDocPlugin]>,
  syntax: HLJSBuilder,
  declaration: DeclarationReflection
) => {
  const buildProperties = (properties: DeclarationReflection[]) => {
    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];
  
      if (property.type) {
        syntax.titleClass(property.name)
        syntax
          .text(': ')
          
        renderTypeSyntax2(syntax, doc, property.type);
      }
      const signatures = property.getAllSignatures();
      for (let o = 0; o < signatures.length; o++) {
        const signature = signatures[o];
        buildSignature(signature);
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
      .text('{')
      .newLine(1)
    
    buildProperties(declaration.getProperties());
  
    syntax
      .newLine(-1)
      .text('}')
  }
  const buildSignature = (signature: SignatureReflection) => {
    if (signature.name !== '__type')
      syntax.titleClass(signature.name)
      
    buildTypeParameters(signature.typeParameters);
    buildFunctionParameters(signature.parameters, !!signature.typeParameters);

    if (signature.type) {
      syntax.text(': ');
      renderTypeSyntax2(syntax, doc, signature.type);
    }
  }

  if (declaration.type) {
    switch (declaration.kind) {
      case ReflectionKind.TypeAlias:
        syntax
          .keyword('type ')
          .type(declaration.name)
          .text(' = ')
        break;
      case ReflectionKind.Variable:
        syntax
          .keyword('let ')
          .type(declaration.name)
          .text(': ')
        break;
    }
    
    renderTypeSyntax2(syntax, doc, declaration.type);
    syntax.text(';')
    return
  }

  if (declaration.kind === ReflectionKind.TypeAlias) {
    syntax
      .keyword('type ')
      .type(declaration.name)
      .text(' = ')

    buildObject();
  }
  if (declaration.kind === ReflectionKind.Function) {

    const signatures = declaration.getAllSignatures();
    for (const signature of signatures) {
      syntax.keyword('function ')
      buildSignature(signature);
    }
  }
  if (declaration.kind === ReflectionKind.TypeLiteral) {
    const signatures = declaration.getAllSignatures();
    
    for (const signature of signatures)
      buildSignature(signature);

    if (signatures.length < 1) {
      syntax
        .keyword('type ')
        .type(declaration.name)
        .text(' = ')

      buildObject();
    }
  }
}