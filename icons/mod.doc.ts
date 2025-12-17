import { h, useEffect, useRef } from "@lukekaalim/act";
import { MarkdownArticle } from "@lukekaalim/grimoire";
import md from './readme.md?raw';
import { SVGRepo } from "./mod";
import { MarkdownComponent } from "@lukekaalim/act-markdown";

const SVGRepoDemo: MarkdownComponent = (props) => {
  const href = `https://www.svgrepo.com/svg/${props.attributes.key}`;
  return h('a', { href, style: { fontSize: '48px', display: 'flex', justifyContent: 'center' } },
    h(SVGRepo, { key: props.attributes.key as string }));
}

export default h(MarkdownArticle, {
  content: md,
  //options: { inlineComponents: { SVGRepoDemo }}
});