# xOTA Map — Requirements Document

**Version:** 1.0
**Datum:** 2026-04-17
**Projekt:** xOTA Map — Die universelle Plattform für Outdoor-Amateurfunk
**Betreiber:** oeradio.at

---

## 1. Projektziel

Eine Web-App, die **alle Outdoor-Amateurfunk-Programme (xOTA)** auf einer einzigen Plattform vereint:

1. **Verstehen** — Enzyklopädie aller 30+ Programme mit Regeln, Awards, Vergleichen
2. **Entdecken** — Interaktive Karte mit Referenz-Overlays aller Programme
3. **Planen** — Multi-Programm-Erkennung und Aktivierungs-Planer
4. **Spotten** — Echtzeit-Spots aller Programme aggregiert
5. **Loggen** — "Log Once, Upload Everywhere"

### Elevator Pitch

> "Spothole zeigt wer JETZT funkt. xOTA Map zeigt wo du funken KANNST — alle 30+ Programme auf einer Karte, mit Planung, Logging und zentralem Upload."

---

## 2. Unique Selling Propositions

| # | USP | Beschreibung | Existiert bei |
|---|-----|-------------|---------------|
| 1 | **Referenz-Atlas** | Alle Referenzen aller Programme als schaltbare Overlays — auch ohne aktive Spots | Niemand |
| 2 | **Multi-Programm-Erkennung** | "Dieser Standort zählt für SOTA + POTA + WWFF + GMA" | Niemand vollständig |
| 3 | **Aktivierungs-Planer** | Route planen → Referenzen entlang Route → maximale Programm-Abdeckung | Niemand |
| 4 | **Enzyklopädie** | Alle Programme beschrieben, verglichen, mit Regeln und Awards | Niemand |
| 5 | **Log Once, Upload Everywhere** | Ein QSO → automatisch an alle zutreffenden Programme | Niemand vollständig |

### Abgrenzung zu Wettbewerbern

| Feature | Spothole | FieldSpotter | Ham2K PoLo | GMA Map | **xOTA Map** |
|---------|----------|--------------|------------|---------|-------------|
| Echtzeit-Spots | ✅ 21 Prog. | ✅ 3 Prog. | ❌ | ✅ | ✅ via Spothole |
| Referenz-Overlays (alle Standorte) | ❌ | ❌ | ❌ | ⚠️ teilw. | **✅** |
| Multi-Programm pro Standort | ❌ | ❌ | ⚠️ | ❌ | **✅** |
| Programm-Enzyklopädie | ❌ | ❌ | ❌ | ❌ | **✅** |
| Aktivierungs-Planer | ❌ | ❌ | ❌ | ❌ | **✅** |
| QSO-Logging | ❌ | ❌ | ✅ | ❌ | ✅ |
| Log Upload multi-Programm | ❌ | ❌ | ⚠️ ADIF | ❌ | **✅** |
| Offline-Modus | ❌ | ❌ | ✅ | ❌ | ✅ |

---

## 3. Abgedeckte Programme (30+)

### 3.1 Vollständige Programmliste

**Tier 1 — Große Programme (APIs vorhanden)**

| ID | Kürzel | Name | Fokus |
|----|--------|------|-------|
| P01 | SOTA | Summits On The Air | Berggipfel |
| P02 | POTA | Parks On The Air | Parks, Naturschutzgebiete |
| P03 | WWFF | World Wide Flora & Fauna | Naturschutzgebiete (172 Länder) |
| P04 | GMA | Global Mountain Activity | Alle Berge |
| P05 | IOTA | Islands On The Air | Inselgruppen |

**Tier 2 — Mittlere Programme (Daten vorhanden)**

| ID | Kürzel | Name | Fokus |
|----|--------|------|-------|
| P06 | WCA/COTA | World Castles Award | Burgen, Schlösser, Ruinen |
| P07 | WWBOTA | Worldwide Bunkers On The Air | Bunker, Militäranlagen |
| P08 | BOTA | Beaches On The Air | Strände |
| P09 | HEMA | HuMPs Excluding Marilyns | Gipfel 100–149m Prominenz |
| P10 | WLOTA | World Lighthouse On The Air | Leuchttürme |
| P11 | ILLW | Int'l Lighthouse Lightship Weekend | Leuchttürme (Event) |
| P12 | TOTA | Towers On The Air | Aussichtstürme |
| P13 | LLOTA | Lagos y Lagunas On The Air | Seen, Lagunen |
| P14 | COTA-OE | Castles On The Air Österreich | Burgen in OE |

**Tier 3 — Regionale Programme**

| ID | Kürzel | Name | Region |
|----|--------|------|--------|
| P15 | WOTA | Wainwrights On The Air | UK Lake District |
| P16 | SiOTA | Silos On The Air | Australien |
| P17 | MOTA | Mills On The Air | DE/International |
| P18 | ECA | English Castles Awards | England |
| P19 | ELA | English Lighthouses Awards | England |
| P20 | ZLOTA | ZL On The Air | Neuseeland |
| P21 | ROTA | Railways On The Air | UK/International |
| P22 | KRMNPA | Keith Roget Memorial Nat'l Parks | VK/Australien |
| P23 | HOTA | Heritage On The Air | Südafrika |
| P24 | HOTA-UK | Houses On The Air | UK |
| P25 | WAB | Worked All Britain | UK |
| P26 | WAI | Worked All Ireland | Irland |

**Tier 4 — Event-basierte Programme**

| ID | Kürzel | Name | Zeitraum |
|----|--------|------|----------|
| P27 | JOTA | Jamboree On The Air | Oktober |
| P28 | KOTA | Kids On The Air | Camps |
| P29 | YOTA | Youngsters On The Air | Dezember |
| P30 | GOTA | Get On The Air | Field Day |
| P31 | CHOTA | Churches & Chapels On The Air | September |

**Sub-Programme (unter Dach-Programmen)**

| Dach | OE-Kürzel | Weitere |
|------|-----------|---------|
| WWFF | OEFF | DLFF, VKFF, JAFF, FFF, ONFF, ... (172 Länder) |
| WWBOTA | OEBOTA | DLBOTA, UKBOTA, USBOTA, S5BOTA, ... (23+ Länder) |
| TOTA | OER | OKR, OMR, DLR, SPR, PAR, ... |

### 3.2 Erweiterbarkeit

Das System MUSS so gestaltet sein, dass neue Programme ohne Code-Änderung hinzugefügt werden können (Daten-gesteuert, nicht hart-codiert).

---

## 4. Funktionale Anforderungen

### F1 — Programm-Enzyklopädie

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F1.1 | Übersichtsseite mit allen Programmen (Filter, Suche, Vergleich) | MUSS |
| F1.2 | Detail-Seite pro Programm: Beschreibung, Geschichte, Fokus | MUSS |
| F1.3 | Regeln pro Programm: min. QSOs, Radius, Equipment, Betriebsarten | MUSS |
| F1.4 | Punkte-System und Award-Stufen pro Programm | MUSS |
| F1.5 | Vergleichstabelle: Programme nebeneinander vergleichen | SOLL |
| F1.6 | Links zu offiziellen Websites, Regeldokumenten, Log-Upload-Seiten | MUSS |
| F1.7 | Mehrsprachig: DE, EN (mindestens) | SOLL |
| F1.8 | "Getting Started"-Guide pro Programm für Einsteiger | SOLL |
| F1.9 | OE-spezifische Hinweise (OEFF, OEBOTA, OER, COTA-OE Referenzen) | SOLL |

### F2 — Interaktive Karte

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| **Basiskarte** | | |
| F2.1 | Basiskarte: OpenStreetMap via MapLibre GL JS (FOSS, keine API-Kosten) | MUSS |
| F2.2 | Verschiedene Basemap-Stile wählbar (Topo, Satellite, Dark) | SOLL |
| F2.3 | Mobile-responsive (Touch, Pinch-Zoom) | MUSS |
| **Referenz-Overlays** | | |
| F2.4 | Schaltbare Layer pro Programm (Checkbox-Liste im Sidebar) | MUSS |
| F2.5 | SOTA: Gipfel als Punkte, farbcodiert nach Punktwert | MUSS (Phase 1) |
| F2.6 | POTA: Parks als Punkte (oder Flächen wenn verfügbar) | MUSS (Phase 1) |
| F2.7 | GMA: Berge als Punkte | MUSS (Phase 1) |
| F2.8 | WWBOTA: Bunker als Punkte | MUSS (Phase 1) |
| F2.9 | IOTA: Inselgruppen als Punkte/Flächen | MUSS (Phase 1) |
| F2.10 | WWFF: Naturschutzgebiete als Punkte/Flächen | SOLL (Phase 2) |
| F2.11 | WCA/COTA: Burgen als Punkte | SOLL (Phase 2) |
| F2.12 | TOTA: Aussichtstürme als Punkte | SOLL (Phase 2) |
| F2.13 | HEMA: Gipfel als Punkte | SOLL (Phase 2) |
| F2.14 | WLOTA/ILLW: Leuchttürme als Punkte | SOLL (Phase 2) |
| F2.15 | Alle weiteren Programme (Tier 3) | SOLL (Phase 3) |
| **Referenz-Details** | | |
| F2.16 | Klick auf Referenz → Popup mit: Name, Code, Programm(e), Koordinaten, Höhe, Punkte, letzte Aktivierung | MUSS |
| F2.17 | Multi-Programm-Badge: Popup zeigt ALLE Programme, die an diesem Standort gelten | MUSS |
| F2.18 | Link zur offiziellen Referenz-Seite im Popup | SOLL |
| **Echtzeit-Spots** | | |
| F2.19 | Aktive Spots als animierte/hervorgehobene Marker auf Karte | MUSS |
| F2.20 | Spot-Daten: Callsign, Frequenz, Mode, Referenz, Alter | MUSS |
| F2.21 | Auto-Refresh (Spots alle 60 Sekunden aktualisieren) | MUSS |
| F2.22 | Filter: Programm, Band, Mode, Alter (5min–1h) | MUSS |
| **Zusätzliche Overlays** | | |
| F2.23 | Greyline/Terminator Overlay | SOLL |
| F2.24 | Maidenhead Grid Overlay | SOLL |
| F2.25 | Eigener Standort (GPS) | MUSS |
| **Performance** | | |
| F2.26 | Clustering bei Zoom-Out (200.000+ Referenzen performant darstellen) | MUSS |
| F2.27 | Lazy Loading: Referenzen nur im sichtbaren Kartenausschnitt laden | MUSS |
| F2.28 | Vektor-Tiles oder PMTiles für Referenz-Daten | SOLL |

### F3 — Multi-Programm-Erkennung

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F3.1 | Standort eingeben (Koordinaten, Adresse, GPS) → alle zutreffenden Referenzen anzeigen | MUSS |
| F3.2 | Geo-Intersection: Punkt gegen alle Referenz-Gebiete/Radien prüfen | MUSS |
| F3.3 | Ergebnis: "Du stehst in: SOTA OE/TI-001 + POTA OE-0012 + OEFF-0045 + GMA OE/TI-123" | MUSS |
| F3.4 | Regeln pro Programm anzeigen (Radius, min. QSOs etc.) | SOLL |
| F3.5 | "Nächste Referenzen in X km" für Programme, die am Standort nicht gelten | SOLL |

### F4 — Aktivierungs-Planer

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F4.1 | Bereich auf Karte wählen → alle Referenzen in diesem Bereich auflisten | SOLL |
| F4.2 | Route zeichnen → Referenzen entlang Route finden | KANN |
| F4.3 | Sortierung nach: Programm-Anzahl (meiste Programme zuerst), Entfernung, Punkte | SOLL |
| F4.4 | "Multi-Programm-Hotspots": Orte mit 3+ gleichzeitigen Programmen hervorheben | SOLL |
| F4.5 | Aktivierungshistorie: War diese Referenz schon mal aktiviert? Wann zuletzt? | KANN |
| F4.6 | Wetter-Integration (openweathermap o.ä.) für geplante Outdoor-Aktivierung | KANN |
| F4.7 | Export als GPX für Wander-Navigation | KANN |

### F5 — Echtzeit-Spotting

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F5.1 | Spot-Aggregation: Spothole JSON-API als primäre Quelle (21 Programme) | MUSS |
| F5.2 | Spot-Liste: Tabellarische Ansicht mit Filter und Sortierung | MUSS |
| F5.3 | Spot-Karte: Spots als Marker auf Karte (kombiniert mit F2.19) | MUSS |
| F5.4 | Filter: Programm (Multi-Select), Band, Mode, Kontinent, Entfernung, Alter | MUSS |
| F5.5 | Audio-Benachrichtigung bei neuem Spot (optional) | SOLL |
| F5.6 | Push-Benachrichtigung für gespeicherte Filter/Watchlists | KANN (Phase 4) |
| F5.7 | Self-Spotting: Spot an Spothole/POTA/SOTA/GMA gleichzeitig posten | KANN (Phase 4) |
| F5.8 | Bearing/Entfernung vom eigenen Standort zum Spot | SOLL |

### F6 — Feld-Logging (leichtgewichtig, lokal)

**Entscheidung:** Logging ist Hilfsfunktion, nicht Kernfeature. Für vollwertiges Logging → Wavelog (wavelog.oeradio.at). xOTA Map bietet nur Quick-Log im Feld mit ADIF-Export.

**Daten sind nur auf dem jeweiligen Gerät gespeichert (IndexedDB). Kein Cloud-Sync. Kein Server-Storage.**

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F6.1 | Einfaches Log-Formular: Callsign, Frequenz, Mode, RST, Notizen | SOLL |
| F6.2 | Auto-Fill: UTC-Zeit, Standort, Maidenhead Grid, erkannte Referenzen | SOLL |
| F6.3 | QSO-Liste der aktuellen Aktivierung | SOLL |
| F6.4 | Lokale Speicherung (IndexedDB) — überlebt Browser-Reload | SOLL |
| F6.5 | Hinweis: "Daten nur auf diesem Gerät. Für permanentes Logging → Wavelog" | MUSS |
| F6.6 | Link zu wavelog.oeradio.at prominent im Log-Bereich | MUSS |

### F7 — ADIF-Export

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F7.1 | ADIF 3.x Export aller QSOs einer Aktivierung als .adi Download | SOLL |
| F7.2 | ADIF mit korrekten SIG/SIG_INFO Feldern pro erkanntem Programm | SOLL |
| F7.3 | Separater ADIF pro Programm (POTA-ADIF, SOTA-ADIF, etc.) | KANN |
| F7.4 | Hinweis: "ADIF in Wavelog oder direkt bei SOTA/POTA/GMA hochladen" | MUSS |

**Kein direkter API-Upload.** User exportiert ADIF → lädt manuell hoch bei SOTA/POTA/GMA/Wavelog. Hält Architektur rein statisch.

---

## 5. Nicht-funktionale Anforderungen

### N1 — Performance

| ID | Anforderung | Zielwert |
|----|-------------|----------|
| N1.1 | Initiales Laden der App (First Contentful Paint) | < 2 Sekunden |
| N1.2 | Karte interaktiv nach Laden | < 3 Sekunden |
| N1.3 | 200.000+ Referenzen auf Karte ohne Ruckeln | 60 FPS beim Panning |
| N1.4 | Spot-Aktualisierung | ≤ 60 Sekunden Latenz |
| N1.5 | Referenz-Suche im Radius | < 500ms für 50km-Radius |

### N2 — Offline-Fähigkeit

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| N2.1 | PWA: App installierbar auf Smartphone (Add to Home Screen) | MUSS |
| N2.2 | Offline-Karte: Kartenausschnitt vorab cachebar (Service Worker) | SOLL |
| N2.3 | Offline-Referenzen: Referenz-Daten für gewählte Region cachebar | SOLL |
| N2.4 | Offline-Logging: QSOs lokal speichern, Upload bei Reconnect | MUSS |
| N2.5 | Sync-Indikator: Klar anzeigen ob online/offline, was noch zu syncen ist | MUSS |

### N3 — Sicherheit

| ID | Anforderung |
|----|-------------|
| N3.1 | HTTPS durchgehend |
| N3.2 | User-Credentials (SOTA/POTA/etc. Logins) verschlüsselt speichern, nie im Klartext |
| N3.3 | Kein Tracking, keine Analytics-Cookies (DSGVO) |
| N3.4 | Keine API-Keys im Frontend (nur öffentliche APIs ohne Key nutzen) |
| N3.5 | Keine eigene API → kein Rate-Limiting nötig (nur statische Dateien) |

### N4 — Skalierbarkeit

| ID | Anforderung |
|----|-------------|
| N4.1 | PMTiles: 500.000+ Referenzen als statische Dateien hostbar |
| N4.2 | Neue Programme durch JSON/PMTiles hinzufügbar, ohne Code-Änderung |
| N4.3 | Spots: Client-seitig von Spothole API geholt, keine Server-Last |
| N4.4 | Unbegrenzte User — kein Server-State, alles lokal im Browser |

### N5 — Barrierefreiheit & UX

| ID | Anforderung |
|----|-------------|
| N5.1 | Mobile-first Design (primäre Nutzung: Smartphone im Feld) |
| N5.2 | Große Touch-Targets (min. 44px) für Outdoor-Nutzung mit Handschuhen |
| N5.3 | Hoher Kontrast / Lesbarkeit bei Sonnenlicht |
| N5.4 | Tastaturnavigation für Desktop-Nutzung |
| N5.5 | Sprache: Deutsch und Englisch (mindestens) |
| N5.6 | Dark/Light/Auto Theme (Tailwind class-based, localStorage) |

### N6 — oeradio.at Branding & Layout (wie bandblick/antennenblick)

| ID | Anforderung |
|----|-------------|
| **Header** | |
| N6.1 | OE Radio Logo links (aus `config.json`: `parentSiteLogo`, verlinkt zu `parentSiteUrl`) |
| N6.2 | App-Icon + Titel "xOTA Map" + Untertitel neben Logo |
| N6.3 | Rechts: Sprachauswahl (DE/EN), Theme-Toggle (Dark/Light/Auto) |
| N6.4 | Mobile: kompakte Header-Version |
| **Footer** | |
| N6.5 | Link zu `parentSiteUrl`: "Part of OE Radio Tools" / "Ein Tool von OE Radio" |
| N6.6 | Link: Impressum (Modal, wie bandblick) |
| N6.7 | Link: Datenschutz (Modal, wie bandblick) |
| N6.8 | Link: GitHub Repository |
| N6.9 | Versionsnummer (aus `config.json`: `version`, gesetzt via `APP_VERSION` Env-Var) |
| N6.10 | Footer-Layout: zentriert, `•`-getrennt, responsive (stacked auf Mobile) |
| **Runtime Config** | |
| N6.11 | `config.json` wird bei Container-Start aus Env-Vars generiert (`docker-entrypoint.sh`) |
| N6.12 | Felder: `siteName`, `siteDescription`, `parentSiteName`, `parentSiteUrl`, `parentSiteLogo`, `version` |
| **Shared Components** (identisch zu bandblick) | |
| N6.13 | `ParentSiteLogo` Component: Lädt Logo aus config, zeigt als Link |
| N6.14 | `LegalModal` Component: Impressum + Datenschutz als Modal-Popups |
| N6.15 | `ThemeToggle` Component: Dark/Light/Auto |
| N6.16 | `LanguageSelector` Component: DE, EN (erweiterbar IT, SL) |
| N6.17 | `useConfig` Hook: Lädt `/config.json`, cached |

#### Header-Mockup

```
┌─────────────────────────────────────────────────────────┐
│ [OE Radio Logo]  🗺️ xOTA Map              [DE|EN] [🌓] │
│                  Alle Outdoor-Funk-Programme             │
└─────────────────────────────────────────────────────────┘
```

#### Footer-Mockup

```
┌─────────────────────────────────────────────────────────┐
│  xOTA Map v0.1.0 • Ein Tool von OE Radio •              │
│  Impressum | Datenschutz | GitHub                        │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Datenarchitektur (Static-First, kein DB-Server)

### 6.1 Datei-Struktur (statisch, kein DB-Server)

Alle Daten als statische Dateien. Geo-Queries im Browser (Turf.js) oder vorberechnet bei Build.

```
/data/
├── programs/
│   ├── index.json              # Alle Programme (Metadaten, Regeln, Icons)
│   ├── sota.json               # SOTA-Details + Regeln
│   ├── pota.json               # POTA-Details + Regeln
│   └── ...                     # Je Programm eine Datei
│
├── references/
│   ├── sota.pmtiles            # SOTA-Gipfel als Vektor-Tiles
│   ├── pota.pmtiles            # POTA-Parks als Vektor-Tiles
│   ├── gma.pmtiles             # GMA-Berge als Vektor-Tiles
│   ├── wwbota.pmtiles          # Bunker als Vektor-Tiles
│   ├── iota.pmtiles            # Inseln als Vektor-Tiles
│   └── ...                     # Je Programm eine PMTiles-Datei
│
├── overlaps/
│   ├── spatial-index.json      # Vorberechneter räumlicher Index
│   └── grid/                   # Vorberechnete Überlappungen pro Rasterfeld
│       ├── 47.0_12.5.json      # "In diesem 0.5°×0.5° Feld gelten: ..."
│       └── ...
│
├── encyclopedia/
│   ├── sota.md                 # Enzyklopädie-Artikel
│   ├── pota.md
│   └── ...
│
└── spots/                      # (Nicht statisch — live von Spothole API)
```

### 6.2 Multi-Programm-Erkennung (ohne Datenbank)

Zwei Ansätze, beide ohne Server:

**Ansatz A: Client-seitig mit Turf.js**
```javascript
import { point, distance } from '@turf/turf';

const myLocation = point([12.6954, 47.0735]);

// Gegen geladene Referenzen im sichtbaren Kartenausschnitt prüfen
const matches = references.filter(ref => {
  const dist = distance(myLocation, point([ref.lon, ref.lat]), { units: 'meters' });
  return dist <= (ref.radius || 500);
});
// → [{code: "OE/TI-001", program: "SOTA"}, {code: "OE-0012", program: "POTA"}, ...]
```

**Ansatz B: Vorberechnetes Grid (Build-Time)**
```javascript
// Überlappungen bei Build vorberechnet → JSON pro Rasterfeld
const gridKey = `${Math.floor(lat * 2) / 2}_${Math.floor(lon * 2) / 2}`;
const overlaps = await fetch(`/data/overlaps/grid/${gridKey}.json`);
// → Alle Referenzen in diesem 0.5° Rasterfeld, schnell filterbar
```

### 6.3 Build-Pipeline (GitHub Actions)

```
GitHub Actions (wöchentlich oder manuell)
│
├── 1. Referenz-Daten holen
│   ├── SOTA API → sota-raw.json
│   ├── POTA API → pota-raw.json
│   ├── GMA API  → gma-raw.json
│   ├── IOTA     → iota-raw.json (Download)
│   ├── WWBOTA   → wwbota-raw.json
│   └── ...
│
├── 2. Normalisieren → GeoJSON pro Programm
│
├── 3. PMTiles erzeugen (tippecanoe)
│   └── *.geojson → *.pmtiles
│
├── 4. Überlappungen vorberechnen
│   └── Alle Referenzen → räumlicher Index → /data/overlaps/grid/*.json
│
└── 5. Deploy statische Dateien
    └── git push → Cloudflare Pages auto-deploy
```

### 6.4 QSO-Daten (lokal im Browser)

```
IndexedDB (Dexie.js) — kein Server speichert User-Daten
│
├── qsos[]            # Alle geloggten QSOs
│   ├── id, timestamp, callsign, freq, mode, rst_s, rst_r
│   ├── my_lat, my_lon, my_grid
│   ├── references[]  # ["SOTA:OE/TI-001", "POTA:OE-0012", ...]
│   └── uploads{}     # {"sota": "done", "pota": "pending", "wwff": "manual"}
│
├── activations[]     # Gruppierung von QSOs pro Aktivierung
│   ├── id, date, location, references[]
│   └── qso_ids[]
│
└── settings           # Callsign, Grid, API-Credentials (verschlüsselt)
```

Export jederzeit als ADIF. Kein Server-Storage. Alles lokal.

---

## 7. Technischer Stack

### Constraint: Docker auf Synology NAS oder host-node-01

Hosting auf bestehender Infrastruktur:
- **Synology NAS** (station.strali.solutions) — läuft bereits oeradio.at WordPress
- **host-node-01** (Ubuntu 24.04) — läuft bereits DMR Bridge
- Zugang von außen via **bestehendem Cloudflare Tunnel** (`cloudflared-oeradio`)
- **Docker-Container** als Deployment-Unit

### Architektur: nginx-Container + statische Dateien

```
┌─────────────────────────────────────────────────────────┐
│  Synology NAS / host-node-01                            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  Docker: xotamap-web (nginx:alpine)               │  │
│  │  Port: 3082                                       │  │
│  │  Volume: /volume1/docker/xotamap → /usr/share/    │  │
│  │          nginx/html                               │  │
│  │                                                   │  │
│  │  Statische Dateien:                               │  │
│  │  ├── index.html (SPA)                             │  │
│  │  ├── assets/ (JS, CSS, Icons)                     │  │
│  │  ├── data/references/*.pmtiles                    │  │
│  │  ├── data/programs/*.json                         │  │
│  │  ├── data/overlaps/grid/*.json                    │  │
│  │  └── data/encyclopedia/*.md                       │  │
│  │                                                   │  │
│  │  nginx.conf:                                      │  │
│  │  ├── gzip on (HTML, JS, CSS, JSON)                │  │
│  │  ├── Range Requests (für PMTiles)                 │  │
│  │  ├── Cache-Control: public, max-age=3600          │  │
│  │  ├── CORS headers (für Spothole API Calls)        │  │
│  │  └── SPA fallback: try_files $uri /index.html     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Cloudflare Tunnel (cloudflared-oeradio)                │
│  └── xotamap.oeradio.at → localhost:3082               │
└─────────────────────────────────────────────────────────┘

Browser (Client)
├── SvelteKit/Astro SPA
├── MapLibre GL JS → lädt PMTiles per HTTP Range Requests
├── Turf.js → Geo-Queries client-seitig
├── IndexedDB → QSO-Logging lokal
└── Direkte API-Calls an:
    ├── Spothole API (Spots, 21 Programme)
    ├── SOTA API (bei Bedarf)
    └── POTA API (bei Bedarf)

GitHub Actions (CI/CD)
├── Referenz-Daten holen (SOTA/POTA/GMA/IOTA/WWBOTA APIs)
├── GeoJSON normalisieren
├── PMTiles erzeugen (tippecanoe)
├── Überlappungen vorberechnen
└── Deploy: scp → Synology/host-node-01 → docker cp/Volume
```

**Resource-Footprint:** ~50MB RAM (nginx:alpine). Keine DB. Keine Runtime. Nur statische Dateien.

### Stack

| Komponente | Technologie | Begründung |
|------------|-------------|------------|
| **Frontend** | SvelteKit (static adapter) oder Astro | Generiert rein statische Dateien, kein Node-Server nötig |
| **Karte** | MapLibre GL JS | FOSS, Vektor-Tiles, schnell, läuft komplett im Browser |
| **Referenz-Daten** | PMTiles (statische Dateien) | Kein DB-Server nötig — Browser lädt Tiles direkt per HTTP Range Requests |
| **Geo-Queries** | Turf.js (Client-seitig) | Punkt-in-Radius, Multi-Programm-Erkennung im Browser |
| **Spot-Daten** | Spothole API (direkt vom Client) | Kein Proxy nötig, CORS-fähig |
| **QSO-Logging** | IndexedDB (Dexie.js) | Lokal im Browser, kein Server-Storage |
| **Programm-Daten** | JSON + Markdown (statisch) | Enzyklopädie als statischer Content |
| **Überlappungen** | Vorberechnetes JSON | Build-Time: alle Referenz-Überlappungen berechnen → JSON |
| **Offline** | Service Worker + Cache API | PWA, gecachte Tiles + Referenz-Daten |
| **Container** | nginx:alpine (~5MB Image) | Minimaler Footprint, nur statische Dateien servieren |
| **Hosting** | Docker auf Synology NAS oder host-node-01 | Bestehende Infrastruktur, Cloudflare Tunnel bereits vorhanden |
| **Domain** | xotamap.oeradio.at | Via bestehenden `cloudflared-oeradio` Tunnel |
| **CI/CD** | GitHub Actions → scp + docker cp | Referenz-Daten aktualisieren, PMTiles bauen, deployen |

### Was entfällt

| Nicht nötig | Warum |
|-------------|-------|
| PostgreSQL / PostGIS | Geo-Queries via Turf.js im Browser oder vorberechnet |
| Redis | Spots direkt von Spothole API, kein Caching-Layer nötig |
| Backend-Server (Node/Python) | Alles statisch + Client-seitige API-Calls |
| SSL-Zertifikate | Cloudflare Tunnel terminiert HTTPS automatisch |
| Reverse Proxy | Cloudflare Tunnel leitet direkt an nginx-Container |

### Log-Upload ohne eigenes Backend

Log-Upload an SOTA/POTA/GMA erfolgt direkt vom Browser (CORS-fähig) oder per generierter ADIF-Datei zum manuellen Upload. Für APIs die kein CORS erlauben: kleiner Cloudflare Worker als Proxy (serverless, gratis-Tier) oder nginx reverse-proxy Endpoint im Container.

### Deploy-Pattern (identisch zu bandblick, antennenblick, etc.)

Alle oeradio.at Tools folgen dasselbe Pattern:
- Multi-Stage Dockerfile: Node (Build) → nginx:alpine (Serve)
- `deploy-production.sh`: git pull auf Synology → Docker Build → Container Start
- `.env.production`: Host, Port, Container-Name, Site-URL
- `docker-entrypoint.sh`: Schreibt runtime `config.json` aus Env-Vars
- Cloudflare Tunnel Route für Subdomain

### Dateien (zu erstellen)

```
xotamap/
├── Dockerfile                    # Multi-stage: Node 20 → nginx:alpine
├── docker-compose.yml            # Port 3082:80, Env-Vars
├── docker-entrypoint.sh          # Runtime config.json generieren
├── nginx.conf                    # Gzip, Range Requests (PMTiles!), SPA fallback
├── deploy-production.sh          # Synology Deploy-Script
├── .env.production               # Host, Port, Container Config
├── .env.production.example       # Template
├── package.json                  # Vite + React/Svelte + Tailwind
├── public/
│   └── config.json               # Dev-Fallback (parentSite etc.)
├── src/                          # App-Code
└── data/                         # PMTiles + JSON (Build-Artefakte)
```

### docker-compose.yml

```yaml
services:
  xotamap:
    build: .
    container_name: xotamap
    restart: unless-stopped
    ports:
      - "127.0.0.1:3082:80"
    environment:
      - SITE_NAME=xOTA Map
      - SITE_DESCRIPTION=Alle Outdoor-Amateurfunk-Programme auf einer Karte
      - PARENT_SITE_NAME=OE Radio
      - PARENT_SITE_URL=https://oeradio.at
      - PARENT_SITE_LOGO=https://oeradio.at/wp-content/uploads/2026/01/oeradiologo-300x200.png
```

### Dockerfile

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
RUN apk add --no-cache wget
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
```

### docker-entrypoint.sh

```bash
#!/bin/sh
set -e
cat > /usr/share/nginx/html/config.json << EOF
{
  "siteName": "${SITE_NAME:-xOTA Map}",
  "siteDescription": "${SITE_DESCRIPTION:-Alle Outdoor-Amateurfunk-Programme auf einer Karte}",
  "parentSiteName": "${PARENT_SITE_NAME:-}",
  "parentSiteUrl": "${PARENT_SITE_URL:-}",
  "parentSiteLogo": "${PARENT_SITE_LOGO:-}",
  "version": "${APP_VERSION:-dev}"
}
EOF
exec nginx -g "daemon off;"
```

### nginx.conf (erweitert für PMTiles)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript
               application/javascript application/json application/xml;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # PMTiles: Range Requests MÜSSEN funktionieren
    location ~* \.pmtiles$ {
        expires 7d;
        add_header Cache-Control "public";
        add_header Access-Control-Allow-Origin "*";
        add_header Access-Control-Allow-Headers "Range";
        add_header Access-Control-Expose-Headers "Content-Range, Content-Length";
    }

    # JSON config: no cache
    location ~* config\.json$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Static JSON data: cache 1 day
    location /data/ {
        expires 1d;
        add_header Cache-Control "public";
    }

    # Hashed assets: cache forever
    location ~* \.(js|css)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Images/fonts: cache 7 days
    location ~* \.(ico|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

### .env.production

```bash
SYNOLOGY_HOST=straliadmin@station.strali.solutions
REMOTE_DIR=/volume1/docker/xotamap
CONTAINER_NAME=xotamap
IMAGE_NAME=xotamap:latest
CONTAINER_PORT=3082:80
SITE_URL=https://xotamap.oeradio.at/
DOCKER_CMD=/var/packages/Docker/target/usr/bin/docker
```

### deploy-production.sh

Identisch zu bandblick: git pull → docker build → docker run mit Env-Vars + Health-Check.

### Cloudflare Tunnel

```yaml
# config.yml ergänzen:
- hostname: xotamap.oeradio.at
  service: http://localhost:3082
```

### Resource-Verbrauch

| Resource | Wert |
|----------|------|
| RAM | ~50MB (nginx:alpine) |
| CPU | Praktisch 0 (nur statische Dateien) |
| Disk | ~200-500MB (PMTiles + Assets) |
| Netzwerk | Minimal (Cloudflare cached, Spots von externen APIs) |
| Vergleich | WordPress-Container braucht 10x mehr Ressourcen |

---

## 8. Rollout-Phasen

### Phase 1 — MVP

**Ziel:** Nutzbarer Referenz-Atlas + Spots + Enzyklopädie

| Komponente | Umfang |
|------------|--------|
| Enzyklopädie | Alle 30+ Programme beschrieben |
| Karte — Referenzen | SOTA, POTA, GMA, WWBOTA, IOTA (5 Overlays) |
| Karte — Spots | Alle 21 Programme via Spothole |
| Multi-Programm-Erkennung | GPS/Koordinaten → "hier gelten: ..." |
| Logging | Log-Formular + ADIF-Export |
| Auth | Kein Login nötig (anonym nutzbar) |

**Abnahmekriterien:**
- [ ] Karte lädt mit 5 Referenz-Layern
- [ ] 200.000+ Referenzen performant (Clustering)
- [ ] Spots von 21 Programmen auf Karte sichtbar
- [ ] Standort → Multi-Programm-Liste korrekt
- [ ] QSO-Logging → ADIF-Export funktioniert
- [ ] Mobile-responsive, PWA installierbar
- [ ] Alle 30+ Programme in Enzyklopädie beschrieben

### Phase 2 — Erweiterte Daten + Upload

| Komponente | Umfang |
|------------|--------|
| Karte — Referenzen | +WWFF, WCA/COTA, TOTA, HEMA, WLOTA, ZLOTA, WOTA |
| Log-Upload | SOTA, POTA, GMA direkt |
| User-Accounts | Login, Credentials speichern |
| Offline | Kartenausschnitt + Referenzen cachebar |

### Phase 3 — Vollständigkeit

| Komponente | Umfang |
|------------|--------|
| Karte — Referenzen | Alle Tier-3-Programme |
| Log-Upload | WWBOTA, TOTA, ZLOTA |
| Aktivierungs-Planer | Bereich/Route → Referenzen |
| ADIF Import | Bestehende Logs importieren |

### Phase 4 — Community & Polish

| Komponente | Umfang |
|------------|--------|
| Events | JOTA/KOTA/YOTA/CHOTA temporäre Overlays |
| Self-Spotting | Multi-Programm Self-Spot |
| Social | Aktivierungs-Feed, Leaderboards |
| Push | Benachrichtigungen für Watchlists |
| Statistiken | Persönliche Stats pro Programm |
| LoTW/eQSL/QRZ | Bonus-Export-Targets |

---

## 9. Risiken & Mitigationen

| Risiko | Auswirkung | Mitigation |
|--------|-----------|------------|
| Spothole-API fällt aus oder ändert sich | Keine Spots | Fallback: direkte SOTA/POTA/WWBOTA APIs |
| Rate-Limiting bei SOTA/POTA APIs | Referenz-Import gebremst | Caching, nächtlicher Batch-Import, respektvolle Intervalle |
| Programme ohne API (BOTA, WCA, ILLW) | Keine Referenz-Daten | Statischer Import, Community-Pflege, Kooperation |
| 200.000+ Referenzen = Performance-Problem | Karte ruckelt | Vektor-Tiles (PMTiles), Clustering, Lazy Loading |
| API-Nutzungsbedingungen unklar | Rechtliches Risiko | Vor Launch: jeden Programm-Betreiber kontaktieren |
| Unterschiedliche Auth-Methoden (Cognito, Session, etc.) | Log-Upload komplex | Phase 2+, Auth-Proxy im Backend |
| Datenaktualität (IOTA JSON, WCA Excel) | Veraltete Referenzen | Cron-Job: wöchentlich/monatlich aktualisieren |
| Offline-Nutzung + große Datenmengen | Speicherverbrauch auf Smartphone | Regionales Caching (nur gewählter Ausschnitt) |
| Keine Koordinaten bei manchen Programmen | Leere Overlays | Geocoding, Community-Beiträge, schrittweise Ergänzung |
| Programm-Betreiber sehen App als Konkurrenz | Kooperations-Verweigerung | Klar kommunizieren: Ergänzung, nicht Ersatz; Link zu offiziellen Seiten |

---

## 10. Erfolgsmetriken

| Metrik | Ziel (6 Monate nach Launch) |
|--------|----------------------------|
| Programme mit Referenz-Overlays | ≥ 15 |
| Referenzen in Datenbank | ≥ 300.000 |
| Monatliche Besucher | ≥ 5.000 |
| QSOs geloggt | ≥ 10.000 |
| ADIF-Exports generiert | ≥ 1.000 |
| Direkte Log-Uploads (SOTA/POTA/GMA) | ≥ 500 |
| PWA-Installationen | ≥ 500 |

---

## 11. Offene Fragen

| # | Frage | Entscheidung nötig bis |
|---|-------|----------------------|
| 1 | ~~Hosting~~ → **Entschieden: Docker (nginx:alpine) auf Synology NAS oder host-node-01** | ✅ |
| 2 | Frontend-Framework: SvelteKit (static adapter) oder Astro? | Phase 1 Start |
| 3 | ~~Backend~~ → **Entfällt.** Kein Backend-Server. Alles statisch + Client-seitig | ✅ |
| 4 | Welcher Host: Synology NAS oder host-node-01 (Ubuntu 24.04)? | Phase 1 Start |
| 5 | API-Nutzungsbedingungen: POTA, SOTA, Spothole Betreiber kontaktieren? | Vor Phase 1 Launch |
| 6 | Lizenz: Open Source (MIT/GPL) oder proprietär? | Phase 1 Start |
| 7 | Monetarisierung: Kostenlos? Freemium? Spenden? | Vor Phase 2 |
| 8 | Wie eng mit oeradio.at verknüpft? Eigenständiges Projekt oder Sub-Seite? | Phase 1 Start |
| 9 | PMTiles-Größe: Wie groß werden 500K+ Referenzen? Passt in CDN-Gratis-Tier? | Phase 1 Prototyp |
| 10 | Cloudflare Worker als CORS-Proxy für APIs ohne CORS (z.B. POTA Upload)? | Phase 2 |

---

## Anhang A — Referenz-Dokumente

- [RESEARCH.md](./RESEARCH.md) — Vollständige Recherche mit allen Programmen, APIs, Competitive Analysis
- [SOTA API Docs](https://api2.sota.org.uk/docs/index.html)
- [POTA API Docs](https://docs.pota.app/api/index.html)
- [Spothole API](https://spothole.app/about)
- [IOTA JSON Downloads](https://iota-world.org/islands-on-the-air/downloads.html)
- [GMA Referenzkarte](https://www.cqgma.org/gmamap/)
- [WWBOTA API](https://wwbota.net)
- [TOTA Referenz-DB](https://wwtota.com)
- [ARLHS World List of Lights](https://wlol.arlhs.com)
- [WCA Castle List](https://wcagroup.org/?page_id=207)
