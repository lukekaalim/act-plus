import { h, useEffect, useMemo, useRef } from "@lukekaalim/act";
import { VerticalNavMenu, VerticalNavMenu2 } from "../components";
import { createNavTreeBuilder, simplifyTree } from "../lib";

export const PrismaticComponent = () => {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el)
      return;
    const animate = () => {
      el.style.background = `hsl(${Date.now() / 5 % 360}deg, 50%, 90%)`;
      el.style.borderColor = `hsl(${(Date.now() / 5 % 360)}deg, 50%, 30%)`;
      id = requestAnimationFrame(animate);
    };
    let id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [])

  return h('div', { ref, style: {
    padding: '2em',
    'border-radius': '1em',
    'border': '8px solid'
  } }, 'A prismatic component!');
};


export const VerticalNavMenuDemo = () => {
  const tree = useMemo(() => {
    const builder = createNavTreeBuilder();

    builder.add('home', 0, 'Home', new URL('https://example.com/='));
    builder.add('about', 1, 'About', new URL('https://example.com/about'));
    builder.add('parent', 1, 'Parent');
    builder.add('ChildA', 2, 'Child A', new URL('https://example.com/parent/childA'));
    builder.add('ChildB', 2, 'Child B', new URL('https://example.com/parent/childB'));
    builder.add('emptyA', 1, 'Left');
    builder.add('emptyB', 2, 'Right');
    builder.add('Visible C', 3, 'Child', new URL('https://example.com/left/right/child'));

    simplifyTree(builder.tree);

    return builder.tree;
  }, []);

  return h(VerticalNavMenu2, { tree })
}