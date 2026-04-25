# xOTA Map

**The universal platform for outdoor amateur radio programs.**

All 34 xOTA programs — SOTA, POTA, WWFF, GMA, IOTA, and many more — on a single interactive map with encyclopedia, real-time spots, multi-program detection, and field logging.

## Features

- **Reference Atlas** — 11 programs with full map overlays (PMTiles vector tiles), all 34 programs visible in layer switcher
- **Encyclopedia** — All 34 programs with rules, awards, hunter/chaser info, and getting-started guides in 4 languages (DE/EN/IT/SL)
- **Multi-Program Detection** — "What counts here?" — find overlapping programs at any point via right-click, long-press, or location search
- **Real-Time Spots** — Live spots from 21 programs via Spothole, on map and as filterable table
- **Field Logging** — Lightweight QSO logging with ADIF export for upload to SOTA/POTA/Wavelog
- **Location Search** — Search by place name, summit, or coordinates to fly to any location
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

## Covered Programs (34)

**With map data (11):** SOTA, POTA, WWFF, GMA, IOTA, TOTA, WCA, WWBOTA, WLOTA, ILLW, ARLHS
**Encyclopedia only (23):** BOTA, HEMA, LLOTA, COTA-OE, WOTA, SiOTA, MOTA, ECA, ELA, ZLOTA, ROTA, KRMNPA, HOTA, HOTA-UK, WAB, WAI, JOTA, KOTA, YOTA, GOTA, CHOTA, SCOTA, BiWOTA

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

1. Fetch from SOTA/POTA/GMA/IOTA/WWBOTA/WCA/WLOTA/ILLW/ARLHS/TOTA APIs
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

## Encyclopedia

Each program has a dedicated article in 4 languages (DE/EN/IT/SL) covering:
- Program overview and purpose
- Activation rules and requirements (min QSOs, activation zone, equipment)
- Hunter/chaser participation and awards
- Points, awards, and certificates
- Getting started guide with links to official resources

Encyclopedia files: `public/data/encyclopedia/{de,en,it,sl}/*.md`
Program metadata: `public/data/programs/index.json`

## Documentation

- [REQUIREMENTS.md](REQUIREMENTS.md) — Full requirements document
- [ARCHITECTURE.md](ARCHITECTURE.md) — Solution architecture
- [IMPLEMENTATION.md](IMPLEMENTATION.md) — Task-based implementation plan (42 tasks)
- [RESEARCH.md](RESEARCH.md) — Research: all programs, APIs, competitive analysis

## Part of OE Radio

This is an [oeradio.at](https://oeradio.at) community tool.

## License

TBD
