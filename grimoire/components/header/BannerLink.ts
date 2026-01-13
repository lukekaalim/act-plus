import { Component, h } from "@lukekaalim/act"
import classes from './BannerLink.module.css';

export type BannerLinkProps = {
  link: string | URL,
};

export const BannerLink: Component<BannerLinkProps> = ({ children, link }) => {
  return h('div', { className: classes.bannerLink },
    h('a', {  href: typeof link === 'string' ? link : link.href }, children)
  )
}