import { useState } from '@lukekaalim/act';

import { RouterPage } from "./pages";
import { createEventEmitter, EventEmitter } from './event_emitter';
import { RouterEvent } from './events';
import { isPathEqual, isURLEqual } from './url';

export type Router = {
  pages: RouterPage[],

  page: RouterPage,
  location: URL,

  navigate(location: URL): void,
  /**
   * A special version of Navigate that doesn't trigger a "navigate" event -
   * useful for "going back" in history
   * */
  replace(location: URL): void

  subscribe: EventEmitter<RouterEvent>["subscribe"],
};

export type RouterConfig = {
  pages: RouterPage[],
  
  specialPages?: {
    notFound?: RouterPage,
  },
  initialLocation: URL,
};

const findPage = (pages: RouterPage[], location: URL) => {
  const page = pages
    .find(page => isPathEqual(page.path, location.pathname));
  return page || null;
}

export const useRouter = ({ initialLocation, pages, specialPages }: RouterConfig): Router => {
  const [location, setLocation] = useState(initialLocation);
  const [emitter] = useState(() => createEventEmitter<RouterEvent>());

  const navigate = (nextLocation: URL) => {
    console.log(`Recived navigate to`, nextLocation)
    setLocation(prevLocation => {
      if (isURLEqual(prevLocation, nextLocation)) {
        console.info(`Refocusing on: "${nextLocation}"`)
        emitter.emit({ type: 'refocus' });
        return prevLocation;
      }
      const page = findPage(pages, nextLocation);
      if (!page)
        return (console.info(`Rejecting navigation to: "${nextLocation}"`), prevLocation);

      console.info(`Navigating to: "${nextLocation}"`)
      emitter.emit({ type: 'navigate', page, location: nextLocation });
      return nextLocation;
    });
  };
  const replace = (nextLocation: URL) => {
    setLocation(nextLocation)
  }

  const page = findPage(pages, location) || RouterPage.EMPTY;

  return {
    subscribe: emitter.subscribe,

    page,
    location,
    pages,
    navigate,
    replace,
  }
};
