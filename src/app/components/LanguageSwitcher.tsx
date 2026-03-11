"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/i18n/config";
import { Check, ChevronDown, Globe } from "lucide-react";

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
        className={`bg-white/5 hover:bg-white/10 border rounded-full p-2 px-4 flex gap-2 items-center transition-all ${
          open
            ? "border-[rgba(0,250,237,1)]"
            : "border-white/20 hover:border-[rgba(0,250,237,1)]"
        }`}
        style={open ? { boxShadow: "0 0 3px 0 rgba(71,255,246,1)" } : undefined}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 3px 0 rgba(71,255,246,1)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.boxShadow = ""; }}
      >
        <Globe className="w-6 h-6" />
        {SUPPORTED_LANGUAGES[currentLang]}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 mt-2 bg-gray-800 rounded-lg overflow-hidden z-50 min-w-[120px] shadow-xl gap-1 py-2 flex flex-col">
          {(Object.keys(SUPPORTED_LANGUAGES) as SupportedLanguage[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleSelect(lang)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-white hover:bg-gray-700 transition-colors whitespace-nowrap ${lang === currentLang ? "bg-[#00FAED1F]" : ""}`}
            >
              {SUPPORTED_LANGUAGES[lang]}
              {lang === currentLang && <Check className="w-4 h-4 ml-3 text-white" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
