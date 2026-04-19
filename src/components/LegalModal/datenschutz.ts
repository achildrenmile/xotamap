export interface PrivacyContent {
  title: string;
  date: string;
  responsibleTitle: string;
  responsibleName: string;
  responsibleAddress: string[];
  responsibleEmail: string;
  responsibleImprintUrl: string;
  responsibleImprintLabel: string;
  intro: string;
  staticAppTitle: string;
  staticAppText: string;
  noDataTitle: string;
  noDataText: string;
  noDataItems: string[];
  localStorageTitle: string;
  localStorageText: string;
  externalApisTitle: string;
  externalApisText: string;
  externalApisItems: Array<{ name: string; description: string; url: string }>;
  hostingTitle: string;
  hostingText: string;
  rightsTitle: string;
  rightsText: string;
  contactTitle: string;
  contactText: string;
  contactEmail: string;
}

export const datenschutz: Record<string, PrivacyContent> = {
  de: {
    title: 'Datenschutzerklärung',
    date: 'Stand: April 2026',
    responsibleTitle: 'Verantwortlicher',
    responsibleName: 'Michael Linder',
    responsibleAddress: ['Nötsch 219', '9611 Nötsch im Gailtal'],
    responsibleEmail: 'kontakt@oeradio.at',
    responsibleImprintUrl: 'https://oeradio.at/impressum/',
    responsibleImprintLabel: 'Impressum',
    intro:
      'Der Schutz Ihrer persönlichen Daten ist uns wichtig. Im Folgenden informieren wir Sie über die Verarbeitung von Daten bei der Nutzung von xOTA Map.',
    staticAppTitle: 'Statische Webanwendung',
    staticAppText:
      'xOTA Map ist eine rein statische Webanwendung. Es gibt keinen eigenen Backend-Server, der personenbezogene Daten verarbeitet oder speichert.',
    noDataTitle: 'Keine Erhebung personenbezogener Daten',
    noDataText: 'Wir erheben und verarbeiten keine personenbezogenen Daten. Insbesondere:',
    noDataItems: [
      'Keine Cookies werden gesetzt',
      'Kein Tracking oder Web-Analyse',
      'Keine Weitergabe von Daten an unsere Server',
      'Keine Registrierung oder Anmeldung erforderlich',
    ],
    localStorageTitle: 'Lokale Datenspeicherung',
    localStorageText:
      'QSO-Logdaten, die Sie in der App eingeben, werden ausschließlich lokal in Ihrem Browser gespeichert (IndexedDB). Diese Daten verlassen Ihr Gerät nicht und werden nicht an Server übertragen. Sie können diese Daten jederzeit über die Browser-Einstellungen löschen.',
    externalApisTitle: 'Externe Dienste',
    externalApisText:
      'Für die Grundfunktionen der App werden folgende externe Dienste aufgerufen. Bitte beachten Sie deren Datenschutzerklärungen:',
    externalApisItems: [
      {
        name: 'Spothole',
        description: 'Lieferung von xOTA-Spots (Aktivierungsdaten)',
        url: 'https://spothole.org',
      },
      {
        name: 'OpenFreeMap',
        description: 'Kartenkacheln (über Proxy, keine direkte Verbindung Ihres Browsers)',
        url: 'https://openfreemap.org',
      },
    ],
    hostingTitle: 'Hosting',
    hostingText:
      'Diese Anwendung wird auf einem Server bereitgestellt, der über Cloudflare (Cloudflare, Inc.) erreichbar ist. Bei der Nutzung werden technisch notwendige Verbindungsdaten (IP-Adresse, Zeitpunkt des Zugriffs) vorübergehend verarbeitet. Wir setzen keine eigene Webanalyse ein.',
    rightsTitle: 'Rechte der betroffenen Personen',
    rightsText:
      'Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung und Datenübertragbarkeit. Bei Beschwerden können Sie sich an die Österreichische Datenschutzbehörde wenden (dsb.gv.at).',
    contactTitle: 'Kontakt',
    contactText:
      'Bei Fragen zum Datenschutz wenden Sie sich bitte an:',
    contactEmail: 'kontakt@oeradio.at',
  },
  en: {
    title: 'Privacy Policy',
    date: 'As of: April 2026',
    responsibleTitle: 'Data Controller',
    responsibleName: 'Michael Linder',
    responsibleAddress: ['Nötsch 219', '9611 Nötsch im Gailtal', 'Austria'],
    responsibleEmail: 'kontakt@oeradio.at',
    responsibleImprintUrl: 'https://oeradio.at/en/imprint/',
    responsibleImprintLabel: 'Legal Notice',
    intro:
      'Protecting your personal data is important to us. Below we inform you about the processing of data when using xOTA Map.',
    staticAppTitle: 'Static Web Application',
    staticAppText:
      'xOTA Map is a purely static web application. There is no dedicated backend server that processes or stores personal data.',
    noDataTitle: 'No Collection of Personal Data',
    noDataText: 'We do not collect or process any personal data. In particular:',
    noDataItems: [
      'No cookies are set',
      'No tracking or web analytics',
      'No transmission of data to our servers',
      'No registration or login required',
    ],
    localStorageTitle: 'Local Data Storage',
    localStorageText:
      'QSO log data that you enter in the app is stored exclusively locally in your browser (IndexedDB). This data does not leave your device and is not transmitted to any server. You can delete this data at any time through your browser settings.',
    externalApisTitle: 'External Services',
    externalApisText:
      'The following external services are used for core app functionality. Please refer to their respective privacy policies:',
    externalApisItems: [
      {
        name: 'Spothole',
        description: 'Provides xOTA spots (activation data)',
        url: 'https://spothole.org',
      },
      {
        name: 'OpenFreeMap',
        description: 'Map tiles (via proxy, no direct connection from your browser)',
        url: 'https://openfreemap.org',
      },
    ],
    hostingTitle: 'Hosting',
    hostingText:
      'This application is hosted on a server accessible through Cloudflare (Cloudflare, Inc.). When using the app, technically necessary connection data (IP address, access time) is temporarily processed. We do not use any web analytics.',
    rightsTitle: 'Your Rights',
    rightsText:
      'You have the right to access, rectification, erasure, restriction of processing, and data portability. For complaints, you may contact the Austrian Data Protection Authority (dsb.gv.at).',
    contactTitle: 'Contact',
    contactText: 'For questions about privacy, please contact:',
    contactEmail: 'kontakt@oeradio.at',
  },
  it: {
    title: 'Informativa sulla privacy',
    date: 'Stato: aprile 2026',
    responsibleTitle: 'Titolare del trattamento',
    responsibleName: 'Michael Linder',
    responsibleAddress: ['Nötsch 219', '9611 Nötsch im Gailtal', 'Austria'],
    responsibleEmail: 'kontakt@oeradio.at',
    responsibleImprintUrl: 'https://oeradio.at/it/impronta/',
    responsibleImprintLabel: 'Note legali',
    intro:
      'La protezione dei tuoi dati personali è importante per noi. Di seguito ti informiamo sul trattamento dei dati durante l\'utilizzo di xOTA Map.',
    staticAppTitle: 'Applicazione web statica',
    staticAppText:
      'xOTA Map è una pura applicazione web statica. Non esiste un server backend dedicato che elabora o memorizza dati personali.',
    noDataTitle: 'Nessuna raccolta di dati personali',
    noDataText: 'Non raccogliamo né elaboriamo dati personali. In particolare:',
    noDataItems: [
      'Nessun cookie viene impostato',
      'Nessun tracciamento o analisi web',
      'Nessuna trasmissione di dati ai nostri server',
      'Nessuna registrazione o accesso richiesto',
    ],
    localStorageTitle: 'Archiviazione dati locale',
    localStorageText:
      'I dati del registro QSO inseriti nell\'app vengono memorizzati esclusivamente in locale nel browser (IndexedDB). Questi dati non lasciano il dispositivo e non vengono trasmessi ad alcun server. Puoi eliminare questi dati in qualsiasi momento tramite le impostazioni del browser.',
    externalApisTitle: 'Servizi esterni',
    externalApisText:
      'I seguenti servizi esterni vengono utilizzati per le funzionalità principali dell\'app. Si prega di consultare le rispettive informative sulla privacy:',
    externalApisItems: [
      {
        name: 'Spothole',
        description: 'Fornisce spot xOTA (dati di attivazione)',
        url: 'https://spothole.org',
      },
      {
        name: 'OpenFreeMap',
        description: 'Tessere mappa (tramite proxy, nessuna connessione diretta dal browser)',
        url: 'https://openfreemap.org',
      },
    ],
    hostingTitle: 'Hosting',
    hostingText:
      'Questa applicazione è ospitata su un server accessibile tramite Cloudflare (Cloudflare, Inc.). Durante l\'utilizzo, i dati di connessione tecnicamente necessari (indirizzo IP, ora di accesso) vengono temporaneamente elaborati. Non utilizziamo alcuna analisi web.',
    rightsTitle: 'I tuoi diritti',
    rightsText:
      'Hai il diritto di accesso, rettifica, cancellazione, limitazione del trattamento e portabilità dei dati. Per reclami, puoi rivolgerti all\'Autorità austriaca per la protezione dei dati (dsb.gv.at).',
    contactTitle: 'Contatto',
    contactText: 'Per domande sulla privacy, contattare:',
    contactEmail: 'kontakt@oeradio.at',
  },
  sl: {
    title: 'Politika zasebnosti',
    date: 'Stanje: april 2026',
    responsibleTitle: 'Upravljavec podatkov',
    responsibleName: 'Michael Linder',
    responsibleAddress: ['Nötsch 219', '9611 Nötsch im Gailtal', 'Avstrija'],
    responsibleEmail: 'kontakt@oeradio.at',
    responsibleImprintUrl: 'https://oeradio.at/sl/impressum/',
    responsibleImprintLabel: 'Impressum',
    intro:
      'Varstvo vaših osebnih podatkov je za nas pomembno. Spodaj vas obveščamo o obdelavi podatkov pri uporabi xOTA Map.',
    staticAppTitle: 'Statična spletna aplikacija',
    staticAppText:
      'xOTA Map je čista statična spletna aplikacija. Ni namenskega zalednega strežnika, ki bi obdeloval ali shranjeval osebne podatke.',
    noDataTitle: 'Brez zbiranja osebnih podatkov',
    noDataText: 'Ne zbiramo in ne obdelujemo osebnih podatkov. Zlasti:',
    noDataItems: [
      'Piškotki niso nastavljeni',
      'Brez sledenja ali spletne analitike',
      'Brez prenosa podatkov na naše strežnike',
      'Registracija ali prijava ni potrebna',
    ],
    localStorageTitle: 'Lokalno shranjevanje podatkov',
    localStorageText:
      'Podatki dnevnika QSO, ki jih vnesete v aplikacijo, so shranjeni izključno lokalno v vašem brskalniku (IndexedDB). Ti podatki ne zapustijo vaše naprave in niso preneseni na noben strežnik. Te podatke lahko kadar koli izbrišete prek nastavitev brskalnika.',
    externalApisTitle: 'Zunanje storitve',
    externalApisText:
      'Za osnovne funkcije aplikacije se uporabljajo naslednje zunanje storitve. Prosimo, preberite njihove politike zasebnosti:',
    externalApisItems: [
      {
        name: 'Spothole',
        description: 'Zagotavlja xOTA spote (podatki o aktivacijah)',
        url: 'https://spothole.org',
      },
      {
        name: 'OpenFreeMap',
        description: 'Ploščice karte (prek proxyja, brez neposredne povezave iz brskalnika)',
        url: 'https://openfreemap.org',
      },
    ],
    hostingTitle: 'Gostovanje',
    hostingText:
      'Ta aplikacija gostuje na strežniku, dostopnem prek Cloudflare (Cloudflare, Inc.). Med uporabo se tehnično potrebni podatki o povezavi (IP-naslov, čas dostopa) začasno obdelajo. Ne uporabljamo spletne analitike.',
    rightsTitle: 'Vaše pravice',
    rightsText:
      'Imate pravico do dostopa, popravka, izbrisa, omejitve obdelave in prenosljivosti podatkov. Za pritožbe se lahko obrnete na avstrijski organ za varstvo podatkov (dsb.gv.at).',
    contactTitle: 'Kontakt',
    contactText: 'Za vprašanja o zasebnosti se obrnite na:',
    contactEmail: 'kontakt@oeradio.at',
  },
};
