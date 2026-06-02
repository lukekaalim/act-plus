import solidBlackArrow from './solid-black-arrow.png';
import solidWhiteArrow from './solid-white-arrow.png';
import solidBlackHouse from './solid-black-house.png';
import classes from './index.module.css';


import { Component, h } from '@lukekaalim/act';

export const icons = {
  solid: {
    black: {
      house: solidBlackHouse,
      arrow: solidBlackArrow
    },
    white: {
      arrow: solidWhiteArrow
    }
  }
}

export type IconAndLabelProps = {
  iconURL: string | URL,
  imgStyle?: Record<string, string>,
}

export const IconAndLabel: Component<IconAndLabelProps> = ({ iconURL, children, imgStyle = {} }) => {
  const finalSrc = typeof iconURL === 'string' ? iconURL : iconURL.href;

  return h('span', { className: classes.iconAndLabel }, [
    h('img', { src: finalSrc, style: imgStyle } ),
    h('span', {}, children)
  ])
}