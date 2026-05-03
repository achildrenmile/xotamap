import { Map, BookOpen, Radio, ClipboardList, MousePointerClick, Lightbulb, Github } from 'lucide-react';
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
          {/* Contribute */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-600 dark:text-blue-400">
                <Github className="w-5 h-5" />
              </span>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {t.helpContributeTitle}
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
              {t.helpContributeText}
            </p>
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              {t.helpContributeIdeas}
            </p>
            <ul className="space-y-1 mb-3">
              {[t.helpContributeIdea1, t.helpContributeIdea2, t.helpContributeIdea3, t.helpContributeIdea4].map((idea, i) => (
                <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <span className="text-blue-400 dark:text-blue-500 mt-0.5 shrink-0">&bull;</span>
                  {idea}
                </li>
              ))}
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              {t.helpContributeCta}
            </p>
            <a
              href="https://github.com/achildrenmile/xotamap"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              <Github className="w-4 h-4" />
              {t.helpContributeGithub}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
