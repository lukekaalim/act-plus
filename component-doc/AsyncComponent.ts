import { Component, createContext, Node, useContext, useEffect, useMemo, useState } from "@lukekaalim/act";
import { docControllerContext } from "./DocController";

export type AsyncNodeRegistry = {
  nodes: Map<string, Node>,

  addNode: (key: string, node: Node) => void,
}
export const asyncNodeRegistryContext = createContext<AsyncNodeRegistry | null>(null);

export const useRootAynscNodeRegistry = (): AsyncNodeRegistry => {
  const [nodes, setNodes] = useState<Map<string, Node>>(new Map());

  const addNode = useMemo(() => (key: string, node: Node) => {
    setNodes(nodes => {
      const newNodes = new Map(nodes);
      newNodes.set(key, node);
      return newNodes;
    })
  }, []);

  return { nodes, addNode };
}


export type AsyncNodeProps = {
  nodeKey?: string | null,
  loadNode: () => Promise<Node>,
};

export const AsyncNode: Component<AsyncNodeProps> = ({ nodeKey = null, loadNode }) => {
  const registry = useContext(asyncNodeRegistryContext);
  const controller = useContext(docControllerContext);

  const [node, setNode] = useState<Node>(null);
  
  useEffect(() => {
    if (registry && nodeKey && registry.nodes.has(nodeKey))
      return;

    if (controller)
      controller.startLoading();
    
    loadNode()
      .then(node => {
        setNode(node);
        if (registry && nodeKey)
          registry.addNode(nodeKey, node);
        if (controller)
          controller.finishLoading();
      })
  }, [nodeKey, loadNode]);

  const registeredNode = useMemo(() => {
    if (!registry || !nodeKey)
      return null;
    return registry.nodes.get(nodeKey) || null;
  }, [registry, nodeKey])

  console.log({ node, registeredNode });

  return node || registeredNode;
};