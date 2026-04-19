export interface ImprintContent {
  title: string;
  infoLabel: string;
  providerLabel: string;
  providerName: string;
  addressLines: string[];
  emailLabel: string;
  email: string;
  webLabel: string;
  web: string;
  webUrl: string;
  directionTitle: string;
  directionText: string;
  liabilityTitle: string;
  liabilityText: string;
  copyrightTitle: string;
  copyrightText: string;
  linksTitle: string;
  linksText: string;
}

export const impressum: Record<string, ImprintContent> = {
  de: {
    title: 'Impressum',
    infoLabel: 'Information gem. § 5 ECG und Offenlegung gem. § 25 MedG',
    providerLabel: 'Diensteanbieter',
    providerName: 'Michael Linder',
    addressLines: ['Nötsch 219', '9611 Nötsch im Gailtal'],
    emailLabel: 'E-Mail',
    email: 'kontakt@oeradio.at',
    webLabel: 'Web',
    web: 'oeradio.at',
    webUrl: 'https://oeradio.at',
    directionTitle: 'Grundlegende Richtung',
    directionText:
      'xOTA Map ist ein Community-Tool von oeradio.at — einem unabhängigen Informationsmedium für Funkamateure und am Amateurfunk Interessierte.',
    liabilityTitle: 'Haftungsausschluss',
    liabilityText:
      'Sämtliche Texte auf der Website werden sorgfältig geprüft. Dessenungeachtet kann keine Garantie für die Richtigkeit, Vollständigkeit und Aktualität der Angaben übernommen werden.',
    copyrightTitle: 'Urheberrecht',
    copyrightText:
      'Sämtliche Texte, Grafiken und Bilder sind urheberrechtlich geschützt, eine Verwendung ist nur mit ausdrücklicher Genehmigung des Erstellers zulässig. Bei Fragen zum Urheberrecht wenden Sie sich bitte an kontakt@oeradio.at.',
    linksTitle: 'Links',
    linksText:
      'Links auf diese Website sind erwünscht. Der Herausgeber identifiziert sich nicht mit dem Inhalt der Seiten, auf die gelinkt wird, und übernimmt dafür keine Haftung.',
  },
  en: {
    title: 'Legal Notice',
    infoLabel: 'Information pursuant to § 5 ECG and disclosure pursuant to § 25 MedG',
    providerLabel: 'Service Provider',
    providerName: 'Michael Linder',
    addressLines: ['Nötsch 219', '9611 Nötsch im Gailtal', 'Austria'],
    emailLabel: 'Email',
    email: 'kontakt@oeradio.at',
    webLabel: 'Web',
    web: 'oeradio.at',
    webUrl: 'https://oeradio.at',
    directionTitle: 'Editorial Direction',
    directionText:
      'xOTA Map is a community tool by oeradio.at — an independent information platform for amateur radio operators and those interested in amateur radio.',
    liabilityTitle: 'Liability Disclaimer',
    liabilityText:
      'All texts on this website are carefully reviewed. Nevertheless, no guarantee can be given for the accuracy, completeness and timeliness of the information.',
    copyrightTitle: 'Copyright',
    copyrightText:
      'All texts, graphics and images are protected by copyright. Use is only permitted with the express permission of the creator. For copyright questions, please contact kontakt@oeradio.at.',
    linksTitle: 'Links',
    linksText:
      'Links to this website are welcome. The publisher does not identify with the content of linked pages and assumes no liability for them.',
  },
  it: {
    title: 'Note legali',
    infoLabel: 'Informazioni ai sensi del § 5 ECG e divulgazione ai sensi del § 25 MedG',
    providerLabel: 'Fornitore del servizio',
    providerName: 'Michael Linder',
    addressLines: ['Nötsch 219', '9611 Nötsch im Gailtal', 'Austria'],
    emailLabel: 'E-mail',
    email: 'kontakt@oeradio.at',
    webLabel: 'Web',
    web: 'oeradio.at',
    webUrl: 'https://oeradio.at',
    directionTitle: 'Orientamento editoriale',
    directionText:
      'xOTA Map è uno strumento comunitario di oeradio.at — una piattaforma informativa indipendente per radioamatori e interessati alla radio amatoriale.',
    liabilityTitle: 'Esclusione di responsabilità',
    liabilityText:
      'Tutti i testi su questo sito web sono attentamente verificati. Tuttavia, non è possibile garantire la correttezza, la completezza e l\'attualità delle informazioni.',
    copyrightTitle: 'Diritto d\'autore',
    copyrightText:
      'Tutti i testi, la grafica e le immagini sono protetti dal diritto d\'autore. L\'uso è consentito solo con l\'espresso consenso del creatore. Per domande sul diritto d\'autore, contattare kontakt@oeradio.at.',
    linksTitle: 'Link',
    linksText:
      'I link a questo sito web sono benvenuti. L\'editore non si identifica con il contenuto delle pagine collegate e non si assume alcuna responsabilità per esse.',
  },
  sl: {
    title: 'Impressum',
    infoLabel: 'Informacije v skladu s § 5 ECG in razkritje v skladu s § 25 MedG',
    providerLabel: 'Ponudnik storitev',
    providerName: 'Michael Linder',
    addressLines: ['Nötsch 219', '9611 Nötsch im Gailtal', 'Avstrija'],
    emailLabel: 'E-pošta',
    email: 'kontakt@oeradio.at',
    webLabel: 'Splet',
    web: 'oeradio.at',
    webUrl: 'https://oeradio.at',
    directionTitle: 'Osnovna usmeritev',
    directionText:
      'xOTA Map je skupnostno orodje oeradio.at — neodvisne informacijske platforme za radioamaterje in zainteresirane za radioamaterstvo.',
    liabilityTitle: 'Omejitev odgovornosti',
    liabilityText:
      'Vsa besedila na tej spletni strani so skrbno preverjena. Kljub temu ni mogoče jamčiti za točnost, popolnost in aktualnost informacij.',
    copyrightTitle: 'Avtorske pravice',
    copyrightText:
      'Vsa besedila, grafika in slike so zaščiteni z avtorskimi pravicami. Uporaba je dovoljena samo z izrecnim dovoljenjem ustvarjalca. Za vprašanja o avtorskih pravicah se obrnite na kontakt@oeradio.at.',
    linksTitle: 'Povezave',
    linksText:
      'Povezave na to spletno stran so dobrodošle. Izdajatelj se ne identificira z vsebino povezanih strani in zanje ne prevzema nobene odgovornosti.',
  },
};
