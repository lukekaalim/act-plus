export const normalizePath = (path: string) => {
  return path
    .toLocaleLowerCase()
    .split('/').filter(Boolean).join('/')
}

export const isPathEqual = (left: string, right: string) => {
  return normalizePath(left) === normalizePath(right)
}

/**
 * A `@lukekaalim/act` specific URL equality
 * evaluation.
 * 
 * @param left 
 * @param right 
 * @returns 
 */
export const isURLEqual = (left: URL, right: URL) => {
  if (left.origin !== right.origin)
    return false;
  if (!isPathEqual(left.pathname, right.pathname))
    return false;
  if (left.hash !== right.hash)
    return false;

  if (left.searchParams.size !== right.searchParams.size)
    return false;

  for (const [key, value] of left.searchParams.entries())
    if (right.searchParams.get(key) !== value)
      return false;

  return true;
}

export const createRelativeURLFactory = (origin: string = document.location.origin) => {
  const createURL = (
    path: string = '/',
    params: Record<string, string> = {},
    hash: string = ''
  ) => {
    const url = new URL(path, origin);
    url.hash = hash;
    
    for (const [key, value] of Object.entries(params))
      url.searchParams.set(key, value);

    return url;
  }
  return { createURL };
}