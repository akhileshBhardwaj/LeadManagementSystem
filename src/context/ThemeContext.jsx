import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { preferredTheme } from "../utils/theme";

const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(preferredTheme);
  const [hasUserChoice, setHasUserChoice] = useState(() => {
    try {
      return ["light", "dark"].includes(
        localStorage.getItem("leadmanager-theme"),
      );
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (hasUserChoice) {
      try {
        localStorage.setItem("leadmanager-theme", theme);
      } catch {
        /* The selection remains active until this page closes. */
      }
    }
  }, [theme, hasUserChoice]);
  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => {
        setHasUserChoice(true);
        setTheme((current) => (current === "dark" ? "light" : "dark"));
      },
    }),
    [theme],
  );
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
