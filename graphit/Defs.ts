import { Node, h, useEffect, useState } from "@lukekaalim/act";
import { SVG } from "@lukekaalim/act-web";

export const globalDefs = new Set<Node>();

const defSubscribers = new Set<() => void>();

export const registerSVGDef = (def: Node) => {
  globalDefs.add(def);
  
  for (const subscriber of defSubscribers)
    subscriber();
}

const useGlobalSVGDefs = () => {
  const [defs, setDefs] = useState(globalDefs);

  useEffect(() => {
    const subscription = () => {
      setDefs(new Set(globalDefs))
    };
    defSubscribers.add(subscription);
    return () => defSubscribers.delete(subscription);
  }, []);

  return defs;
};

export const DefProvider = () => {
  const defs = useGlobalSVGDefs();

  return h(SVG, {}, [
    h('svg', {}, h('defs', {}, [...defs]))
  ])
}