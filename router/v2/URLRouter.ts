import { createEventEmitter, EventEmitter } from "../event_emitter";


/**
 * A URLRouter manages the current URL of a weboage and acts
 * as an authority and subscribable event manager when it changes.
 * 
 * Note that the URL router does not check if the app can render the path,
 * or if it's event the correct origin, or if the parameters are correct.
 */
export class URLRouter {
  /**
   * The URL of the current webpage. Will be replaced
   * with a different value as the page changes.
   * 
   * Get the path via `URLRouter.location.pathname` or the params
   * with `URLRouter.location.searchParams`.
   * 
   * Listen to it's changes by listening for `go` or `replace` events.
   */
  location: URL;
  /**
   * This value represents your position in the history stack.
   * 
   * This value is almost entirely driven by the browser.
   */
  history_index: number = 0;

  /**
   * Changes to the router cause RouterEvents to be emitted.
   * 
   * The router's state is changed first, and then the event is emitted.
   * 
   * The various events are:
   *  - `go`. The location has changed, due to navigating forwards or backwards.
   *  - `replace`. The current location has changed, but the history state is untouched.
   *  - `refocus`. An attempt to navigate was made, but the destination is
   *    the same as the current location, so nothing changed.
   */
  events: EventEmitter<
    | { type: 'go' }
    | { type: 'replace' }
    | { type: 'refocus' }
  > = createEventEmitter();

  constructor(initialLocation: URL | string) {
    let url;
    if (typeof initialLocation === 'string') {
      url = new URL(initialLocation);
    } else {
      url = initialLocation;
    }
    this.location = url;
  }

  /**
   * Navigate to a new location!
   * 
   * The new location can be the same path, but with a different
   * hash or searchParams.
   * 
   * This adds the new location to the history stack.
   * 
   * If the URL is (via string comparison) the same as the current location, a "refocus" event is sent
   * and the history is not changed.
   * 
   * Emits a "go" or "refocus" event.
   * 
   * @see `URLRouter.replace` for a version that does not alter the history stack.
   * 
   * @param newLocation A URL or string of the new location. If a string is passed,
   * a new URL object is constructed and the current location is used as the "base path".
   */
  go(newLocation: URL | string) {
    let url: URL;

    if (typeof newLocation === 'string') {
      url = new URL(newLocation, this.location);
    } else {
      url = newLocation;
    }

    if (this.location.href === url.href) {
      this.events.emit({ type: 'refocus' });
      return;
    }

    this.location = url;

    this.events.emit({ type: 'go' });
  };

  /**
   * Replaces the current location with a new location,
   * but does not append the history stack. (The "current" location
   * in the history stack is replaced however)
   * 
   * Does not check for location equality for refocus events.
   * 
   * Emits a "replace" event.
   * 
   * @param newLocation 
   */
  replace(newLocation: URL | string) {
    let url: URL;

    if (typeof newLocation === 'string') {
      url = new URL(newLocation, this.location);
    } else {
      url = newLocation;
    }
    
    this.location = url;
    this.events.emit({ type: 'replace' });
  }
  
  /**
   * Navigate to a location in the history.
   * @param history_index The position in the `router.history` array
   * that you are navigating to.
   */
  back(history_index: number) {
    
    this.history_index = history_index;
  }
}
