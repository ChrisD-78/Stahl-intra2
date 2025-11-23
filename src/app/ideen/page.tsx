'use client'

import Link from 'next/link'
import Beschwerdemanagement from '@/components/Beschwerdemanagement'

const faqItems = [
  {
    question: 'Wie beantrage ich Urlaub oder Gleittage?',
    answer:
      'Nutze das Formular unter Verwaltungsprozesse → Abwesenheiten. Nach digitaler Unterschrift geht der Antrag automatisch zur Teamleitung und Personalstelle.'
  },
  {
    question: 'Wo hinterlege ich Dienstreiseanträge?',
    answer:
      'Dienstreisen werden im Workflow-System angelegt. Lade Budget und Agenda hoch, anschließend prüft die Beschaffung die Unterlagen.'
  },
  {
    question: 'Wer hilft bei IT-Problemen?',
    answer:
      'Wende dich an den IT-Service im Organigramm. Über das Status-Tracking siehst du, wie weit dein Ticket ist.'
  },
  {
    question: 'Wie reiche ich Verbesserungsvorschläge ein?',
    answer:
      'Öffne das Ideenmanagement-Tool weiter unten. Dort kannst du Ideen kategorisieren, Impact einschätzen und das Team zur Diskussion einladen.'
  }
]

const bulletinPosts = [
  {
    title: 'Stadthallen-Renovierung: Sperrzeiten beachten',
    category: 'Ankündigung',
    date: '15.12.2025',
    details: 'Zugang Nordflügel ab 18:00 Uhr gesperrt. Bitte Material rechtzeitig umlagern.'
  },
  {
    title: 'Verwaltungsforum & Netzwerktreffen',
    category: 'Veranstaltung',
    date: '22.01.2026',
    details: 'Impulsvortrag zu digitalen Genehmigungsprozessen, anschließend Workshops.'
  },
  {
    title: 'Neues Energiesparprogramm',
    category: 'Ankündigung',
    date: '05.12.2025',
    details: 'Teams können eigene Projekte im Workspace „GreenOps“ starten und Budgets abrufen.'
  }
]

const orgStructure = [
  {
    unit: 'Geschäftsführung',
    lead: 'Eva Klein',
    phone: '+49 6341 12-100',
    mail: 'eva.klein@stadtholding.de'
  },
  {
    unit: 'Verwaltungsservice',
    lead: 'Jonas Meier',
    phone: '+49 6341 12-220',
    mail: 'jonas.meier@stadtholding.de'
  },
  {
    unit: 'Personal & Entwicklung',
    lead: 'Carla Nguyen',
    phone: '+49 6341 12-330',
    mail: 'carla.nguyen@stadtholding.de'
  },
  {
    unit: 'IT & Digitales',
    lead: 'Felix Sturm',
    phone: '+49 6341 12-440',
    mail: 'felix.sturm@stadtholding.de'
  }
]

const employeeDirectory = [
  {
    name: 'Mara Schubert',
    role: 'Teamkoordination Verwaltung',
    competencies: ['Prozessdesign', 'Haushaltsplanung'],
    responsibilities: 'Koordination Verwaltung, Eskalationsstelle Beschaffung',
    deputy: 'Leon Fuchs',
    contact: 'mara.schubert@stadtholding.de'
  },
  {
    name: 'Leon Fuchs',
    role: 'Fachreferent Beschaffung',
    competencies: ['Vergaberecht', 'Lieferantenmanagement'],
    responsibilities: 'Prüfung Beschaffungen ab 5.000 €',
    deputy: 'Mara Schubert',
    contact: 'leon.fuchs@stadtholding.de'
  },
  {
    name: 'Selina Wolf',
    role: 'HR Business Partner',
    competencies: ['Arbeitsrecht', 'Change Management'],
    responsibilities: 'Personalentwicklung, Vertretung für Urlaubsprozesse',
    deputy: 'Moritz Brecht',
    contact: 'selina.wolf@stadtholding.de'
  },
  {
    name: 'Moritz Brecht',
    role: 'Digital Workplace',
    competencies: ['Automationen', 'Power Platform'],
    responsibilities: 'Workflow-System, digitale Signaturen',
    deputy: 'Felix Sturm',
    contact: 'moritz.brecht@stadtholding.de'
  }
]

const projectWorkspaces = [
  {
    name: 'GreenOps',
    goal: 'Energie- und Ressourcenmanagement bündeln',
    leads: ['Felix Sturm', 'Eva Klein'],
    channel: '#workspace-greenops'
  },
  {
    name: 'Service2026',
    goal: 'Kund:innenservice digitalisieren',
    leads: ['Mara Schubert'],
    channel: '#workspace-service'
  },
  {
    name: 'QMS-Upgrade',
    goal: 'Qualitätsmanagement ISO 9001 rezertifizieren',
    leads: ['Carla Nguyen', 'Leon Fuchs'],
    channel: '#workspace-qms'
  }
]

const surveyData = [
  {
    title: 'Pulse Check Dezember',
    focus: 'Mitarbeiterzufriedenheit',
    participation: '78 %',
    action: 'Workshops zu Workload & Kollaboration ab Januar'
  },
  {
    title: 'IT Service Feedback',
    focus: 'Ticketbearbeitung',
    participation: '62 %',
    action: 'Neue Self-Service-Roadmap veröffentlicht'
  }
]

const adminProcesses = [
  {
    title: 'Abwesenheiten & Zeitwirtschaft',
    description: 'Urlaub, Dienstreisen, Zeitausgleich mit automatischer Vertretungsregel.',
    tools: ['Workflow-System', 'Digitale Signatur']
  },
  {
    title: 'Beschaffung & Verträge',
    description: 'Standardisierte Freigaben mit Budgetkontrolle und Lieferantenvergleich.',
    tools: ['Status-Tracking', 'Dokumentenablage']
  },
  {
    title: 'Verwaltungsprozesse',
    description: 'Formulare für Rechnungen, Kassenführung und interne Abstimmungen.',
    tools: ['Formularcenter', 'Aufgabensteuerung']
  }
]

const workflowStatus = [
  {
    process: 'Beschaffung',
    pending: 3,
    avgTime: '2,4 Tage',
    status: 'On Track'
  },
  {
    process: 'Dienstreisen',
    pending: 1,
    avgTime: '1,1 Tage',
    status: 'Priorität'
  },
  {
    process: 'HR-Freigaben',
    pending: 5,
    avgTime: '3,2 Tage',
    status: 'Monitoring'
  }
]

const trackingItems = [
  {
    title: 'Sanierung Nordbad',
    owner: 'Projektteam GreenOps',
    phase: 'Genehmigung',
    eta: 'KW 51'
  },
  {
    title: 'Dienstreise-Leitfaden',
    owner: 'Personal & Entwicklung',
    phase: 'Review',
    eta: 'KW 48'
  },
  {
    title: 'IT-Sicherheitsupdate',
    owner: 'IT & Digitales',
    phase: 'Umsetzung',
    eta: 'laufend'
  }
]

const signaturePolicies = [
  'Beschaffungen über 5.000 € erfordern eine doppelte digitale Signatur.',
  'Dienstreiseanträge werden nach Genehmigung automatisch archiviert.',
  'HR-Verträge nutzen DocuSign-Vorlagen mit Zwei-Faktor-Authentifizierung.',
  'Projektdokumente lassen sich direkt aus dem Workspace signieren.'
]

export default function IdeenPage() {
  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="bg-gradient-to-r from-blue-700 to-purple-600 rounded-2xl shadow-xl p-6 lg:p-10 text-white">
        <p className="text-sm uppercase tracking-[0.3em] text-white/80 mb-3">Ideen & Prozesse</p>
        <h1 className="text-2xl lg:text-4xl font-extrabold">Zusammenarbeit & Innovationen</h1>
        <p className="mt-3 text-white/90 max-w-3xl">
          FAQ, Organigramm, Ideenmanagement und Workflow-Status gebündelt auf einer Seite.
        </p>
      </header>

      {/* FAQ & Schwarzes Brett */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">FAQ</h2>
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              Verwaltungsfragen
            </span>
          </div>
          <div className="space-y-4">
            {faqItems.map((faq) => (
              <div key={faq.question} className="border border-gray-100 rounded-xl p-4 hover:border-blue-200 transition-colors">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <span className="text-blue-500">?</span>
                  {faq.question}
                </p>
                <p className="text-sm text-gray-600 mt-2">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Schwarzes Brett</h2>
            <span className="text-sm font-semibold text-purple-600 uppercase tracking-wide">
              Ankündigungen
            </span>
          </div>
          <div className="space-y-4">
            {bulletinPosts.map((post) => (
              <article key={post.title} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500">{post.date}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{post.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{post.details}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Organigramm & Mitarbeiter */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Organigramm</h2>
            <p className="text-sm text-gray-600">Direkte Kontaktmöglichkeiten pro Bereich</p>
          </div>
          <Link
            href="/users"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            gesamtes Organigramm öffnen →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {orgStructure.map((unit) => (
            <div key={unit.unit} className="p-4 border border-gray-100 rounded-xl bg-gradient-to-br from-blue-50 to-white">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{unit.unit}</p>
              <p className="text-base font-semibold text-gray-900 mt-1">{unit.lead}</p>
              <p className="text-sm text-gray-600 mt-3 flex flex-col">
                <span>{unit.phone}</span>
                <span>{unit.mail}</span>
              </p>
              <button className="mt-4 text-sm text-blue-600 font-semibold hover:underline">
                Kontakt aufnehmen
              </button>
            </div>
          ))}
        </div>

        <div className="border border-gray-100 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Mitarbeiterverzeichnis</h3>
              <p className="text-sm text-gray-600">
                Kompetenzen, Zuständigkeiten & Vertretungen auf einen Blick
              </p>
            </div>
            <Link href="/admin/users" className="text-sm font-semibold text-blue-600 hover:underline">
              Verzeichnis verwalten
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Rolle</th>
                  <th className="px-4 py-2">Kompetenzen</th>
                  <th className="px-4 py-2">Zuständigkeiten</th>
                  <th className="px-4 py-2">Vertretung</th>
                  <th className="px-4 py-2">Kontakt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employeeDirectory.map((employee) => (
                  <tr key={employee.name} className="bg-white">
                    <td className="px-4 py-3 font-semibold text-gray-900">{employee.name}</td>
                    <td className="px-4 py-3 text-gray-700">{employee.role}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {employee.competencies.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{employee.responsibilities}</td>
                    <td className="px-4 py-3 text-gray-600">{employee.deputy}</td>
                    <td className="px-4 py-3 text-blue-600">{employee.contact}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Projektworkspaces */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Projektworkspaces</h2>
            <p className="text-sm text-gray-600">Bereichsübergreifend planen, kommentieren und Entscheidungen festhalten</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors">
            neuen Workspace erstellen
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projectWorkspaces.map((workspace) => (
            <div key={workspace.name} className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-white">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">{workspace.channel}</p>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">{workspace.name}</h3>
              <p className="text-sm text-gray-600 mt-2">{workspace.goal}</p>
              <p className="text-xs text-gray-500 mt-3">Leads: {workspace.leads.join(', ')}</p>
              <button className="mt-4 text-sm font-semibold text-purple-600 hover:underline">
                Workspace öffnen
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Ideenmanagement & Umfragen */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Ideenmanagement</h2>
          <p className="text-sm text-gray-600 mt-1">Verbesserungsvorschläge verfolgen und bewerten</p>
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="rounded-xl bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">42</p>
              <p className="text-xs text-blue-700">eingereicht</p>
            </div>
            <div className="rounded-xl bg-green-50 p-3 text-center">
              <p className="text-2xl font-bold text-green-600">18</p>
              <p className="text-xs text-green-700">in Umsetzung</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">12.500 €</p>
              <p className="text-xs text-purple-700">Einsparung</p>
            </div>
          </div>
          <button className="mt-6 w-full px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            Idee einreichen
          </button>
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Interne Umfragen</h2>
            <span className="text-sm font-semibold text-green-600 uppercase tracking-wide">
              Mitarbeiterzufriedenheit
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveyData.map((survey) => (
              <div key={survey.title} className="border border-gray-100 rounded-xl p-4 bg-gradient-to-br from-green-50 to-white">
                <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">{survey.focus}</p>
                <h3 className="text-lg font-semibold text-gray-900 mt-1">{survey.title}</h3>
                <p className="text-sm text-gray-600 mt-2">Teilnahme: {survey.participation}</p>
                <p className="text-sm text-gray-700 mt-3">{survey.action}</p>
                <button className="mt-4 text-sm font-semibold text-green-600 hover:underline">
                  Ergebnisse ansehen
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beschwerdemanagement */}
      <Beschwerdemanagement />

      {/* Verwaltungsprozesse & Workflows */}
      <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Verwaltungsprozesse</h2>
            <p className="text-sm text-gray-600">Standardisierte Abläufe mit klaren Zuständigkeiten</p>
          </div>
          <Link href="/formulare" className="text-sm font-semibold text-blue-600 hover:underline">
            zum Formularcenter →
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {adminProcesses.map((process) => (
            <div key={process.title} className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-white">
              <h3 className="text-lg font-semibold text-gray-900">{process.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{process.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {process.tools.map((tool) => (
                  <span key={tool} className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {workflowStatus.map((workflow) => (
            <div key={workflow.process} className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-white">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{workflow.process}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{workflow.pending}</p>
              <p className="text-sm text-gray-600">Vorgänge in Prüfung • ⌀ {workflow.avgTime}</p>
              <span className="inline-flex mt-4 px-2 py-1 text-xs font-semibold rounded-full bg-white border border-blue-100 text-blue-700">
                {workflow.status}
              </span>
            </div>
          ))}
          <div className="border border-gray-100 rounded-2xl p-4 bg-gradient-to-br from-purple-50 to-white">
            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Workflow-System</p>
            <h3 className="text-lg font-semibold text-gray-900 mt-2">Genehmigungen & Freigaben</h3>
            <p className="text-sm text-gray-600 mt-2">
              Beschaffungen, Dienstreisen und HR-Prozesse lassen sich digital starten, bearbeiten und signieren. Aufgaben verteilen sich automatisch an Vertretungen.
            </p>
            <button className="mt-4 text-sm font-semibold text-purple-600 hover:underline">
              Workflow starten
            </button>
          </div>
        </div>
      </section>

      {/* Status-Tracking & Digitale Signaturen */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Status-Tracking</h2>
            <Link href="/aufgaben" className="text-sm font-semibold text-blue-600 hover:underline">
              alle Vorgänge
            </Link>
          </div>
          <div className="space-y-4">
            {trackingItems.map((item) => (
              <div key={item.title} className="border border-gray-100 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-white">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{item.owner}</p>
                <h3 className="text-sm font-semibold text-gray-900 mt-1">{item.title}</h3>
                <p className="text-sm text-gray-600">Phase: {item.phase}</p>
                <p className="text-xs text-gray-500 mt-1">Nächster Meilenstein: {item.eta}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h2 className="text-2xl font-bold text-gray-900">Digitale Unterschriften</h2>
          <p className="text-sm text-gray-600 mt-1">
            Verbindliche Signaturen für Verträge, Beschaffungen und HR-Dokumente
          </p>
          <ul className="mt-6 space-y-3">
            {signaturePolicies.map((policy) => (
              <li key={policy} className="flex items-start gap-3 text-sm text-gray-700">
                <span className="text-green-600 mt-0.5">✔</span>
                {policy}
              </li>
            ))}
          </ul>
          <button className="mt-6 w-full px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors">
            Richtlinie anzeigen
          </button>
        </div>
      </section>
    </div>
  )
}

