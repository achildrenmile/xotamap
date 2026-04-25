import { useState, useEffect, useMemo } from 'react';
import { useI18n } from '../i18n';
import type { Program } from '../types/program';
import ProgramCard from '../components/Encyclopedia/ProgramCard';
import ProgramFilter from '../components/Encyclopedia/ProgramFilter';

interface ProgramIndex {
  programs: Program[];
}

export default function Encyclopedia() {
  const { t } = useI18n();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/data/programs/index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<ProgramIndex>;
      })
      .then((data) => {
        setPrograms(data.programs.filter((p: Program) => p.hasReferences));
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load programs');
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return programs.filter((p) => {
      if (q) {
        return (
          p.code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.nameDE.toLowerCase().includes(q) ||
          p.focus.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [programs, search]);

  const programsFoundText = t.programsFound.replace('{count}', String(filtered.length));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">{t.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <p className="text-red-500 dark:text-red-400">
          {t.error}: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
            {t.encyclopediaTitle}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{programsFoundText}</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <ProgramFilter
            search={search}
            onSearchChange={setSearch}
          />
        </div>

        {/* Results grid */}
        {filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-16">{t.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
