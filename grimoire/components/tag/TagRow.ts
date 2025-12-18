import { Component, h } from "@lukekaalim/act";
import classes from './TagRow.module.css';
import { Tag } from "../../lib";
import { TagPill } from "./TagPill";

export type TagRowProps = {
  tags: Tag[],
}

export const TagRow: Component<TagRowProps> = ({ tags }) => {
  return h('ul', { className: classes.tagList }, tags.map((tag) => {
    return h('li', { key: tag.key, className: classes.tagEntry },
      h(TagPill, { tag }))
  }))
};
