/**
 * T35–T39 — LogView
 *
 * Full log page combining:
 * - WavelogHint (persistent storage info)
 * - ActivationHeader (current activation + QSO count)
 * - QsoForm (new QSO entry)
 * - QsoTable (QSOs for current activation)
 * - LocalStorageWarning (shown when > 50 QSOs without export)
 */

import { useState, useEffect, useCallback } from 'react';
import { WavelogHint } from '../components/Log/WavelogHint';
import { LocalStorageWarning } from '../components/Log/LocalStorageWarning';
import { ActivationHeader } from '../components/Log/ActivationHeader';
import { QsoForm } from '../components/Log/QsoForm';
import { QsoTable } from '../components/Log/QsoTable';
import {
  getCurrentActivation,
  addActivation,
  getQsos,
} from '../services/db';
import type { Activation, QSO } from '../types/qso';
import { useI18n } from '../i18n';

// ---------------------------------------------------------------------------
// New Activation Modal
// ---------------------------------------------------------------------------

interface NewActivationModalProps {
  onConfirm: (location: string, references: string[]) => void;
  onCancel: () => void;
  t: ReturnType<typeof useI18n>['t'];
}

function NewActivationModal({ onConfirm, onCancel, t }: NewActivationModalProps) {
  const [location, setLocation] = useState('');
  const [refs, setRefs] = useState<string[]>(['']);

  const handleRef = (idx: number, val: string) => {
    setRefs((r) => { const n = [...r]; n[idx] = val; return n; });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(location.trim(), refs.filter(Boolean));
  };

  const inputClass =
    'block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">{t.newActivation}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              {t.activationLocation}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={inputClass}
              placeholder={t.activationLocationPlaceholder}
              autoFocus
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">{t.references}</label>
              <button
                type="button"
                onClick={() => setRefs((r) => [...r, ''])}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                + {t.addReference}
              </button>
            </div>
            <div className="space-y-1">
              {refs.map((ref, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={ref}
                    onChange={(e) => handleRef(idx, e.target.value)}
                    className={`${inputClass} font-mono text-xs`}
                    placeholder="SOTA:OE/TI-001"
                  />
                  {refs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setRefs((r) => r.filter((_, i) => i !== idx))}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-1.5 text-sm rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-sm rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {t.startActivation}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LogView
// ---------------------------------------------------------------------------

export default function LogView() {
  const { t } = useI18n();
  const [activation, setActivation] = useState<Activation | null>(null);
  const [qsos, setQsos] = useState<QSO[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshData = useCallback(async () => {
    const act = await getCurrentActivation();
    setActivation(act ?? null);
    if (act?.id !== undefined) {
      const q = await getQsos(act.id);
      setQsos(q);
    } else {
      setQsos([]);
    }
  }, []);

  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, [refreshData]);

  const handleNewActivation = async (location: string, references: string[]) => {
    const id = await addActivation({
      date: new Date().toISOString().slice(0, 10),
      location,
      references,
    });
    setShowNewModal(false);
    const act = await getCurrentActivation();
    setActivation(act ?? null);
    // If we just created it, refresh with the new id
    if (act?.id !== undefined) {
      setQsos(await getQsos(act.id));
    }
    // Suppress unused id warning
    void id;
  };

  const handleEndActivation = () => {
    // Ending an activation just means starting fresh — we keep data in DB
    setActivation(null);
    setQsos([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-5xl mx-auto w-full">
      {/* Page title */}
      <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t.logTitle}</h1>

      {/* T39 — Wavelog hint */}
      <WavelogHint />

      {/* T37 — Activation header */}
      <ActivationHeader
        activation={activation}
        qsoCount={qsos.length}
        onNewActivation={() => setShowNewModal(true)}
        onEndActivation={handleEndActivation}
      />

      {/* T36 — QSO form (only shown when activation is active) */}
      {activation?.id !== undefined && (
        <QsoForm
          activationId={activation.id}
          activeReferences={activation.references}
          onQsoAdded={refreshData}
        />
      )}

      {/* T37 — QSO table */}
      {activation && (
        <QsoTable qsos={qsos} onChanged={refreshData} />
      )}

      {/* T39 — Local storage warning (> 50 QSOs) */}
      <LocalStorageWarning qsoCount={qsos.length} />

      {/* New activation modal */}
      {showNewModal && (
        <NewActivationModal
          onConfirm={handleNewActivation}
          onCancel={() => setShowNewModal(false)}
          t={t}
        />
      )}
    </div>
  );
}
