import { useState } from '@lukekaalim/act';

import { RouterLocation } from "./location";
import { RouterPage } from "./pages";
import { createEventEmitter, EventEmitter } from './event_emitter';
import { RouterEvent } from './events';

export type Router = {
  pages: RouterPage[],

  page: RouterPage,
  location: RouterLocation,

  navigate(location: RouterLocation): void,

  subscribe: EventEmitter<RouterEvent>["subscribe"],
};

export type RouterConfig = {
  pages: RouterPage[],
  
  specialPages?: {
    notFound?: RouterPage,
  },
  initialLocation?: RouterLocation,
};

const findPage = (pages: RouterPage[], location: RouterLocation) => {
  const page = pages
    .find(page => page.path.toLowerCase() === location.path.toLowerCase());
  return page || null;
}

export const useRouter = ({ initialLocation, pages, specialPages }: RouterConfig): Router => {
  const [location, setLocation] = useState(initialLocation || RouterLocation.ROOT);
  const [emitter] = useState(() => createEventEmitter<RouterEvent>());

  const navigate = (nextLocation: RouterLocation) => {
    setLocation(prevLocation => {
      if (RouterLocation.equals(prevLocation, nextLocation)) {
        emitter.emit({ type: 'refocus' });
        return prevLocation;
      }
      const page = findPage(pages, nextLocation);
      if (!page)
        return prevLocation;

      emitter.emit({ type: 'navigate', page, location: nextLocation });
      return nextLocation;
    });
  };

  const page = findPage(pages, location) || RouterPage.EMPTY;

  return {
    subscribe: emitter.subscribe,

    page,
    location,
    pages,
    navigate
  }
};
