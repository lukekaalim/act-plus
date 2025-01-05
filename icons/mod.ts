import { Component, h } from "@lukekaalim/act";
import classes from './mod.module.css'

export type SVGRepoProps = {
  /** the id and name, i.e.: `535142/aquarius` */
  key: string,
};

export const SVGRepo: Component<SVGRepoProps> = ({ key }) => {
  return h('img', {
    className: classes.icon,
    src: `https://www.svgrepo.com/download/${key}.svg`,
  })
}