/**
 * xOTA Map — Reference Data Import Orchestrator
 *
 * Runs all importers sequentially, collects results, and logs a summary.
 * Each importer fetches data from its respective API, normalizes to GeoJSON,
 * and writes to public/data/references/{program}.geojson.
 *
 * Usage: npx tsx scripts/import/index.ts
 */

import { mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ImportResult } from './types.js';
import { importSota } from './sota.js';
import { importPota } from './pota.js';
import { importGma } from './gma.js';
import { importWwbota } from './wwbota.js';
import { importIota } from './iota.js';
import { importWwff } from './wwff.js';
import { importWca } from './wca.js';
import { importWlota } from './wlota.js';
import { importIllw } from './illw.js';
import { importArlhs } from './arlhs.js';
import { normalizeAll } from './normalize.js';
import { formatCount } from './utils.js';

const OUTPUT_DIR = join(process.cwd(), 'public/data/references');

async function main(): Promise<void> {
  const startTime = Date.now();

  console.log('╔════��═════════════════════════════════════════════════════╗');
  console.log('║       xOTA Map — Reference Data Import Pipeline        ║');
  console.log('╚═════���════════════════════════════���═══════════════════════╝');
  console.log(`\nStarted at: ${new Date().toISOString()}`);

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUTPUT_DIR}`);
  }

  const results: ImportResult[] = [];

  // Run importers sequentially (to be respectful of APIs)
  const importers: Array<{ name: string; fn: () => Promise<ImportResult> }> = [
    { name: 'SOTA', fn: importSota },
    { name: 'POTA', fn: importPota },
    { name: 'WWFF', fn: importWwff },
    { name: 'GMA', fn: importGma },
    { name: 'IOTA', fn: importIota },
    { name: 'WCA', fn: importWca },
    { name: 'WWBOTA', fn: importWwbota },
    { name: 'WLOTA', fn: importWlota },
    { name: 'ILLW', fn: importIllw },
    { name: 'ARLHS', fn: importArlhs },
  ];

  for (const importer of importers) {
    try {
      const result = await importer.fn();
      results.push(result);
    } catch (err) {
      console.error(`\nFATAL: ${importer.name} importer crashed: ${err instanceof Error ? err.message : err}`);
      results.push({
        program: importer.name.toLowerCase(),
        count: 0,
        errors: [String(err)],
        skipped: 0,
      });
    }
  }

  // Normalize all GeoJSON files
  normalizeAll();

  // Summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const totalFeatures = results.reduce((sum, r) => sum + r.count, 0);
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalSkipped = results.reduce((sum, r) => sum + r.skipped, 0);

  console.log('\n╔═��═════════════════════════════════��══════════════════════╗');
  console.log('║                    Import Summary                       ║');
  console.log('╠═════════════════════���════════════════════════════════���═══╣');
  console.log('║ Program     │ References │ Skipped │ Errors             ║');
  console.log('╠─────────────┼────────────┼─────────┼────────────────────╣');

  for (const r of results) {
    const prog = r.program.toUpperCase().padEnd(11);
    const count = formatCount(r.count).padStart(10);
    const skip = formatCount(r.skipped).padStart(7);
    const errs = formatCount(r.errors.length).padStart(6);
    console.log(`��� ${prog} │ ${count} │ ${skip} │ ${errs}              ║`);
  }

  console.log('╠─────────────┼────────────┼────��────┼─────────────────���──╣');
  const totalProg = 'TOTAL'.padEnd(11);
  const totalCount = formatCount(totalFeatures).padStart(10);
  const totalSkip = formatCount(totalSkipped).padStart(7);
  const totalErrs = formatCount(totalErrors).padStart(6);
  console.log(`║ ${totalProg} │ ${totalCount} │ ${totalSkip} │ ${totalErrs}              ║`);
  console.log('╚════════════════════════════════════════════��═════════════╝');
  console.log(`\nCompleted in ${elapsed}s`);

  // Exit with error code if all importers failed
  if (totalFeatures === 0 && totalErrors > 0) {
    console.error('\nWARNING: No data was imported. Check API availability.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Import pipeline failed:', err);
  process.exit(1);
});
