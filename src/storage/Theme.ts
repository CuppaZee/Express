import { storageAtom } from "../utils/useStorage";

export interface ThemeSelection {
  style: "system" | "light" | "dark";
}

export const ThemeStorage = storageAtom<ThemeSelection>("theme", { style: "system" });