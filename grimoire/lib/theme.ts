import { Component, createContext, useContext } from "@lukekaalim/act";

export type ThemeContext = {
  VerticalNav: Component
}

export const ThemeContext = createContext<ThemeContext | null>(null);

export const useDocThemeContext = (): ThemeContext => {
  const theme = useContext(ThemeContext);
  if (!theme)
    throw new Error(`No theme context`)

  return theme;
}