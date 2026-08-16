"use client";

import { useEffect, useRef, useState } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { useTheme, type ThemeMode } from "@/contexts/ThemeContext";

const OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/**
 * Compact theme switcher — click the icon to cycle to the next mode, or
 * click-and-hold / use the dropdown for direct selection. Designed to drop
 * into a navbar or sidebar without needing extra layout space.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const ActiveIcon = resolvedTheme === "light" ? Sun : Moon;

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label="Change theme"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-9 h-9 rounded-full transition-colors duration-150
          text-[var(--text-secondary)] hover:text-[var(--text-primary)]
          hover:bg-[var(--surface-alt)]"
      >
        <ActiveIcon size={17} strokeWidth={2} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-40 py-1.5 rounded-xl shadow-xl
            bg-[var(--surface)] border border-[var(--border-subtle)]"
        >
          {OPTIONS.map(({ value, label, icon: Icon }) => {
            const active = theme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-150
                  text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-alt)]"
              >
                <Icon size={15} strokeWidth={2} />
                <span className="flex-1 text-left">{label}</span>
                {active && <Check size={14} style={{ color: "var(--brand)" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
