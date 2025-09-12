import { Component, h } from "@lukekaalim/act";
import { defaultMdxComponentMap } from "../article/MDXContext";
import { DemoStore, DemoSubject } from "../../lib/demo";

import classes from './Demo.module.css'


export type DemoProps = {
  subject: DemoSubject,
}

export const Demo: Component<DemoProps> = ({ subject }) => {
  return h('div', { className: classes.container }, [
    h(subject)
  ]);
};

defaultMdxComponentMap.set('Demo', ({ attributes }) => {
  const subjectName = attributes['subject'] as string;
  const subject = DemoStore.global.subjects.get(subjectName);
  if (!subject)
    return `Demo of name "${subjectName}" not found`;

  return h(Demo, { subject });
})