# xOTA Map — Solution Architecture

**Version:** 1.0
**Datum:** 2026-04-17

---

## 1. Architektur-Übersicht

```
                          ┌──────────────────��──────┐
                          │     Cloudflare Tunnel    │
                          │  xotamap.oeradio.at      │
                          │  (HTTPS termination)     │
                          └────────���───┬────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │   Synology NAS / Docker  │
                          │                          │
                          │  ┌────────────────────┐  │
                          │  │ xotamap (nginx:alp) │  │
                          │  │ Port 3082           │  │
                          │  │                     │  │
                          │  │  Statische Dateien  │  │
                          │  ��  ├── index.html     │  │
                          │  │  ├── assets/        │  │
                          │  │  ├── config.json    │  │
                          │  │  └── data/          │  │
                          │  │      ├── *.pmtiles  │  │
                          │  │      ├── *.json     │  │
                          │  │      └── *.md       │  │
                          │  └────────────────────┘  │
                          │  ~50MB RAM, ~0 CPU       │
                          └──────────────────────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                   │
                    ▼                  ▼                   ▼
              ┌────────���─┐    ┌──────────────┐    ┌─────────���──┐
              │  Browser  │    │   Browser    │    │  Browser   │
              │  User A   │    │   User B     │    │  User C    │
              │           │    │              │    │            │
              │ ┌───────┐ │    │              │    │            │
              │ │IndexDB│ │    │   ...        │    │   ...      │
              │ │(QSOs) │ │    │              │    │            │
              │ └───────┘ │    │              │    │            │
              └─────┬─────┘    └──────────────┘    └────────────┘
                    │
        ┌───────────┼───────────┬────────────┐
        ▼           ▼           ▼            ▼
  ┌───────��──┐ ┌────────���┐ ┌────────┐ ┌──────────┐
  │ Spothole │ │ SOTA    │ │ POTA   │ │ WWBOTA   │
  │ API      │ │ API     │ │ API    │ │ API      │
  │(21 Prog.)│ │(Upload) │ │(Upload)│ │(Upload)  │
  └──────────┘ └─────────┘ └────────┘ └──────────┘
    Spots        Log         Log         Log
```

**Kern-Prinzip:** Server liefert nur Dateien. Alle Logik im Browser. Keine Datenbank. Kein Backend.

---

## 2. Drei Laufzeitumgebungen

### 2.1 Build-Time (GitHub Actions)

Läuft **wöchentlich** oder manuell. Erzeugt alle statischen Daten.

```
GitHub Actions Runner
│
├── 1. DATEN HOLEN
│   ��── SOTA API     → GET api2.sota.org.uk/api/summits/...
│   ├── POTA API     → GET api.pota.app/programs/locations/...
│   ├── GMA          → GET cqgma.org GeoJSON Export
│   ├── IOTA         → Download iota-world.org JSON
│   ├── WWBOTA API   → GET wwbota.net/api/...
│   ├─�� WCA          → Download wcagroup.org Excel
│   ├── TOTA         → GET wwtota.com Referenz-DB
│   ├── HEMA         → Download GPS Waypoints
│   └── WLOTA        → Download ARLHS WLOL-DB
│
├── 2. NORMALISIEREN
│   └── Jede Quelle → einheitliches GeoJSON
│       {
│         "type": "Feature",
│         "geometry": { "type": "Point", "coordinates": [lon, lat] },
│         "properties": {
│           "code": "OE/TI-001",
│           "program": "sota",
│           "name": "Großglockner",
│           "points": 10,
│           "elevation": 3798,
│           "region": "OE"
│         }
│       }
│
├── 3. PMTILES ERZEUGEN
│   └── tippecanoe --output=sota.pmtiles --layer=sota \
│       --maximum-zoom=14 --minimum-zoom=2 \
│       --cluster-distance=50 \
│       sota.geojson
│
├── 4. ÜBERLAPPUNGEN VORBERECHNEN
│   └── Für jedes 0.25° × 0.25° Rasterfeld:
│       "Welche Referenzen aller Programme liegen hier?"
│       → /data/overlaps/grid/47.00_12.50.json
│       [
│         {"code":"OE/TI-001","program":"sota","lat":47.07,"lon":12.69},
│         {"code":"OE-0012","program":"pota","lat":47.08,"lon":12.70},
│         {"code":"OEFF-0045","program":"wwff","lat":47.07,"lon":12.69}
│       ]
│
├── 5. APP BAUEN
│   └── npm run build → /dist (HTML, JS, CSS)
│
└── 6. DEPLOY
    └── ssh + git pull + docker build + docker run
        → Synology NAS
```

**Erzeugte Artefakte:**

| Datei | Größe (geschätzt) | Inhalt |
|-------|-------------------|--------|
| `data/references/sota.pmtiles` | ~30 MB | 100K+ Gipfel |
| `data/references/pota.pmtiles` | ~20 MB | 50K+ Parks |
| `data/references/gma.pmtiles` | ~25 MB | Berge weltweit |
| `data/references/wwbota.pmtiles` | ~2 MB | Bunker |
| `data/references/iota.pmtiles` | ~1 MB | Inselgruppen |
| `data/references/wwff.pmtiles` | ~15 MB | 40K+ Naturgebiete |
| `data/references/cota.pmtiles` | ~5 MB | Burgen |
| `data/references/tota.pmtiles` | ~1 MB | Türme |
| `data/references/*.pmtiles` | ~5 MB | Restliche Programme |
| `data/programs/index.json` | ~50 KB | Alle 30+ Programme Metadaten |
| `data/programs/*.json` | ~200 KB | Detailseiten |
| `data/overlaps/grid/*.json` | ~50 MB | Vorberechnete Überlappungen |
| `data/encyclopedia/*.md` | ~200 KB | Artikel |
| `dist/` (App) | ~2 MB | HTML, JS, CSS |
| **Gesamt** | **~160 MB** | |

---

### 2.2 Server-Time (nginx auf Synology)

Macht genau eine Sache: **Dateien ausliefern.**

```
nginx:alpine Container
│
├── EINGEHENDE REQUESTS
│   │
│   ├── GET /                        → index.html (SPA)
│   ├── GET /encyclopedia/sota       → index.html (SPA routing)
│   ├── GET /config.json             → Runtime Config (no-cache)
│   │
│   ├── GET /data/references/sota.pmtiles
│   │   └── HTTP Range Request: bytes=1024-2048
│   │       → Nur angefragte Bytes (Vektor-Tile für Kartenausschnitt)
│   │       → Browser muss NICHT ganze 30MB laden!
│   │
│   ├── GET /data/programs/index.json   → Programm-Liste
│   ├── GET /data/overlaps/grid/47.00_12.50.json → Überlappungen
│   └── GET /assets/main-a1b2c3.js     → Hashed JS (cached 1 Jahr)
│
├── NGINX MACHT KEIN:
│   ├── ✗ Keine API Calls
│   ├── ✗ Keine Datenbank-Queries
│   ├── ✗ Keine Berechnungen
│   ├── ✗ Keine User-Verwaltung
│   └── ✗ Keine Spot-Aggregation
│
└── CACHING-STRATEGIE
    ├── HTML, config.json     → no-cache (immer frisch)
    ├── *.pmtiles             → 7 Tage (Referenzen ändern sich selten)
    ├── /data/*.json          → 1 Tag
    ├── *.js, *.css (hashed)  → 1 Jahr (immutable)
    └── Bilder, Fonts         → 7 Tage
```

---

### 2.3 Client-Time (Browser)

**Hier passiert die ganze Logik.**

```
Browser
│
├── APP-SHELL (einmalig geladen, dann Service Worker gecached)
│   ├── SvelteKit/React SPA
│   ├── MapLibre GL JS (Kartenengine)
│   ├── Turf.js (Geo-Berechnungen)
│   ├── Dexie.js (IndexedDB Wrapper)
│   └── i18n (DE/EN Übersetzungen)
│
├── KARTE
│   ├── Basemap: OpenStreetMap Vektor-Tiles (externer Tile-Server)
│   ├── Referenz-Layer: PMTiles von eigenem Server
│   │   └── MapLibre lädt nur Tiles im sichtbaren Ausschnitt
│   │       via HTTP Range Requests (kein Download der ganzen Datei)
│   ├── Spot-Layer: Live-Daten von Spothole API
│   └── Overlays: Greyline, Maidenhead Grid (client-seitig berechnet)
│
├── SPOT-AGGREGATION
│   ├── Pollt Spothole API alle 60 Sekunden
│   │   GET https://spothole.app/api/spots?...
│   │   → JSON Array mit Spots aus 21 Programmen
│   └── Rendert als Marker auf Karte + Tabelle
│
├── MULTI-PROGRAMM-ERKENNUNG
│   ├── User klickt auf Karte oder gibt Koordinaten ein
│   ├── Lädt /data/overlaps/grid/{gridKey}.json (vorberechnet)
│   ├── Filtert mit Turf.js: distance(userPoint, refPoint) < radius
│   └── Zeigt: "Hier gelten: SOTA OE/TI-001 + POTA OE-0012 + ..."
│
├── FELD-LOGGING (leichtgewichtig, nur lokal)
│   ├── Einfaches Quick-Log: Callsign, Freq, Mode, RST
│   ├── Auto-Fill: UTC, Locator, Referenzen (via Multi-Programm)
│   ├── Gespeichert in IndexedDB (nur dieses Gerät!)
│   ├── ADIF-Export: Generiert .adi Datei → Download
│   ├── Kein Cloud-Sync, kein Server-Storage
│   └── Hinweis: "Für permanentes Logging → wavelog.oeradio.at"
│
└── OFFLINE-MODUS
    ├── Service Worker cached:
    │   ├── App-Shell (HTML, JS, CSS)
    │   ├── Zuletzt geladene PMTiles-Ranges
    │   └── Zuletzt geladene Overlap-JSONs
    ├── IndexedDB verfügbar (QSOs immer lokal)
    └── Spots: Nicht verfügbar offline (live API)
```

---

## 3. Datenfluss-Diagramme

### 3.1 Referenz-Daten (Build-Time → Server → Client)

```
SOTA API ─┐
POTA API ─┤
GMA API  ─┤     GitHub        Synology        Browser
IOTA JSON ┼──→  Actions  ──→  nginx    ──→    MapLibre
WWBOTA   ─┤     (Build)       (serve)         (render)
WCA Excel ┤
TOTA DB  ─┤     GeoJSON       PMTiles         Vektor-Tiles
HEMA GPS ─┤     → tippecanoe  (statisch)      (Range Req.)
WLOL DB  ─┘     → PMTiles
                 → Overlap JSON

Update-Zyklus: wöchentlich (GitHub Actions Cron)
```

### 3.2 Spot-Daten (Extern → Client direkt)

```
                                    Browser
                                       │
                                  pollt alle 60s
                                       │
                                       ▼
POTA Spots ─┐                   ┌──────────────┐
SOTA Spots ─┤                   │  Spothole    │
WWFF Spots ─┤                   │  API         │
GMA Spots  ─┼───→ aggregiert ──→│              │──→ JSON ──→ MapLibre
WWBOTA SSE ─┤    (von Spothole) │  spothole.   │          + Tabelle
HEMA Spots ─┤                   │  app/api/    │
WOTA Spots ─┤                   └──────────────┘
+14 weitere─┘

Kein eigener Server involviert. Browser ← direkt → Spothole.
```

### 3.3 QSO-Daten (Lokal im Browser → ADIF → Wavelog)

```
                    ┌──────────────────────────┐
                    │       Browser             │
                    │                           │
User ──→ Log-Form ──→ IndexedDB               │
                    │  ├── qsos[]              │
                    │  └── settings             │
                    │          │                │
                    │          ▼                │
                    │       ADIF Gen            │
                    │          │                │
                    └──────────┼────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    .adi Download     │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼─────────────────┐
              ▼                ▼                  ▼
     wavelog.oeradio.at    SOTA/POTA Log-Upload   Lokale
     (empfohlen)           (manuell via Website)  Archivierung

Kein Server speichert QSOs. Nur auf diesem Gerät.
Für permanentes Logging → Wavelog.
```

### 3.4 Enzyklopädie (Statischer Content)

```
Markdown-Dateien ��─→ Build (SvelteKit/Astro) ──→ HTML-Seiten
/data/encyclopedia/       rendert zur             (statisch)
├── sota.md               Build-Zeit
├── pota.md
├── wwff.md
└── ...

ODER: Markdown-Dateien bleiben roh, Client rendert mit marked.js
```

---

## 4. Wo ist was gespeichert?

| Daten | Wo | Format | Update-Zyklus |
|-------|----|--------|---------------|
| **App-Code** | GitHub Repository | TypeScript, Svelte/React | Bei Entwicklung |
| **Referenz-Daten** (alle Programme) | Synology nginx `/data/references/` | PMTiles | Wöchentlich (CI/CD) |
| **Programm-Metadaten** (Regeln etc.) | Synology nginx `/data/programs/` | JSON | Bei Änderung |
| **Überlappungs-Index** | Synology nginx `/data/overlaps/` | JSON | Wöchentlich (CI/CD) |
| **Enzyklopädie-Artikel** | Synology nginx `/data/encyclopedia/` | Markdown/HTML | Bei Änderung |
| **Runtime-Config** | Container (generiert beim Start) | JSON (`config.json`) | Bei Container-Start |
| **Echtzeit-Spots** | Spothole API (extern) | JSON | Live (60s Polling) |
| **QSO-Logs** | Browser IndexedDB (nur dieses Gerät!) | Dexie.js Records | Bei jedem QSO |
| **User-Settings** | Browser IndexedDB (nur dieses Gerät!) | JSON | Bei Änderung |
| **ADIF-Exports** | User-Download (lokal) → manuell in Wavelog/SOTA/POTA | ADIF 3.x (.adi) | On-Demand |
| **Basemap-Tiles** | Externer Tile-Server (z.B. OpenFreeMap) | Vektor-Tiles | Extern verwaltet |
| **Docker Image** | Synology lokal | OCI Image | Bei Deploy |
| **Source Code** | GitHub | Git | Laufend |

---

## 5. Externe Abhängigkeiten

| Dienst | Wofür | Ausfallwirkung | Fallback |
|--------|-------|----------------|----------|
| **Spothole API** | Echtzeit-Spots (21 Programme) | Keine Live-Spots auf Karte | Direkte SOTA/POTA APIs |
| **OpenFreeMap / MapTiler** | Basemap-Tiles | Keine Hintergrundkarte | Alternative Tile-Server oder gecachte Tiles |
| **SOTA API** | Referenz-Daten (Build) | Veraltete SOTA-Daten | Letzte bekannte Version nutzen |
| **POTA API** | Referenz-Daten (Build) | Veraltete POTA-Daten | Letzte bekannte Version nutzen |
| **Cloudflare Tunnel** | HTTPS + Routing | Site nicht erreichbar | Direkte Port-Freigabe (Not-Lösung) |
| **GitHub Actions** | CI/CD + Daten-Updates | Kein Auto-Update | Manueller Build + Deploy |

**Keine harte Abhängigkeit zur Laufzeit außer Basemap-Tiles.** Referenzen, Overlaps, Enzyklopädie — alles lokal auf dem Server. Spots sind nice-to-have, App funktioniert auch ohne.

---

## 6. Sicherheits-Architektur

```
Internet
    │
    ▼
Cloudflare (DDoS, WAF, HTTPS)
    │
    ▼
Cloudflare Tunnel (kein offener Port)
    │
    ▼
nginx:alpine (read-only filesystem möglich)
    │
    └── Nur statische Dateien, kein Scripting
        Kein PHP, kein Node, kein Python
        Keine Datenbank
        Kein User-State auf Server

Browser
    │
    ├── IndexedDB: Nur eigene Daten, sandboxed
    ├── API Calls: Nur zu öffentlichen APIs (Spothole, SOTA, POTA)
    ├── Keine Cookies, kein Tracking
    └── Credentials (für Log-Upload Phase 2+):
        ���── Web Crypto API verschlüsselt in IndexedDB
```

---

## 7. Komponenten-Diagramm (Frontend)

```
App
├── Layout
│   ├── Header (OE Radio Logo, Titel, Sprache, Theme)
│   └── Footer (Version, Impressum, Datenschutz, GitHub)
│
├── Seiten
│   ├── /                    MapView (Hauptseite)
│   ├── /encyclopedia        ProgramList (alle Programme)
│   ├── /encyclopedia/:id    ProgramDetail (ein Programm)
│   ├── /spots               SpotList (Tabelle)
│   └── /log                 LogView (QSO-Formular + Liste)
│
├── Karten-Komponenten
│   ├── MapContainer         MapLibre GL JS Wrapper
│   ├── ReferenceLayer       PMTiles → Vektor-Layer pro Programm
│   ├── SpotLayer            Live-Spots als Marker
│   ├─�� LocationMarker       Eigener GPS-Standort
│   ├── LayerSwitcher        Checkbox-Liste: welche Programme an/aus
│   ├── ReferencePopup       Klick → Details + Multi-Programm
│   └── OverlapFinder        "Was gilt hier?" Panel
│
├── Spot-Komponenten
│   ├── SpotTable            Sortier/filterbare Tabelle
│   ├── SpotFilters          Programm, Band, Mode, Alter
│   └── SpotPoller           60s Interval → Spothole API
│
├── Log-Komponenten
│   ├─��� QsoForm              Eingabe-Formular
│   ├── QsoTable             QSOs der aktuellen Aktivierung
│   ├── AdifExport           ADIF generieren + Download
│   └── WavelogHint          "Für permanentes Logging → wavelog.oeradio.at"
│
├── Shared Components
│   ├── ParentSiteLogo       OE Radio Logo (aus config.json)
│   ├── LegalModal           Impressum + Datenschutz
│   ├── ThemeToggle          Dark/Light/Auto
│   ├── LanguageSelector     DE/EN
│   └── useConfig            Hook: lädt /config.json
│
��── Services
    ├── spothole.ts          Spothole API Client
    ├── pmtiles.ts           PMTiles Loader
    ├── overlap.ts           Grid-Lookup für Multi-Programm
    ├── adif.ts              ADIF 3.x Generator
    ├── db.ts                Dexie.js Schema (IndexedDB)
    └── geo.ts               Turf.js Wrapper (distance, bbox)
```

---

## 8. Zusammenfassung

| Frage | Antwort |
|-------|---------|
| Wo läuft die App? | nginx:alpine Docker Container auf Synology NAS |
| Was macht der Server? | Dateien ausliefern. Sonst nichts. |
| Wo ist die Logik? | Im Browser (JavaScript) |
| Wo sind die Referenzen? | PMTiles auf Synology, geladen per Range Request |
| Wo kommen Spots her? | Spothole API (direkt vom Browser) |
| Wo werden QSOs gespeichert? | IndexedDB im Browser (nur dieses Gerät!) |
| Wo werden QSOs dauerhaft gespeichert? | ADIF exportieren → Wavelog (wavelog.oeradio.at) |
| Was passiert bei Server-Ausfall? | Offline-Cache (Service Worker) liefert App + gecachte Daten |
| Was passiert bei Spothole-Ausfall? | App funktioniert, nur keine Live-Spots |
| Wieviel RAM braucht der Server? | ~50MB (nginx:alpine) |
| Wieviel Disk braucht der Server? | ~200MB (App + PMTiles + JSON) |
| Wieviele User gleichzeitig? | Unbegrenzt (nur statische Dateien, CDN-fähig) |
