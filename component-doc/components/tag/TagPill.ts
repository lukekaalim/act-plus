import { Component, h, useMemo } from "@lukekaalim/act";
import { Tag } from "../../lib/tag";

import classes from './TagPill.module.css';
import Color from "color";

export type TagPillProps = {
  tag: Tag
}

export const TagPill: Component<TagPillProps> = ({ tag }) => {
  const [dark, bright] = useMemo(() => [
    new Color(tag.color),
    new Color(tag.color).lighten(0.3),
  ], [tag.color]);

  return h('div', { className: classes.tag, style: { '--dark': dark.hex(), '--bright': bright.hex() } },
    '# ' + tag.display);
};
