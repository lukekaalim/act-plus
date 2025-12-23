import { DocApp, FullSizePage } from "@lukekaalim/grimoire";
import { TypeDocPlugin } from "@lukekaalim/grimoire-ts";

import reflection from 'typedoc:../mod.ts';
import readmeMd from '../readme.md?raw';
import { CurveDemo } from "./mod.doc";
import { h } from "@lukekaalim/act";

export const buildCurveDocs = (doc: DocApp<[TypeDocPlugin]>) => {
  doc.typedoc.addProjectJSON('@lukekaalim/act-curve', reflection);

  doc.article.add('curve.readme', readmeMd, '/packages/@lukekaalim/act-curve/api');
  doc.route.add('/packages/@lukekaalim/act-curve', h(FullSizePage, {}, h(CurveDemo, { offset: { x: 600, y: 100} })));

  doc.demos.add('CurveDemo', () => h(CurveDemo, {}));
}