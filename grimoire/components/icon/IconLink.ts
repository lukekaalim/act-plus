import { Component, h } from '@lukekaalim/act';
import classes from './index.module.css';

import solidBlackArrow from './solid-black-arrow.svg';
import solidWhiteArrow from './solid-white-arrow.svg';

export type IconLinkProps = {
  href: string
}

export const IconLink: Component<IconLinkProps> = ({ href, children }) => {
  return h('a', {
    className: classes.iconLink,
    href,
  }, [h('img', { src: solidBlackArrow } ), h('span', {}, children)])
}