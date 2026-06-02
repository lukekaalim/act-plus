import { useEffect, useState } from "@lukekaalim/act";
import { URLRouter } from "./URLRouter";

/**
 * Get the current Router location and track it in state,
 * causing re-renders when the location changes (i.e. via
 * navigation).
 * 
 * @param router 
 * @returns The Routers current location.
 */
export const useRouterLocation = (router: URLRouter) => {
  const [location, setLocation] = useState(router.location);

  useEffect(() => {
    setLocation(router.location);

    const sub = router.events.subscribe(() => {
      setLocation(router.location)
    });

    return () => sub.cancel();
  }, [router])

  return location;
}