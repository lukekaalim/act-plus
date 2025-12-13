import { Component, h, Node } from "@lukekaalim/act";
import { CoreAPI, DocApp, useDocApp } from "@lukekaalim/act-doc/application";
import { hljs, HLJSBuilder } from "@lukekaalim/act-doc"
import { ReflectionKind, SomeType, Type, TypeParameterReflection } from "typedoc/browser";
import { TypeDocPlugin } from "./plugin";
import { createDeclarationPreviewSyntax } from "./DeclarationPreview";

export const renderTypeSyntax2 = (syntax: HLJSBuilder, doc: DocApp<[TypeDocPlugin]>, type: SomeType) => {
  const recurse = (type: SomeType) => renderTypeSyntax2(syntax, doc, type);
  switch (type.type) {
    case 'mapped':
      syntax
        .text('{')
        .newLine(1)
        .text('[')
        .titleClass(type.parameter)
        .keyword(' in ')
      recurse(type.parameterType)

      if (type.nameType) {
        syntax.keyword(' as ')
        recurse(type.nameType);
      }
      
      syntax.text(']: ');
      recurse(type.templateType);
      syntax.newLine(-1)
      syntax.text('}');
      return;

    case 'indexedAccess':
      recurse(type.objectType);
      syntax.text('[')
      recurse(type.indexType);
      syntax.text(']')
      return;
      
    default:
      return syntax.comment(`<UnsupportedType type="${type.type}" />`);
    case 'intrinsic':
      return syntax.builtIn(type.name);
    case 'literal':
      switch (typeof type.value) {
        case 'string':
        case 'symbol':
          syntax.string(`"${type.value}"`);
          return;
        case 'number':
        case 'bigint':
          return syntax.number(type.value.toString());
        case 'boolean':
        case 'function':
          syntax.text(type.value.toString());
          return;
        case 'object':
          return syntax.builtIn('null');
        case 'undefined':
          return syntax.builtIn('undefined');
        default:
          return;
      }
    case 'reflection':
      if (type.declaration.type) {
        recurse(type.declaration.type);
        return;
      } else {
        createDeclarationPreviewSyntax(doc, syntax, type.declaration);
        return;
      }
      //return syntax.titleClass(type.declaration.getFullName());
    case 'tuple':
      syntax.text('[');
      for (let i  = 0; i < type.elements.length; i++) {
        recurse(type.elements[i]);
        if (i !== type.elements.length - 1) {
          syntax.text(',');
        }
      }
      syntax.text(']');
      return;
    case 'reference':
      //const url = doc.typedoc.getLinkForType(type);
      syntax.titleClass(type.name);

      //lastLine.push(h(hljs.titleClass, {}, h('a', { href: "https://example.com", style: { color: 'inherit' } }, type.name)));

      if (type.typeArguments) {
        syntax.text('<')
        for (let i = 0; i < type.typeArguments.length; i++) {
          recurse(type.typeArguments[i]);
          if (i !== type.typeArguments.length - 1) {
            syntax.text(', ')
          }
        }
        syntax.text('>')
      }
      return;
    case 'intersection':
      for (let i = 0; i < type.types.length; i++) {
        recurse(type.types[i]);
        if (i !== type.types.length - 1)
          syntax.text(' & ')
      }
      return;
  }
}

export const renderTypeSyntax = (
  doc: DocApp<[TypeDocPlugin]>,
  name: string,
  rootType: SomeType,
  parameters: TypeParameterReflection[] = []
): Node[][] => {
  let lastLine: Node[] = []
  const lines: Node[][] = [lastLine];
  let depth = 0;

  const newLine = (depthMod = 0) => {
    lastLine = [];
    lines.push(lastLine);
    depth += depthMod;
    lastLine.push(Array.from({ length: depth }).map(() => ' '));
  }

  const run = (type: SomeType) => {
    switch (type.type) {
      case 'mapped':
        lastLine.push('{');
        newLine(1);
        lastLine.push(' [', h(hljs.titleClass, {}, type.parameter), h(hljs.keyword, {}, ' in '));
        run(type.parameterType);
        if (type.nameType) {
          lastLine.push(h(hljs.keyword, {}, ' as '));
          run(type.nameType);
        }
        
        lastLine.push(']: ');
        run(type.templateType);
        newLine(-1);
        lastLine.push('}');
        return;
      case 'indexedAccess':
        run(type.objectType);
        lastLine.push('[');
        run(type.indexType);
        lastLine.push(']');
        return;
      default:
        return lastLine.push(h(hljs.comment, {}, `<UnsupportedType type="${type.type}" />`))
      case 'intrinsic':
        return lastLine.push(h(hljs.builtIn, {}, type.name))
      case 'literal':
        switch (typeof type.value) {
          case 'string':
          case 'symbol':
            return lastLine.push(h(hljs.string, {}, [`"`, type.value, `"`]));
          case 'number':
          case 'bigint':
          case 'boolean':
          case 'function':
            return lastLine.push(h('span', {}, [type.value.toString()]));
          case 'object':
            return lastLine.push(h('span', {}, ["null"]));
          case 'undefined':
            return lastLine.push(h('span', {}, [typeof type.value]));
          default:
            return;
        }
      case 'reflection':
        return lastLine.push(h('span', {}, type.declaration.getFullName()));
      case 'tuple':
        lastLine.push('[');
        for (let i  = 0; i < type.elements.length; i++) {
          run(type.elements[i]);
          if (i !== type.elements.length - 1) {
            lastLine.push(',');
          }
        }
        lastLine.push(']');
        return;
      case 'reference':
        //const url = doc.typedoc.getLinkForType(type);
        lastLine.push(h(hljs.titleClass, {}, h('a', { href: "https://example.com", style: { color: 'inherit' } }, type.name)));

        if (type.typeArguments) {
          lastLine.push(h('span', { className: hljs.symbol }, '<'));
          for (let i = 0; i < type.typeArguments.length; i++) {
            run(type.typeArguments[i]);
            if (i !== type.typeArguments.length - 1) {
              lastLine.push(', ')
            }
          }
          lastLine.push(h('span', { className: hljs.symbol }, '>'));
        }
        return;
      case 'intersection':
        for (let i = 0; i < type.types.length; i++) {
          run(type.types[i]);
          if (i !== type.types.length - 1)
            lastLine.push(' & ')
        }
        return;
    }
  }

  lastLine.push([h(hljs.keyword, {}, 'type '), h(hljs.type, {}, name)])
  if (parameters.length > 0) {
    lastLine.push('<');
    for (let i = 0; i < parameters.length; i++) {
      const parameter = parameters[i];
      lastLine.push(h(hljs.titleClass, {}, parameter.name));
      if (parameter.type) {
        lastLine.push(h(hljs.keyword, {}, ' extends '));
        run(parameter.type);
      }
      if (parameter.default) {
        lastLine.push(' = ');
        run(parameter.default);
      }
      if (i !== parameters.length - 1) {
        lastLine.push(', ');
      }
    }
    lastLine.push('>');
  }
  lastLine.push(' = ');

  run(rootType)

  return lines;
}

export type TypeRendererProps = {
  type: SomeType
};

export const TypeRenderer: Component<TypeRendererProps> = ({ type }) => {
  const doc = useDocApp([TypeDocPlugin]);

  switch (type.type) {
    case 'intersection': {
      return type.types.map((subType, index) => {
        const lastType = index === type.types.length - 1;
        return [
          h(TypeRenderer, { type: subType }), !lastType && ' & '];
      })
    }
    case 'reference': {
      return h('a', { href: '' }, type.name)
    }
    default:
      console.info(type)
  }
  return type.toString();
}