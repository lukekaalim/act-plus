import { Component, h } from "@lukekaalim/act";
import { SVG } from '@lukekaalim/act-web';

import classes from './Demo.module.css'
import { DemoFrameComponent, MDXComponent, useDocApp } from "../../application";
import { InlineErrorBox } from "../debug/ErrorBox";


export const DefaultDemoFrame: DemoFrameComponent = ({ children, demo }) => {
  return [
    h('span', { style: {
      background: '#3057E1', 'border-radius': '4px 4px 0 0', padding: '4px 8px',
      'font-size': '14px',
      'color': 'white',
    }}, ['Demo: ', demo.key]),
    h('div', { className: classes.container }, [
      h(SVG, {}, [
        h('svg', { style: { position: 'absolute', width: '100%', height: '100%', left: 0, top: 0, 'z-index': '0' } }, [
          h('defs', {}, [
            h('pattern', { id: `grid`, width: '80', height: '80', 'patternUnits': 'userSpaceOnUse', x: '40px', y: '40px' }, [
              //  <path d="M 80 0 L 0 0 0 80" fill="none" stroke="gray" stroke-width="1"/>
              h('path', { d: `M 80 0 L 0 0 0 80`, fill: 'none', stroke: '#4A6DE5', [`stroke-width`]: '6px' })
            ])
          ]),
          h('rect', { width: '100%', height: '100%', fill: '#3057E1' }),
          h('rect', { width: '100%', height: '100%', fill: `url(#grid)` })
        ]),
      ]),
      h('div', { style: {
        'z-index': 1, position: 'relative',
        margin: '0 -1em',
        resize: 'both',
        overflow: 'hidden',
        background: 'white', padding: '1em',
        'box-shadow': '#4846773d 0px 0px 8px 8px',
        border: '3px solid #4A6DE5', 'border-radius': '8px'
      }, 'data-ignore-navtree': true },
        children,
      ),
    ])
  ];
};

export const DemoMDX: MDXComponent = ({ attributes }) => {
  const frameKey = attributes["frame"];
  const demoKey = attributes["demo"];

  if (!demoKey)
    return h(InlineErrorBox, {}, `❕ DemoMDX missing "demo" attribute`);

  const doc = useDocApp([]);
  const demo = doc.demos.demos.find(d => d.key === demoKey);
  if (!demo)
    return h(InlineErrorBox, {}, `❕ DemoMDX can't find demo "${demoKey}"`);
  
  const frame = doc.demos.frames.find(f => f.key === frameKey) || doc.demos.defaultFrame;

  return h(frame.component, { demo }, h(demo.component));
}