import { Component, h } from "@lukekaalim/act";

import classes from './Demo.module.css'
import { MDXComponent, useDocApp } from "../../application";

export const DefaultDemoFrame: Component = ({ children }) => {
  return [
    'Example:',
    h('div', { className: classes.container }, [
      children
    ])
  ];
};

export const DemoMDX: MDXComponent = ({ attributes }) => {
  const frameKey = attributes["frame"];
  const demoKey = attributes["demo"];

  if (!demoKey)
    throw new Error(`DemoMDX missing "demo" attribute`);

  const doc = useDocApp([]);
  const demo = doc.demos.demos.find(d => d.key === demoKey);
  if (!demo)
    throw new Error(`DemoMDX can't find demo "${demoKey}"`);
  
  const frame = doc.demos.frames.find(f => f.key === frameKey) || doc.demos.defaultFrame;

  return h(frame.component, {}, h(demo.component));
}