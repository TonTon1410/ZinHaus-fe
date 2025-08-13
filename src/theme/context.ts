import { createContext, useContext } from "react";

export type Theme = "light" | "dark";
export type ThemeCtx = { theme: Theme; toggle: () => void; set: (t: Theme) => void };

export const ThemeContext = createContext<ThemeCtx>({
  theme: "light",
  toggle: () => {},
  set: () => {},
});

export const useTheme = () => useContext(ThemeContext);
