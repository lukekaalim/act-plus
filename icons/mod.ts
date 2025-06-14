import { Component, h } from "@lukekaalim/act";
import classes from './mod.module.css'

export type SVGRepoProps = {
  /** the id and name, i.e.: `535142/aquarius` */
  key: string,
  style?: Record<string, string>
};

export const SVGRepo: Component<SVGRepoProps> = ({ key, style }) => {
  return h('img', {
    style,
    className: classes.icon,
    src: `https://www.svgrepo.com/download/${key}.svg`,
  })
}