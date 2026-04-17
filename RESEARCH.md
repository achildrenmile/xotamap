# xOTA Map – Research & Requirements Basis

**Stand: 2026-04-17**
**Ziel:** Web-App die alle Outdoor-Amateurfunk-Programme (xOTA) vereint — beschreiben, spotten, auf Karte darstellen, zentral loggen.

---

## 1. Identifizierte xOTA-Programme

### Tier 1 – Große Programme (aktive APIs, große Community)

| Programm | Vollname | Fokus | Referenzen | Website | API |
|----------|----------|-------|------------|---------|-----|
| **SOTA** | Summits On The Air | Berggipfel (zu Fuß) | ~100.000+ Gipfel weltweit | sota.org.uk | ✅ `api2.sota.org.uk` – Spots, Summits, GeoJSON, Aktivierungen |
| **POTA** | Parks On The Air | Nationalparks, Naturschutzgebiete | ~50.000+ Parks weltweit | pota.app | ✅ `api.pota.app` – Spots, Parks, Statistiken, Log-Upload |
| **WWFF** | World Wide Flora & Fauna | Naturschutzgebiete, FFH-Gebiete | 40.700+ Referenzen, 172 Länder | wwff.co | ⚠️ Logsearch-DB, Spots über GMA-Cluster |
| **GMA** | Global Mountain Activity | Alle Berge (auch unter SOTA-Kriterien) | Umfassend, inkl. anderer Programme | cqgma.org | ✅ Spots-API, Referenz-Karte, GeoJSON-Export |
| **IOTA** | Islands On The Air | Inselgruppen | 1.200+ Gruppen | iota-world.org | ✅ JSON-Downloads (Gruppen, Inseln, DXCC-Zuordnung) |

### Tier 2 – Mittlere Programme (Datenbanken vorhanden, APIs teilweise)

| Programm | Vollname | Fokus | Referenzen | Website | API/Daten |
|----------|----------|-------|------------|---------|-----------|
| **WCA/COTA** | World Castles Award / Castles On The Air | Burgen, Schlösser, Ruinen | Tausende weltweit | wcagroup.org / cotagroup.org | ⚠️ Excel-Download (WCALIST ~15MB) |
| **WWBOTA** | Worldwide Bunkers On The Air | Bunker, Militäranlagen | 23+ Länder (OEBOTA, DLBOTA, etc.) | wwbota.net | ✅ API + Spots (SSE-basiert) |
| **BOTA** | Beaches On The Air | Strände | 30.000+ Strände | beachesontheair.com | ❌ Nur Web-UI, kein bekanntes API |
| **HEMA** | HuMPs Excluding Marilyns Award | Gipfel 100-149m Prominenz | UK + 19 DXCC-Entitäten | hema.org.uk | ⚠️ GPS-Waypoints downloadbar |
| **WLOTA** | World Lighthouse On The Air | Leuchttürme weltweit | ARLHS World List (laufend aktualisiert) | wlota.com / arlhs.com | ⚠️ WLOL-Datenbank (wlol.arlhs.com) |
| **ILLW** | Int'l Lighthouse Lightship Weekend | Leuchttürme (Event, 3. Aug-Wochenende) | 500+ pro Event, 95 Länder | illw.net | ⚠️ Download-Listen |
| **TOTA/WWTOTA** | Towers On The Air | Aussichtstürme, Türme | CZ/DE/OE/SK/PL (expandierend → NL, PR, DR) | wwtota.com | ✅ Referenz-DB + Karte (OKR/OMR/DLR/OER/SPR) |
| **LLOTA** | Lagos y Lagunas On The Air | Seen, Lagunen, Stauseen | Chile (expandierend), 200m Radius | — | ⚠️ Referenz-DB mit GPS-Koordinaten |
| **COTA-OE** | Castles On The Air Österreich | Burgen & Festungen in OE | AFCH/ÖVSV Referenzliste | afch.at/cota | ⚠️ Referenzliste |

### Tier 3 – Kleinere/Regionale Programme

| Programm | Vollname | Fokus | Region | Website | API/Daten |
|----------|----------|-------|--------|---------|-----------|
| **WOTA** | Wainwrights On The Air | 214(+330) Wainwright-Gipfel | UK Lake District | wota.org.uk | ⚠️ GitHub-Daten, Spothole-Support |
| **SiOTA** | Silos On The Air | Getreidesilos | Australien (700+ Silos) | silosontheair.com | Spots via ParksnPeaks |
| **MOTA** | Mills On The Air / Mühlentag OTA | Mühlen | DE/International | cqgma.org/muehlentag/ | Via GMA |
| **ECA** | English Castles Awards | Burgen | England | — | Spots via GMA |
| **ELA** | English Lighthouses Awards | Leuchttürme | England | — | Spots via GMA |
| **ZLOTA** | ZL On The Air | Diverse Referenzen (Distrikte/Regionen) | Neuseeland | ontheair.nz | ✅ Eigene API |
| **ROTA** | Railways On The Air | Eisenbahnen | UK/International | — | ⚠️ Jährlich aktualisiert |
| **YOTA** | Youngsters On The Air | Jugend (<26) | International | ham-yota.com | ❌ Event-basiert |
| **DLFF** | Deutscher Flora-Fauna Award | DE Naturschutzgebiete | Deutschland | — | Via WWFF |
| **KRMNPA** | Keith Roget Memorial Nat'l Parks Award | Nationalparks | VK (Australien) | — | Via ParksnPeaks |
| **HOTA** | Heritage On The Air | Historische Stätten | Südafrika (expandierend) | heritageontheair.co.za | ⚠️ Referenz-DB |
| **HOTA-UK** | Houses On The Air | Wohnhäuser mit fester Adresse | UK/International | hota.org.uk | ⚠️ Referenz-DB |
| **CHOTA** | Churches & Chapels On The Air | Kirchen, Kapellen (Event, September) | UK/International | wacral.org | ❌ Event-basiert |
| **WAB** | Worked All Britain | Britische Kartenquadrate | UK | — | ⚠️ Via Spothole |
| **WAI** | Worked All Ireland | Irische Kartenquadrate | Irland | — | ⚠️ Via Spothole |

### Tier 4 – Event-basierte & Scouting-Programme

| Programm | Vollname | Fokus | Zeitraum | Website |
|----------|----------|-------|----------|---------|
| **JOTA** | Jamboree On The Air | Pfadfinder-Funk | 3. Oktober-Wochenende | jotajoti.info |
| **KOTA** | Kids On The Air | Kinder 10-15 | Camps (CZ, expandierend) | — |
| **GOTA** | Get On The Air | Newcomer-Station bei Field Day | Juni (Field Day) | arrl.org |

### WWFF Nationale Sub-Programme

WWFF hat pro Land eigene Referenzen. Wichtigste:

| Kürzel | Land | Beispiel |
|--------|------|---------|
| OEFF | Österreich | OEFF-0001 |
| DLFF | Deutschland | DLFF-0001 |
| VKFF | Australien | VKFF-0001 |
| JAFF | Japan | JAFF-0001 |
| F/FF | Frankreich | FFF-0001 |
| ON/FF | Belgien | ONFF-0001 |
| ... | 172 Länder insgesamt | — |

### WWBOTA Nationale Sub-Programme

| Kürzel | Land |
|--------|------|
| OEBOTA | Österreich |
| DLBOTA | Deutschland |
| UKBOTA | UK |
| USBOTA | USA |
| CABOTA | Kanada |
| SPBOTA | Polen |
| S5BOTA | Slowenien |
| ITABOTA | Italien |
| 9ABOTA | Kroatien |
| ... | 23+ Länder |

### Gesamtübersicht: 30+ Programme identifiziert

```
Tier 1 (API ✅):     SOTA, POTA, GMA, IOTA, WWBOTA
Tier 2 (Daten ⚠️):  WWFF, WCA/COTA, HEMA, WLOTA, ILLW, TOTA, BOTA, LLOTA, COTA-OE
Tier 3 (Regional):   WOTA, SiOTA, MOTA, ECA, ELA, ZLOTA, ROTA, DLFF, KRMNPA, HOTA, HOTA-UK, WAB, WAI
Tier 4 (Events):     JOTA, KOTA, YOTA, GOTA, CHOTA
```

---

## 2. Bestehende API-Endpunkte (technische Details)

### SOTA API (`api2.sota.org.uk`)
```
GET /api/spots/{filter}           # Aktuelle Spots (24h)
GET /api/summits/{lat},{lon},{range}  # Gipfel im Radius (GeoJSON-fähig)
GET /api/activator/{callsign}     # Aktivator-Tracks (GeoJSON)
GET /api/associations              # Alle Verbände
```
- Dokumentation: `api2.sota.org.uk/docs/index.html`
- Daten: Koordinaten, Punkte, Höhe, Name pro Gipfel

### POTA API (`api.pota.app`)
```
GET /spot/activator               # Aktuelle Aktivator-Spots
GET /park/{reference}             # Park-Details
GET /park/activations/{reference} # Aktivierungshistorie
GET /location/parks/{location}    # Parks in Region
GET /programs/locations/          # Alle Locations
GET /stats/user/{callsign}       # User-Statistiken
POST /spot/                       # Spot posten
```
- Log-Upload: ADIF via Web-UI oder Cognito-Auth-API
- Keine offizielle API-Doku, aber reverse-engineered und gut dokumentiert

### GMA API (`cqgma.org`)
```
GET /api/spots/wwff/              # WWFF Spots
```
- Referenz-Karte mit GeoJSON/JPG-Export
- Aggregiert Spots von: SOTA, WWFF, POTA, COTA, HEMA, ECA, ELA, MOTA, SiOTA

### IOTA Daten (`iota-world.org`)
```
Downloads (JSON):
- Alle IOTA-Gruppen, Untergruppen und Inseln
- IOTA-Gruppen separat
- IOTA-Inseln separat
- DXCC↔IOTA Zuordnung
- Dokumentation: IOTA_JSON_structure.pdf
```
- Kein API-Key mehr erforderlich

### WWBOTA API (`wwbota.net`)
- Server-Sent Events (SSE) für Echtzeit-Spots
- Initial: letzte 60 Min Spots, dann Push

### ParksnPeaks API (`parksnpeaks.org/api/`)
- Aggregator für VK/ZL: POTA, SOTA, WWFF, HEMA, SiOTA, BOTA
- JSON/RSS Spots + POST-Fähigkeit

### WWFF
- Spots über GMA-Cluster (`cqgma.org/api/spots/wwff/`)
- Logsearch-DB: 24M+ QSOs, kein öffentliches API
- Log-Upload via nationale Koordinatoren (ADIF)

---

## 3. Bestehende Lösungen (Competitive Analysis)

| App/Service | Was | Stärken | Schwächen |
|-------------|-----|---------|-----------|
| **Ham2K PoLo** | Mobile Logger | 10+ Programme, Multi-Aktivierung, ADIF-Export | Nur Logging, keine Map-Overlays |
| **FieldSpotter** | Web-Spotmap | POTA+SOTA+WWFF Spots auf Karte, Filter | Nur 3 Programme, kein Logging |
| **xota.radio** | Web-Plattform (Beta) | Spots, Alerts, Cross-Device | Nur POTA+SOTA, noch früh |
| **SOTAmaps** | SOTA-Karte | Detaillierte SOTA-Daten | Nur SOTA |
| **POTA Map** | POTA-Karte | Offizielle POTA-Daten | Nur POTA |
| **GMA Map** | Multi-Programm-Karte | GMA+SOTA+WWFF+COTA Referenzen | Kein Logging, UI veraltet |
| **ParksnPeaks** | VK/ZL Aggregator | Multi-Programm Spots | Nur VK/ZL Fokus |
| **pota-gb-map** | UK Multi-Overlay Map | POTA+SOTA+WWBOTA Overlays | Nur UK |
| **Spothole** | Spot-Aggregator + API | 21 Programme! POTA/SOTA/WWFF/GMA/WWBOTA/HEMA/WOTA/LLOTA/TOTA/ZLOTA/WAB/WAI + DX Cluster + RBN | Keine eigenen Referenz-Overlays, primär Spots |
| **APSPOT** | APRS Self-Spotting | Multi-Programm via APRS | Nur Spotting |

### Kritische Analyse: Spothole hat bereits Karte + 21 Programme

Spothole bietet:
- ✅ Karte mit Spots aus 21 Programmen
- ✅ Filter nach Programm, Band, Mode, Kontinent
- ✅ Overlays (Greyline, Maidenhead, CQ/ITU Zones)
- ✅ Offene JSON-API
- ✅ Kostenlos, Open Source

Spothole bietet NICHT:
- ❌ **Referenz-Overlays** (zeigt nur aktive Spots, NICHT alle 100.000+ SOTA-Gipfel, 50.000+ POTA-Parks etc.)
- ❌ **Programm-Enzyklopädie** (keine Beschreibungen, Regeln, Awards, Vergleiche)
- ❌ **Logging** (kein QSO-Logging)
- ❌ **Log-Upload** (kein "Log Once, Upload Everywhere")
- ❌ **Referenz-Suche** ("welche Referenzen gibt es in meiner Nähe?")
- ❌ **Multi-Programm-Erkennung** ("dieser Standort ist gleichzeitig SOTA + WWFF + POTA")
- ❌ **Offline-Modus** (kein PWA, keine gecachten Daten)
- ❌ **Aktivierungs-Planung** ("wo kann ich morgen wandern und 3 Programme gleichzeitig aktivieren?")

### USP (Unique Selling Proposition)

**xOTA Map ist NICHT ein weiterer Spot-Viewer. xOTA Map ist die Referenz-Datenbank + Planungstool + Logger.**

| Feature | Spothole | FieldSpotter | Ham2K PoLo | **xOTA Map** |
|---------|----------|--------------|------------|-------------|
| Echtzeit-Spots | ✅ 21 Prog. | ✅ 3 Prog. | ❌ | ✅ (via Spothole) |
| Referenz-Overlays (alle Standorte) | ❌ | ❌ | ❌ | **✅ USP #1** |
| Multi-Programm-Erkennung pro Standort | ❌ | ❌ | ⚠️ teilw. | **✅ USP #2** |
| Programm-Enzyklopädie | ❌ | ❌ | ❌ | **✅ USP #3** |
| Aktivierungs-Planer | ❌ | ❌ | ❌ | **✅ USP #4** |
| QSO-Logging | ❌ | ❌ | ✅ | ✅ |
| Log Once, Upload Everywhere | ❌ | ❌ | ⚠️ ADIF | **✅ USP #5** |
| Offline-Modus | ❌ | ❌ | ✅ | ✅ |

**Elevator Pitch:**
> "Spothole zeigt dir wer JETZT funkt. xOTA Map zeigt dir WO du funken KANNST — alle 30+ Programme auf einer Karte, mit Planung, Logging und zentralem Upload."

**Kern-USPs:**
1. **Referenz-Atlas:** Alle Referenzen aller Programme als schaltbare Overlays auf einer Karte — auch wenn gerade niemand aktiv ist
2. **Multi-Programm-Erkennung:** "Du stehst auf einem SOTA-Gipfel, in einem POTA-Park, in einer WWFF-Zone, neben einer COTA-Burg — ein QSO zählt für alle 4"
3. **Aktivierungs-Planer:** Route planen, Referenzen entlang der Route finden, maximale Programm-Abdeckung
4. **Log Once, Upload Everywhere:** Ein QSO loggen → automatisch an SOTA + POTA + WWFF + GMA + ...
5. **Enzyklopädie:** Endlich ein Ort, der alle Programme erklärt und vergleicht

---

## 4. Feature-Anforderungen (Basis)

### 4.1 Programm-Enzyklopädie
- Beschreibung jedes xOTA-Programms
- Regeln & Anforderungen (min. QSOs, Equipment, etc.)
- Punkte-Systeme
- Awards/Diplome
- Links zu offiziellen Seiten

### 4.2 Spotting
- Echtzeit-Spot-Aggregation aller Programme
- Unified Spot-Anzeige (Callsign, Referenz, Frequenz, Mode, Alter)
- Filter: Programm, Band, Mode, Entfernung, Alter
- Self-Spotting an multiple Dienste gleichzeitig
- Push-Benachrichtigungen (optional)

### 4.3 Karte mit Overlays
- **Basiskarte:** OpenStreetMap/MapLibre (FOSS, keine API-Kosten)
- **Schaltbare Overlay-Layer pro Programm:**
  - SOTA-Gipfel (Punkte farbcodiert)
  - POTA-Parks (Flächen/Punkte)
  - WWFF-Gebiete
  - IOTA-Inseln
  - COTA/WCA-Burgen
  - WWBOTA-Bunker
  - BOTA-Strände
  - HEMA-Gipfel
  - Leuchttürme (ILLW/LOTA)
  - GMA-Berge
  - Weitere
- **Aktive Spots** als Echtzeit-Marker
- **Greyline/Terminator** Overlay
- **Maidenhead Grid** Overlay
- Cluster-Darstellung bei vielen Referenzen
- Offline-Fähigkeit für Feldgebrauch

### 4.4 Zentrales Logging ("Log Once, Upload Everywhere")
- ADIF-basiertes Logging
- Automatische Erkennung zutreffender Programme anhand Koordinaten
- Ein QSO → automatisch getaggt für alle relevanten Programme
- Upload-Targets:
  - SOTA (via API)
  - POTA (via API/ADIF)
  - WWFF (ADIF-Export für Koordinator)
  - GMA (via API)
  - IOTA (Club Log?)
  - WWBOTA (via API)
  - LoTW, eQSL, QRZ (Bonus)
- ADIF-Export für Programme ohne API

---

## 5. Technische Machbarkeit

### Datenquellen-Status

| Programm | Referenz-Daten | Koordinaten | Spots-API | Log-Upload-API |
|----------|---------------|-------------|-----------|----------------|
| SOTA | ✅ API | ✅ lat/lon | ✅ JSON | ✅ API |
| POTA | ✅ API | ✅ lat/lon | ✅ JSON | ✅ API (Auth) |
| WWFF | ⚠️ Via GMA | ⚠️ Via GMA | ✅ Via GMA | ❌ ADIF an Koordinator |
| GMA | ✅ API/Map | ✅ lat/lon | ✅ JSON | ✅ CSV-Import |
| IOTA | ✅ JSON Download | ⚠️ Gruppenebene | ❌ | ❌ Club Log |
| WCA/COTA | ⚠️ Excel Download | ⚠️ Teilweise | ❌ | ❌ |
| WWBOTA | ✅ API | ✅ lat/lon | ✅ SSE | ⚠️ |
| BOTA | ❌ Nur Web | ⚠️ | ✅ Via Spothole | ❌ Web-UI |
| TOTA/WWTOTA | ✅ Referenz-DB | ✅ lat/lon | ✅ Via Spothole | ✅ wwtota.com Login |
| LLOTA | ✅ Referenz-DB | ✅ GPS | ✅ Via Spothole | ⚠️ |
| WLOTA | ✅ WLOL-DB | ⚠️ Teilweise | ❌ | ❌ |
| ILLW | ⚠️ Download-Listen | ⚠️ Teilweise | ❌ | ❌ |
| WOTA | ⚠️ GitHub | ✅ lat/lon | ✅ Via Spothole | ❌ |
| SiOTA | ⚠️ ParksnPeaks | ✅ | ✅ Via ParksnPeaks | ❌ |
| ZLOTA | ✅ API | ✅ lat/lon | ✅ Via Spothole | ✅ ontheair.nz |
| COTA-OE | ⚠️ Referenzliste | ⚠️ | ❌ | ❌ ADIF per Mail |
| CHOTA | ❌ Event-Liste | ⚠️ | ❌ | ❌ |
| HOTA | ⚠️ Referenz-DB | ⚠️ | ❌ | ❌ |
| HEMA | ⚠️ Waypoints | ✅ GPS | ❌ | ❌ |
| ILLW/LOTA | ⚠️ Listen | ⚠️ Teilweise | ❌ | ❌ |
| WOTA | ⚠️ GitHub | ✅ | ❌ | ❌ |
| SiOTA | ⚠️ ParksnPeaks | ✅ | Via ParksnPeaks | ❌ |

### Schlüssel-Erkenntnis: Spothole als Daten-Backbone

**Spothole** (spothole.app) ist ein Open-Source Spot-Aggregator mit offener JSON-API, der bereits 21 Programme aggregiert. Statt jede API einzeln anzubinden:

**Strategie:** Spothole-API als primäre Spot-Quelle nutzen + direkte APIs nur für Referenz-Daten und Log-Upload.

```
Spots:       Spothole JSON API → alle 21 Programme auf einmal
Referenzen:  SOTA API + POTA API + GMA + IOTA JSON + WWBOTA API + TOTA DB (direkt)
             + WCA Excel + HEMA Waypoints + WLOTA/ARLHS DB (Import)
Log-Upload:  Direkt an SOTA/POTA/GMA/WWBOTA/TOTA APIs + ADIF-Export für Rest
```

### Risiken & Herausforderungen

1. **Kein einheitliches API-Format** – Jedes Programm hat eigene Strukturen
2. **Rate Limiting** – POTA und SOTA APIs haben undokumentierte Limits
3. **Fehlende APIs** – BOTA, ILLW, WCA haben keine programmatischen Schnittstellen
4. **Datenaktualität** – Statische Downloads (IOTA, WCA) müssen periodisch aktualisiert werden
5. **Authentifizierung** – POTA-Log-Upload braucht Cognito Auth, SOTA braucht Session
6. **Referenz-Überlappungen** – Ein Ort kann SOTA + POTA + WWFF + GMA gleichzeitig sein
7. **Datenmenge** – 100.000+ SOTA + 50.000+ POTA + 40.000+ WWFF = massive Datenbank
8. **Offline** – Outdoor-Nutzung braucht offline-fähige Karte und Logging
9. **Rechtliches** – API-Nutzungsbedingungen jedes Programms prüfen
10. **Wartung** – APIs können sich ändern, Referenzen werden aktualisiert

---

## 6. Empfohlener Tech-Stack

| Komponente | Empfehlung | Begründung |
|------------|------------|------------|
| **Frontend** | React/Next.js oder SvelteKit | PWA-fähig, offline-support |
| **Karte** | MapLibre GL JS + PMTiles | FOSS, schnell, Vektor-Tiles, offline-fähig |
| **Backend** | Node.js oder Python FastAPI | API-Aggregation, Caching, Auth-Proxy |
| **Datenbank** | PostgreSQL + PostGIS | Geo-Queries, Referenz-Speicherung |
| **Cache** | Redis | Spot-Caching, Rate-Limit-Buffer |
| **Hosting** | Vercel/Cloudflare Pages + Supabase | Oder self-hosted auf Synology |
| **Auth** | OAuth2 (eigene Accounts) | Für Log-Upload Credentials |

---

## 7. Rollout-Plan (Alle Programme, phasenweise)

**Ziel: Alle 30+ Programme abdecken.** Phasen nach Daten-Verfügbarkeit, nicht nach Priorität.

### Phase 1 – MVP (Sofort machbar: APIs + Spothole)

**Spots:** Spothole-API als Backbone → sofort 21 Programme mit Spots
**Referenz-Overlays auf Karte:**
- SOTA (api2.sota.org.uk – vollständige Koordinaten)
- POTA (api.pota.app – vollständige Koordinaten)
- GMA (cqgma.org – Koordinaten + GeoJSON)
- WWBOTA (wwbota.net API – Koordinaten)
- IOTA (JSON-Download – Gruppenebene)

**Info-Seiten:** Alle 30+ Programme beschrieben (Regeln, Links, Awards)
**Logging:** ADIF-Export + direkter Upload an SOTA/POTA/GMA

### Phase 2 – Erweiterte Referenz-Daten (Import nötig)

Referenz-Overlays hinzufügen:
- WWFF (via GMA-Daten oder WWFF-Map-Daten)
- WCA/COTA + COTA-OE (Excel-Import, Geocoding nötig)
- TOTA/WWTOTA (Referenz-DB, Koordinaten vorhanden)
- HEMA (GPS-Waypoints Import)
- WLOTA/ILLW (ARLHS WLOL-DB Import)
- ZLOTA (ontheair.nz API)
- WOTA (GitHub-Daten)

Log-Upload erweitern: WWBOTA, TOTA, ZLOTA

### Phase 3 – Regionale & Nischen-Programme

Referenz-Overlays:
- BOTA (30.000 Strände – Scraping oder Kooperation)
- SiOTA (ParksnPeaks-Daten)
- MOTA/ECA/ELA (GMA-Daten)
- LLOTA (Referenz-DB mit GPS)
- HOTA, HOTA-UK (Referenz-DBs)
- KRMNPA, SANPCPA (VK-Daten)
- WAB, WAI (Grid-basiert)
- ROTA (jährliche Listen)

### Phase 4 – Events & Community

- JOTA, KOTA, YOTA, GOTA, CHOTA (Event-Kalender + temporäre Overlays)
- User-Accounts mit Statistiken pro Programm
- "Log Once, Upload Everywhere" vollautomatisch
- Push-Benachrichtigungen
- Offline-Mode (Service Worker + cached Tiles)
- Social Features (Aktivierungs-Feed, Leaderboards)

---

## 8. Strategie: "Alle Programme" abdecken

### Drei Ebenen der Abdeckung

| Ebene | Was | Ab wann | Aufwand |
|-------|-----|---------|---------|
| **Info** | Programm-Beschreibung, Regeln, Links, Awards | Phase 1 (alle 30+) | Niedrig – redaktionell |
| **Spots** | Echtzeit-Spots auf Karte | Phase 1 (via Spothole: 21 Prog.) | Niedrig – API-Anbindung |
| **Referenz-Overlay** | Alle Referenzen als Punkte/Flächen auf Karte | Phase 1-3 (schrittweise) | Hoch – Datenimport pro Programm |
| **Log-Upload** | Direkt an Programm-Server | Phase 1-4 (schrittweise) | Mittel-Hoch – Auth pro Programm |

### Für Programme ohne API

| Strategie | Anwendbar auf |
|-----------|---------------|
| **Spothole als Proxy** | Spots für fast alle Programme |
| **Statischer Datenimport** | WCA (Excel), HEMA (Waypoints), IOTA (JSON) |
| **GMA als Aggregator** | WWFF, MOTA, ECA, ELA, SiOTA Referenzen |
| **ParksnPeaks als Proxy** | VK/ZL Programme (KRMNPA, SiOTA) |
| **Community-Pflege** | BOTA, HOTA, CHOTA – User reichen Referenzen ein |
| **Kooperation** | Programm-Betreiber direkt kontaktieren für Datenexport |

---

## 9. Fazit

**Ist es sinnvoll?** Absolut. 30+ Programme, kein Tool deckt alle ab. Funkamateure nutzen 5-10 verschiedene Websites/Apps parallel.

**Alle Programme möglich?** Ja, durch Drei-Ebenen-Strategie:
- **Info** → sofort für alle (redaktioneller Aufwand)
- **Spots** → sofort für 21 Programme (Spothole-API)
- **Referenz-Overlays** → schrittweise, je nach Datenverfügbarkeit
- **Log-Upload** → schrittweise, je nach API-Verfügbarkeit

**Killer-Feature:** Spothole-Integration liefert ab Tag 1 Spots für 21 Programme. Kein anderes Tool bietet das auf einer Karte.

**OE-Relevanz:** COTA-OE, OEFF (WWFF), OEBOTA, OER (TOTA) — Österreich hat in vielen Programmen eigene Referenzen. Perfekte Synergie mit oeradio.at.

---

## Quellen

- [SOTA](https://sota.org.uk) / [SOTAdata](https://sotadata.org.uk) / [SOTAmaps](https://sotamaps.org)
- [POTA](https://pota.app) / [POTA Docs](https://docs.pota.app) / [POTA API Docs](https://docs.pota.app/api/index.html)
- [WWFF](https://wwff.co)
- [GMA](https://cqgma.org)
- [IOTA](https://iota-world.org) / [IOTA Downloads](https://iota-world.org/islands-on-the-air/downloads.html)
- [WCA](https://wcagroup.org)
- [WWBOTA](https://wwbota.net)
- [BOTA](https://beachesontheair.com)
- [HEMA](http://hema.org.uk)
- [ILLW](https://illw.net) / [ARLHS](https://arlhs.com)
- [WOTA](https://wota.org.uk)
- [SiOTA](https://silosontheair.com)
- [ZLOTA](https://ontheair.nz)
- [Ham2K PoLo](https://polo.ham2k.com)
- [FieldSpotter](https://fieldspotter.radio)
- [xota.radio](https://docs.xota.radio)
- [ParksnPeaks](https://parksnpeaks.org)
- [Spothole](https://spothole.app) — **Schlüsselressource: 21 Programme, offene JSON-API**
- [TOTA/WWTOTA](https://wwtota.com) / [OKTOTA](https://oktota.eu)
- [LLOTA](https://www.outnaboot.ca/llota/)
- [HOTA Heritage](https://heritageontheair.co.za) / [HOTA Houses](https://hota.org.uk)
- [CHOTA](https://wacral.org)
- [COTA-OE](http://www.afch.at/cota/)
- [JOTA](https://jotajoti.info)
- [WLOTA/ARLHS](https://wlota.com) / [WLOL-DB](https://wlol.arlhs.com)
- [DARC E39 OTA-Übersicht](https://darc-e39.org/amateurfunk/ota-programme/)
- [pota-gb-map (GitHub)](https://github.com/kwirk/pota-gb-map)
