import { h, useRef, useState } from "@lukekaalim/act";
import { hs, HTML, SVG } from "@lukekaalim/act-web";

import { CartesianSpace } from "@lukekaalim/act-graphit/CartesianSpace";
import { LinePath } from "@lukekaalim/act-graphit/LinePath";
import { EditablePoint } from "@lukekaalim/act-graphit/EditablePoint";
import { Vector } from "@lukekaalim/act-graphit/vector";
import {
  Animation1D,
  Curve2D,
  lerp,
  useAnimatedValue,
  useSpan,
  //useBezierAnimation,
  //curve3, curve4, lerp
} from "../mod";
import classes from './index.module.css';

type Vector2 = { x: number, y: number };
const Vector2 = {
  new: (x: number, y: number): Vector2 => ({ x, y }),
  scalar: {
    add: (a: Vector2, b: number) => Vector2.new(a.x + b, a.y + b),
    multiply: (a: Vector2, b: number) => Vector2.new(a.x * b, a.y * b),
  }
}
type Line2 = { start: Vector2, end: Vector2 };
const Line2 = {
  new: (start: Vector2, end: Vector2): Line2 => ({ start, end }),
} 

const Curve4Demo = ({ progress }: { progress: number }) => {
  const [start, setStart] = useState(Vector2.new(0, 0));
  const [midA, setMidA] = useState(Vector2.new(100, 300));
  const [midB, setMidB] = useState(Vector2.new(500, 500));
  const [end, setEnd] = useState(Vector2.new(600, 600));


  const [altMidB, setAltMidB] = useState(Vector2.new(700, 700));
  const [altEnd, setAltEnd] = useState(Vector2.new(600, 800));

  const interpA = {
    x: lerp(start.x, midA.x, progress/100),
    y: lerp(start.y, midA.y, progress/100),
  };
  const interpB = {
    x: lerp(midA.x, midB.x, progress/100),
    y: lerp(midA.y, midB.y, progress/100),
  };
  const interpC = {
    x: lerp(midB.x, end.x, progress/100),
    y: lerp(midB.y, end.y, progress/100),
  };
  const interpD = {
    x: lerp(interpA.x, interpB.x, progress/100),
    y: lerp(interpA.y, interpB.y, progress/100),
  }
  const interpE = {
    x: lerp(interpB.x, interpC.x, progress/100),
    y: lerp(interpB.y, interpC.y, progress/100),
  }
  const interpF = {
    x: lerp(interpD.x, interpE.x, progress/100),
    y: lerp(interpD.y, interpE.y, progress/100),
  }

  return h('g', {  }, [
    h(LinePath, { resolution: 25, strokeWidth: 2, stroke: 'purple', calcPoint(p) {
      let v = Curve2D.curve4(start, midA, midB, end, p);
      return v;
    }, }),
    h(EditablePoint, { point: start, onPointEdit: setStart }),
    h(EditablePoint, { point: midA, onPointEdit: setMidA }),
    h(EditablePoint, { point: midB, onPointEdit: setMidB }),
    h(EditablePoint, { point: end, onPointEdit: setEnd }),

    h(EditablePoint, { point: altMidB, onPointEdit: setAltMidB }),
    h(EditablePoint, { point: altEnd, onPointEdit: setAltEnd }),

    h('line', {
      x1: interpA.x,
      y1: interpA.y,

      x2: interpB.x,
      y2: interpB.y,
      stroke: 'red'
    }),
    h('line', {
      x1: interpB.x,
      y1: interpB.y,

      x2: interpC.x,
      y2: interpC.y,
      stroke: 'red'
    }),
    h('line', {
      x1: interpD.x,
      y1: interpD.y,

      x2: interpE.x,
      y2: interpE.y,
      stroke: 'red'
    }),
    h('circle', {
      cx: interpF.x,
      cy: interpF.y,
      r: 4,
      fill: 'yellow',
      stroke: 'black'
    }),

    h('line', { x1: start.x, y1: start.y, x2: midA.x, y2: midA.y, stroke: 'red' }),
    h('line', { x1: end.x, y1: end.y, x2: midB.x, y2: midB.y, stroke: 'red' }),

    h(LinePath, { resolution: 25, strokeWidth: 2, stroke: 'purple', calcPoint(p) {
      let v = Curve2D.curve4(interpF, interpE, altMidB, altEnd, p);
      return v;
    }, }),

    h(LinePath, { resolution: 25, strokeWidth: 2, stroke: 'purple', calcPoint(p) {
      let v = Curve2D.curve4(interpF, interpE, interpC, end, p);
      v = Vector(2).add(v, { x: 200, y: 0 })
      return v;
    }, }),
    h(LinePath, { resolution: 25, strokeWidth: 2, stroke: 'purple', calcPoint(p) {
      let v = Curve2D.curve4(interpF, interpD, interpA, start, p);
      v = Vector(2).add(v, { x: -200, y: 0 })
      return v;
    }, }),
  ])
}

const Curve3Demo = ({ progress }: { progress: number }) => {
  const [start, setStart] = useState(Vector2.new(0, 0));
  const [mid, setMid] = useState(Vector2.new(100, 500));
  const [end, setEnd] = useState(Vector2.new(600, 600));

  const circleVec = Curve2D.curve3(start, mid, end, progress/100);

  return h('g', {}, [
    h(LinePath, { resolution: 25, strokeWidth: 2, stroke: 'purple', calcPoint(p) {
      let v = Curve2D.curve3(start, mid, end, p);
      return v;
    }, }),
    h('line', {
      x1: lerp(start.x, mid.x, progress/100),
      y1: lerp(start.y, mid.y, progress/100),
      x2: lerp(mid.x, end.x, progress/100),
      y2: lerp(mid.y, end.y, progress/100),
      stroke: 'red'
    }),
    h('circle', {
      cx: circleVec.x,
      cy: circleVec.y,
      r: 4,
      fill: 'yellow',
      stroke: 'black'
    }),


    h(EditablePoint, { point: start, onPointEdit: setStart }),
    h('line', { x1: start.x, y1: start.y, x2: mid.x, y2: mid.y, stroke: 'red' }),
    h(EditablePoint, { point: mid, onPointEdit: setMid }),
    h('line', { x1: mid.x, y1: mid.y, x2: end.x, y2: end.y, stroke: 'blue' }),
    h(EditablePoint, { point: end, onPointEdit: setEnd }),
  ])
}

const AnimDemo = () => {
  const [value, setValue] = useAnimatedValue(0, 200);

  const ref = useRef<SVGCircleElement | null>(null);

  Animation1D.Bezier4.useAnimation(value, ({ x }) => {
    const el = ref.current as SVGCircleElement;
    el.setAttribute('cx', x.toString());
  })

  return h('g', {}, [
    h('foreignObject', { width: 200, height: 30 }, h(HTML, {}, [
      h('button', { onClick: () => setValue(-80, performance.now()) }, 'Left'),
      h('button', { onClick: () => setValue(0, performance.now()) }, 'Middle'),
      h('button', { onClick: () => setValue(80, performance.now()) }, 'Right'),
    ])),
    h('circle', {
      ref,
      cy: 50,
      r: 20,
    })
  ])
}

export const CurveDemo = () => {
  
  const [progress, setProgress] = useState(50);

  return h('div', { className: classes.fullpageSVG }, [
    h('input', { type: 'range', min: 0, max: 100, value: progress, onInput: (e: InputEvent) => setProgress((e.currentTarget as HTMLInputElement).valueAsNumber) }),
    h(CartesianSpace, { offset: { x: 100, y: 100 }}, h('g', {  }, [
      h('foreignObject', { x: 8, y: 0, width: 400, height: 200 }, h(HTML, {}, [
        h('h1', {}, '@lukekaalim/act-curve'),
        h('p', {}, `A lite animation and math libary for @lukekaalim/act`),
      ])),
      h('g', { transform: `translate(0 100)` }, 
        h(Curve3Demo, { progress })),
      h('g', { transform: `translate(0 600)` }, 
        h(Curve4Demo, { progress })),
      h('g', { transform: `translate(500 100)` }, 
        h(AnimDemo)),
    ]))
  ]);
};
