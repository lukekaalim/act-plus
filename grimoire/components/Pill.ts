import { Component, h, Node } from '@lukekaalim/act';
import classNames from './styles.module.css';
import stringHash from '@sindresorhus/string-hash';

export type PillProps = {
  text: string,

  background?: string,

  onClick?(): void,
}

export const Pill: Component<PillProps> = ({ text, background, onClick }) => {

  if (!background)
    background = `hsl(${stringHash(text) % 360}deg 70 40)`

  return h('span', { style: { background }, className: classNames.pill }, text)
};

export type PillListProps = {
  pills: Node[],
}

export const PillList: Component<PillListProps> = ({ pills }) => {
  if (pills.length === 0)
    return null;

  return h('ul', { className: classNames.pillList }, pills.map(pill => {
    return h('li', {}, pill)
  }))
}