import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useI18n } from '../../i18n';
import { impressum } from './impressum';
import { datenschutz } from './datenschutz';

interface LegalModalProps {
  type: 'imprint' | 'privacy';
  onClose: () => void;
}

export function LegalModal({ type, onClose }: LegalModalProps) {
  const { language, t } = useI18n();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const title = type === 'imprint' ? t.imprint : t.privacy;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={t.close}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {type === 'imprint' ? (
            <ImprintContent language={language} />
          ) : (
            <PrivacyContent language={language} />
          )}
        </div>
      </div>
    </div>
  );
}

function ImprintContent({ language }: { language: string }) {
  const content = impressum[language] || impressum['de'];

  return (
    <div className="space-y-6 text-gray-700 dark:text-gray-300">
      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
          {content.publisherLabel}
        </h3>
        <div className="space-y-1">
          <p className="font-medium">{content.publisherName}</p>
          <p>
            {content.zvrLabel}: {content.zvrNumber}
          </p>
          <p>
            {content.emailLabel}:{' '}
            <a
              href={`mailto:${content.email}`}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {content.email}
            </a>
          </p>
          <p>
            {content.webLabel}:{' '}
            <a
              href={content.webUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {content.web}
            </a>
          </p>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {content.liabilityTitle}
        </h3>
        <p className="text-sm leading-relaxed">{content.liabilityText}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {content.copyrightTitle}
        </h3>
        <p className="text-sm leading-relaxed">{content.copyrightText}</p>
      </section>
    </div>
  );
}

function PrivacyContent({ language }: { language: string }) {
  const content = datenschutz[language] || datenschutz['de'];

  return (
    <div className="space-y-6 text-gray-700 dark:text-gray-300">
      <p className="leading-relaxed">{content.intro}</p>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {content.staticAppTitle}
        </h3>
        <p className="text-sm leading-relaxed">{content.staticAppText}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {content.noDataTitle}
        </h3>
        <p className="text-sm mb-2">{content.noDataText}</p>
        <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
          {content.noDataItems.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {content.localStorageTitle}
        </h3>
        <p className="text-sm leading-relaxed">{content.localStorageText}</p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {content.externalApisTitle}
        </h3>
        <p className="text-sm mb-3">{content.externalApisText}</p>
        <ul className="space-y-2 text-sm">
          {content.externalApisItems.map((api) => (
            <li key={api.name} className="flex flex-col gap-0.5">
              <a
                href={api.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                {api.name}
              </a>
              <span className="text-gray-600 dark:text-gray-400">{api.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          {content.contactTitle}
        </h3>
        <p className="text-sm mb-1">{content.contactText}</p>
        <a
          href={`mailto:${content.contactEmail}`}
          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          {content.contactEmail}
        </a>
      </section>
    </div>
  );
}
