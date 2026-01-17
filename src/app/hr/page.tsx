'use client'

import { useAuth } from '@/components/AuthProvider'

const sections = [
  {
    title: 'Mitarbeiterverwaltung',
    items: [
      'Mitarbeiterverzeichnis mit Kontaktdaten, Abteilung, Position',
      'Organigramm und Organisationsstruktur',
      'Geburtstagskalender',
      'Notfallkontakte'
    ]
  },
  {
    title: 'Personalakten (digital)',
    items: [
      'Arbeitsvertraege und Aenderungsvereinbarungen',
      'Zeugnisse, Qualifikationen, Fortbildungsnachweise',
      'Abmahnungen, Beurteilungen',
      'Sicherheitsunterweisungen'
    ]
  },
  {
    title: 'Urlaubsverwaltung',
    items: [
      'Urlaubsantrag online stellen',
      'Genehmigungsprozess fuer Vorgesetzte',
      'Urlaubskalender (Teamuebersicht)',
      'Resturlaubsanzeige und Ueberstundenstand'
    ]
  },
  {
    title: 'Krankmeldungen',
    items: [
      'Krankmeldung einreichen',
      'Uebersicht Fehlzeiten',
      'AU-Bescheinigungen hochladen'
    ]
  },
  {
    title: 'Arbeitszeiterfassung',
    items: [
      'Kommen/Gehen erfassen',
      'Pausenzeiten',
      'Homeoffice-Tage dokumentieren',
      'Zeitkonten-Uebersicht'
    ]
  },
  {
    title: 'Lohn & Gehalt',
    items: [
      'Gehaltsabrechnungen als PDF abrufbar',
      'Lohnsteuerbescheinigungen',
      'Meldebescheinigungen fuer Sozialversicherung'
    ]
  },
  {
    title: 'Benefits-Uebersicht',
    items: [
      'Firmenwagen-Regelungen',
      'Essenszuschuesse',
      'Altersvorsorge/bAV',
      'Vermoegenswirksame Leistungen',
      'Fahrtkostenzuschuesse'
    ]
  },
  {
    title: 'Onboarding & Entwicklung',
    items: [
      'Onboarding-Checkliste',
      'Willkommensmappe digital',
      'Zustaendigkeiten und Ansprechpartner',
      'IT-Ausstattung beantragen',
      'Schulungskalender und Fortbildungsantrag',
      'Uebersicht absolvierte Schulungen',
      'E-Learning-Plattform (falls vorhanden)'
    ]
  },
  {
    title: 'Mitarbeitergespraeche',
    items: [
      'Terminplanung fuer Jahresgespraeche',
      'Gesprächsprotokolle und Zielvereinbarungen',
      'Feedback-Formulare'
    ]
  },
  {
    title: 'Self-Service fuer Mitarbeiter',
    items: [
      'Adressaenderungen melden',
      'Bankverbindung aktualisieren',
      'Steuerklasse aendern',
      'Familienstand aktualisieren',
      'Bescheinigungen anfordern'
    ]
  },
  {
    title: 'Richtlinien & Formulare',
    items: [
      'Arbeitsordnung und Betriebsvereinbarungen',
      'Compliance-Richtlinien und Datenschutz',
      'Arbeitsschutz-Unterweisungen',
      'Urlaubs- und Gleitzeitregelungen',
      'Formulare: Urlaub, Reisekosten, Unfall, Elternzeit'
    ]
  },
  {
    title: 'Kommunikation & Organisation',
    items: [
      'Personalnews und Ankuendigungen',
      'Interne Stellenausschreibungen',
      'Wichtige HR-Mitteilungen',
      'FAQ-Bereich und Ansprechpartner',
      'Schichtplanung (falls relevant)'
    ]
  },
  {
    title: 'Berichtswesen & Analytics',
    items: [
      'Krankenquote',
      'Fluktuationsrate',
      'Urlaubsstand gesamt',
      'Altersstruktur',
      'Personalkosten-Uebersicht'
    ]
  },
  {
    title: 'Rechtliches & Compliance',
    items: [
      'DSGVO-konforme Verwaltung',
      'Einwilligungen dokumentieren',
      'Aufbewahrungsfristen beachten',
      'Berechtigungskonzept'
    ]
  }
]

export default function HRPage() {
  const { isLoggedIn } = useAuth()

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 lg:p-10 text-white">
        <h1 className="text-2xl lg:text-4xl font-extrabold mb-2">🧑‍💼 HR</h1>
        <p className="text-white/90 max-w-3xl">
          Zentrale Plattform fuer Personalverwaltung, Self-Service und Compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3">{section.title}</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              {section.items.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
