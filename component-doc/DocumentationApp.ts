import { Component, ErrorBoundary, h, useMemo, useRef } from "@lukekaalim/act"
import { useNavigationListener, useRootNavigationController } from "./NavigationController"
import { hs } from "@lukekaalim/act-web";
import { NavigationPanel } from "./NavigationPanel";
import { DocLayout } from "./DocLayout";
import { DocPage } from "./DocPage";

import docMarkClasses from './DocMark.module.css';
import { asyncNodeRegistryContext, useRootAynscNodeRegistry } from "./AsyncComponent";
import { DefProvider } from "@lukekaalim/act-graphit/Defs";

export type DocumentationAppProps = {
  pages: DocPage[],
}

export const DocumentationApp: Component<DocumentationAppProps> = ({ pages }) => {
  const ref = useRef<null | HTMLElement>(null);
  
  const pageMap = useMemo(() => {
    return new Map(pages.map(page => [page.path, page.element]))
  }, [pages]);

  const navigation = useRootNavigationController(new URL(document.location.href));
  const asyncNodeRegistry = useRootAynscNodeRegistry()

  useNavigationListener(ref, navigation);

  const currentPage = pageMap.get(navigation.location.pathname);

  return [
    h(DefProvider),
    h(asyncNodeRegistryContext.Provider, { value: asyncNodeRegistry },
    h(DocLayout, {
      ref,
      content: h(ErrorBoundary, { onError: console.error }, currentPage || h(NotFound)),
      navPanel: h(NavigationPanel, { navigation, pages })
    }))
  ]
}

const NotFound = () => {
  return h('article', { className: docMarkClasses.article }, [
    h('h1', {}, '404 - Page not found'),
  ])
}