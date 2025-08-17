import { Component, h } from "@lukekaalim/act"

export type BannerLinkProps = {

};

const BannerLink: Component<BannerLinkProps> = ({ children }) => {
  return h('span', { style: {
      'display': 'flex',
      'font-size': '18px',
      'white-space': 'pre',
      'margin': 'auto',
      'padding': '0 8px',
      color: 'white'
    } }, children)
}