import { Component, h, Node } from "@lukekaalim/act";
import classes from './Hero.module.css';

export type HeroProps = {
  backgroundContent: Node,
  blurbContent: Node
}

export const Hero: Component<HeroProps> = ({ backgroundContent, blurbContent }) => {
  return h('div', { className: classes.container }, [
    h('div', { className: classes.background },
        backgroundContent),
    h('div', { className: classes.blurb },
        blurbContent)
  ])
};
