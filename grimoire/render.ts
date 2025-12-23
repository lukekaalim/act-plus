import { Component, h, useMemo, useRef } from "@lukekaalim/act"
import { DocApp, DocAppContext } from "./application/App"
import { AnyPluginArray } from "./application/Plugin"
import { useDOMIntegration, useRouter } from "@lukekaalim/act-router"
import { PageTransitionDriver, usePageTransition } from "./pageTransition"

export type DocAppRendererProps = {
  doc: DocApp<AnyPluginArray>,
}

export const DocAppRenderer: Component<DocAppRendererProps> = ({ doc }) => {
  const ref = useRef<HTMLElement | null>(null)
  const pages = useMemo(() => {
    return doc.route.routes.map(page => {
      const MyPageComponent = () => page.content;

      return { path: page.path, display: null, component: MyPageComponent }
    });
  }, [doc]);

  const router = useRouter({
    initialLocation: new URL(document.location.href),
    pages,
  });
  useDOMIntegration(router);
  const pageStates = usePageTransition(router.page);

  return h(DocAppContext.Provider, { value: doc },
    h('div', { ref, style: { position: 'relative', flex: 1 } },
      pageStates.map(state => h(PageTransitionDriver, { state, key: state.id, direction: router.direction }))));
}
