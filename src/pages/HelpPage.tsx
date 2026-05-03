import { Map, BookOpen, Radio, ClipboardList, MousePointerClick, Lightbulb } from 'lucide-react';
import { useI18n } from '../i18n';

interface HelpSection {
  icon: React.ReactNode;
  titleKey: keyof ReturnType<typeof useI18n>['t'];
  textKey: keyof ReturnType<typeof useI18n>['t'];
}

const sections: HelpSection[] = [
  { icon: <Map className="w-5 h-5" />, titleKey: 'helpMapTitle', textKey: 'helpMapText' },
  { icon: <BookOpen className="w-5 h-5" />, titleKey: 'helpEncyclopediaTitle', textKey: 'helpEncyclopediaText' },
  { icon: <Radio className="w-5 h-5" />, titleKey: 'helpSpotsTitle', textKey: 'helpSpotsText' },
  { icon: <ClipboardList className="w-5 h-5" />, titleKey: 'helpLogTitle', textKey: 'helpLogText' },
  { icon: <MousePointerClick className="w-5 h-5" />, titleKey: 'helpWhatCountsTitle', textKey: 'helpWhatCountsText' },
];

export default function HelpPage() {
  const { t } = useI18n();

  const tips = [t.helpTip1, t.helpTip2, t.helpTip3, t.helpTip4];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t.helpTitle}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t.helpIntro}
        </p>

        <div className="space-y-4">
          {sections.map(({ icon, titleKey, textKey }) => (
            <div
              key={titleKey}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-blue-600 dark:text-blue-400">{icon}</span>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {t[titleKey]}
                </h2>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t[textKey]}
              </p>
            </div>
          ))}

          {/* Tips */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 dark:text-blue-400">
                <Lightbulb className="w-5 h-5" />
              </span>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {t.helpTipsTitle}
              </h2>
            </div>
            <ul className="space-y-1.5">
              {tips.map((tip, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-gray-400 dark:text-gray-500 mt-0.5 shrink-0">&bull;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
