# xOTA Map — Implementation Plan

**Version:** 1.0
**Datum:** 2026-04-17
**Stack:** React 18 + Vite + Tailwind CSS 3 + TypeScript + MapLibre GL JS
**Pattern:** Identisch zu bandblick (deploy, branding, i18n, components)

---

## Übersicht: 8 Epics, 42 Tasks

| Epic | Tasks | Beschreibung |
|------|-------|-------------|
| E1 | T01–T06 | Projekt-Scaffolding & Infrastruktur |
| E2 | T07–T12 | Shared Components & Layout (bandblick-Pattern) |
| E3 | T13–T19 | Interaktive Karte (MapLibre + PMTiles) |
| E4 | T20–T24 | Programm-Enzyklopädie |
| E5 | T25–T29 | Echtzeit-Spots (Spothole) |
| E6 | T30–T34 | Multi-Programm-Erkennung |
| E7 | T35–T39 | Feld-Logging & ADIF-Export |
| E8 | T40–T42 | Build-Pipeline & Deployment |

Abhängigkeiten:

```
E1 ──→ E2 ──→ E3 ──────→ E6
              ──→ E4       │
              ──→ E5       ▼
              ──→ E7 (braucht E6)
E8 parallel zu E3–E7
```

---

## E1 — Projekt-Scaffolding & Infrastruktur

### T01 — Vite + React + TypeScript Projekt initialisieren

**Req:** Technischer Stack
**Beschreibung:** Projekt mit `npm create vite@latest` aufsetzen. React 18, TypeScript strict, ESLint.

**Dateien:**
- `package.json` — Dependencies: react, react-dom, react-router-dom, lucide-react
- `tsconfig.json` — strict mode, path aliases (`@/` → `src/`)
- `vite.config.ts` — React plugin, path aliases
- `src/main.tsx` — Entry point
- `src/App.tsx` — Skeleton
- `.eslintrc.cjs` — ESLint config (bandblick-Pattern)

**Akzeptanzkriterien:**
- [ ] `npm run dev` startet Dev-Server
- [ ] `npm run build` erzeugt `dist/`
- [ ] TypeScript strict-mode, keine Fehler
- [ ] Path aliases funktionieren (`@/components/...`)

**Tests:**
- `npm run build` exitiert mit 0
- `tsc --noEmit` exitiert mit 0

---

### T02 — Tailwind CSS konfigurieren

**Req:** N5.6 (Dark/Light Theme), N5.1 (Mobile-first)
**Beschreibung:** Tailwind 3 mit `class`-basiertem Dark Mode. Eigene Farbpalette für xOTA Map.

**Dateien:**
- `tailwind.config.js` — `darkMode: 'class'`, content paths
- `postcss.config.js`
- `src/index.css` — Tailwind directives + Custom CSS vars

**Akzeptanzkriterien:**
- [ ] Tailwind-Klassen funktionieren in Komponenten
- [ ] Dark/Light umschaltbar via `class` auf `<html>`
- [ ] Mobile-first Breakpoints (sm, md, lg)

**Tests:**
- Build erzeugt CSS < 50KB (purged)
- Dark-Mode-Toggle ändert Hintergrundfarbe

---

### T03 — React Router Setup

**Req:** F1 (Enzyklopädie), F2 (Karte), F5 (Spots), F6 (Logging)
**Beschreibung:** Client-seitiges Routing mit react-router-dom v6. SPA mit nginx fallback.

**Routes:**
```
/                    → MapView (Hauptseite)
/encyclopedia        → ProgramList
/encyclopedia/:id    → ProgramDetail
/spots               → SpotList
/log                 → LogView
```

**Dateien:**
- `src/router.tsx` — Route-Definitionen
- `src/pages/MapView.tsx` — Skeleton
- `src/pages/Encyclopedia.tsx` — Skeleton
- `src/pages/ProgramDetail.tsx` — Skeleton
- `src/pages/SpotList.tsx` — Skeleton
- `src/pages/LogView.tsx` — Skeleton

**Akzeptanzkriterien:**
- [ ] Alle Routes erreichbar via Navigation
- [ ] Links klickbar (echte `<Link>` Elemente, nicht Buttons!)
- [ ] Browser Back/Forward funktioniert
- [ ] Direct URL load funktioniert (SPA fallback)

**Tests:**
- Jede Route rendert ohne Crash
- Navigation zwischen Routes aktualisiert URL

---

### T04 — Docker-Infrastruktur

**Req:** N6.11 (Runtime Config), Deploy-Pattern
**Beschreibung:** Dockerfile (Multi-Stage), nginx.conf, docker-entrypoint.sh, docker-compose.yml — identisch zu bandblick-Pattern.

**Dateien:**
- `Dockerfile` — Node 20 build → nginx:alpine serve
- `nginx.conf` — Gzip, Range Requests (PMTiles!), SPA fallback, proxy für OpenFreeMap
- `docker-entrypoint.sh` — Generiert `config.json` aus Env-Vars
- `docker-compose.yml` — Port 3082, Env-Vars
- `.env.production` — Synology config
- `.env.production.example` — Template

**nginx.conf Besonderheiten:**
```nginx
# OpenFreeMap Tile Proxy
location /tiles/ {
    proxy_pass https://tiles.openfreemap.org/;
    proxy_set_header Host tiles.openfreemap.org;
    proxy_cache_valid 200 7d;
    proxy_buffering on;
}

# PMTiles Range Requests
location ~* \.pmtiles$ {
    add_header Access-Control-Allow-Origin "*";
    add_header Access-Control-Allow-Headers "Range";
    add_header Access-Control-Expose-Headers "Content-Range, Content-Length";
}
```

**Akzeptanzkriterien:**
- [ ] `docker compose up` startet Container auf Port 3082
- [ ] `config.json` wird aus Env-Vars generiert
- [ ] SPA fallback: `/encyclopedia/sota` liefert `index.html`
- [ ] PMTiles: Range Request Header korrekt
- [ ] OpenFreeMap Proxy: `/tiles/...` leitet weiter

**Tests:**
- `docker compose build` exitiert mit 0
- `curl localhost:3082/config.json` liefert JSON
- `curl -H "Range: bytes=0-100" localhost:3082/data/references/test.pmtiles` liefert 206

---

### T05 — Deploy-Script

**Req:** Deploy-Pattern (wie bandblick)
**Beschreibung:** `deploy-production.sh` — git pull auf Synology → docker build → docker run.

**Dateien:**
- `deploy-production.sh` — Kopie von bandblick, angepasst (Port 3082, Container-Name xotamap)

**Akzeptanzkriterien:**
- [ ] Script deployt auf Synology
- [ ] Health-Check nach Start
- [ ] Container läuft unter `xotamap`

**Tests:**
- Script Syntax-Check (`bash -n deploy-production.sh`)

---

### T06 — Public Config & Favicon

**Req:** N6.11, N6.12
**Beschreibung:** Dev-Fallback `config.json`, Favicon, PWA manifest.

**Dateien:**
- `public/config.json` — Dev-Defaults (parentSite, version etc.)
- `public/favicon.svg` — xOTA Map Icon (Karten-Pin + Funk)
- `public/manifest.json` — PWA manifest (name, icons, theme_color)
- `index.html` — Meta tags, manifest link, theme-color

**Akzeptanzkriterien:**
- [ ] Dev-Server zeigt korrekten Titel und Icon
- [ ] `config.json` im Dev hat sinnvolle Defaults
- [ ] PWA manifest valide

**Tests:**
- `config.json` parse-bar
- manifest.json valide (JSON schema)

---

## E2 — Shared Components & Layout

### T07 — useConfig Hook

**Req:** N6.11, N6.12, N6.17
**Beschreibung:** Hook der `/config.json` lädt und cached. Identisch zu bandblick.

**Dateien:**
- `src/hooks/useConfig.ts`

**Interface:**
```typescript
interface AppConfig {
  siteName: string;
  siteDescription: string;
  parentSiteName: string;
  parentSiteUrl: string;
  parentSiteLogo: string;
  version: string;
}
```

**Akzeptanzkriterien:**
- [ ] Config wird geladen und gecached
- [ ] Loading-State während Fetch
- [ ] Fallback-Defaults wenn Fetch fehlschlägt

**Tests:**
- Hook gibt Config-Objekt zurück
- Bei Netzwerkfehler: Defaults

---

### T08 — i18n System (4 Sprachen)

**Req:** F1.7, N5.5
**Beschreibung:** i18n mit Context-Provider, 4 Sprachen (DE, EN, IT, SL). Pattern von bandblick erweitert.

**Dateien:**
- `src/i18n/translations.ts` — Type-sicheres Translation-Interface
- `src/i18n/de.ts` — Deutsche Texte
- `src/i18n/en.ts` — Englische Texte
- `src/i18n/it.ts` — Italienische Texte
- `src/i18n/sl.ts` — Slowenische Texte
- `src/i18n/I18nContext.tsx` — Provider + useI18n Hook
- `src/i18n/index.ts` — Re-exports

**Akzeptanzkriterien:**
- [ ] Alle 4 Sprachen vollständig
- [ ] Sprachauswahl in localStorage persistent
- [ ] Type-safety: fehlende Keys = Compile-Fehler
- [ ] Alle UI-Texte über i18n, keine hardcoded Strings

**Tests:**
- Alle 4 Sprach-Objekte haben identische Keys
- Sprachwechsel ändert alle sichtbaren Texte

---

### T09 — ThemeToggle Component

**Req:** N5.6
**Beschreibung:** Dark/Light/Auto Toggle. Identisch zu bandblick.

**Dateien:**
- `src/components/ThemeToggle/ThemeToggle.tsx`

**Akzeptanzkriterien:**
- [ ] 3 Modi: Light, Dark, System
- [ ] Präferenz in localStorage persistent
- [ ] System-Modus reagiert auf OS-Änderung

**Tests:**
- Toggle ändert `<html>` class
- localStorage wird gesetzt

---

### T10 — ParentSiteLogo & LanguageSelector

**Req:** N6.1, N6.3, N6.16
**Beschreibung:** Logo-Component + Sprachauswahl (4 Sprachen). Identisch zu bandblick, erweitert um IT/SL.

**Dateien:**
- `src/components/ParentSiteLogo/ParentSiteLogo.tsx`
- `src/components/LanguageSelector/LanguageSelector.tsx`

**Akzeptanzkriterien:**
- [ ] Logo lädt von config.parentSiteLogo URL
- [ ] Logo verlinkt zu config.parentSiteUrl (klickbarer Link!)
- [ ] Sprachauswahl zeigt DE/EN/IT/SL
- [ ] Sprachwechsel sofort wirksam

**Tests:**
- Logo rendert als `<a><img></a>`
- LanguageSelector rendert 4 Optionen

---

### T11 — LegalModal (Impressum/Datenschutz)

**Req:** N6.6, N6.7, N6.14
**Beschreibung:** Modal für Impressum und Datenschutz. Identisch zu bandblick.

**Dateien:**
- `src/components/LegalModal/LegalModal.tsx`
- `src/components/LegalModal/impressum.ts` — DE/EN/IT/SL Texte
- `src/components/LegalModal/datenschutz.ts` — DE/EN/IT/SL Texte

**Akzeptanzkriterien:**
- [ ] Modal öffnet/schließt (ESC + Klick außerhalb)
- [ ] Impressum und Datenschutz getrennt
- [ ] Alle 4 Sprachen
- [ ] Links im Text klickbar

**Tests:**
- Modal öffnet mit type="imprint"
- Modal schließt bei ESC
- Content enthält keine hardcoded deutschen Texte in EN-Modus

---

### T12 — App Layout (Header + Footer + Navigation)

**Req:** N6.1–N6.10
**Beschreibung:** Haupt-Layout mit Header (Logo, Titel, Nav, Sprache, Theme), Footer (Version, Impressum, Datenschutz, GitHub), und Navigation zwischen Seiten.

**Dateien:**
- `src/App.tsx` — Layout + Router
- `src/components/Header/Header.tsx`
- `src/components/Footer/Footer.tsx`
- `src/components/Navigation/Navigation.tsx` — Tabs: Karte, Enzyklopädie, Spots, Log

**Header:**
```
[OE Radio Logo]  🗺️ xOTA Map          [Karte|Enzy|Spots|Log]  [DE▾] [🌓]
                 Alle Outdoor-Programme
```

**Footer:**
```
xOTA Map v0.1.0 • Ein Tool von OE Radio • Impressum | Datenschutz | GitHub
```

**Akzeptanzkriterien:**
- [ ] Header mit Logo, Titel, Nav, Sprache, Theme
- [ ] Footer mit Version, Links, Impressum/Datenschutz Buttons
- [ ] Navigation-Links klickbar (echte `<Link>`, kein onClick redirect!)
- [ ] Mobile: hamburger Menu oder Bottom-Tabs
- [ ] Active-State auf aktuellem Tab
- [ ] Version aus config.json

**Tests:**
- Header rendert alle Elemente
- Footer zeigt Version aus config
- Nav-Links navigieren korrekt
- Mobile viewport: Navigation responsive

---

## E3 — Interaktive Karte

### T13 — MapLibre GL JS Integration

**Req:** F2.1, F2.3
**Beschreibung:** MapLibre GL JS mit OpenFreeMap Basemap via nginx Proxy.

**Dependencies:** `maplibre-gl`

**Dateien:**
- `src/components/Map/MapContainer.tsx` — MapLibre Wrapper
- `src/components/Map/useMap.ts` — Map Instance Hook
- `src/components/Map/mapStyles.ts` — Basemap Style (pointing to `/tiles/` proxy)

**Basemap über Proxy:**
```typescript
const style = {
  version: 8,
  sources: {
    openmaptiles: {
      type: 'vector',
      url: '/tiles/...'  // nginx proxy → tiles.openfreemap.org
    }
  },
  // ...
};
```

**Akzeptanzkriterien:**
- [ ] Karte rendert mit OpenFreeMap Tiles via Proxy
- [ ] Pan, Zoom, Rotation funktionieren
- [ ] Touch-Support (Pinch-Zoom, Drag)
- [ ] Karte füllt verfügbaren Platz
- [ ] Default-Zoom auf Europa/OE

**Tests:**
- MapContainer rendert `<canvas>` Element
- Map-Instanz hat korrekten Style geladen
- Proxy-URL `/tiles/` wird verwendet (nicht direkt openfreemap.org)

---

### T14 — PMTiles Loader

**Req:** F2.28, N1.3
**Beschreibung:** PMTiles-Protokoll in MapLibre integrieren. Referenzen als Vektor-Tiles laden per HTTP Range Requests.

**Dependencies:** `pmtiles`

**Dateien:**
- `src/services/pmtiles.ts` — PMTiles Protocol-Handler registrieren
- `src/components/Map/ReferenceLayer.tsx` — Vektor-Layer pro Programm

**Akzeptanzkriterien:**
- [ ] PMTiles-Protocol in MapLibre registriert
- [ ] Referenz-Layer lädt aus `/data/references/{program}.pmtiles`
- [ ] Nur sichtbare Tiles werden geladen (Range Requests)
- [ ] Layer style pro Programm (Farbe, Icon)

**Tests:**
- PMTiles Source registriert ohne Fehler
- Layer rendert Punkte aus PMTiles-Datei
- Network-Tab zeigt Range Requests (nicht ganze Datei)

---

### T15 — Layer Switcher (Programm-Overlays)

**Req:** F2.4
**Beschreibung:** Sidebar mit Checkbox-Liste zum Ein/Ausschalten der Referenz-Layer.

**Dateien:**
- `src/components/Map/LayerSwitcher.tsx` — Checkbox pro Programm
- `src/hooks/useLayerVisibility.ts` — State für aktive Layer

**Akzeptanzkriterien:**
- [ ] Checkbox pro verfügbarem Programm
- [ ] Toggle schaltet Layer auf Karte an/aus
- [ ] Farbcode-Legend neben Checkbox
- [ ] State persistent (localStorage)
- [ ] "Alle an" / "Alle aus" Buttons
- [ ] Responsive: Sidebar auf Desktop, Drawer auf Mobile

**Tests:**
- Toggle ändert Layer-Visibility
- State überlebt Page-Reload

---

### T16 — Referenz-Popup (Klick auf Marker)

**Req:** F2.16, F2.17, F2.18
**Beschreibung:** Klick auf Referenz-Marker → Popup mit Details + Multi-Programm-Badge.

**Dateien:**
- `src/components/Map/ReferencePopup.tsx`

**Popup-Inhalt:**
```
OE/TI-001 — Großglockner
━━━━━━━━━━━━━━━━━━━━━━━━
Programme: SOTA • POTA • GMA
Höhe: 3.798m  |  Punkte: 10
Letzte Aktivierung: 2025-08-12
[→ SOTA-DB] [→ POTA-DB] [→ GMA-DB]
```

**Akzeptanzkriterien:**
- [ ] Popup zeigt Name, Code, Koordinaten, Höhe, Punkte
- [ ] Multi-Programm-Badge zeigt ALLE Programme
- [ ] Links zu offiziellen Programm-Seiten (klickbar!, `target="_blank"`)
- [ ] Popup schließt bei Klick auf anderes Element
- [ ] Mobile-freundlich (Touch)

**Tests:**
- Popup rendert korrekte Daten
- Links sind `<a href>` Elemente (nicht onClick)
- Multi-Programm zeigt >1 wenn zutreffend

---

### T17 — Clustering (Performance)

**Req:** F2.26, F2.27, N1.3
**Beschreibung:** Clustering bei niedrigem Zoom-Level. 200.000+ Referenzen ohne Ruckeln.

**Dateien:**
- `src/components/Map/ClusterLayer.tsx` — Cluster-Darstellung
- Update `mapStyles.ts` — Cluster-Konfiguration pro Source

**Akzeptanzkriterien:**
- [ ] Bei Zoom < 8: Cluster-Circles mit Zähler
- [ ] Bei Zoom ≥ 8: Einzelne Marker
- [ ] Klick auf Cluster → Zoom in
- [ ] 200K+ Punkte = kein Ruckeln bei Panning (60 FPS)

**Tests:**
- Performance: Pan auf Zoom 3 mit 200K Punkten ≥ 30 FPS
- Cluster-Count entspricht Anzahl enthaltener Punkte

---

### T18 — Eigener Standort (GPS)

**Req:** F2.25
**Beschreibung:** GPS-Position des Users auf Karte anzeigen.

**Dateien:**
- `src/components/Map/LocationMarker.tsx`
- `src/hooks/useGeolocation.ts`

**Akzeptanzkriterien:**
- [ ] "Locate me" Button auf Karte
- [ ] GPS-Permission-Dialog korrekt
- [ ] Blauer Puls-Marker am Standort
- [ ] Genauigkeitskreis anzeigen
- [ ] Fehlerbehandlung: GPS nicht verfügbar

**Tests:**
- Hook gibt Position oder Fehler zurück
- Marker rendert bei gültiger Position

---

### T19 — Basemap-Stil-Wechsel

**Req:** F2.2
**Beschreibung:** Verschiedene Basemap-Stile wählbar (Standard, Topo, Satellit falls verfügbar).

**Dateien:**
- `src/components/Map/BasemapSelector.tsx`
- Update `mapStyles.ts` — Mehrere Styles

**Akzeptanzkriterien:**
- [ ] Mindestens 2 Stile: Standard (hell/dunkel) + Outdoor/Topo
- [ ] Wechsel bewahrt aktuelle Position und Zoom
- [ ] Referenz-Layer bleiben nach Wechsel aktiv

**Tests:**
- Style-Wechsel ändert Basemap
- Position bleibt nach Wechsel identisch

---

## E4 — Programm-Enzyklopädie

### T20 — Programm-Datenmodell & Typedefs

**Req:** F1, 3.2 (Erweiterbarkeit)
**Beschreibung:** TypeScript Types für alle Programme. JSON-Schema für Programm-Metadaten.

**Dateien:**
- `src/types/program.ts` — Interfaces
- `public/data/programs/index.json` — Programm-Index (Metadaten aller 30+ Programme)

**Interface:**
```typescript
interface Program {
  id: string;           // "sota", "pota", ...
  code: string;         // "SOTA", "POTA", ...
  name: string;         // "Summits On The Air"
  nameDE: string;
  focus: string;        // "Mountain summits"
  focusDE: string;
  tier: 1 | 2 | 3 | 4;
  website: string;
  spotSource: string;   // "spothole" | "direct" | "none"
  hasReferences: boolean;
  referenceCount?: number;
  color: string;        // Hex-Farbe für Karte
  icon: string;         // Lucide icon name
  rules: ProgramRules;
  awards: Award[];
  links: ProgramLinks;
}
```

**Akzeptanzkriterien:**
- [ ] `index.json` enthält alle 31 Programme (P01–P31)
- [ ] Jedes Programm hat alle Pflichtfelder
- [ ] Types exportiert und verwendbar
- [ ] Daten-getrieben: neues Programm = nur JSON ergänzen

**Tests:**
- `index.json` valide gegen TypeScript Interface
- Alle 31 Programme vorhanden
- Kein Programm ohne `website` Link

---

### T21 — Enzyklopädie-Inhalte generieren (4 Sprachen)

**Req:** F1.2, F1.3, F1.4, F1.7, F1.8, F1.9
**Beschreibung:** Markdown-Artikel für alle 31 Programme in DE/EN/IT/SL. Enthält: Beschreibung, Geschichte, Regeln, Awards, Getting Started, OE-spezifische Hinweise.

**Dateien:**
- `public/data/encyclopedia/de/sota.md`
- `public/data/encyclopedia/en/sota.md`
- `public/data/encyclopedia/it/sota.md`
- `public/data/encyclopedia/sl/sota.md`
- ... (× 31 Programme × 4 Sprachen = 124 Dateien)

**Struktur pro Artikel:**
```markdown
# SOTA — Summits On The Air

## Was ist SOTA?
[Beschreibung, Geschichte, Fokus]

## Regeln
- Minimum QSOs: 4
- Gipfel-Radius: innerhalb Aktivierungszone
- Equipment: portable, eigene Stromversorgung
[...]

## Punkte & Awards
| Stufe | Punkte |
|-------|--------|
| Mountain Goat | 1000 |
[...]

## Einstieg (Getting Started)
[Schritt-für-Schritt für Anfänger]

## OE-spezifische Hinweise
[OEFF-Referenzen, lokale Besonderheiten]

## Links
- [Offizielle Website](https://www.sota.org.uk)
- [Regeldokument (PDF)](...)
- [Log-Upload](...)
```

**Akzeptanzkriterien:**
- [ ] Alle 31 Programme × 4 Sprachen = 124 Artikel
- [ ] Mindestens Tier 1+2 (P01–P14) mit vollständigen Artikeln
- [ ] Tier 3+4 mit Kurzartikeln (Beschreibung, Regeln, Links)
- [ ] Alle Links klickbar (absolute URLs)
- [ ] OE-spezifische Hinweise wo relevant

**Tests:**
- Alle 124 Markdown-Dateien existieren
- Jeder Artikel hat H1, mindestens "Was ist...", "Regeln", "Links"
- Keine broken Links (relative URLs die nicht funktionieren)

---

### T22 — Markdown Renderer

**Req:** F1.2
**Beschreibung:** Markdown-Artikel im Browser rendern. Links müssen klickbar sein!

**Dependencies:** `marked` oder `react-markdown`

**Dateien:**
- `src/components/Encyclopedia/MarkdownRenderer.tsx`
- `src/hooks/useMarkdown.ts` — Lädt + cached Markdown per fetch

**Akzeptanzkriterien:**
- [ ] Markdown → HTML korrekt (Headings, Listen, Tabellen, Links)
- [ ] Links sind echte `<a href>` mit `target="_blank"` und `rel="noopener"`
- [ ] Code-Blöcke formatiert
- [ ] Dark-Mode kompatibel
- [ ] Ladezustand während Fetch

**Tests:**
- Link in Markdown rendert als `<a>` (nicht als Plain-Text)
- `target="_blank"` auf externen Links
- Tabelle rendert mit Tailwind-Styling

---

### T23 — Programm-Übersichtsseite

**Req:** F1.1, F1.5
**Beschreibung:** `/encyclopedia` — Alle Programme als Karten mit Filter und Suche.

**Dateien:**
- `src/pages/Encyclopedia.tsx`
- `src/components/Encyclopedia/ProgramCard.tsx`
- `src/components/Encyclopedia/ProgramFilter.tsx`
- `src/components/Encyclopedia/ProgramComparison.tsx`

**Akzeptanzkriterien:**
- [ ] Alle 31 Programme als Cards dargestellt
- [ ] Suche nach Name/Kürzel
- [ ] Filter nach Tier, Fokus (Berge, Parks, Burgen, etc.)
- [ ] Klick auf Card → `/encyclopedia/{id}` (klickbarer Link!)
- [ ] Vergleichsfunktion: 2–3 Programme nebeneinander
- [ ] Responsive Grid (1 Spalte Mobile, 2–3 Desktop)

**Tests:**
- Alle 31 Programme sichtbar
- Suche "SOTA" filtert auf 1 Ergebnis
- Card-Klick navigiert korrekt

---

### T24 — Programm-Detailseite

**Req:** F1.2–F1.9
**Beschreibung:** `/encyclopedia/:id` — Vollständiger Artikel mit Regeln, Awards, Links.

**Dateien:**
- `src/pages/ProgramDetail.tsx`
- `src/components/Encyclopedia/ProgramHeader.tsx` — Name, Icon, Badge
- `src/components/Encyclopedia/RulesTable.tsx`
- `src/components/Encyclopedia/AwardsList.tsx`

**Akzeptanzkriterien:**
- [ ] Markdown-Artikel gerendert (via T22)
- [ ] Programm-Header mit Icon, Name, Tier-Badge
- [ ] Regeln-Tabelle (min QSOs, Radius, Equipment)
- [ ] Awards-Liste mit Stufen
- [ ] Quick-Links: Offizielle Seite, Regeln-PDF, Log-Upload
- [ ] "Auf Karte anzeigen" Button → navigiert zu Map mit aktivem Layer
- [ ] Breadcrumb: Enzyklopädie > SOTA

**Tests:**
- Route `/encyclopedia/sota` rendert SOTA-Artikel
- Route `/encyclopedia/nonexistent` zeigt 404
- "Auf Karte anzeigen" navigiert zu `/` mit Query-Param

---

## E5 — Echtzeit-Spots

### T25 — Spothole API Client

**Req:** F5.1
**Beschreibung:** Service für Spothole API. Typed Response, Error Handling.

**Dateien:**
- `src/services/spothole.ts`
- `src/types/spot.ts`

**Interface:**
```typescript
interface Spot {
  id: string;
  callsign: string;
  frequency: number;
  mode: string;
  reference: string;
  program: string;
  lat?: number;
  lon?: number;
  comment?: string;
  time: string;       // ISO 8601
  spotter?: string;
}
```

**Akzeptanzkriterien:**
- [ ] Fetch Spots von Spothole API
- [ ] Typed Response (kein `any`)
- [ ] Error Handling: Timeout, 429, 500
- [ ] Normalisierung: alle Programme auf einheitliches Format

**Tests:**
- Client parst Spothole Response korrekt
- Bei Netzwerkfehler: Error-Objekt (kein Crash)
- Response enthält program-Feld

---

### T26 — Spot Poller (Auto-Refresh)

**Req:** F2.21, N1.4
**Beschreibung:** Polling-Mechanismus: Spots alle 60s aktualisieren. Pausiert wenn Tab nicht aktiv.

**Dateien:**
- `src/hooks/useSpotPoller.ts`

**Akzeptanzkriterien:**
- [ ] Spots alle 60 Sekunden aktualisiert
- [ ] Polling pausiert bei Hintergrund-Tab (Page Visibility API)
- [ ] Polling pausiert bei Offline
- [ ] Countdown bis nächstem Refresh sichtbar
- [ ] Manueller Refresh-Button

**Tests:**
- Polling startet bei Mount
- Polling stoppt bei Unmount
- Polling pausiert bei `visibilitychange`

---

### T27 — Spot-Tabelle (Listenansicht)

**Req:** F5.2
**Beschreibung:** `/spots` — Tabellarische Ansicht aller aktuellen Spots.

**Dateien:**
- `src/pages/SpotList.tsx`
- `src/components/Spots/SpotTable.tsx`
- `src/components/Spots/SpotRow.tsx`

**Spalten:** Callsign, Frequenz, Mode, Referenz, Programm, Alter, Kommentar

**Akzeptanzkriterien:**
- [ ] Sortierbar nach jeder Spalte
- [ ] Callsign verlinkt (klickbar!) zu QRZ.com
- [ ] Referenz verlinkt zu offizieller Seite
- [ ] "Alter" als relative Zeit ("vor 3 Min")
- [ ] Neue Spots visuell hervorgehoben (Flash)
- [ ] Responsive: horizontaler Scroll oder Card-View auf Mobile

**Tests:**
- Tabelle rendert Spots korrekt
- Sortierung funktioniert
- Callsign-Link öffnet QRZ.com

---

### T28 — Spot-Filter

**Req:** F5.4, F2.22
**Beschreibung:** Filter für Spots: Programm, Band, Mode, Alter.

**Dateien:**
- `src/components/Spots/SpotFilters.tsx`
- `src/hooks/useSpotFilters.ts`

**Akzeptanzkriterien:**
- [ ] Multi-Select für Programme
- [ ] Band-Filter (160m–70cm)
- [ ] Mode-Filter (SSB, CW, FM, FT8, etc.)
- [ ] Alter-Filter (5 Min, 15 Min, 30 Min, 1h)
- [ ] Filter persistent (localStorage)
- [ ] Filter-Count Badge
- [ ] "Filter zurücksetzen" Button

**Tests:**
- Programm-Filter zeigt nur gewählte Programme
- Mode-Filter korrekt
- Kombination von Filtern korrekt (AND-Logik)

---

### T29 — Spots auf Karte

**Req:** F2.19, F2.20, F5.3
**Beschreibung:** Live-Spots als animierte Marker auf der Hauptkarte.

**Dateien:**
- `src/components/Map/SpotLayer.tsx`
- `src/components/Map/SpotPopup.tsx`

**Akzeptanzkriterien:**
- [ ] Spots als Marker auf Karte (anders als Referenz-Marker)
- [ ] Pulsierender Effekt für frische Spots (< 5 Min)
- [ ] Klick auf Spot → Popup: Callsign, Freq, Mode, Referenz, Alter
- [ ] Popup enthält klickbare Links (QRZ, Referenz)
- [ ] Filter von SpotFilters (T28) wirken auch auf Karte
- [ ] Spot-Layer über Referenz-Layer (z-index)

**Tests:**
- Spots rendern auf korrekter Position
- Popup zeigt korrekte Daten
- Filter blendet Spots aus

---

## E6 — Multi-Programm-Erkennung

### T30 — Overlap-Grid Loader

**Req:** F3.2
**Beschreibung:** Vorberechnete Überlappungs-Daten laden. Grid-Dateien per Fetch.

**Dateien:**
- `src/services/overlap.ts`
- `src/types/overlap.ts`

**Akzeptanzkriterien:**
- [ ] Grid-Datei für gegebene Koordinaten laden
- [ ] Caching: Grid-Datei nur einmal laden pro Session
- [ ] Fehlertoleranz: nicht existierendes Grid → leeres Array

**Tests:**
- Korrekte Grid-Key-Berechnung (47.07°, 12.69° → "47.00_12.50.json")
- Bei fehlender Datei: leeres Array (kein Crash)

---

### T31 — Multi-Programm-Erkennung (Client-seitig)

**Req:** F3.1, F3.2, F3.3
**Beschreibung:** Standort eingeben → alle zutreffenden Programme anzeigen.

**Dependencies:** `@turf/distance`

**Dateien:**
- `src/services/multiProgram.ts`
- `src/components/Map/OverlapFinder.tsx` — Panel "Was gilt hier?"

**Akzeptanzkriterien:**
- [ ] Eingabe: Klick auf Karte ODER Koordinaten-Eingabe ODER GPS
- [ ] Ergebnis: Liste aller Programme die an diesem Standort gelten
- [ ] Pro Treffer: Programm, Referenz-Code, Name, Entfernung
- [ ] Sortiert nach Entfernung (nächste zuerst)
- [ ] Klick auf Treffer → Popup auf Karte

**Tests:**
- Bekannter Punkt (Großglockner) findet SOTA + ggf. weitere
- Punkt im Meer → wenige/keine Treffer
- Ergebnisse sortiert nach Entfernung

---

### T32 — "Was gilt hier?" Panel

**Req:** F3.3, F3.4
**Beschreibung:** Interaktives Panel das bei Kartenklick die Multi-Programm-Erkennung zeigt.

**Dateien:**
- `src/components/Map/WhatCountsHere.tsx`

**Akzeptanzkriterien:**
- [ ] Öffnet bei Rechtsklick/Long-Press auf Karte
- [ ] Zeigt Koordinaten des gewählten Punkts
- [ ] Listet alle zutreffenden Programme
- [ ] Pro Programm: Regeln-Kurzinfo (min. QSOs, Radius)
- [ ] "Auf Karte zentrieren" pro Referenz
- [ ] Ladezustand während Berechnung

**Tests:**
- Panel öffnet bei Kartenklick
- Korrekte Programme gelistet
- Regeln pro Programm sichtbar

---

### T33 — Nächste Referenzen (optional)

**Req:** F3.5
**Beschreibung:** "Nächste Referenzen in X km" für Programme die am aktuellen Standort nicht gelten.

**Dateien:**
- `src/components/Map/NearbyReferences.tsx`

**Akzeptanzkriterien:**
- [ ] Für jedes Programm ohne Treffer: nächste Referenz + Entfernung
- [ ] Klick → Karte zoomt zu dieser Referenz
- [ ] Max 5 nächste Referenzen pro Programm

**Tests:**
- Zeigt Entfernung zur nächsten SOTA-Referenz
- Klick zoomt korrekt

---

### T34 — Standort-Suche (Geocoding)

**Req:** F3.1
**Beschreibung:** Adresse oder Ortsname eingeben → Koordinaten → Multi-Programm-Erkennung.

**Dateien:**
- `src/components/Map/LocationSearch.tsx`
- `src/services/geocode.ts` — Nominatim (OSM) Geocoding

**Akzeptanzkriterien:**
- [ ] Texteingabe mit Autocomplete
- [ ] Nominatim API (frei, kein API-Key)
- [ ] Ergebnis → Karte zoomt hin + Multi-Programm-Erkennung
- [ ] Debounce (300ms)
- [ ] Rate-Limit respektieren (max 1 req/s)

**Tests:**
- "Großglockner" findet korrekten Punkt
- Debounce: kein Request bei schnellem Tippen
- Kein Request bei leerem Input

---

## E7 — Feld-Logging & ADIF-Export

### T35 — IndexedDB Schema (Dexie.js)

**Req:** F6.4
**Beschreibung:** Dexie.js Schema für QSOs, Aktivierungen, Settings.

**Dependencies:** `dexie`

**Dateien:**
- `src/services/db.ts`
- `src/types/qso.ts`

**Schema:**
```typescript
interface QSO {
  id?: number;
  activationId: number;
  timestamp: string;     // ISO 8601
  callsign: string;
  frequency: number;
  mode: string;
  rstSent: string;
  rstReceived: string;
  myLat?: number;
  myLon?: number;
  myGrid?: string;
  references: string[];  // ["SOTA:OE/TI-001", "POTA:OE-0012"]
  notes?: string;
}

interface Activation {
  id?: number;
  date: string;
  location: string;
  lat?: number;
  lon?: number;
  references: string[];
}
```

**Akzeptanzkriterien:**
- [ ] Schema erstellt bei erstem Besuch
- [ ] CRUD-Operationen funktionieren
- [ ] Daten überleben Browser-Reload
- [ ] Migration-Support (Dexie Versioning)

**Tests:**
- QSO erstellen + lesen
- Activation erstellen + QSOs zuordnen
- Daten nach Reload noch vorhanden

---

### T36 — QSO-Formular

**Req:** F6.1, F6.2
**Beschreibung:** Einfaches Log-Formular im Feld.

**Dateien:**
- `src/pages/LogView.tsx`
- `src/components/Log/QsoForm.tsx`

**Felder:**
- Callsign (Pflicht, uppercase auto)
- Frequenz (Pflicht, kHz)
- Mode (Dropdown: SSB, CW, FM, FT8, FT4, etc.)
- RST gesendet / empfangen
- Notizen (optional)
- **Auto-Fill:** UTC-Zeit, GPS-Standort, Maidenhead Grid, erkannte Referenzen

**Akzeptanzkriterien:**
- [ ] Formular validiert Pflichtfelder
- [ ] Callsign auto-uppercase
- [ ] UTC-Zeit automatisch
- [ ] GPS-Standort wenn verfügbar
- [ ] Referenzen aus Multi-Programm-Erkennung vorausgefüllt
- [ ] Submit → IndexedDB speichern
- [ ] Fokus springt nach Submit auf Callsign (schnelle Eingabe)
- [ ] Tastatur-freundlich (Tab-Reihenfolge)

**Tests:**
- Submit mit gültigen Daten → QSO in IndexedDB
- Submit mit leerem Callsign → Validation Error
- Callsign "oe8hsf" → gespeichert als "OE8HSF"

---

### T37 — QSO-Tabelle (aktuelle Aktivierung)

**Req:** F6.3
**Beschreibung:** QSOs der aktuellen Aktivierung als Tabelle.

**Dateien:**
- `src/components/Log/QsoTable.tsx`
- `src/components/Log/ActivationHeader.tsx`

**Akzeptanzkriterien:**
- [ ] QSOs der aktuellen Aktivierung anzeigen
- [ ] Sortiert nach Zeit (neueste oben)
- [ ] QSO editierbar (inline oder Modal)
- [ ] QSO löschbar (mit Bestätigung)
- [ ] QSO-Zähler
- [ ] Aktivierung beenden / neue starten

**Tests:**
- Tabelle zeigt QSOs korrekt
- Delete entfernt aus IndexedDB
- Edit aktualisiert in IndexedDB

---

### T38 — ADIF-Export

**Req:** F7.1, F7.2, F7.4
**Beschreibung:** ADIF 3.x Export aller QSOs einer Aktivierung.

**Dateien:**
- `src/services/adif.ts` — ADIF Generator
- `src/components/Log/AdifExport.tsx` — Export-Button + Optionen

**ADIF-Felder:**
```
<CALL:6>OE8HSF
<QSO_DATE:8>20260417
<TIME_ON:6>143000
<FREQ:7>14.285
<MODE:3>SSB
<RST_SENT:2>59
<RST_RCVD:2>57
<MY_GRIDSQUARE:6>JN66pu
<SIG:4>SOTA
<SIG_INFO:9>OE/TI-001
<MY_SIG:4>POTA
<MY_SIG_INFO:7>OE-0012
<EOR>
```

**Akzeptanzkriterien:**
- [ ] Valides ADIF 3.x Format
- [ ] SIG/SIG_INFO korrekt pro Programm
- [ ] Download als `.adi` Datei
- [ ] Dateiname: `{date}_{referenz}_{n}qsos.adi`
- [ ] Hinweis: "ADIF in Wavelog oder direkt bei SOTA/POTA/GMA hochladen"
- [ ] Link zu wavelog.oeradio.at

**Tests:**
- Generiertes ADIF enthält korrektes Header
- QSO-Felder korrekt formatiert
- Datei downloadbar

---

### T39 — Wavelog-Hinweis & Permanenz-Warnung

**Req:** F6.5, F6.6
**Beschreibung:** Prominenter Hinweis dass Daten nur lokal sind + Link zu Wavelog.

**Dateien:**
- `src/components/Log/WavelogHint.tsx`
- `src/components/Log/LocalStorageWarning.tsx`

**Akzeptanzkriterien:**
- [ ] Permanenter Hinweis oben auf Log-Seite
- [ ] Text: "Daten nur auf diesem Gerät. Für permanentes Logging → wavelog.oeradio.at"
- [ ] Link klickbar, öffnet in neuem Tab
- [ ] Warnung bei > 50 QSOs ohne Export
- [ ] i18n in allen 4 Sprachen

**Tests:**
- Hinweis sichtbar auf Log-Seite
- Link ist `<a>` mit `href`
- Warnung erscheint bei > 50 QSOs

---

## E8 — Build-Pipeline & Deployment

### T40 — Referenz-Daten Import Scripts

**Req:** 6.3 (Build-Pipeline)
**Beschreibung:** Scripts zum Abrufen und Normalisieren von Referenz-Daten aus allen APIs.

**Dateien:**
- `scripts/import/sota.ts` — SOTA API → GeoJSON
- `scripts/import/pota.ts` — POTA API → GeoJSON
- `scripts/import/gma.ts` — GMA → GeoJSON
- `scripts/import/wwbota.ts` — WWBOTA API → GeoJSON
- `scripts/import/iota.ts` — IOTA JSON → GeoJSON
- `scripts/import/normalize.ts` — Einheitliches GeoJSON-Format
- `scripts/import/index.ts` — Orchestrator: alle Quellen abholen

**Output:** `data/references/{program}.geojson`

**Akzeptanzkriterien:**
- [ ] Jeder Importer holt Daten von API
- [ ] Normalisierung auf einheitliches GeoJSON
- [ ] Rate-Limiting (respektvolle Intervalle)
- [ ] Fehlertoleranz: wenn eine API offline → Skip mit Warning
- [ ] Logging: wie viele Referenzen pro Programm
- [ ] `npm run import` führt alle Importer aus

**Tests:**
- SOTA-Importer erzeugt valides GeoJSON
- GeoJSON enthält required properties (code, program, name, lat, lon)
- Bei API-Fehler: Warning, nicht Crash

---

### T41 — PMTiles Build (tippecanoe)

**Req:** F2.28, 6.3
**Beschreibung:** GeoJSON → PMTiles Konvertierung mit tippecanoe.

**Dateien:**
- `scripts/build-pmtiles.sh` — tippecanoe für alle GeoJSON-Dateien
- `scripts/build-overlaps.ts` — Überlappungs-Grid vorberechnen

**Akzeptanzkriterien:**
- [ ] GeoJSON → PMTiles mit tippecanoe
- [ ] Zoom-Level 2–14
- [ ] Clustering in Tiles konfiguriert
- [ ] Überlappungs-Grid (0.25° × 0.25°) erzeugt
- [ ] `npm run build:data` führt gesamten Pipeline aus

**Tests:**
- PMTiles-Datei erzeugt und > 0 Bytes
- Overlap-Grid-Dateien erzeugt
- PMTiles ladbar in MapLibre (Integrationstest)

---

### T42 — GitHub Actions CI/CD

**Req:** 6.3 (Build-Pipeline)
**Beschreibung:** GitHub Actions Workflow: wöchentlicher Daten-Import + Build + Deploy.

**Dateien:**
- `.github/workflows/data-update.yml` — Wöchentlicher Cron + manuell
- `.github/workflows/deploy.yml` — App Build + Deploy bei Push

**data-update.yml:**
```yaml
on:
  schedule:
    - cron: '0 3 * * 0'  # Sonntag 03:00 UTC
  workflow_dispatch: {}

jobs:
  update-data:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run import
      - run: npm run build:pmtiles
      - run: npm run build:overlaps
      - uses: stefanzweifel/git-auto-commit-action@v5
        with:
          commit_message: "chore: update reference data"
```

**Akzeptanzkriterien:**
- [ ] Wöchentlicher Cron läuft
- [ ] Manueller Trigger möglich
- [ ] tippecanoe installiert in Runner
- [ ] Daten-Commit ins Repo
- [ ] Deploy auf Synology nach App-Build
- [ ] Secrets: SSH-Key für Synology

**Tests:**
- Workflow YAML valide
- Dry-Run lokal möglich (`act` oder manuell)

---

## Abhängigkeiten & Reihenfolge

```
Phase 1 (Wochen 1–2): E1 (T01–T06) → E2 (T07–T12)
Phase 2 (Wochen 3–4): E3 (T13–T19) parallel E4 (T20–T24)
Phase 3 (Wochen 5–6): E5 (T25–T29) parallel E6 (T30–T34)
Phase 4 (Wochen 7–8): E7 (T35–T39) parallel E8 (T40–T42)
```

### Kritischer Pfad

```
T01 → T02 → T03 → T12 → T13 → T14 → T15 → T17 → T29 → T31
```

Map + PMTiles + Layer-Switching + Clustering + Spots + Multi-Programm = Kernfeature-Kette.

---

## Dependencies (package.json)

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0",
    "maplibre-gl": "^4.7.0",
    "pmtiles": "^3.2.0",
    "@turf/distance": "^7.1.0",
    "@turf/helpers": "^7.1.0",
    "dexie": "^4.0.0",
    "react-markdown": "^9.0.0",
    "lucide-react": "^0.468.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.6.2",
    "tailwindcss": "^3.4.17",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "vite": "^6.0.0",
    "vitest": "^2.1.0",
    "@testing-library/react": "^16.0.0",
    "eslint": "^9.17.0"
  }
}
```

---

## Test-Strategie

| Ebene | Tool | Scope |
|-------|------|-------|
| Unit | Vitest | Services (adif.ts, overlap.ts, spothole.ts, db.ts) |
| Component | Vitest + Testing Library | React Components (Rendering, Events) |
| Integration | Vitest | API Clients gegen Mock-Server |
| E2E | Playwright (optional Phase 2) | Full User-Flows |
| Visual | Storybook (optional) | Component Library |

**Mindest-Coverage:** Services 80%, Components 60%.

---

## Offene Frage

| # | Frage | Status |
|---|-------|--------|
| 1 | GitHub Repo: eigenes Repo `xotamap` oder Subfolder in `oeradioat`? | Offen |
