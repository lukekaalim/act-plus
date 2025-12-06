import { Component, h, Node } from "@lukekaalim/act";
import { useDocApp } from "@lukekaalim/act-doc/application";
import { hljs } from "@lukekaalim/act-doc"
import { SomeType, Type } from "typedoc";
import { TypeDocPlugin } from "./plugin";

export const renderTypeSyntax = (rootType: SomeType): Node[][] => {
  let lastLine: Node[] = []
  const lines: Node[][] = [lastLine];

  const run = (type: SomeType) => {
    switch (type.type) {
      case 'reference':
        lastLine.push(h('a', { classes: hljs.titleClass }, type.name))

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

  run(rootType)

  return lines;
}

export type TypeRendererProps = {
  type: SomeType
};

export const TypeRenderer: Component<TypeRendererProps> = ({ type }) => {
  const api = useDocApp<[TypeDocPlugin]>(["typedoc"]);

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