/**
 * T37 — QsoTable
 *
 * Table of QSOs for the current activation.
 * Sorted by time (newest on top). Supports inline editing and deletion.
 */

import { useState } from 'react';
import type { QSO } from '../../types/qso';
import { updateQso, deleteQso } from '../../services/db';
import { useI18n } from '../../i18n';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatUtc(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toISOString().slice(11, 16) + 'z';
  } catch {
    return iso;
  }
}

function formatFreq(khz: number): string {
  if (khz >= 1000) return (khz / 1000).toFixed(3) + ' MHz';
  return khz.toFixed(1) + ' kHz';
}

// ---------------------------------------------------------------------------
// Inline edit row
// ---------------------------------------------------------------------------

interface EditRowProps {
  qso: QSO;
  onSave: (changes: Partial<QSO>) => void;
  onCancel: () => void;
  t: ReturnType<typeof useI18n>['t'];
}

function EditRow({ qso, onSave, onCancel, t }: EditRowProps) {
  const [callsign, setCallsign] = useState(qso.callsign);
  const [frequency, setFrequency] = useState(String(qso.frequency));
  const [mode, setMode] = useState(qso.mode);
  const [rstSent, setRstSent] = useState(qso.rstSent);
  const [rstReceived, setRstReceived] = useState(qso.rstReceived);
  const [notes, setNotes] = useState(qso.notes ?? '');

  const inputClass =
    'w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-1.5 py-0.5 text-xs font-mono text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500';

  const handleSave = () => {
    onSave({
      callsign: callsign.trim().toUpperCase(),
      frequency: parseFloat(frequency) || 0,
      mode,
      rstSent,
      rstReceived,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <tr className="bg-blue-50 dark:bg-blue-900/20">
      <td className="px-2 py-1 text-xs font-mono text-gray-500">{formatUtc(qso.timestamp)}</td>
      <td className="px-2 py-1">
        <input value={callsign} onChange={(e) => setCallsign(e.target.value.toUpperCase())} className={inputClass} />
      </td>
      <td className="px-2 py-1">
        <input value={frequency} onChange={(e) => setFrequency(e.target.value)} className={inputClass} type="number" step="0.1" />
      </td>
      <td className="px-2 py-1">
        <input value={mode} onChange={(e) => setMode(e.target.value)} className={inputClass} />
      </td>
      <td className="px-2 py-1">
        <input value={rstSent} onChange={(e) => setRstSent(e.target.value)} className={`${inputClass} w-12`} maxLength={3} />
      </td>
      <td className="px-2 py-1">
        <input value={rstReceived} onChange={(e) => setRstReceived(e.target.value)} className={`${inputClass} w-12`} maxLength={3} />
      </td>
      <td className="px-2 py-1">
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className={inputClass} />
      </td>
      <td className="px-2 py-1 whitespace-nowrap">
        <button onClick={handleSave} className="mr-1 text-xs px-2 py-0.5 rounded bg-blue-600 text-white hover:bg-blue-700">
          {t.save}
        </button>
        <button onClick={onCancel} className="text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          {t.cancel}
        </button>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface QsoTableProps {
  qsos: QSO[];
  onChanged: () => void;
}

export function QsoTable({ qsos, onChanged }: QsoTableProps) {
  const { t } = useI18n();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // Newest first
  const sorted = [...qsos].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSave = async (id: number, changes: Partial<QSO>) => {
    await updateQso(id, changes);
    setEditingId(null);
    onChanged();
  };

  const handleDelete = async (id: number) => {
    await deleteQso(id);
    setConfirmDeleteId(null);
    onChanged();
  };

  const headerClass =
    'px-2 py-2 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide whitespace-nowrap';

  if (qsos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-600">
        <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p className="text-sm">{t.noQsos}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th className={headerClass}>UTC</th>
              <th className={headerClass}>{t.callsign}</th>
              <th className={headerClass}>{t.frequency}</th>
              <th className={headerClass}>{t.mode}</th>
              <th className={headerClass}>{t.rstSent}</th>
              <th className={headerClass}>{t.rstReceived}</th>
              <th className={headerClass}>{t.notes}</th>
              <th className={`${headerClass} text-right`}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
            {sorted.map((qso) => {
              const id = qso.id!;
              if (editingId === id) {
                return (
                  <EditRow
                    key={id}
                    qso={qso}
                    onSave={(changes) => handleSave(id, changes)}
                    onCancel={() => setEditingId(null)}
                    t={t}
                  />
                );
              }
              return (
                <tr
                  key={id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <td className="px-2 py-1.5 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {formatUtc(qso.timestamp)}
                  </td>
                  <td className="px-2 py-1.5 text-sm font-mono font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                    {qso.callsign}
                  </td>
                  <td className="px-2 py-1.5 text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {formatFreq(qso.frequency)}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap">
                    <span className="inline-block rounded px-1.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {qso.mode}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-sm font-mono text-gray-600 dark:text-gray-400">{qso.rstSent}</td>
                  <td className="px-2 py-1.5 text-sm font-mono text-gray-600 dark:text-gray-400">{qso.rstReceived}</td>
                  <td className="px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                    {qso.notes || ''}
                  </td>
                  <td className="px-2 py-1.5 whitespace-nowrap text-right">
                    {confirmDeleteId === id ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="text-xs text-red-600 dark:text-red-400">{t.confirmDelete}</span>
                        <button
                          onClick={() => handleDelete(id)}
                          className="text-xs px-1.5 py-0.5 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                          {t.yes}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs px-1.5 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400"
                        >
                          {t.no}
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditingId(id)}
                          className="text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(id)}
                          className="text-xs px-2 py-0.5 rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          {t.delete}
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
        {sorted.map((qso) => {
          const id = qso.id!;
          return (
            <div key={id} className="p-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {qso.callsign}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">{formatUtc(qso.timestamp)}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setEditingId(editingId === id ? null : id)}
                    className="text-xs px-2 py-0.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300"
                  >
                    {t.edit}
                  </button>
                  <button
                    onClick={() => {
                      if (confirmDeleteId === id) {
                        handleDelete(id);
                      } else {
                        setConfirmDeleteId(id);
                      }
                    }}
                    className="text-xs px-2 py-0.5 rounded border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400"
                  >
                    {confirmDeleteId === id ? t.confirmDelete : t.delete}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-sm">
                <span className="font-mono text-gray-700 dark:text-gray-300">{formatFreq(qso.frequency)}</span>
                <span className="rounded px-1.5 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {qso.mode}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  {qso.rstSent} / {qso.rstReceived}
                </span>
              </div>
              {qso.notes && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{qso.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
