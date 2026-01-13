import { Component, h, useMemo } from "@lukekaalim/act";
import { DocApp, DocAppContext } from "../../application";
import { useDOMIntegration, useRouter } from "@lukekaalim/act-router";
import { VerticalNavMenu2 } from "../vertical_nav_menu";
import { ThemeContext } from "../../lib";

import classes from './BoneTheme.module.css';

export type BoneThemeProps = {
  doc: DocApp,
}

export const BoneTheme: Component<BoneThemeProps> = ({ doc }) => {
  const router = useRouter({
    initialLocation: new URL(document.location.href),
    pages: doc.route.routes,
  });
  useDOMIntegration(router);

  function onReady() {

  }

  const tree = doc.route.getNavTree();

  const theme: ThemeContext = useMemo(() => ({
    VerticalNav() {
      return h(VerticalNavMenu2, { tree })
    }
  }), []);

  return h('section', { className: classes.boneTheme },
    h(DocAppContext.Provider, { value: doc },
      h(ThemeContext.Provider, { value: theme },
        h(router.page.component, { onReady })
      )))
};
