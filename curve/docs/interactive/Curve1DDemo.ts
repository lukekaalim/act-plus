import { Component, h, useMemo, useRef, useState } from "@lukekaalim/act";
import { Animation1D, Vector2D, Vector } from "@lukekaalim/act-curve";
import { assertRefs, Circle, EditablePoint, LinePath, PositiveAxes, ZeroBasedAxes } from "@lukekaalim/act-graphit";
import { InteractiveDemo } from ".";
import { ProgressAnim } from "./progress";

export const Curve1DDemo: InteractiveDemo = ({ position, size }) => {
  const [a, setA] = useState(Vector2D.create(0, 50));
  const [b, setB] = useState(Vector2D.create(100, 50));
  const [c, setC] = useState(Vector2D.create(200, 50));
  const [d, setD] = useState(Vector2D.create(300, 50));

  const { progress } = ProgressAnim.useCurrent();

  ProgressAnim.useCallback(({ setCallback }) => {
    const { tX, tXY, text, tXTText } = assertRefs({ tX: tXRef, tXY: tXYRef, text: textRef, tXTText: tXYTextRef });
    const svg = text.ownerSVGElement || (() => { throw new Error() })()

    const textX = svg.createSVGLength()
    const tXYTextX = svg.createSVGLength()
    const tXYTextY = svg.createSVGLength()

    text.x.baseVal.initialize(textX);
    tXTText.x.baseVal.initialize(tXYTextX)
    tXTText.y.baseVal.initialize(tXYTextY)

    setCallback(({ progress }) => {
      const point = Animation1D.CurveAPI.curve4(a, b, c, d, progress);

      tX.cx.baseVal.value = point.x;
      tXY.cx.baseVal.value = point.x;
      tXY.cy.baseVal.value = progress * 300;

      textX.value = point.x + 15;

      text.textContent = point.x.toFixed();
      tXTText.textContent = (progress * 100).toFixed() + '%'

      tXYTextX.value = point.x + 15;
      tXYTextY.value = progress * 300;
    });
  }, [a, b, c, d]);

  const tXRef = useRef<SVGCircleElement | null>(null);
  const tXYRef = useRef<SVGCircleElement | null>(null);
  const textRef = useRef<SVGTextElement | null>(null);
  const tXYTextRef = useRef<SVGTextElement | null>(null);

  const point = Animation1D.CurveAPI.curve4(a, b, c, d, progress);


  const calcSpeedPoint = useMemo(() => (progress: number): Vector<2> => {
    return { y: progress * 300, x: Animation1D.CurveAPI.curve4(a, b, c, d, progress).x }
  }, [a, b, c, d]);

  const axesLabels = {
    y: 'Time',
    x: 'Position'
  }

  return h(PositiveAxes, { position, size }, [
    h(LinePath, { calcPoint: calcSpeedPoint }),
    h(Circle, {
      ref: tXRef,
      cx: point.x,
      cy: 100,
      r: 10,
      fill: 'white',
      stroke: 'black'
    }),
    h(Circle, {
      ref: tXYRef,
      cx: calcSpeedPoint(progress).x,
      cy: calcSpeedPoint(progress).y,
      r: 5,
      fill: 'white',
      stroke: 'black'
    }),
    h('text', {
      ref: textRef,
      x: point.x + 15,
      y: 100 - 15,
    }, `${point.x.toFixed()}`),
    h('text', { ref: tXYTextRef, }),
    h(EditablePoint, { point: { x: a.x, y: 0 }, onPointEdit: setA }, h('text', {}, a.x)),
    h(EditablePoint, { point: { x: b.x, y: 0 }, onPointEdit: setB }, h('text', {}, b.x)),
    h(EditablePoint, { point: { x: c.x, y: 0 }, onPointEdit: setC }, h('text', {}, c.x)),
    h(EditablePoint, { point: { x: d.x, y: 0 }, onPointEdit: setD }, h('text', {}, d.x)),
  ])
}