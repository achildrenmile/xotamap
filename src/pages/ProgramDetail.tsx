import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import type { Program } from '../types/program';
import ProgramHeader from '../components/Encyclopedia/ProgramHeader';
import RulesTable from '../components/Encyclopedia/RulesTable';
import AwardsList from '../components/Encyclopedia/AwardsList';
import MarkdownRenderer from '../components/Encyclopedia/MarkdownRenderer';
import { useMarkdown } from '../hooks/useMarkdown';

interface ProgramIndex {
  programs: Program[];
}

function ExternalLinkIcon() {
  return (
    <svg
      className="inline-block w-3.5 h-3.5 ml-1 opacity-60"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14 5h5m0 0v5m0-5L10 14M5 7H3a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-2"
      />
    </svg>
  );
}

function QuickLinks({ program }: { program: Program }) {
  const { t } = useI18n();

  const links: Array<{ label: string; href: string | undefined }> = [
    { label: t.officialWebsite, href: program.links.website },
    { label: t.rules, href: program.links.rules },
    { label: t.logUpload, href: program.links.logUpload },
    { label: t.referenceSearch, href: program.links.referenceSearch },
    { label: t.spotPage, href: program.links.spotPage },
  ].filter((l): l is { label: string; href: string } => Boolean(l.href));

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ label, href }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-600 dark:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {label}
          <ExternalLinkIcon />
        </a>
      ))}
    </div>
  );
}

function ArticleSection({ program }: { program: Program }) {
  const { t } = useI18n();
  const slug = program.code.toLowerCase();
  const { content, loading, error } = useMarkdown(slug);

  if (loading) {
    return (
      <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
        {t.loading}
      </div>
    );
  }

  if (error || !content) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">{t.noMarkdown}</p>
    );
  }

  return <MarkdownRenderer content={content} />;
}

export default function ProgramDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    fetch('/data/programs/index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ProgramIndex>;
      })
      .then((data) => {
        const found = data.programs.find((p) => p.id === id) ?? null;
        setProgram(found);
      })
      .catch(() => {
        setProgram(null);
      });
  }, [id]);

  const handleShowOnMap = () => {
    navigate(`/?program=${id}`);
  };

  // Loading
  if (program === undefined) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">{t.loading}</p>
      </div>
    );
  }

  // 404
  if (program === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 bg-gray-50 dark:bg-gray-900">
        <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">
          {t.programNotFound}
        </p>
        <Link
          to="/encyclopedia"
          className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
        >
          &larr; {t.breadcrumbEncyclopedia}
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-6" aria-label="Breadcrumb">
          <Link
            to="/encyclopedia"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.breadcrumbEncyclopedia}
          </Link>
          <span className="text-gray-400 dark:text-gray-500" aria-hidden="true">/</span>
          <span className="text-gray-700 dark:text-gray-300 font-medium">{program.code}</span>
        </nav>

        {/* Program header card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
          <ProgramHeader program={program} />

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={handleShowOnMap}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="w-4 h-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.618V7.382a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              {t.showOnMap}
            </button>
          </div>
        </div>

        {/* Quick links */}
        <div className="mb-6">
          <QuickLinks program={program} />
        </div>

        {/* Markdown article */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 mb-6 shadow-sm">
          <ArticleSection program={program} />
        </div>

        {/* Rules table */}
        {program.rules && Object.keys(program.rules).length > 0 && (
          <div className="mb-6">
            <RulesTable rules={program.rules} />
          </div>
        )}

        {/* Awards list */}
        {program.awards && program.awards.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <AwardsList awards={program.awards} />
          </div>
        )}
      </div>
    </div>
  );
}
