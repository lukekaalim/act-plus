import { Node, Ref, useEffect, useMemo, useState } from '@lukekaalim/act';

export type NavigationController = {
  navigate: (destination: URL) => void,
  location: URL,
};

export const useRootNavigationController = (
  initialLocation: URL,
): NavigationController => {
  const [location, setLocation] = useState(initialLocation);

  const navigate = (destination: URL) => {
    setLocation(prevLocation => {
      if (prevLocation.host !== destination.host)
        window.location.href = destination.href;

      window.history.pushState(null, '', destination);
      return destination;
    });
  }

  return useMemo(() => ({
    location,
    navigate,
  }), [location])
}

const findParentAnchor = (element: HTMLElement): HTMLAnchorElement | null => {
  if (element instanceof HTMLAnchorElement)
    return element;

  if (!element.parentElement)
    return null;
  
  return findParentAnchor(element.parentElement);
}

export const useNavigationListener = (rootRef: Ref<null | HTMLElement>, navigation: NavigationController) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root)
      return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || !(event.target instanceof HTMLElement))
        return;
      
      const anchor = findParentAnchor(event.target);
      if (!anchor)
        return;
      const newURL = new URL(anchor.href, navigation.location);
      navigation.navigate(newURL);
      event.preventDefault();
    };
    root.addEventListener('click', onClick);
    return () => {
      root.removeEventListener('click', onClick);
    }
  }, [])
}