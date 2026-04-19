/**
 * T38 — AdifExport
 *
 * Export button + options for downloading QSOs as ADIF file.
 * Supports per-reference export when activation has multiple references.
 */

import { useState } from 'react';
import { Download, ExternalLink, ChevronDown } from 'lucide-react';
import { useI18n } from '../../i18n';
import { exportAdifFile } from '../../services/adif';
import type { QSO, Activation } from '../../types/qso';

interface AdifExportProps {
  qsos: QSO[];
  activation?: Activation;
}

const UPLOAD_LINKS: Record<string, string> = {
  SOTA: 'https://www.sotadata.org.uk/en/upload',
  POTA: 'https://pota.app/#/activations',
  GMA: 'https://www.cqgma.org/logentry.php',
};

export default function AdifExport({ qsos, activation }: AdifExportProps) {
  const { t } = useI18n();
  const [showPrograms, setShowPrograms] = useState(false);

  const refs = activation?.references ?? [];
  const hasMultipleRefs = refs.length > 1;

  const handleExportAll = () => {
    exportAdifFile(qsos, activation);
  };

  const handleExportRef = (ref: string) => {
    exportAdifFile(qsos, activation, ref);
    setShowPrograms(false);
  };

  if (qsos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
      {/* Export buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          onClick={handleExportAll}
        >
          <Download size={16} />
          {t.adifExportAll}
        </button>

        {hasMultipleRefs && (
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowPrograms(!showPrograms)}
            >
              {t.adifExportByProgram}
              <ChevronDown size={14} />
            </button>
            {showPrograms && (
              <ul className="absolute z-10 mt-1 w-56 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1">
                {refs.map((ref) => (
                  <li key={ref}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-1.5 text-sm font-mono text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleExportRef(ref)}
                    >
                      {ref}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Hint text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t.adifUploadHint}
      </p>

      {/* Upload links */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <a
          href="https://wavelog.oeradio.at"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
        >
          Wavelog <ExternalLink size={12} />
        </a>
        {Object.entries(UPLOAD_LINKS).map(([name, url]) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
          >
            {name} <ExternalLink size={12} />
          </a>
        ))}
      </div>
    </div>
  );
}
