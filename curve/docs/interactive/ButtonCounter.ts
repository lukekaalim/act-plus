import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { assertRefs, ForeignObject, Vector } from "@lukekaalim/act-graphit";
import { InteractiveDemo } from ".";
import { HTML } from "@lukekaalim/act-web";
import { Anim, Bezier4Animation } from "../../animation";
import { Animation1D, Curve1D, Vector1D, Vector2D } from "../../vectors";
import { RAFBeat } from "@lukekaalim/grimoire";

const useRefEffect = () => {

}

export const ButtonCounter: InteractiveDemo = ({ position, size }) => {
  const [counter, setCounter] = useState(0);
  const [curve, setCurve] = useState(Anim.createStatic(Vector1D.create(0)))

  const ref = useRef<HTMLButtonElement | null>(null);

  RAFBeat.useCallback(({ setCallback }) => {
    const { button } = assertRefs({ button: ref });

    setCallback(({ now }) => {
      const { point: { x }, progress } = Animation1D.Bezier4.calcState(curve, now);

      const value = Math.round(x);
      
      const rotation = (((x * 180) + 90) % 180) - 90;

      button.style.transform = `perspective(600px) translateY(${Math.sin(x / 10) * 50}px) rotate3d(0, 1, 0, ${rotation}deg)`;

      button.textContent = value.toString();
    })
  }, [curve]);

  const onPointerDown = () => {
    setCounter(counter + 1);
    setCurve(Anim.kick(Animation1D.Bezier4, curve, { x: counter + 1 }, 800));
  }

  return h(ForeignObject, { position, size }, h(HTML, {}, [
    h('div', { style: { display: 'flex', height: '100%', width: '100%' }},
      h('button', { ref, onPointerDown, style: { padding: '24px', width: '200px', margin: 'auto' } }, counter)
    )
  ]))
};