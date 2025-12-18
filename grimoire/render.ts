import { Component, h, useMemo } from "@lukekaalim/act"
import { DocApp, DocAppContext } from "./application/App"
import { AnyPluginArray } from "./application/Plugin"
import { useDOMIntegration, useRouter } from "@lukekaalim/act-router"
import { PageTransitionDriver, usePageTransition } from "./pageTransition"

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
  const pageStates = usePageTransition(router.page);

  return h(DocAppContext.Provider, { value: doc },
    h('div', { style: { position: 'relative' } },
      pageStates.map(state => h(PageTransitionDriver, { state, key: state.id }))));
}
