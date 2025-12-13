import { Component, h, useMemo } from "@lukekaalim/act"
import { DocApp, DocAppContext } from "./application/App"
import { AnyPluginArray } from "./application/Plugin"
import { useRootNavigationController } from "./NavigationController"
import { useDOMIntegration, useRouter } from "@lukekaalim/act-router"

export type DocAppRendererProps = {
  doc: DocApp<AnyPluginArray>,
}

export const DocAppRenderer: Component<DocAppRendererProps> = ({ doc }) => {
  const pages = useMemo(() => {
    return doc.route.routes.map(page => ({ path: page.path, display: null, component: () => page.content }));
  }, [doc]);

  const router = useRouter({
    initialLocation: new URL(document.location.href),
    pages,
  });
  useDOMIntegration(router);

  return h(DocAppContext.Provider, { value: doc },
    h(router.page.component, { onReady: () => {} }));
}
