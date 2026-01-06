import { Component, h, Ref, useEffect, useMemo, useState } from '@lukekaalim/act';
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
      if (!(target instanceof HTMLElement))
        return;

      const anchor = target.closest(`a`);

      if (!anchor)
        return;
      if (event.button !== 0)
        return;
      const url = new URL(anchor.href);
      if (url.origin !== origin)
        return;

      event.preventDefault();
      router.navigate(url);
    };
    el.addEventListener('click', onClick);
    return () => {
      el.removeEventListener('click', onClick);
    }
  }, [rootElement])
};


/**
 * This will attempt to find the current hash element,
 * and scroll to it.
 * @param router 
 */
export const useDOMHashScroll = (router: Router, rootElement: Ref<HTMLElement | null>) => {
  const focus = (location: URL) => {
    const hash = location.hash;
    if (!hash)
      if (rootElement.current)
          return rootElement.current.scrollTo({ top: 0 });
        else
          return;
    const elementId = hash.slice(1);
    const element = document.getElementById(elementId);
    if (!element)
      return;
    element.scrollIntoView();
  };

  useEffect(() => {
    focus(router.location);
  }, [router.location.pathname, router.location.hash]);

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
  const [state, setState] = useState(history.state as number || 0);

  useRouterEvents(router, useMemo(() => event => {
      switch (event.type) {
        case 'navigate':
          setState(state + 1)
          history.pushState(state + 1, '', event.location);
          break;
      }
  }, [state]));

  useEffect(() => {
    window.addEventListener('popstate', event => {
      setState(event.state);
      const direction = (event.state || 0) < state ? 'backward' : 'forward';
      router.replace(new URL(window.location.href), direction)
    })
  }, [state])

  console.log({ state }, history.state)
}

export type RouterDOMIntegrationConfig = {
  history?: History,
  origin?: string,
  rootElement?: Ref<null | HTMLElement>,
}

/**
 * Automatically integrates web-specific router integrations,
 * such as scrolling to the selected hash, calling history.push
 * on navigation, and capturing regular anchor clicks.
 */
export const useDOMIntegration = (
  router: Router,
  {
    history = window.history,
    origin = document.location.origin,
    rootElement = { current: document.body }
  }: RouterDOMIntegrationConfig = {}
) => {
  useDOMHashScroll(router, rootElement);
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

  return h('a', { ...props, href: link.location.href }, link.display)
}