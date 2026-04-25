import { MapPin } from 'lucide-react';
import { useI18n } from '../../i18n';
import { ParentSiteLogo } from '../ParentSiteLogo/ParentSiteLogo';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector';
import { Navigation } from '../Navigation/Navigation';

export function Header() {
  const { t } = useI18n();

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-3">
          {/* Left: Parent logo + App branding */}
          <div className="flex items-center gap-3 min-w-0">
            <ParentSiteLogo />

            {/* Divider between logo and app title — only when logo present */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-700" />
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-6 h-6 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <div className="min-w-0">
                <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight truncate">
                  {t.appTitle}
                </h1>
                <p className="hidden sm:block text-xs text-gray-500 dark:text-gray-400 leading-tight truncate">
                  {t.appSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Center: Navigation tabs (desktop only) */}
          <Navigation variant="tabs" />

          {/* Right: Language + Theme */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <LanguageSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
