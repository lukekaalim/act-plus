import { createContext, useContext } from "@lukekaalim/act";
import { AllStore } from "../stores/all";

export const storeContext = createContext<AllStore | null>(null);

export const useStore = () => {
  const allStore = useContext(storeContext);
  if (!allStore)
    throw new Error();

  return allStore;
}
