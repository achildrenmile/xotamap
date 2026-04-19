export interface QSO {
  id?: number;
  activationId: number;
  timestamp: string; // ISO 8601 UTC
  callsign: string;
  frequency: number; // kHz
  mode: string;
  rstSent: string;
  rstReceived: string;
  notes?: string;
  references?: string[];
  myLat?: number;
  myLon?: number;
  myGrid?: string;
}

export interface Activation {
  id?: number;
  date: string; // YYYY-MM-DD
  location?: string;
  references: string[];
}

export interface UserSettings {
  id?: number;
  myCallsign: string;
  myGrid: string;
}
