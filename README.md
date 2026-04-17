# xOTA Map

**The universal platform for outdoor amateur radio programs.**

All 30+ xOTA programs — SOTA, POTA, WWFF, GMA, IOTA, and many more — on a single interactive map with encyclopedia, real-time spots, multi-program detection, and field logging.

## Features

- **Reference Atlas** — All reference locations of all programs as switchable overlays on an interactive map, even without active spots
- **Encyclopedia** — All 30+ programs described with rules, awards, and getting-started guides (DE/EN/IT/SL)
- **Multi-Program Detection** — "This location counts for SOTA + POTA + WWFF + GMA" — find overlapping programs at any point
- **Real-Time Spots** — Live spots from 21 programs via Spothole, on map and as filterable table
- **Field Logging** — Lightweight QSO logging with ADIF export for upload to SOTA/POTA/Wavelog
- **Offline-Ready** — PWA with Service Worker caching for field use

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS 3 |
| Map | MapLibre GL JS |
| Reference Data | PMTiles (vector tiles via HTTP Range Requests) |
| Geo Queries | Turf.js (client-side) |
| Spot Data | Spothole API (direct from browser) |
| QSO Storage | IndexedDB (Dexie.js, local only) |
| Basemap | OpenFreeMap (via nginx proxy) |
| Server | nginx:alpine (static files only) |
| Deployment | Docker on Synology NAS |
| CI/CD | GitHub Actions |
| Languages | DE, EN, IT, SL |

## Covered Programs (30+)

**Tier 1:** SOTA, POTA, WWFF, GMA, IOTA
**Tier 2:** WCA/COTA, WWBOTA, BOTA, HEMA, WLOTA, ILLW, TOTA, LLOTA, COTA-OE
**Tier 3:** WOTA, SiOTA, MOTA, ECA, ELA, ZLOTA, ROTA, KRMNPA, HOTA, HOTA-UK, WAB, WAI
**Tier 4:** JOTA, KOTA, YOTA, GOTA, CHOTA

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Docker

```bash
docker compose up --build
```

The app runs on port **3082** and is accessible via Cloudflare Tunnel at `xotamap.oeradio.at`.

## Deployment

```bash
./deploy-production.sh
```

Deploys to Synology NAS via SSH — identical pattern to other oeradio.at tools (bandblick, antennenblick).

## Data Pipeline

Reference data is updated weekly via GitHub Actions:

1. Fetch from SOTA/POTA/GMA/IOTA/WWBOTA APIs
2. Normalize to GeoJSON
3. Convert to PMTiles (tippecanoe)
4. Precompute overlap grid
5. Deploy to server

## Architecture

No database. No backend. The server only serves static files. All logic runs in the browser.

- **Reference data:** PMTiles on server, loaded via HTTP Range Requests
- **Spots:** Fetched directly from Spothole API by the browser
- **QSO logs:** IndexedDB in the browser (local only, export as ADIF)
- **Basemap tiles:** OpenFreeMap via nginx reverse proxy

For permanent logging, use [Wavelog](https://wavelog.oeradio.at).

## Documentation

- [REQUIREMENTS.md](REQUIREMENTS.md) — Full requirements document
- [ARCHITECTURE.md](ARCHITECTURE.md) — Solution architecture
- [IMPLEMENTATION.md](IMPLEMENTATION.md) — Task-based implementation plan (42 tasks)
- [RESEARCH.md](RESEARCH.md) — Research: all programs, APIs, competitive analysis

## Part of OE Radio

This is an [oeradio.at](https://oeradio.at) community tool.

## License

TBD
