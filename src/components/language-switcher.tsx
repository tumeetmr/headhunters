"use client";

import { Globe, ChevronDown } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { Locale, locales } from "@/lib/i18n";
import { useState, useRef, useEffect } from "react";

const localeLabels: Record<Locale, string> = {
  en: "English",
  mn: "Монгол",
};

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-sm text-primary-text transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Globe className="h-4 w-4" />
        {localeLabels[locale]}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 min-w-30 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          {locales.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLocale(l);
                setOpen(false);
              }}
              className={`flex w-full items-center px-3 py-2 text-sm transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                l === locale
                  ? "font-semibold text-[#36CCC7]"
                  : "text-primary-text dark:text-zinc-300"
              }`}
            >
              {localeLabels[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
