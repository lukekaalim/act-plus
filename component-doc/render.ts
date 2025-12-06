import { Component, h } from "@lukekaalim/act"
import { DocApp, DocAppContext } from "./application/App"
import { AnyPluginArray } from "./application/Plugin"
import { useRootNavigationController } from "./NavigationController"

export type DocAppRendererProps = {
  doc: DocApp<AnyPluginArray>,
}

export const DocAppRenderer: Component<DocAppRendererProps> = ({ doc }) => {
  const navigation = useRootNavigationController(new URL(document.location.href));

  const route = doc.route.routes.find(route => route.path === navigation.location.pathname);

  if (!route)
    return '404';

  return h(DocAppContext.Provider, { value: doc }, route.content);
}
