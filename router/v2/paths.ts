import { Component, Node } from "@lukekaalim/act"
import { URLRouter } from "./URLRouter";
import { useRouterLocation } from "./location";

export type URLRouterComponentProps = {
  router: URLRouter,
};

export type RouterNodeMap = {
  paths: Map<string, Node>,
  notFound: Component
}

/**
 * From a map of values, select a value based on the current path.
 * @param router 
 * @param paths 
 */
export const useRouterPath = <T>(router: URLRouter, paths: Record<string, T>): T | null => {
  const location = useRouterLocation(router);

  const currentPathLower = location.pathname.toLocaleLowerCase();
  for (const [targetPath, value] of Object.entries(paths)) {
    const targetPathLower = targetPath.toLocaleLowerCase();

    if (targetPathLower === currentPathLower)
      return value;
  }

  return null;
}
