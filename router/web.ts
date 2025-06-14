import { Component, h, Ref, useEffect, useMemo } from '@lukekaalim/act';
import { Router } from "./router";
import { useRouterEvents } from './events';
import { Link } from './link';
import { useRouterContext } from './context';

/**
 * Listens to Click events that happen on anchors, and if
 * the destination is the current page, converts them into
 * navigation requests for the Router instead.
 * 
 * Click events that have called preventDefault or used a different
 * button than '0' are not converted into requests.
 * 
 * @param router The router that will be passed the navigation events
 * @param rootElement The HTML element that will have the event listener attached.
 *  This can be something like document.body, or something more specific to the page.
 * @param origin 
 */
export const useDOMAnchorIntercept = (
  router: Router,
  rootElement: Ref<null | HTMLElement>,
  origin: string,
) => {
  useEffect(() => {
    const el = rootElement.current as HTMLElement;
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (event.defaultPrevented)
        return;
      if (!(target instanceof HTMLAnchorElement))
        return;
      if (event.button !== 0)
        return;
      const url = new URL(target.href);
      if (url.origin !== origin)
        return;

      event.preventDefault();
      router.navigate(url);
    };
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('click', onClick);
    }
  }, [])
};


/**
 * This will attempt to find the current hash element,
 * and scroll to it.
 * @param router 
 */
export const useDOMHashScroll = (router: Router) => {
  const focus = (location: URL) => {
    const hash = location.hash;
    if (!hash)
      return;
    const elementId = hash.slice(1);
    const element = document.getElementById(elementId);
    if (!element)
      return;
    element.scrollIntoView();
  };

  useEffect(() => {
    focus(router.location);
  }, [router.location.hash]);

  useRouterEvents(router, useMemo(() => event => {
      switch (event.type) {
        case 'refocus':
          focus(router.location)
      }
  }, [router.location]));
}

/**
 * When the router navigates to a new location
 *  (but not the _initial_ location)
 * 
 * call history.pushState to have the new location be
 * reflected in the URL
 * @param router 
 * @param history 
 * @param origin 
 */
export const useDOMHistoryPush = (router: Router, history: History, origin: string) => {
  useRouterEvents(router, useMemo(() => event => {
      switch (event.type) {
        case 'navigate':
          history.pushState(null, '', event.location);
          break;
      }
  }, []));

  useEffect(() => {
    window.addEventListener('popstate', event => {
      router.replace(new URL(window.location.href))
    })
  }, [])
}

export type RouterDOMIntergrationConfig = {
  history?: History,
  origin?: string,
  rootElement?: Ref<null | HTMLElement>,
}

/**
 * Automatically intergrates web-specific router intergrations,
 * such as scrolling to the selected hash, calling history.push
 * on navigation, and capturing regular anchor clicks.
 */
export const useDOMIntergration = (
  router: Router,
  {
    history = window.history,
    origin = document.location.origin,
    rootElement = { current: document.body }
  }: RouterDOMIntergrationConfig = {}
) => {
  useDOMHashScroll(router);
  useDOMHistoryPush(router, history, origin);
  useDOMAnchorIntercept(router, rootElement, origin);
}

export type WebLinkProps = {
  link: Link,
  style?: Record<string, string | number>,
  className?: string,
  id?: string,
  disabled?: boolean,
}


export const WebLink: Component<WebLinkProps> = ({ link, children, ...props }) => {
  const router = useRouterContext();
  
  const onClick = (e: MouseEvent) => {
    if (link.location.origin !== router.location.origin)
      return;
    e.preventDefault();
    router.navigate(link.location);
  }

  return h('a', { ...props, href: link.location.href, onClick }, link.display)
}