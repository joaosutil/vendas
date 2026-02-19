"use client";

import { useEffect, useState } from "react";

type ReaderTheme = "light" | "dark" | "reading";

const STORAGE_KEY = "mdt_reader_theme";

function applyTheme(theme: ReaderTheme) {
  document.documentElement.setAttribute("data-reader-theme", theme);
}

export function ThemeModeToggle() {
  const [theme, setTheme] = useState<ReaderTheme>(() => {
    if (typeof window === "undefined") return "light";
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark" || saved === "reading") return saved;
    return "light";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function updateTheme(next: ReaderTheme) {
    setTheme(next);
    applyTheme(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  const buttonBase = "rounded-md border px-2 py-1 text-xs font-semibold";

  return (
    <div className="flex items-center gap-1 rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] p-1" role="group" aria-label="Selecionar tema">
      <button
        type="button"
        onClick={() => updateTheme("light")}
        aria-pressed={theme === "light"}
        className={`${buttonBase} ${theme === "light" ? "bg-[var(--ink)] text-white" : "bg-white/70 text-[var(--carvao)]"}`}
      >
        Claro
      </button>
      <button
        type="button"
        onClick={() => updateTheme("dark")}
        aria-pressed={theme === "dark"}
        className={`${buttonBase} ${theme === "dark" ? "bg-[var(--ink)] text-white" : "bg-white/70 text-[var(--carvao)]"}`}
      >
        Escuro
      </button>
      <button
        type="button"
        onClick={() => updateTheme("reading")}
        aria-pressed={theme === "reading"}
        className={`${buttonBase} ${theme === "reading" ? "bg-[var(--ink)] text-white" : "bg-white/70 text-[var(--carvao)]"}`}
      >
        Leitura
      </button>
    </div>
  );
}
