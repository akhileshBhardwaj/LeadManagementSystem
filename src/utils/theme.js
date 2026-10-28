export function preferredTheme() {
  try {
    const saved = localStorage.getItem("leadmanager-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* Storage can be disabled by the browser. */
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}
