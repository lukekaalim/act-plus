import { Component, ErrorBoundary, h, useMemo, useRef } from "@lukekaalim/act"
import { useNavigationListener, useRootNavigationController } from "./NavigationController"
import { hs } from "@lukekaalim/act-web";
import { NavigationPanel } from "./NavigationPanel";
import { DocLayout } from "./DocLayout";
import { DocPage } from "./DocPage";

import docMarkClasses from './DocMark.module.css';
import { asyncNodeRegistryContext, useRootAynscNodeRegistry } from "./AsyncComponent";
import { DefProvider } from "@lukekaalim/act-graphit";
import { PageTransitionDriver, usePageTransition } from "./pageTransition";

/**
 * This is some documentation props
 */
export type DocumentationAppProps = {
  pages: DocPage[],
}

/**
 * I dunno
 * @param param0 
 * @returns Whatever
 */
export const DocumentationApp: Component<DocumentationAppProps> = ({ pages }) => {
  const ref = useRef<null | HTMLElement>(null);
  
  const pageMap = useMemo(() => {
    return new Map(pages.map(page => [page.path, page]))
  }, [pages]);

  const navigation = useRootNavigationController(new URL(document.location.href));
  const asyncNodeRegistry = useRootAynscNodeRegistry()

  useNavigationListener(ref, navigation);

  const path = navigation.location.pathname;

  const currentPage = pageMap.get(path) || { path: '', element: h(NotFound), link: '' };

  const pageAnimStates = usePageTransition(currentPage);
  console.log(pageAnimStates);

  return [
    h(DefProvider),
    h(asyncNodeRegistryContext.Provider, { value: asyncNodeRegistry },
    h(DocLayout, {
      ref,
      content: h(ErrorBoundary, { onError: console.error, key: path }, pageAnimStates.map(state => {
        return h(PageTransitionDriver, { state, key: `${state.page.path}(${state.id})` })
      })),
      navPanel: h(NavigationPanel, { navigation, pages })
    }))
  ]
}

const NotFound = () => {
  return h('article', { className: docMarkClasses.article }, [
    h('h1', {}, '404 - Page not found'),
  ])
}

function SampleFunc(myArg: number): string {
  return '';
}