import { h, useMemo, useRef, useState } from "@lukekaalim/act";
import { Curve2D, Vector1D, Vector2D } from "../../vectors";
import { assertRefs, assertSVGParent, Circle, ForeignObject, Group, LinePath, PositiveAxes, Ring, Vector } from "@lukekaalim/act-graphit";
import { HTML } from "@lukekaalim/act-web";
import { InteractiveDemo } from ".";
import { calcNodeLayouts, LayoutNode, LayoutOutput } from "../layout";
import { RAFBeat } from "@lukekaalim/grimoire";
import { bezier, getSpanProgress } from "../../mod";
import { CubicBezier2DConstructionLines } from "../utils";

const RESOLUTION = 256;

export const ContinueDemo: InteractiveDemo = ({ position, size }) => {
  const circlePosition = useRef(Vector1D.create(0, 50)).current;

  const circleRef = useRef<SVGCircleElement | null>(null);
  const groupRef = useRef<SVGGElement | null>(null)

  const onClick = (newPosition: Vector<1>) => () => {
    const t = getSpanProgress(curve.span, performance.now())
    const velocity = bezier.cubic["1D"].velocity(curve.a, curve.b, curve.c, curve.d, t);
    const circlePosition = bezier.cubic["1D"].position(curve.a, curve.b, curve.c, curve.d, t);

    const distance = newPosition.x - circlePosition.x;
    const direction = (distance / Math.abs(distance)) || 0;
    const kick = direction * Math.abs((distance))

    const force = mode === 'force' ? kick : velocity.x / 3;

    setOldCurves(oldCurves => [{ ...curve, cutoff: t }]);
    setCurve({
      a: circlePosition,
      b: { x: circlePosition.x + force }, //(velocity.x / 3) },
      c: newPosition,
      d: newPosition,
      span: { start: performance.now(), end: performance.now() + 2000 }
    })
  }
  const [curve, setCurve] = useState({ a: { x: 0 }, b: { x: 0 }, c: { x: 0 }, d: { x: 0 }, span: { start: 0, end: 0 } });
  const [oldCurves, setOldCurves] = useState([{
    a: { x: 0 }, b: { x: 0 }, c: { x: 0 }, d: { x: 0 },
    span: { start: 0, end: 0 },
    cutoff: 0,
  }]);

  RAFBeat.useCallback(({ setCallback }) => {
    const { circle, group } = assertRefs({ circle: circleRef, group: groupRef });
    const svg = assertSVGParent(group)

    const gTransform = svg.createSVGTransform();
    group.transform.baseVal.initialize(gTransform);

    setCallback(({ now, delta }) => {
      const t = getSpanProgress(curve.span, now)
      const position = bezier.cubic["1D"].position(curve.a, curve.b, curve.c, curve.d, t);

      gTransform.setTranslate(0, ((1 - t) * 100) + 50)
      circle.cx.baseVal.value = position.x;
    })
  }, [curve])

  const layout = useMemo(() => {
    const nodes = LayoutNode.list('', 'vertical', 'start', [
      LayoutNode.rect('controls', { x: size.x, y: 50 }),
      LayoutNode.rect('graphic', { x: size.x, y: size.y - 50 }),
    ]);

    const layout = calcNodeLayouts(nodes, position);
    return {
      controls: layout.get('controls') as LayoutOutput,
      graphics: layout.get('graphic') as LayoutOutput,
      table: layout.get('table') as LayoutOutput,
    }
  }, [position, size])

  const [mode, setMode] = useState<'force' | 'preserve'>('preserve');
  const onClickMode = () => {
    setMode(mode === 'force' ? 'preserve' : 'force');
  }

  return [
    h(PositiveAxes, layout.graphics, [
      h(Circle, { center: { x: circlePosition.x, y: 150 }, ref: circleRef, radius: 8, fill: 'white' }),
      h(Group, { ref: groupRef, }, [
        h(LinePath, { calcPoint(t) {
          const position = bezier.cubic["1D"].position(curve.a, curve.b, curve.c, curve.d, t);
          return { x: position.x, y: t * 100 }
        }, }),
        oldCurves.map(oldCurve =>
          h(LinePath, { calcPoint(t) {
            const position = bezier.cubic["1D"].position(oldCurve.a, oldCurve.b, oldCurve.c, oldCurve.d, t);
            return { x: position.x, y: (t * 100) - (oldCurve.cutoff * 100) }
          }, }),
        )
      ])
    ]),

    h(ForeignObject, layout.controls, h(HTML, {}, [
      h('button', { onClick: onClick(Vector1D.create(0)) }, 'Left'),
      h('button', { onClick: onClick(Vector1D.create(150) ) }, 'Center'),
      h('button', { onClick: onClick(Vector1D.create(300)) }, 'Right'),
      h('div', {}, [
        h('button', { onClick: onClickMode }, [
          mode === 'force' && 'Force Push',
          mode === 'preserve' && 'Preserve Momentum',
        ]),
      ]),
    ])),
  ]
};