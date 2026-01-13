import { Component, h, useMemo, useRef } from "@lukekaalim/act"
import { useDOMIntegration, useRouter } from "@lukekaalim/act-router"
import { DocApp, DocAppContext } from "../../application";
import { PageTransitionDriver, usePageTransition } from "../../pageTransition";
import { ThemeContext } from "../../lib";
import { VerticalNavMenu2 } from "../vertical_nav_menu";
import { TopBanner2, TopBanner2Props } from "../header";

export type SimpleThemeProps = {
  doc: DocApp,
  banner?: TopBanner2Props,
}

export const SimpleTheme: Component<SimpleThemeProps> = ({ doc, banner }) => {
  const router = useRouter({
    initialLocation: new URL(document.location.href),
    pages: doc.route.routes,
  });
  useDOMIntegration(router);
  
  const pageStates = usePageTransition(router.page);

  const tree = doc.route.getNavTree();
  
  const theme: ThemeContext = useMemo(() => ({
    VerticalNav() {
      return h(VerticalNavMenu2, { tree })
    }
  }), []);

  return h('div', { style: { height: '100%', width: '100%', display: 'flex', 'flex-direction': 'column' }}, h(DocAppContext.Provider, { value: doc }, h(ThemeContext.Provider, { value: theme }, [
    !!banner && h(TopBanner2, banner),
    
    h('div', { style: { position: 'relative', flex: 1 } },
      pageStates.map(state => h(PageTransitionDriver, { state, key: state.id, direction: router.direction })))
  ])));
}
