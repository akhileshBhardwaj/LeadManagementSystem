import { useEffect } from "react";

// Closes popovers when the user clicks anywhere outside the given element.
export default function useOutsideClick(ref, onOutside, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const handleDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) onOutside();
    };
    const handleKey = (event) => {
      if (event.key === "Escape") onOutside();
    };
    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [ref, onOutside, active]);
}
