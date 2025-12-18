import { Component, h, Node } from "@lukekaalim/act";
import { GridCard } from "./card";

import classes from './Grid3.module.css';

export type Grid3Props = {
  cards: GridCard[],
};

export const Grid3: Component<Grid3Props> = ({ cards }) => {
  return h('nav', { className: classes.container },
    cards.map(card => {
      return h('li', { className: classes.entry, key: card.id },
        h('a', { className: classes.card, href: card.destination.href }, card.content));
    })
  )
}