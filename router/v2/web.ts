import { Ref, useEffect, useMemo, useState } from '@lukekaalim/act';
import { URLRouter } from './URLRouter';

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
 * @param origin an origin to compare links to. If the origin does not match the destination
 * location, we allow the link to proceed as normal (and let the browser navigate away)
 */
export const useDOMAnchorIntercept = (
  router: URLRouter,
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
      router.go(url);
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
export const useDOMHashScroll = (
  router: URLRouter,
  rootElement: Ref<HTMLElement | null>
) => {
  const focus = useMemo(() => (location: URL) => {
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
  }, [rootElement]);

  useEffect(() => {
    focus(router.location);

    const sub = router.events.subscribe((event) => {
      if (event.type === 'go' || event.type === 'refocus') {
        // On `go` or `refocus` events, try to refocus on the hash.
        focus(router.location);
      }
    });

    return () => sub.cancel();
  }, [router])
}

/**
 * When the router navigates to a new location
 *  (but not the _initial_ location)
 * 
 * call history.pushState to have the new location be
 * reflected in the URL
 * 
 * We store the history index inside the "data" parameter of "pushRoute"
 * to tell if we've travelled back into history or not.
 * 
 * @param router 
 * @param history 
 * @param origin 
 */
export const useDOMHistoryPush = (router: URLRouter, history: History, window: Window) => {
  useEffect(() => {
    const sub = router.events.subscribe(event => {
      switch (event.type) {
        case 'go':
          history.pushState(router.history_index, '', router.location);
          break 
        case 'replace':
          history.replaceState(router.history_index, '', router.location);
          break;
      }
    });

    return () => sub.cancel();
  }, [router])

  useEffect(() => {
    window.addEventListener('popstate', event => {
      // TODO: figure out a method to see if we are going forwards or backwards
      router.go(window.location.href);
    })
  }, [router])
}

export type RouterDOMIntegrationConfig = {
  history?: History,
  origin?: string,
  window?: Window,
  rootElement?: Ref<null | HTMLElement>,
}

const GLOBAL_WINDOW = window;

/**
 * Automatically integrates web-specific router integrations,
 * such as scrolling to the selected hash, calling history.push
 * on navigation, and capturing regular anchor clicks.
 */
export const useDOMIntegration = (
  router: URLRouter,
  {
    window = GLOBAL_WINDOW,
    history = window.history,
    origin = window.location.origin,
    rootElement = { current: document.body }
  }: RouterDOMIntegrationConfig = {}
) => {
  useDOMHashScroll(router, rootElement);
  useDOMHistoryPush(router, history, window);
  useDOMAnchorIntercept(router, rootElement, origin);
}

