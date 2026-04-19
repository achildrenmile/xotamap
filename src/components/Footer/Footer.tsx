import { useI18n } from '../../i18n';
import { useConfig } from '../../hooks/useConfig';

interface FooterProps {
  onOpenImprint: () => void;
  onOpenPrivacy: () => void;
}

export function Footer({ onOpenImprint, onOpenPrivacy }: FooterProps) {
  const { t } = useI18n();
  const { config } = useConfig();

  const version = config.version || '0.1.0';
  const parentSiteName = config.parentSiteName;
  const parentSiteUrl = config.parentSiteUrl;

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          {/* Version + tool name */}
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {t.appTitle} v{version}
          </span>

          {parentSiteName && parentSiteUrl && (
            <>
              <span className="hidden sm:inline" aria-hidden="true">•</span>
              <a
                href={parentSiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {t.partOfTools.replace('{name}', parentSiteName)}
              </a>
            </>
          )}

          <span className="hidden sm:inline" aria-hidden="true">•</span>

          <button
            onClick={onOpenImprint}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            type="button"
          >
            {t.imprint}
          </button>

          <span aria-hidden="true">|</span>

          <button
            onClick={onOpenPrivacy}
            className="text-blue-600 dark:text-blue-400 hover:underline"
            type="button"
          >
            {t.privacy}
          </button>

          <span aria-hidden="true">|</span>

          <a
            href="https://github.com/achildrenmile/xotamap"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
