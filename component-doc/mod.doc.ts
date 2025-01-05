import { h, useEffect, useRef } from "@lukekaalim/act";
import { DocMark } from "./DocMark";
import md from './readme.md?raw';

const PrismaticComponent = () => {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el)
      return;
    const animate = () => {
      el.style.background = `hsl(${Date.now() / 5 % 360}deg, 100%, 90%)`;
      id = requestAnimationFrame(animate);
    };
    let id = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(id);
  }, [])

  return h('div', { ref, style: {
    padding: '2em',
  } }, 'A prismatic component!');
};

export default h(DocMark, {
  text: md,
  options: { components: { PrismaticComponent }}
});