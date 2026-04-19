/**
 * T35 — IndexedDB Schema (Dexie.js)
 *
 * Database service for xOTA Map local QSO logging.
 * Provides CRUD helpers for QSOs, Activations, and UserSettings.
 */

import Dexie from 'dexie';
import type { QSO, Activation, UserSettings } from '../types/qso';

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

class XotaMapDB extends Dexie {
  qsos!: Dexie.Table<QSO, number>;
  activations!: Dexie.Table<Activation, number>;
  settings!: Dexie.Table<UserSettings, number>;

  constructor() {
    super('xotamap');
    this.version(1).stores({
      qsos: '++id, activationId, timestamp, callsign',
      activations: '++id, date',
      settings: '++id',
    });
  }
}

export const db = new XotaMapDB();

// ---------------------------------------------------------------------------
// QSO CRUD helpers
// ---------------------------------------------------------------------------

export async function addQso(qso: Omit<QSO, 'id'>): Promise<number> {
  return db.qsos.add(qso as QSO);
}

export async function getQsos(activationId?: number): Promise<QSO[]> {
  if (activationId !== undefined) {
    return db.qsos.where('activationId').equals(activationId).toArray();
  }
  return db.qsos.toArray();
}

export async function updateQso(id: number, changes: Partial<QSO>): Promise<void> {
  await db.qsos.update(id, changes);
}

export async function deleteQso(id: number): Promise<void> {
  await db.qsos.delete(id);
}

// ---------------------------------------------------------------------------
// Activation CRUD helpers
// ---------------------------------------------------------------------------

export async function addActivation(activation: Omit<Activation, 'id'>): Promise<number> {
  return db.activations.add(activation as Activation);
}

export async function getActivations(): Promise<Activation[]> {
  return db.activations.orderBy('date').reverse().toArray();
}

export async function getCurrentActivation(): Promise<Activation | undefined> {
  const all = await db.activations.orderBy('id').reverse().first();
  return all;
}

// ---------------------------------------------------------------------------
// Settings helpers
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<UserSettings> {
  const existing = await db.settings.toCollection().first();
  if (existing) return existing;
  // Auto-create default settings row
  const id = await db.settings.add({ myCallsign: '', myGrid: '' });
  return { id, myCallsign: '', myGrid: '' };
}

export async function updateSettings(changes: Partial<UserSettings>): Promise<void> {
  const existing = await db.settings.toCollection().first();
  if (existing?.id !== undefined) {
    await db.settings.update(existing.id, changes);
  } else {
    await db.settings.add({ myCallsign: '', myGrid: '', ...changes });
  }
}
