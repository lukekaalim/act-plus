import { useGrimoireMdastRenderer } from "@lukekaalim/grimoire";
import { calcNodeLayouts, LayoutNode } from "../layout";
import { parser } from "@lukekaalim/act-markdown";
import { Root } from 'mdast';
import { Component, h, Node, useEffect, useRef, useState } from "@lukekaalim/act";
import { HTML } from "@lukekaalim/act-web";
import { Rect, Vector } from "@lukekaalim/act-graphit";
import { Curve1DDemo } from "./Curve1DDemo";
import { ProgressAnim } from "./progress";

export type InteractiveDemo = Component<{
  position: Vector<2>,
  size: Vector<2>,
}>

const sections = await Promise.all([
  import('./0.intro.md?raw'),
  import('./1.animation_as_curves.md?raw'),
  import('./2.bezier_dimensions.md?raw'),
  import('./3.curves_driving_values.md?raw'),
  import('./4.continuing_splines.md?raw'),
  import('./4.position_velocity_acceleration.md?raw'),
  import('./lerp_to_curve.md?raw'),
  import('./transitioning_curves.md?raw'),
].map(p => p.then(module => parser.parse(module.default))))

const Aside = ({ root, position, size }: { root: Root, position: Vector<2>, size: Vector<2> }) => {
  const renderer = useGrimoireMdastRenderer();

  const style = {
    background: 'white',
    padding: '16px',
    margin: '8px',
    'border-radius': '8px',
    'box-shadow': '#0e2b5182 0px 2px 8px 0px'
  }

  return h('foreignObject', {
    x: position.x, y: position.y,
    width: size.x, height: size.y,
  }, h(HTML, {}, h('section', { style } , renderer(root))))
}

const layout_map = calcNodeLayouts(LayoutNode.list('root', 'vertical', 'center', [
  LayoutNode.rect('0', { x: 800, y: 400 }),
  LayoutNode.rect('spacer', { x: 0, y: 100 }),
  LayoutNode.list('1.container', 'horizontal', 'start', [
    LayoutNode.rect('1', { x: 800, y: 600 }),
    LayoutNode.rect('spacer', { x: 50, y: 0 }),
    LayoutNode.rect('1.demo', { x: 300, y: 300 }),
  ]),
  LayoutNode.rect('spacer', { x: 0, y: 100 }),
  LayoutNode.rect('2', { x: 800, y: 400 }),
  LayoutNode.rect('spacer', { x: 0, y: 100 }),
  LayoutNode.rect('3', { x: 800, y: 400 }),
  LayoutNode.rect('spacer', { x: 0, y: 100 }),
  LayoutNode.rect('4', { x: 800, y: 400 }),
  LayoutNode.rect('spacer', { x: 0, y: 100 }),
  LayoutNode.rect('5', { x: 800, y: 400 }),
  LayoutNode.rect('spacer', { x: 0, y: 100 }),
  LayoutNode.rect('6', { x: 800, y: 400 }),
  LayoutNode.rect('spacer', { x: 0, y: 100 }),
  LayoutNode.rect('7', { x: 800, y: 400 }),
]), { x: 50, y: 50 });

const all_content: Record<string, InteractiveDemo> = {
  '0': ({ position, size }) => h(Aside, { root: sections[0], position, size }),

  '1': ({ position, size }) => h(Aside, { root: sections[1], position, size }),
  '1.demo': Curve1DDemo,

  '2': ({ position, size }) => h(Aside, { root: sections[2], position, size }),
  '3': ({ position, size }) => h(Aside, { root: sections[3], position, size }),
  '4': ({ position, size }) => h(Aside, { root: sections[4], position, size }),
  '5': ({ position, size }) => h(Aside, { root: sections[5], position, size }),
  '6': ({ position, size }) => h(Aside, { root: sections[6], position, size }),
  '7': ({ position, size }) => h(Aside, { root: sections[7], position, size }),
}

export const InteractiveGuide = () => {
  const [progress, setProgress] = useState(0.5);

  const progressController =  useRef(() => ProgressAnim.createController()).current;

  useEffect(() => {
    const id = setInterval(() => {
      progressController.run({ progress: (performance.now() / 5000) % 1 })
    }, 10)
    return () => clearInterval(id);
  }, [])



  return h(ProgressAnim.Provider, { controller: progressController }, [

    [...layout_map.keys()].map(key => {
      const placement = layout_map.get(key);
      if (!placement)
        return null;
      const { position, size } = placement;

      return null;

      return h(Rect, { position, size, stroke: 'red', strokeDashArray: [4], fill: 'none' })
    }),

    [...layout_map.keys()].map(key => {
      const placement = layout_map.get(key);
      const content = all_content[key];
      if (!placement || !content)
        return null;

      return h(content, { position: placement.position, size: placement.size })
    }),
  ]);
};
