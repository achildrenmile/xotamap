export type Language = 'de' | 'en' | 'it' | 'sl';

export interface Translations {
  // App
  appTitle: string;
  appSubtitle: string;
  footerText: string;

  // Navigation
  navMap: string;
  navEncyclopedia: string;
  navSpots: string;
  navLog: string;

  // Map
  mapLoading: string;
  layerSwitcher: string;
  showAllLayers: string;
  hideAllLayers: string;
  locateMe: string;
  basemap: string;
  basemapStandard: string;
  basemapOutdoor: string;
  basemapDark: string;
  locationError: string;
  locationDenied: string;

  // Encyclopedia
  encyclopediaTitle: string;
  programsFound: string;
  searchPrograms: string;
  showOnMap: string;
  rules: string;
  awards: string;
  gettingStarted: string;
  officialWebsite: string;
  comparePrograms: string;
  // Encyclopedia detail
  breadcrumbEncyclopedia: string;
  rulesTitle: string;
  awardsTitle: string;
  minQsos: string;
  activationRadius: string;
  equipment: string;
  operatingModes: string;
  specialRequirements: string;
  points: string;
  description: string;
  noMarkdown: string;
  logUpload: string;
  referenceSearch: string;
  spotPage: string;
  references: string;
  programNotFound: string;

  // Spots
  spotsTitle: string;
  noSpots: string;
  callsign: string;
  frequency: string;
  mode: string;
  reference: string;
  program: string;
  age: string;
  comment: string;
  lastUpdate: string;
  refreshIn: string;
  spotFilters: string;
  // Spot filters
  filterPrograms: string;
  filterBand: string;
  filterMode: string;
  filterMaxAge: string;
  allBands: string;
  allModes: string;
  allAges: string;
  maxAge5min: string;
  maxAge15min: string;
  maxAge30min: string;
  maxAge1h: string;
  activeFilters: string;
  // Spot table / age
  newSpot: string;
  justNow: string;
  minutesAgo: string;
  hoursAgo: string;
  // Spot popup
  viewOnQrz: string;
  spotsOnMap: string;

  // Log
  logTitle: string;
  newActivation: string;
  endActivation: string;
  startActivation: string;
  activeActivation: string;
  noActiveActivation: string;
  qsoCount: string;
  exportAdif: string;
  adifExportAll: string;
  adifExportByProgram: string;
  adifUploadHint: string;
  callsignRequired: string;
  localStorageWarning: string;
  wavelogHint: string;
  rstSent: string;
  rstReceived: string;
  logQso: string;
  notes: string;
  notesPlaceholder: string;
  addReference: string;
  noReferences: string;
  activationLocation: string;
  activationLocationPlaceholder: string;
  noQsos: string;
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  confirmDelete: string;
  yes: string;
  no: string;

  // Multi-Program
  whatCountsHere: string;
  programsAtLocation: string;
  noPrograms: string;
  nearestReferences: string;
  distance: string;
  coordinates: string;
  rightClickHint: string;
  searchingPrograms: string;
  flyToReference: string;
  enterCoordinates: string;
  useMyLocation: string;
  metersAway: string;
  elevation: string;
  // T32 — rules summary
  minQsosShort: string;
  activationRadiusShort: string;
  // T33 — nearby references
  nearestFor: string;
  noNearbyReferences: string;
  // T34 — location search
  searchLocation: string;
  searchLocationPlaceholder: string;
  searching: string;
  clearSearch: string;

  // Legal
  imprint: string;
  privacy: string;
  partOfTools: string;

  // Common
  loading: string;
  error: string;
  close: string;
  search: string;
  filter: string;
  clearFilters: string;
  noResults: string;
  viewDetails: string;
  back: string;

  // Popup
  popupProgramme: string;
  popupAltitude: string;
  popupPoints: string;
  popupOfficialPage: string;
  popupEncyclopedia: string;

  // Theme
  lightMode: string;
  darkMode: string;
  systemMode: string;

  // Language
  language: string;
}
