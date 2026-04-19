export interface OverlapReference {
  code: string;       // "OE/TI-001"
  program: string;    // "sota"
  name: string;       // "Großglockner"
  lat: number;
  lon: number;
  elevation?: number;
  points?: number;
}

export interface OverlapGrid {
  gridKey: string;    // "47.00_12.50"
  references: OverlapReference[];
}
