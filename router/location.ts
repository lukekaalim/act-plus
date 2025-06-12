import { EventEmitter } from "./event_emitter";

export type RouterLocation = {
  path: string,
  query: Record<string, string>,
  hash: string,
};

export const RouterLocation = {
  ROOT: { path: '/', query: {}, hash: '' },

  fromURL(url: URL): RouterLocation {
    return {
      path: url.pathname,
      query: Object.fromEntries(url.searchParams.entries()),
      hash: url.hash
    }
  },
  toURL(location: RouterLocation, origin: string): URL {
    const url = new URL(location.path, origin);
    url.hash = location.hash;

    for (const [key, value] of Object.entries(location.query))
      url.searchParams.set(key, value);

    return url;
  },
  equals(left: RouterLocation, right: RouterLocation): boolean {
    if (left.path !== right.path)
      return false;
    if (left.hash !== right.hash)
      return false;
    
    const leftKeys = Object.keys(left.query);
    const rightKeys = Object.keys(right.query);

    if (leftKeys.length !== rightKeys.length)
      return false;

    for (const key of leftKeys) {
      if (left.query[key] !== right.query[key])
        return false;
    }
    
    return true;
  }
}