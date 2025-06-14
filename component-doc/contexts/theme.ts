import { createContext } from "@lukekaalim/act";

export type DocTheme = {
  primaryColor: string,
  secondaryColor: string,
};

export const themeContext = createContext<DocTheme | null>(null);