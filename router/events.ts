import { useEffect } from '@lukekaalim/act';

import { useRouterContext } from "./context";
import { RouterPage } from "./pages";
import { Router } from './router';

export type RouterEvent =
   // A navigate event for the current page
  | { type: 'refocus' }
  | { type: 'navigate', page: RouterPage, location: URL }

export const useRouterEvents = (router: Router, handler: (event: RouterEvent) => unknown) => {
  useEffect(() => {
    const sub = router.subscribe(handler);
    return () => sub.cancel();
  }, [router, handler])
}