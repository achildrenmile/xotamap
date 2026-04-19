export interface ImprintContent {
  title: string;
  publisherLabel: string;
  publisherName: string;
  zvrLabel: string;
  zvrNumber: string;
  emailLabel: string;
  email: string;
  webLabel: string;
  web: string;
  webUrl: string;
  liabilityTitle: string;
  liabilityText: string;
  copyrightTitle: string;
  copyrightText: string;
}

export const impressum: Record<string, ImprintContent> = {
  de: {
    title: 'Impressum',
    publisherLabel: 'Medieninhaber und Herausgeber',
    publisherName: 'Verein der Freunde von OE Radio',
    zvrLabel: 'ZVR-Zahl',
    zvrNumber: '1510891498',
    emailLabel: 'E-Mail',
    email: 'kontakt@oeradio.at',
    webLabel: 'Web',
    web: 'oeradio.at',
    webUrl: 'https://oeradio.at',
    liabilityTitle: 'Haftungsausschluss',
    liabilityText:
      'Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden. Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich.',
    copyrightTitle: 'Urheberrecht',
    copyrightText:
      'Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.',
  },
  en: {
    title: 'Imprint',
    publisherLabel: 'Publisher and Editor',
    publisherName: 'Verein der Freunde von OE Radio',
    zvrLabel: 'Association Registration Number',
    zvrNumber: '1510891498',
    emailLabel: 'Email',
    email: 'kontakt@oeradio.at',
    webLabel: 'Web',
    web: 'oeradio.at',
    webUrl: 'https://oeradio.at',
    liabilityTitle: 'Liability Disclaimer',
    liabilityText:
      'The contents of this website have been compiled with the greatest care. However, no guarantee can be given for the accuracy, completeness and topicality of the contents. As a service provider, we are responsible for our own content on these pages in accordance with general laws.',
    copyrightTitle: 'Copyright',
    copyrightText:
      'The content and works on these pages created by the site operators are subject to Austrian copyright law. Contributions from third parties are marked as such. Reproduction, editing, distribution and any kind of use beyond the limits of copyright law require the written consent of the respective author or creator.',
  },
  it: {
    title: 'Note legali',
    publisherLabel: 'Editore e Redazione',
    publisherName: 'Verein der Freunde von OE Radio',
    zvrLabel: 'Numero di registrazione associazione',
    zvrNumber: '1510891498',
    emailLabel: 'E-mail',
    email: 'kontakt@oeradio.at',
    webLabel: 'Web',
    web: 'oeradio.at',
    webUrl: 'https://oeradio.at',
    liabilityTitle: 'Esclusione di responsabilità',
    liabilityText:
      'I contenuti di questo sito web sono stati redatti con la massima cura. Tuttavia, non è possibile garantire la correttezza, la completezza e l\'attualità dei contenuti. In quanto fornitore di servizi, siamo responsabili dei nostri contenuti su queste pagine in conformità con le leggi generali.',
    copyrightTitle: 'Diritto d\'autore',
    copyrightText:
      'I contenuti e le opere su queste pagine creati dagli operatori del sito sono soggetti alla legge austriaca sul diritto d\'autore. I contributi di terzi sono contrassegnati come tali. La riproduzione, la modifica, la distribuzione e qualsiasi tipo di utilizzo al di là dei limiti del diritto d\'autore richiedono il consenso scritto del rispettivo autore o creatore.',
  },
  sl: {
    title: 'Impressum',
    publisherLabel: 'Lastnik medija in izdajatelj',
    publisherName: 'Verein der Freunde von OE Radio',
    zvrLabel: 'Številka v registru združenj',
    zvrNumber: '1510891498',
    emailLabel: 'E-pošta',
    email: 'kontakt@oeradio.at',
    webLabel: 'Splet',
    web: 'oeradio.at',
    webUrl: 'https://oeradio.at',
    liabilityTitle: 'Omejitev odgovornosti',
    liabilityText:
      'Vsebina tega spletnega mesta je bila sestavljena z največjo skrbnostjo. Vendar pa ni mogoče jamčiti za točnost, popolnost in aktualnost vsebine. Kot ponudnik storitev smo odgovorni za lastno vsebino na teh straneh v skladu s splošnimi zakoni.',
    copyrightTitle: 'Avtorske pravice',
    copyrightText:
      'Vsebina in dela na teh straneh, ki so jih ustvarili upravljavci spletnega mesta, so predmet avstrijskega zakona o avtorskih pravicah. Prispevki tretjih oseb so kot takšni označeni. Reprodukcija, urejanje, distribucija in kakršna koli uporaba zunaj meja zakona o avtorskih pravicah zahtevata pisno soglasje zadevnega avtorja ali ustvarjalca.',
  },
};
