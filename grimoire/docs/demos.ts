import { h, useEffect, useRef } from "@lukekaalim/act";

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
