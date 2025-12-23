import { Component, createContext, h, Node, StateSetter, Updater, useContext, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import { hs, HTML, render, SVG } from "@lukekaalim/act-web";

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
  Vector2D,
  //useBezierAnimation,
  //curve3, curve4, lerp
} from "../mod";
import classes from './index.module.css';
import { MDXComponentEntry, StaticMarkdownArticle, useGrimoireMdastRenderer } from "@lukekaalim/grimoire";
import { parser } from "@lukekaalim/act-markdown";

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

const segments = await Promise.all([
  import('./interactive/0.intro.md?raw'),
  import('./interactive/1.animation_as_curves.md?raw'),
  import('./interactive/2.bezier_dimensions.md?raw'),
].map(p => p.then(r => parser.parse(r.default))))

const Curve3Demo = ({ progress, y }: { progress: number, y: number }) => {
  const [start, setStart] = useState(Vector2.new(50, 50));
  const [mid, setMid] = useState(Vector2.new(150, 150));
  const [end, setEnd] = useState(Vector2.new(250, 50));

  const circleVec = Curve2D.curve3(start, mid, end, progress/100);

  return h(GraphContainer, { position: { x: 0, y }, size: { x: 300, y: 300 }, documentation: h(DocAside, { segmentIndex: 1 }) }, [
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


    h(EditablePoint, { point: start, onPointEdit: setStart }, h('text', {}, `${start.x}, ${start.y}`)),
    h('line', { x1: start.x, y1: start.y, x2: mid.x, y2: mid.y, stroke: 'red' }),
    h(EditablePoint, { point: mid, onPointEdit: setMid }, h('text', {}, `${mid.x}, ${mid.y}`)),
    h('line', { x1: mid.x, y1: mid.y, x2: end.x, y2: end.y, stroke: 'blue' }),
    h(EditablePoint, { point: end, onPointEdit: setEnd }, h('text', {}, `${end.x}, ${end.y}`)),
  ])
}

const Curve1DDemo: Component<{ progress: number, y: number }> = ({ progress, y }) => {
  const [a, setA] = useState(Vector2.new(0, 50));
  const [b, setB] = useState(Vector2.new(100, 50));
  const [c, setC] = useState(Vector2.new(200, 50));
  const [d, setD] = useState(Vector2.new(300, 50));

  const point = Animation1D.CurveAPI.curve4(a, b, c, d, progress / 100);
  const calcSpeedPoint = (progress: number): Vector<2> => {
    return { y: progress * 300, x: Animation1D.CurveAPI.curve4(a, b, c, d, progress).x }
  };

  const documentation = h(DocAside, { segmentIndex: 2 })

  return h(GraphContainer, { documentation, docSide: 'left', size: { x: 300, y: 300 }, position: { x: 600, y }}, [
    h(LinePath, { calcPoint: calcSpeedPoint }),
    h(EditablePoint, { point: { x: a.x, y: 50 }, onPointEdit: setA }, h('text', {}, a.x)),
    h(EditablePoint, { point: { x: b.x, y: 50 }, onPointEdit: setB }, h('text', {}, b.x)),
    h(EditablePoint, { point: { x: c.x, y: 50 }, onPointEdit: setC }, h('text', {}, c.x)),
    h(EditablePoint, { point: { x: d.x, y: 50 }, onPointEdit: setD }, h('text', {}, d.x)),
    h('circle', {
      cx: point.x,
      cy: 100,
      r: 10,
      fill: 'white',
      stroke: 'black'
    }),
    h('circle', {
      cx: calcSpeedPoint(progress / 100).x,
      cy: calcSpeedPoint(progress / 100).y,
      r: 5,
      fill: 'white',
      stroke: 'black'
    }),
    h('text', {
      x: point.x + 15,
      y: 100 - 15,
    }, `${point.x.toFixed()}`)
  ])
}

const AnimDemo = () => {
  const [value, setValue] = useAnimatedValue(80, 200);

  const ref = useRef<SVGCircleElement | null>(null);

  Animation1D.Bezier4.useAnimation(value, ({ x }) => {
    const el = ref.current as SVGCircleElement;
    el.setAttribute('cx', x.toString());
  })

  return h(GraphContainer, { size: { x: 200, y: 200 }, position: { x: 900, y: 50 } }, [
    h('foreignObject', { width: 200, height: 30 }, h(HTML, {}, [
      h('button', { onClick: () => setValue(0, performance.now()) }, 'Left'),
      h('button', { onClick: () => {
        setValue(80, performance.now())
      } }, 'Middle'),
      h('button', { onClick: () => setValue(160, performance.now()) }, 'Right'),
    ])),
    h('circle', {
      ref,
      cy: 50,
      r: 20,
    })
  ])
}

const GraphContainer: Component<{
  size: Vector<2>, position: Vector<2>, documentation?: Node,
  showAxes?: boolean,
  docSide?: 'right' | 'left'
}> = ({
  size, children, position, documentation,
  showAxes = true,
  docSide = "right",
}) => {
  return h('g', { transform: `translate(${position.x} ${position.y})` }, [
    showAxes && [
      h('line', { x1: 0, x2: 0, y1: 0, y2: size.y, stroke: 'red' }),
      h('line', { x1: 0, x2: size.x, y1: 0, y2: 0, stroke: 'blue' }),
      h('text', { fill: 'red' }),
      h('text', { fill: 'blue' }),
    ],
    children,
    h('foreignObject', { x: docSide === "right" ? (size.x + 150) : (-600 - 150), y: 0, width: 600, height: 600 },
      h(HTML, {}, documentation)),
  ])
};

const usePlayState = () => {
  const [progress, setProgress] = useState(50);
  const [playState, setPlayState] = useState<{ direction: 'forward' | 'backward', playing: boolean }>({
    direction: 'forward',
    playing: false,
  });

  const togglePlaying = () => {
    setPlayState(state => ({ ...state, playing: !state.playing }));
  }
  const toggleDirection = () => {
    setPlayState(state => {
    if (state.direction === 'forward')
      return { ...state, direction: 'backward' }
    else
      return { ...state, direction: 'forward' }
    })
  }
  useEffect(() => {
    if (!playState.playing)
      return;

    const id = setInterval(() => {
      setProgress(progress => {
        if (playState.direction === 'forward') {
          const newProgress = progress + 1;
          if (newProgress >= 100) {
            setPlayState(state => ({ ...state, direction: 'backward' }))
            clearInterval(id)
          }
          return Math.min(100, newProgress);
        } else {
          const newProgress = progress - 1;
          if (newProgress <= 0) {
            setPlayState(state => ({ ...state, direction: 'forward' }))
            clearInterval(id)
          }
          return Math.max(0, newProgress);;
        }
      });
    }, 30);
    return () => clearInterval(id)
  }, [playState])

  return {
    progress,
    setProgress,
    playState,
    toggleDirection,
    togglePlaying
  }
}


const DemoProgressControls: Component = () => {
  const playback = useContext(PlaybackContext);

  if (!playback)
    return null;

  const { playState, toggleDirection, togglePlaying, progress, setProgress } = playback;

  const onInput = (e: InputEvent) => {
    setProgress((e.currentTarget as HTMLInputElement).valueAsNumber)
  }

  return [
    h('input', { type: 'range', min: 0, max: 100, value: progress, onInput }),
    h('div', { style: { position: 'relative' } }, h('div', { style: { position: 'absolute', right: 0, top: 0 } }, [
      !playState.playing && h('button', { onClick: togglePlaying}, 'Play'),
      playState.playing && h('button', { onClick: togglePlaying }, 'Pause'),
      playState.direction === 'forward' && h('button', { onClick: toggleDirection }, 'Forward'),
      playState.direction === 'backward' && h('button', { onClick: toggleDirection }, 'Backward'),
    ]))
  ]
}

const PlaybackContext = createContext<null | ReturnType<typeof usePlayState>>(null)
const DemoPlayback = () => {
  return h('div', { style: { display: 'flex', 'flex-direction': 'column', 'margin-bottom': '24px' } },
    h(DemoProgressControls)
  );
}
const extraComponents: MDXComponentEntry[] = [
  { name: 'DemoPlayback', component: DemoPlayback }
]

const DocAside: Component<{ segmentIndex: number }> = ({ segmentIndex }) => {
  const renderer = useGrimoireMdastRenderer(extraComponents);

  return useMemo(() => h('article', { style: {
    background: 'white',
    padding: '16px',
    margin: '8px',
    'border-radius': '8px', 'box-shadow': '#0e2b5182 0px 2px 8px 0px'
  }}, renderer(segments[segmentIndex])), []);
}


export const CurveDemo = ({ offset }: { offset?: Vector2 }) => {
  
  const playState = usePlayState();
  const { progress, setProgress } = playState;

  const [mousePos, setMousePos] = useState(Vector2D.ZERO);

  const onPointerMove = (event: PointerEvent) => {
    if (!(event.currentTarget instanceof SVGSVGElement))
      return;

    const rect = event.currentTarget.getBoundingClientRect();
  
    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }); 
  }
  const onDragComplete = useMemo(() => (newPoint: Vector<2>) => {
    //const location = new URL(document.location.href);
    //location.searchParams.set(`x`, (-newPoint.x).toFixed());
    //location.searchParams.set(`y`, (-newPoint.y).toFixed());

    //history.replaceState(null, '', location.href);
  }, []);
  
  const initialPosition = useMemo(() => {
    const url = new URL(document.location.href);
    return {
      x: -Number(url.searchParams.get('x')) || 0,
      y: -Number(url.searchParams.get('y')) || 0,
    }
  }, []);


  return h('div', { className: classes.fullpageSVG }, h(PlaybackContext.Provider, { value: playState }, [
   
    h(DemoProgressControls),

    h(CartesianSpace, { onDragComplete, initialPosition, offset: offset || { x: 100, y: 100 }, onPointerMove, overlay: [
      h('text', { x: mousePos.x, y: mousePos.y, style: { 'pointer-events': 'none' } },
        [mousePos.x.toFixed(), 'px, ', mousePos.y.toFixed(), 'px'])
    ] } as any, h('g', {}, [
      h('foreignObject', { x: 8, y: 0, width: 800, height: 400 },
        h(HTML, {}, h(DocAside, { segmentIndex: 0 }))),
      h(Curve3Demo, { progress, y: 450 }),
      h(Curve1DDemo, { progress, y: 1100 }),
      h(AnimDemo)
    ]))
  ]));
};
