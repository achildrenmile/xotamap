import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Language, Translations } from './translations';
import { de } from './de';
import { en } from './en';
import { it } from './it';
import { sl } from './sl';

const translations: Record<Language, Translations> = { de, en, it, sl };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'xotamap-language';

function detectLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'de' || stored === 'en' || stored === 'it' || stored === 'sl') {
    return stored;
  }
  // Try to match browser language
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'de') return 'de';
  if (browserLang === 'it') return 'it';
  if (browserLang === 'sl') return 'sl';
  // Default to German as primary language for oeradio.at context
  return 'de';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = translations[language];

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
