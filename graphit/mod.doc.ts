import { Component, h, useState } from "@lukekaalim/act";
import { DocApp, MarkdownArticle } from "@lukekaalim/grimoire";
import { MarkdownComponent } from "@lukekaalim/act-markdown";
import { CartesianSpace } from "./CartesianSpace";
import { LinePath } from "./LinePath";
import { TypeDocPlugin } from "@lukekaalim/grimoire-ts";

import readmeMd from './readme.md?raw';
import projectJSON from 'typedoc:index.ts';

const CartesianSpaceDemo: Component = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  return [
    h('div', { style: {
      display: 'flex'
    }}, [
      h('input', { 
        type: 'range',
        min: 0,
        max: 100,
        value: x,
        onInput: (e: InputEvent) => (setX((e.target as HTMLInputElement).valueAsNumber))
      }),
      h('input', { 
        type: 'range',
        min: 0,
        max: 100,
        value: y,
        onInput: (e: InputEvent) => (setY((e.target as HTMLInputElement).valueAsNumber))
      }),
    ]),
    h('div', { style: {
      height: '400px',
      display: 'flex'
    }}, h(CartesianSpace, { offset: { x, y } }),)
  ];
}

const LinePathDemo = () => {
  return h('div', { style: {
    height: '400px',
    display: 'flex',
  }}, h(CartesianSpace, { offset: { x: 0, y: 0 } }, [
    h(LinePath, {
      stroke: 'red',
      strokeWidth: 2,
      calcPoint(progress) {
        return {
          x: (Math.sin(progress * Math.PI * 2) * 100) + 150,
          y: (Math.cos(progress * Math.PI * 2) * 100) + 150
        }
      },
      resolution: 16
    }),
    h(LinePath, {
      stroke: 'red',
      strokeWidth: 2,
      calcPoint(progress) {
        return {
          x: (progress * 300) + 300,
          y: (Math.cos((progress + (1/8)) * Math.PI * 4) * 100) + 150
        }
      },
      resolution: 32
    }),
  ]))
}

export default h(MarkdownArticle, {
  content: await import('./readme.md?raw').then(m => m.default),
  //options: {
  //  components: {
  //    CartesianSpaceDemo,
  //    LinePathDemo
  //  }
  //}
})

export const buildGraphitDocs = (doc: DocApp<[TypeDocPlugin]>) => {
  doc.typedoc.addProjectJSON('@lukekaalim/act-graphit', projectJSON);

  doc.article.add('graphit.readme', readmeMd, '/packages/@lukekaalim/act-graphit')

  doc.demos.add('CartesianSpaceDemo', CartesianSpaceDemo)
  doc.demos.add('LinePathDemo', LinePathDemo)
}