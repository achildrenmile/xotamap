/**
 * T36 — QsoForm
 *
 * Form for logging a new QSO during an activation.
 * Auto-fills UTC time, GPS coordinates (if available), and Maidenhead grid.
 * Saves to IndexedDB on submit, clears form, refocuses callsign input.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { addQso } from '../../services/db';
import type { QSO } from '../../types/qso';
import { useI18n } from '../../i18n';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MODES = ['SSB', 'CW', 'FM', 'FT8', 'FT4', 'AM', 'RTTY', 'DSTAR', 'DMR', 'C4FM'] as const;
type Mode = typeof MODES[number];

const CW_DIGI_MODES: Mode[] = ['CW', 'FT8', 'FT4', 'RTTY'];

function defaultRst(mode: string): string {
  if (CW_DIGI_MODES.includes(mode as Mode)) return '599';
  return '59';
}

/** Convert decimal lat/lon to Maidenhead grid locator (6-char) */
function toMaidenhead(lat: number, lon: number): string {
  const adjLon = lon + 180;
  const adjLat = lat + 90;
  const fieldLon = Math.floor(adjLon / 20);
  const fieldLat = Math.floor(adjLat / 10);
  const sqLon = Math.floor((adjLon % 20) / 2);
  const sqLat = Math.floor(adjLat % 10);
  const subLon = Math.floor(((adjLon % 20) % 2) * 12);
  const subLat = Math.floor((adjLat % 1) * 24);
  return (
    String.fromCharCode(65 + fieldLon) +
    String.fromCharCode(65 + fieldLat) +
    String(sqLon) +
    String(sqLat) +
    String.fromCharCode(97 + subLon) +
    String.fromCharCode(97 + subLat)
  );
}

function utcNow(): string {
  return new Date().toISOString();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface QsoFormProps {
  activationId: number;
  activeReferences: string[];
  onQsoAdded: () => void;
}

interface FormState {
  callsign: string;
  frequency: string;
  mode: Mode;
  rstSent: string;
  rstReceived: string;
  notes: string;
  references: string[];
}

const initialForm = (refs: string[]): FormState => ({
  callsign: '',
  frequency: '14285',
  mode: 'SSB',
  rstSent: '59',
  rstReceived: '59',
  notes: '',
  references: refs,
});

export function QsoForm({ activationId, activeReferences, onQsoAdded }: QsoFormProps) {
  const { t } = useI18n();
  const callsignRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(initialForm(activeReferences));
  const [gpsPos, setGpsPos] = useState<GeolocationCoordinates | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Try to get GPS position once on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsPos(pos.coords),
        () => { /* GPS not available, that's fine */ },
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  }, []);

  // Sync references when activeReferences changes
  useEffect(() => {
    setForm((f) => ({ ...f, references: activeReferences }));
  }, [activeReferences]);

  // Update RST defaults when mode changes
  const handleModeChange = useCallback((mode: Mode) => {
    setForm((f) => ({
      ...f,
      mode,
      rstSent: defaultRst(mode),
      rstReceived: defaultRst(mode),
    }));
  }, []);

  const handleChange = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = field === 'callsign' ? e.target.value.toUpperCase() : e.target.value;
        setForm((f) => ({ ...f, [field]: value }));
      },
    []
  );

  const handleReferenceChange = useCallback((idx: number, value: string) => {
    setForm((f) => {
      const refs = [...f.references];
      refs[idx] = value;
      return { ...f, references: refs };
    });
  }, []);

  const handleAddReference = useCallback(() => {
    setForm((f) => ({ ...f, references: [...f.references, ''] }));
  }, []);

  const handleRemoveReference = useCallback((idx: number) => {
    setForm((f) => ({ ...f, references: f.references.filter((_, i) => i !== idx) }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.callsign.trim()) {
      setError(t.callsignRequired);
      callsignRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const qso: Omit<QSO, 'id'> = {
        activationId,
        timestamp: utcNow(),
        callsign: form.callsign.trim(),
        frequency: parseFloat(form.frequency) || 0,
        mode: form.mode,
        rstSent: form.rstSent,
        rstReceived: form.rstReceived,
        notes: form.notes.trim() || undefined,
        references: form.references.filter(Boolean),
        myLat: gpsPos?.latitude,
        myLon: gpsPos?.longitude,
        myGrid:
          gpsPos ? toMaidenhead(gpsPos.latitude, gpsPos.longitude) : undefined,
      };

      await addQso(qso);
      onQsoAdded();

      // Reset form, keep frequency/mode/references
      setForm((f) => ({
        ...initialForm(f.references),
        frequency: f.frequency,
        mode: f.mode,
        rstSent: defaultRst(f.mode),
        rstReceived: defaultRst(f.mode),
      }));

      // Refocus callsign
      setTimeout(() => callsignRef.current?.focus(), 0);
    } catch (err) {
      setError(String(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400';
  const labelClass = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {error && (
        <div className="mb-3 px-3 py-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Callsign */}
        <div className="col-span-2 sm:col-span-1">
          <label className={labelClass}>{t.callsign} *</label>
          <input
            ref={callsignRef}
            type="text"
            value={form.callsign}
            onChange={handleChange('callsign')}
            className={`${inputClass} font-mono uppercase`}
            placeholder="OE1XYZ"
            autoComplete="off"
            autoCapitalize="characters"
            required
          />
        </div>

        {/* Frequency */}
        <div>
          <label className={labelClass}>{t.frequency} (kHz)</label>
          <input
            type="number"
            value={form.frequency}
            onChange={handleChange('frequency')}
            className={`${inputClass} font-mono`}
            placeholder="14285"
            min={0}
            step={0.1}
            required
          />
        </div>

        {/* Mode */}
        <div>
          <label className={labelClass}>{t.mode}</label>
          <select
            value={form.mode}
            onChange={(e) => handleModeChange(e.target.value as Mode)}
            className={inputClass}
          >
            {MODES.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* RST Sent */}
        <div>
          <label className={labelClass}>{t.rstSent}</label>
          <input
            type="text"
            value={form.rstSent}
            onChange={handleChange('rstSent')}
            className={`${inputClass} font-mono`}
            maxLength={3}
          />
        </div>

        {/* RST Received */}
        <div>
          <label className={labelClass}>{t.rstReceived}</label>
          <input
            type="text"
            value={form.rstReceived}
            onChange={handleChange('rstReceived')}
            className={`${inputClass} font-mono`}
            maxLength={3}
          />
        </div>

        {/* Submit */}
        <div className="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {t.logQso}
          </button>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-3">
        <label className={labelClass}>{t.notes}</label>
        <textarea
          value={form.notes}
          onChange={handleChange('notes')}
          className={`${inputClass} resize-none`}
          rows={1}
          placeholder={t.notesPlaceholder}
        />
      </div>

      {/* References */}
      {(form.references.length > 0 || true) && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <label className={labelClass}>{t.references}</label>
            <button
              type="button"
              onClick={handleAddReference}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              + {t.addReference}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.references.map((ref, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <input
                  type="text"
                  value={ref}
                  onChange={(e) => handleReferenceChange(idx, e.target.value)}
                  className={`${inputClass} w-40 font-mono text-xs`}
                  placeholder="SOTA:OE/TI-001"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveReference(idx)}
                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
            {form.references.length === 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">{t.noReferences}</span>
            )}
          </div>
        </div>
      )}

      {/* GPS indicator */}
      {gpsPos && (
        <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
          GPS: {gpsPos.latitude.toFixed(4)}, {gpsPos.longitude.toFixed(4)}
          {' · '}
          {toMaidenhead(gpsPos.latitude, gpsPos.longitude)}
        </div>
      )}
    </form>
  );
}
