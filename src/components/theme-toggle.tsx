"use client";

import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  function toggleTheme() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("garagem-theme", next);
  }

  return (
    <button onClick={toggleTheme} className="icon-button" aria-label="Alternar entre modo claro e escuro" title="Alternar tema">
      <Sun size={20} className="theme-icon-sun"/>
      <Moon size={20} className="theme-icon-moon"/>
    </button>
  );
}
