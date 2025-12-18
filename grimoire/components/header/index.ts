import { Component, h } from '@lukekaalim/act';

export type IconTextBannerLogoProps = {
  iconURL: string,
  name: string,
};

export const IconTextBannerLogo: Component<IconTextBannerLogoProps> = ({ name, iconURL }) => {
  return [
    h('img', {
      src: iconURL,
      style: { 'border-radius': '8px', background: 'white', margin: '8px' }
    }),
    h('span', {}, name)
  ]
}
export const BannerLink: Component = ({ children }) => {
  return h('span', { style: {
      'display': 'flex',
      'font-size': '18px',
      'white-space': 'pre',
      'margin': 'auto',
      'padding': '0 8px',
      color: 'white',
  }}, children)
}

export * from './TopBanner';