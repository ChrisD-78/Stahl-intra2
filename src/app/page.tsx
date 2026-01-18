'use client'

import { useEffect, useState } from 'react'
import { getDashboardInfos, createDashboardInfo, deleteDashboardInfo, uploadInfoPdf, DashboardInfoRecord } from '@/lib/db'
import Link from 'next/link'
import DailyMotivation from "@/components/DailyMotivation"
import InfoForm from "@/components/InfoForm"
import DashboardInfoPopup from "@/components/DashboardInfoPopup"
import { useAuth } from "@/components/AuthProvider"

interface InfoItem {
  id: string
  title: string
  content: string
  timestamp: string
  pdfFile?: File
  pdfFileName?: string
  pdfUrl?: string
  isPopup?: boolean
}

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

export default function Dashboard() {
  const { isAdmin, currentUser } = useAuth()
  
  const [currentInfos, setCurrentInfos] = useState<InfoItem[]>([])
  const [popupInfo, setPopupInfo] = useState<InfoItem | null>(null)
  const [editingInfo, setEditingInfo] = useState<InfoItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    name: currentUser || '',
    email: '',
    department: '',
    message: ''
  })
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [feedbackError, setFeedbackError] = useState<string | null>(null)

  const formatDate = (dateString: string): string => {
    // Konvertiere das Datum in das Format: TT.MM.JJJJ (ohne Uhrzeit)
    if (!dateString) return ''
    
    // Spezielle Werte direkt zurückgeben
    if (dateString === 'gerade eben' || dateString === 'Heute' || dateString === 'Gestern') {
      return dateString
    }
    
    try {
      // Wenn das Datum bereits im deutschen Format ist (z.B. "08.11.2025, 14:30:45")
      if (dateString.includes(',')) {
        // Extrahiere nur den Datumsteil vor dem Komma
        return dateString.split(',')[0].trim()
      }
      
      // Wenn es bereits im Format TT.MM.JJJJ ist (ohne Komma)
      if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
        return dateString
      }
      
      // Ansonsten versuche es zu parsen
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // Falls das Parsen fehlschlägt, gebe den Original-String zurück
        return dateString
      }
      const day = String(date.getDate()).padStart(2, '0')
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const year = date.getFullYear()
      return `${day}.${month}.${year}`
    } catch (e) {
      return dateString
    }
  }

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDashboardInfos()
        const mapped: InfoItem[] = data.map((r: DashboardInfoRecord) => ({
          id: r.id as string,
          title: r.title,
          content: r.content,
          timestamp: r.timestamp,
          pdfFileName: r.pdf_name || undefined,
          pdfUrl: r.pdf_url || undefined,
          isPopup: r.is_popup || false
        }))
        setCurrentInfos(mapped)

        // Prüfe auf Popup-Informationen
        const popupInfos = mapped.filter(info => info.isPopup)
        if (popupInfos.length > 0) {
          // Zeige die neueste Popup-Info, die noch nicht dismissed wurde
          const dismissedPopups = JSON.parse(localStorage.getItem('dismissedPopups') || '[]')
          const unDismissedPopup = popupInfos.find(info => !dismissedPopups.includes(info.id))
          if (unDismissedPopup) {
            setPopupInfo(unDismissedPopup)
          }
        }
      } catch (e) {
        console.error('Load dashboard infos failed', e)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!currentUser) return
    setFeedbackForm((prev) => (prev.name ? prev : { ...prev, name: currentUser }))
  }, [currentUser])

  const addNewInfo = async (title: string, content: string, pdfFile?: File, isPopup?: boolean) => {
    const optimistic: InfoItem = {
      id: `tmp_${Date.now()}`,
      title,
      content,
      timestamp: 'gerade eben',
      pdfFile,
      pdfFileName: pdfFile?.name
    }
    setCurrentInfos(prev => [optimistic, ...prev])
    try {
      let publicUrl: string | undefined
      if (pdfFile) {
        const up = await uploadInfoPdf(pdfFile)
        publicUrl = up.publicUrl
      }
      await createDashboardInfo({
        title,
        content,
        timestamp: new Date().toLocaleString('de-DE'),
        pdf_name: pdfFile?.name,
        pdf_url: publicUrl,
        is_popup: isPopup || false
      })
      const fresh = await getDashboardInfos()
      const mapped: InfoItem[] = fresh.map((r: DashboardInfoRecord) => ({
        id: r.id as string,
        title: r.title,
        content: r.content,
        timestamp: r.timestamp,
        pdfFileName: r.pdf_name || undefined,
        pdfUrl: r.pdf_url || undefined
      }))
      setCurrentInfos(mapped)
    } catch (e) {
      console.error('Create dashboard info failed', e)
      setCurrentInfos(prev => prev.filter(i => i.id !== optimistic.id))
      alert('Information konnte nicht gespeichert werden.')
    }
  }

  const removeInfo = async (id: string) => {
    const prev = currentInfos
    setCurrentInfos(prev.filter(info => info.id !== id))
    try {
      await deleteDashboardInfo(id)
    } catch (e) {
      console.error('Delete dashboard info failed', e)
      setCurrentInfos(prev)
      alert('Information konnte nicht gelöscht werden.')
    }
  }

  const handleEditClick = (info: InfoItem) => {
    setEditingInfo(info)
    setShowEditModal(true)
  }

  const updateInfo = async (id: string, title: string, content: string, isPopup?: boolean) => {
    const prev = currentInfos
    // Optimistic update
    setCurrentInfos(prevInfos => 
      prevInfos.map(info => 
        info.id === id 
          ? { ...info, title, content, isPopup: isPopup || false }
          : info
      )
    )
    try {
      const response = await fetch(`/api/dashboard-infos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, is_popup: isPopup || false })
      })
      
      if (!response.ok) {
        throw new Error('Update failed')
      }
      
      // Reload fresh data
      const fresh = await getDashboardInfos()
      const mapped: InfoItem[] = fresh.map((r: DashboardInfoRecord) => ({
        id: r.id as string,
        title: r.title,
        content: r.content,
        timestamp: r.timestamp,
        pdfFileName: r.pdf_name || undefined,
        pdfUrl: r.pdf_url || undefined,
        isPopup: r.is_popup || false
      }))
      setCurrentInfos(mapped)
      setShowEditModal(false)
      setEditingInfo(null)
    } catch (e) {
      console.error('Update dashboard info failed', e)
      setCurrentInfos(prev)
      alert('Information konnte nicht aktualisiert werden.')
    }
  }

  const downloadPdf = (info: InfoItem) => {
    // If PDF URL is available (from database), open it
    if (info.pdfUrl) {
      window.open(info.pdfUrl, '_blank')
      return
    }
    
    // Otherwise, if it's a newly uploaded file in memory
    if (info.pdfFile) {
      const url = window.URL.createObjectURL(info.pdfFile)
      const link = document.createElement('a')
      link.href = url
      link.download = info.pdfFileName || 'dokument.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  }
  
  const viewPdf = (info: InfoItem) => {
    // Open PDF in new tab for viewing
    if (info.pdfUrl) {
      window.open(info.pdfUrl, '_blank')
    } else if (info.pdfFile) {
      const url = window.URL.createObjectURL(info.pdfFile)
      window.open(url, '_blank')
    }
  }

  const handleFeedbackSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setFeedbackStatus('sending')
    setFeedbackError(null)

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'christof.drost@gmail.com',
          subject: 'Intranet Testphase Feedback',
          text: `Name: ${feedbackForm.name}\nE-Mail: ${feedbackForm.email}\nAbteilung: ${feedbackForm.department}\n\nWunsch/Anregung/Bug:\n${feedbackForm.message}`,
          html: `
            <h2>Intranet Testphase Feedback</h2>
            <p><strong>Name:</strong> ${feedbackForm.name || '-'}</p>
            <p><strong>E-Mail:</strong> ${feedbackForm.email || '-'}</p>
            <p><strong>Abteilung:</strong> ${feedbackForm.department || '-'}</p>
            <p><strong>Wunsch/Anregung/Bug:</strong></p>
            <p>${feedbackForm.message.replace(/\\n/g, '<br/>')}</p>
          `
        })
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'E-Mail konnte nicht gesendet werden')
      }

      setFeedbackStatus('sent')
      setFeedbackForm((prev) => ({ ...prev, message: '' }))
    } catch (error) {
      console.error('Feedback send failed:', error)
      setFeedbackStatus('error')
      setFeedbackError(error instanceof Error ? error.message : 'Unbekannter Fehler')
    }
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white">
        <h1 className="text-lg lg:text-xl font-bold mb-4 text-center">
          Willkommen im Intranet der Stadtholding Landau in der Pfalz GmbH
        </h1>
        <DailyMotivation />
      </div>

      {/* Testphase Hinweis */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 mb-3">
                🧪 Testphase 3 Monate
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Intranet startet jetzt in die Testphase
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl">
                Für die nächsten 3 Monate sammeln wir Wünsche, Anregungen und Bugs.
                Bitte meldet alles, was euch auffällt – so verbessern wir das Intranet gemeinsam.
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowFeedbackModal(true)
                  setFeedbackStatus('idle')
                  setFeedbackError(null)
                }}
                className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors"
              >
                Feedback senden
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Aktuelle Informationen */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1"></div>
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Aktuelle Informationen
            </h2>
            <div className="flex-1 flex justify-end">
              <InfoForm onAddInfo={addNewInfo} />
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          
          {/* Bestehende Informationen */}
          {currentInfos.map((info) => (
            <div key={info.id} className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg mt-2 flex-shrink-0"></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-blue-900">
                    {info.title}
                  </h3>
                  {info.isPopup && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      📢 Popup
                    </span>
                  )}
                </div>
                <p className="text-sm text-blue-800 mb-2">
                  {info.content}
                </p>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-blue-600 font-medium">
                    {formatDate(info.timestamp)}
                  </span>
                  {info.pdfFileName && (
                    <span className="text-xs text-blue-600 font-medium">
                      📄 {info.pdfFileName}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {info.pdfFileName && (
                  <button
                    onClick={() => viewPdf(info)}
                    className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                    title="PDF ansehen"
                  >
                    📄
                  </button>
                )}
                {isAdmin && (
                  <button
                    onClick={() => handleEditClick(info)}
                    className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                    title="Information bearbeiten"
                  >
                    ✏️
                  </button>
                )}
                <button
                  onClick={() => removeInfo(info.id)}
                  className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                  title="Information entfernen"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>


      {/* Popup für wichtige Informationen */}
      {popupInfo && (
        <DashboardInfoPopup
          info={popupInfo}
          onClose={() => setPopupInfo(null)}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && editingInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white">Information bearbeiten</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-2">
                    👑 Admin
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingInfo(null)
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <EditForm
              info={editingInfo}
              onSave={updateInfo}
              onCancel={() => {
                setShowEditModal(false)
                setEditingInfo(null)
              }}
            />
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Feedback zur Testphase</h3>
                  <p className="text-sm text-blue-100 mt-1">
                    Wünsche, Anregungen oder Bugs direkt senden
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false)
                    setFeedbackStatus('idle')
                    setFeedbackError(null)
                  }}
                  className="text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={feedbackForm.name}
                    onChange={(e) => setFeedbackForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Ihr Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail (optional)</label>
                  <input
                    type="email"
                    value={feedbackForm.email}
                    onChange={(e) => setFeedbackForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="name@stadtholding.de"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Abteilung (optional)</label>
                  <input
                    type="text"
                    value={feedbackForm.department}
                    onChange={(e) => setFeedbackForm((prev) => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="z.B. Verwaltung, HR, Technik"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wunsch / Anregung / Bug
                  </label>
                  <textarea
                    value={feedbackForm.message}
                    onChange={(e) => setFeedbackForm((prev) => ({ ...prev, message: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 min-h-[140px]"
                    placeholder="Beschreibe kurz dein Anliegen..."
                    required
                  />
                </div>
              </div>

              {feedbackStatus === 'error' && feedbackError && (
                <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
                  {feedbackError}
                </div>
              )}
              {feedbackStatus === 'sent' && (
                <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm border border-green-200">
                  Danke! Dein Feedback wurde gesendet.
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowFeedbackModal(false)
                    setFeedbackStatus('idle')
                    setFeedbackError(null)
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Schließen
                </button>
                <button
                  type="submit"
                  disabled={feedbackStatus === 'sending'}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {feedbackStatus === 'sending' ? 'Sende...' : 'Feedback senden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Edit Form Component
function EditForm({ 
  info, 
  onSave, 
  onCancel 
}: { 
  info: InfoItem
  onSave: (id: string, title: string, content: string, isPopup?: boolean) => void
  onCancel: () => void
}) {
  const [title, setTitle] = useState(info.title)
  const [content, setContent] = useState(info.content)
  const [isPopup, setIsPopup] = useState(info.isPopup || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) {
      alert('Bitte alle Felder ausfüllen')
      return
    }
    onSave(info.id, title, content, isPopup)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {/* Titel */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Titel
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Titel der Information"
          required
        />
      </div>

      {/* Inhalt */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Inhalt
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          rows={4}
          placeholder="Beschreibung der Information"
          required
        />
      </div>

      {/* Popup Checkbox */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="edit-is-popup"
          checked={isPopup}
          onChange={(e) => setIsPopup(e.target.checked)}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="edit-is-popup" className="text-sm text-gray-700">
          Als Popup anzeigen (wird beim nächsten Login als Hinweis angezeigt)
        </label>
      </div>

      {/* PDF Info (nicht editierbar) */}
      {info.pdfFileName && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Angehängte PDF:</p>
          <span className="text-sm text-gray-900 font-medium">
            📄 {info.pdfFileName}
          </span>
          <p className="text-xs text-gray-500 mt-1">
            Hinweis: PDF kann nicht bearbeitet werden
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          💾 Speichern
        </button>
      </div>
    </form>
  )
}
