import { Globe } from 'lucide-react';
import { useI18n } from '../../i18n';
import type { Language } from '../../i18n';

const languageLabels: Record<Language, string> = {
  de: 'DE',
  en: 'EN',
  it: 'IT',
  sl: 'SL',
};

const allLanguages: Language[] = ['de', 'en', 'it', 'sl'];

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
      <div className="flex items-center">
        {allLanguages.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-1.5 py-1 text-xs font-medium rounded transition-colors ${
              lang === language
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={languageLabels[lang]}
            aria-pressed={lang === language}
          >
            {languageLabels[lang]}
          </button>
        ))}
      </div>
    </div>
  );
}
