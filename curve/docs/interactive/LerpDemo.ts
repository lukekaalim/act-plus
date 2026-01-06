import { h, useRef, useState } from "@lukekaalim/act";
import { InteractiveDemo } from ".";
import { Vector2D } from "../../vectors";
import { assertRefs, assertSVGParent, Circle, EditablePoint, Group, Line, PositiveAxes } from "@lukekaalim/act-graphit";
import { ProgressAnim } from "./progress";

export const LerpDemo: InteractiveDemo = ({ position, size }) => {
  const [a, setA] = useState({ x: 50, y: 50 });
  const [b, setB] = useState({ x: 250, y: 150 });

  const pointRef = useRef<SVGCircleElement | null>(null);
  const textRef = useRef<SVGTextElement | null>(null);
  const progressTextRef = useRef<SVGTextElement | null>(null);

  ProgressAnim.useCallback(({ setCallback }) => {
    const { point, text, progressText } = assertRefs({ point: pointRef, text: textRef, progressText: progressTextRef });
    const svg = assertSVGParent(text);

    const textX = svg.createSVGLength();
    const textY = svg.createSVGLength();

    text.x.baseVal.initialize(textX);
    text.y.baseVal.initialize(textY);

    setCallback(({ progress }) => {
      const lerpPosition = Vector2D.interpolate(a, b, progress);

      const color = `rgb(${lerpPosition.x}, 0.5, ${lerpPosition.y})`;
      
      point.style.fill = color;
      text.style.fill = color;

      point.cx.baseVal.value = lerpPosition.x;
      point.cy.baseVal.value = lerpPosition.y;

      progressText.textContent = `(t=${progress.toFixed(2)})`;
      text.textContent = `${lerpPosition.x.toFixed()}x, ${lerpPosition.y.toFixed()}y`;
      textX.value = lerpPosition.x + 10
      textY.value = lerpPosition.y - 10
    });
  }, [a, b]);

  const aColor = `rgb(${a.x}, 0.5, ${a.y})`;
  const bColor = `rgb(${b.x}, 0.5, ${b.y})`

  return h(PositiveAxes, { position, size }, [
    h(Line, { start: a, end: b }),
    h(Circle, { ref: pointRef, r: 5, stroke: 'none' }),
    h('text', { ref: textRef  }),
    h('text', { ref: progressTextRef, x: 0, y: -25  }),

    h(EditablePoint, { point: a, onPointEdit: setA, fill: aColor },
      h('text', { fill: aColor }, `${a.x}x, ${a.y}y`)),
    h(EditablePoint, { point: b, onPointEdit: setB, fill: bColor },
      h('text', { fill: bColor }, `${b.x}x, ${b.y}y`)),
  ]);
}