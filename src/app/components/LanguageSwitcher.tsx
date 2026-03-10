"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/i18n/config";
import { ChevronDown } from "lucide-react";

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const currentLang = (
    Object.keys(SUPPORTED_LANGUAGES).includes(i18n.language)
      ? i18n.language
      : "en"
  ) as SupportedLanguage;

  const handleSelect = (lang: SupportedLanguage) => {
    i18n.changeLanguage(lang);
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 bg-gray-900 border border-white/20 rounded-full py-2 px-3 text-sm text-white hover:bg-gray-800 transition-colors whitespace-nowrap"
      >
        {SUPPORTED_LANGUAGES[currentLang]}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 bg-gray-900 border border-white/20 rounded-lg overflow-hidden z-50 min-w-full shadow-lg">
          {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-700 transition-colors whitespace-nowrap ${
                lang === currentLang ? "text-cyan-400 font-bold" : "text-white"
              }`}
            >
              {SUPPORTED_LANGUAGES[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
