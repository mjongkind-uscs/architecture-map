import { useState } from "react";
import { createRoot } from "react-dom/client";

import ArchitectureMap from "./components/ArchitectureMap";
import "./components/keyframes.css";
import { paint, type as typeface } from "./components/theme";
import { ARCHITECTURE } from "./graph";

/**
 * Standalone mount: the map plus a light/dark toggle. The page's inline
 * boot script has already put `.dark` on <html> (localStorage, falling back
 * to the OS preference) before React runs, so the initial state is read
 * straight off the DOM and the toggle only has to keep the two in sync.
 */
function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  const toggle = () => {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("am-theme", next ? "dark" : "light");
    } catch {
      /* private mode — the preference just won't stick */
    }
    setDark(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      style={{
        position: "fixed",
        right: 10,
        bottom: 40,
        zIndex: 10,
        padding: "6px 10px",
        borderRadius: 4,
        border: `1px solid ${paint.border}`,
        background: paint.surface,
        color: paint.inkTertiary,
        fontFamily: typeface.mono,
        fontSize: 10,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      {dark ? "light" : "dark"}
    </button>
  );
}

createRoot(document.getElementById("root")!).render(
  <>
    <ArchitectureMap data={ARCHITECTURE} />
    <ThemeToggle />
  </>,
);
