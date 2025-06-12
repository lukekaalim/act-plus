import { createContext, useContext } from '@lukekaalim/act';
import { Router } from './router';

export const RouterContext = createContext<null | Router>(null);

export const useRouterContext = () => {
  const router = useContext(RouterContext);
  if (!router)
    throw new Error(`Missing Router in Context`);
  return router;
}