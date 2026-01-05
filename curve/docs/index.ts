import { DocApp, FullSizePage } from "@lukekaalim/grimoire";
import { TypeDocPlugin } from "@lukekaalim/grimoire-ts";

import reflection from 'typedoc:../mod.ts';
import readmeMd from '../readme.md?raw';
import { CurveDemo } from "./mod.doc";
import { h, useMemo } from "@lukekaalim/act";
import { CartesianSpace, Rect, Vector } from "@lukekaalim/act-graphit";
import { calcNodeLayouts, LayoutNode } from "./layout";
import { Vector2D } from "../vectors";
import { InteractiveGuide } from "./interactive";

export const buildCurveDocs = (doc: DocApp<[TypeDocPlugin]>) => {
  doc.typedoc.addProjectJSON('@lukekaalim/act-curve', reflection);

  doc.article.add('curve.readme', readmeMd, '/packages/@lukekaalim/act-curve/api');
  doc.route.add('/packages/@lukekaalim/act-curve', h(FullSizePage, {}, h(CurveDemo, { offset: { x: 600, y: 100} })));

  doc.route.add('/packages/@lukekaalim/act-curve/guide', h(FullSizePage, {}, h(CartesianSpace, {}, h(InteractiveGuide))));

  doc.demos.add('CurveDemo', () => h(CurveDemo, {}));

  doc.route.add('/layout-test', h(LayoutTest))
}

const layout = LayoutNode.list('root', 'vertical', 'center', [
  LayoutNode.list('top', 'horizontal', 'center', [
    LayoutNode.rect('square_1', { x: 100, y: 100 }),
    LayoutNode.rect('square_2', { x: 100, y: 200 }),
    LayoutNode.rect('square_3', { x: 200, y: 400 }),
    LayoutNode.rect('square_4', { x: 100, y: 100 }),
  ]),
  LayoutNode.list('bottom', 'horizontal', 'center', [
    LayoutNode.rect('square_5', { x: 200, y: 200 }),
    LayoutNode.rect('square_6', { x: 400, y: 50 }),
  ]),
])

const LayoutTest = () => {
  const layouts = useMemo(() => {
    return calcNodeLayouts(layout, Vector2D.ZERO);

  }, []);
  return h(FullSizePage, {}, [
    h(CartesianSpace, {}, [ 
      [...layouts.keys()].map(id => {
        const layout = layouts.get(id);
        if (!layout)
          return (console.warn('Missing id', id), null);

        const center = {
          x:  layout.position.x + (layout.size.x / 2),
          y:  layout.position.y + (layout.size.y / 2)
        }

        return [
          h(Rect, { position: layout.position, size: layout.size, stroke: 'red', fill: 'none', strokeWidth: 2 }),

          h('text', { x: center.x, y: center.y }, id)
        ]
      })

    ])
  ])
}