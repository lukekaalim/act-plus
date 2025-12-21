import { Component, h, Node, useEffect, useRef, useState } from "@lukekaalim/act";
import { SVG } from '@lukekaalim/act-web';
import { DocApp, MarkdownArticle } from "@lukekaalim/grimoire";

import { CartesianSpace } from "./CartesianSpace";
import { LinePath } from "./LinePath";
import { TypeDocPlugin } from "@lukekaalim/grimoire-ts";

import readmeMd from './readme.md?raw';
import structuresMd from './structures.md?raw';
import projectJSON from 'typedoc:index.ts';
import { Ring } from "./structures";
import { Vector2D } from "@lukekaalim/act-curve";

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
  doc.article.add('graphit.structs', structuresMd, '/packages/@lukekaalim/act-graphit/structures');

  doc.demos.add('CartesianSpaceDemo', CartesianSpaceDemo)
  doc.demos.add('LinePathDemo', LinePathDemo)
  doc.demos.add('Ring', () => {
    let output: Node[] = [];

    const a = new Ring<number>(8);
    const b = new Ring<number>(8);
    const c = new Ring<number>(8);

    for (let i = 1; i <= 12; i++) {
      a.push(i)
    }
    b.index = 7
    for (let i = 1; i <= 5; i++) {
      b.push(i)
    }
    c.index = 1;
    for (let i = 1; i <= 3; i++) {
      c.push(i)
    }

    output.push(Array.from(a.map(v => h('span', { style: { padding: '2px' }}, v))));
    output.push(Array.from(b.map(v => h('span', { style: { padding: '2px' }}, v))));
    output.push(Array.from(c.map(v => h('span', { style: { padding: '2px' }}, v))));

    return h('ol', {}, output.map(line => h('li', {}, line)))
  });

  doc.demos.add('Worm', () => {
    const ringRef = useRef(new Ring<Vector2D>(128))
    const [points, setPoints] = useState('')

    const [offset, setOffset] = useState(Vector2D.ZERO);

    useEffect(() => {
      let velocity = Vector2D.create(0);
      let position = Vector2D.create(0);

      const id = setInterval(() => {
        velocity.x += (Math.random() * 8) - 4
        velocity.y += (Math.random() * 8) - 4;

        velocity = Vector2D.ScalarAPI.multiply(velocity, (1/Vector2D.ScalarAPI.length(velocity) * 5));

        position.x += velocity.x;
        position.y += velocity.y;

        ringRef.current.push({ x: position.x, y: position.y });
        setOffset(Vector2D.add(Vector2D.subtract(Vector2D.ZERO, position), { x: 256, y: 256 }));

        setPoints(
          Array.from(ringRef.current.map(point => `${point.x.toFixed(0)},${point.y.toFixed(0)}`))
            .join(' ')
        )
      }, 50);
      return () => clearInterval(id);
    }, [])



    return h(CartesianSpace, { style: { width: '100%', height: '512px' }, offset }, [
      h('polyline', { points, fill: 'none', stroke: 'black', 'stroke-width': '2px' })
    ])
  });
}