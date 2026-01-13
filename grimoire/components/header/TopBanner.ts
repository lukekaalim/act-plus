import { Component, h, Node } from "@lukekaalim/act";
import { Link, WebLink } from "@lukekaalim/act-router";

import classes from './TopBanner.module.css';

export type TopBannerProps = {
  logoLink: Link,

  topLevelLinks?: Link[],

  endContext?: Node,
};

export const TopBanner: Component<TopBannerProps> = ({
  logoLink,
  topLevelLinks = [],
  endContext = null
}) => {
  return h('div', { className: classes.container }, [
    h(WebLink, { link: logoLink, className: classes.logo }),
    h('div', { className: classes.verticalLineSeperator }),
    topLevelLinks.map(link => {
      return h(WebLink, { link, className: classes.topLevelLink });
    }),
    h('div', { className: classes.blankSeperator }),
    endContext && h('div', { className: classes.endContent }, endContext)
  ])
};

export type TopBanner2Props = {
  home?: Node,
  nav?: Node[],

  endContent?: Node,
}

export const TopBanner2: Component<TopBanner2Props> = ({ home, nav, endContent }) => {
  return h('nav', { className: classes.topBannerContainer }, [
    !!home && [
      home,
      !!(nav || endContent) && h('div', { className: classes.verticalLineSeparator })
    ],
    nav || null,
    !!endContent && [
      h('div', { className: classes.blankSeparator }),
      endContent,
    ],
  ])
}