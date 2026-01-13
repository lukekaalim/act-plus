import { Component, h } from '@lukekaalim/act';

export type IconTextBannerLogoProps = {
  iconURL: string,
  name: string,
  style?: {},
};

export const IconTextBannerLogo: Component<IconTextBannerLogoProps> = ({ name, iconURL, style: extraStyle = {} }) => {
  return h('span', { style: { display: 'flex', height: '100%', 'flex-direction': 'row', ...extraStyle }}, [
    h('img', {
      src: iconURL,
      style: { 'border-radius': '8px', background: 'white', 'margin': '8px 8px 8px 0'  }
    }),
    h('span', { style: { 'white-space': 'pre', margin: 'auto', color: 'white' }}, name)
  ])
}

export * from './TopBanner';
export * from './BannerLink';
