'use client'

import { useState, useEffect } from 'react'
import UrlaubsantragForm from '@/components/UrlaubsantragForm'
import DienstreiseantragForm from '@/components/DienstreiseantragForm'
import BeschaffungsantragForm from '@/components/BeschaffungsantragForm'
import ReisekostenabrechnungForm from '@/components/ReisekostenabrechnungForm'
import { getFormSubmissions, insertFormSubmission, deleteFormSubmissionById, updateFormSubmissionById } from '@/lib/db'
import { useAuth } from '@/components/AuthProvider'

interface FormSubmission {
  id: string
  type: string
  title: string
  description: string
  status: string
  submittedAt: string
  formData: any // eslint-disable-line @typescript-eslint/no-explicit-any
  submittedBy: string
}

export default function Formulare() {
  const { isAdmin, currentUser } = useAuth()
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)

  const [openForm, setOpenForm] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<FormSubmission | null>(null)
  const [selfServiceForm, setSelfServiceForm] = useState({
    employeeName: '',
    requestType: 'adressaenderung',
    details: ''
  })
  const [adminEdits, setAdminEdits] = useState<Record<string, { status: string; comment: string }>>({})
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterType, setFilterType] = useState<string>('')

  // Load submissions from Supabase
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        const data = await getFormSubmissions()
        const mapped: FormSubmission[] = data.map((sub) => ({
          id: sub.id,
          type: sub.type,
          title: sub.title,
          description: sub.description,
          status: sub.status,
          submittedAt: sub.submitted_at,
          formData: sub.form_data,
          submittedBy: sub.submitted_by
        }))
        setSubmissions(mapped)
      } catch (error) {
        console.error('Error loading submissions:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSubmissions()
  }, [])

  useEffect(() => {
    if (openForm === 'hr_self_service' && currentUser && !selfServiceForm.employeeName) {
      setSelfServiceForm((prev) => ({ ...prev, employeeName: currentUser }))
    }
  }, [openForm, currentUser, selfServiceForm.employeeName])

  const handleFormSubmit = async (type: string, data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    try {
      const submissionData = {
        type,
        title: `${type} - ${new Date().toLocaleDateString('de-DE')}`,
        description: generateDescription(type, data),
        status: 'Eingegangen',
        form_data: data,
        submitted_by: currentUser || 'Aktueller Benutzer'
      }

      // Save to Supabase
      const savedSubmission = await insertFormSubmission(submissionData)
      
      const newSubmission: FormSubmission = {
        id: savedSubmission.id,
        type: savedSubmission.type,
        title: savedSubmission.title,
        description: savedSubmission.description,
        status: savedSubmission.status,
        submittedAt: savedSubmission.submitted_at,
        formData: savedSubmission.form_data,
        submittedBy: savedSubmission.submitted_by
      }
      
      setSubmissions([newSubmission, ...submissions])
    } catch (error) {
      console.error('Error saving form submission:', error)
      alert('Fehler beim Speichern des Formulars.')
    }
  }

  const generateDescription = (type: string, data: any): string => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const requestLabel = (value: string) => {
      switch (value) {
        case 'adressaenderung': return 'Adressaenderung'
        case 'bankverbindung': return 'Bankverbindung'
        case 'steuerklasse': return 'Steuerklasse'
        case 'familienstand': return 'Familienstand'
        case 'bescheinigung': return 'Bescheinigung'
        default: return value
      }
    }
    switch (type) {
      case 'urlaubsantrag':
        return `Name: ${data.name}, Abteilung: ${data.abteilung}, Von: ${data.vonDatum}, Bis: ${data.bisDatum}, Tage: ${data.anzahlTage}`
      case 'dienstreiseantrag':
        return `Name: ${data.name}, Reiseziel: ${data.reiseziel}, Von: ${data.vonDatum}, Bis: ${data.bisDatum}, Kosten: ${data.geschaetzteKosten} €`
      case 'beschaffungsantrag':
        return `Name: ${data.name}, Gegenstand: ${data.beschaffungsgegenstand}, Menge: ${data.menge}, Gesamtpreis: ${data.gesamtpreis} €, Dringlichkeit: ${data.dringlichkeit}`
      case 'reisekostenabrechnung':
        return `Name: ${data.name}, Reiseziel: ${data.reiseziel}, Von: ${data.vonDatum}, Bis: ${data.bisDatum}, Gesamtkosten: ${data.gesamtkosten} €`
      case 'hr_self_service':
        return `Mitarbeiter: ${data.employeeName}, Typ: ${requestLabel(data.requestType)}, Details: ${data.details || '-'}`
      default:
        return 'Formular eingereicht'
    }
  }

  const formatDate = (dateString: string): string => {
    // Konvertiere das Datum in das Format: TT.MM.JJJJ (ohne Uhrzeit)
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  const handleViewSubmission = (submission: FormSubmission) => {
    setSelectedSubmission(submission)
    setShowSubmissionModal(true)
  }

  const handleDeleteSubmission = (submission: FormSubmission) => {
    setShowDeleteConfirm(submission)
  }

  const handleDownloadPdf = (submission: FormSubmission) => {
    const title = `${getFormTypeLabel(submission.type)} – ${submission.title}`
    const htmlRows = Object.entries(submission.formData).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').trim()
      return `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;">${label}</td><td style=\"padding:8px;border:1px solid #e5e7eb;\">${String(value)}</td></tr>`
    }).join('')

    const html = `<!doctype html><html lang=\"de\"><head><meta charset=\"utf-8\"/>
      <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>
      <title>${title}</title>
      <style>
        body{font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111827;margin:24px}
        h1{font-size:20px;margin:0 0 16px 0}
        .meta{color:#6b7280;font-size:12px;margin-bottom:16px}
        table{border-collapse:collapse;width:100%;font-size:14px}
        thead td{background:#f9fafb;font-weight:700}
      </style>
    </head><body>
      <h1>${title}</h1>
      <div class=\"meta\">Status: ${submission.status} • Eingereicht: ${formatDate(submission.submittedAt)} • Von: ${submission.submittedBy}</div>
      <div style=\"margin:12px 0 20px 0;color:#374151;\">${submission.description}</div>
      <table>
        <thead><tr><td style=\"padding:8px;border:1px solid #e5e7eb;\">Feld</td><td style=\"padding:8px;border:1px solid #e5e7eb;\">Wert</td></tr></thead>
        <tbody>${htmlRows}</tbody>
      </table>
      <script>window.addEventListener('load',()=>{setTimeout(()=>{window.print()},200)})</script>
    </body></html>`

    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(html)
      w.document.close()
    }
  }

  const confirmDelete = async () => {
    if (showDeleteConfirm) {
      // Admin-Benutzer überspringen die Passwort-Abfrage
      if (isAdmin) {
        try {
          await deleteFormSubmissionById(showDeleteConfirm.id)
          setSubmissions(submissions.filter(sub => sub.id !== showDeleteConfirm.id))
          setShowDeleteConfirm(null)
        } catch (error) {
          console.error('Error deleting submission:', error)
          alert('Fehler beim Löschen des Formulars.')
        }
      } else {
        // Nicht-Admins müssen Passwort eingeben
        const pass = prompt('Bitte Passwort eingeben:')
        if (pass === 'bl') {
          try {
            await deleteFormSubmissionById(showDeleteConfirm.id)
            setSubmissions(submissions.filter(sub => sub.id !== showDeleteConfirm.id))
            setShowDeleteConfirm(null)
          } catch (error) {
            console.error('Error deleting submission:', error)
            alert('Fehler beim Löschen des Formulars.')
          }
        } else if (pass !== null) {
          alert('Falsches Passwort')
        }
      }
    }
  }

  const closeSubmissionModal = () => {
    setShowSubmissionModal(false)
    setSelectedSubmission(null)
  }

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'urlaubsantrag': return 'Urlaubsantrag'
      case 'dienstreiseantrag': return 'Dienstreiseantrag'
      case 'beschaffungsantrag': return 'Beschaffungsantrag'
      case 'reisekostenabrechnung': return 'Reisekostenabrechnung'
      case 'hr_self_service': return 'Self-Service'
      default: return type
    }
  }

  const selfServiceSubmissions = submissions.filter((submission) => submission.type === 'hr_self_service')

  const handleAdminSaveSelfService = async (submission: FormSubmission) => {
    const currentEdit = adminEdits[submission.id] || {
      status: submission.status,
      comment: (submission.formData as any)?.adminComment || ''
    }
    try {
      const updated = await updateFormSubmissionById(submission.id, {
        status: currentEdit.status,
        form_data: {
          ...(submission.formData || {}),
          adminComment: currentEdit.comment || ''
        }
      })
      setSubmissions((prev) => prev.map((item) => (
        item.id === submission.id
          ? {
              ...item,
              status: updated.status || currentEdit.status,
              formData: updated.form_data || {
                ...(submission.formData || {}),
                adminComment: currentEdit.comment || ''
              }
            }
          : item
      )))
    } catch (error) {
      console.error('Failed to update self-service submission:', error)
      alert('Fehler beim Speichern der Self-Service-Anfrage.')
    }
  }

  // Filter submissions based on selected filters
  const filteredSubmissions = submissions.filter((submission) => {
    const matchesStatus = !filterStatus || submission.status === filterStatus
    const matchesType = !filterType || submission.type === filterType
    return matchesStatus && matchesType
  })
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-4 lg:p-8 text-white text-center">
        <h1 className="text-2xl lg:text-4xl font-bold mb-2">Formulare</h1>
        <p className="text-sm lg:text-base text-white/90">
          Füllen Sie wichtige Formulare aus und verwalten Sie Ihre Einreichungen
        </p>
      </div>

      {/* Available Forms */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Verfügbare Formulare</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 p-4 lg:p-6">
          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">🏖️</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Urlaubsantrag
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Beantragen Sie Urlaub und Abwesenheiten
            </p>
            <button 
              onClick={() => setOpenForm('urlaubsantrag')}
              className="w-full px-4 py-2.5 text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">✈️</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Dienstreiseantrag
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Beantragen Sie Dienstreisen und Fortbildungen
            </p>
            <button 
              onClick={() => setOpenForm('dienstreiseantrag')}
              className="w-full px-4 py-2.5 text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">🛒</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Beschaffungsantrag
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Beantragen Sie Beschaffungen und Einkäufe
            </p>
            <button 
              onClick={() => setOpenForm('beschaffungsantrag')}
              className="w-full px-4 py-2.5 text-base bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">💳</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Reisekostenabrechnung
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Rechnen Sie Ihre Reisekosten ab
            </p>
            <button 
              onClick={() => setOpenForm('reisekostenabrechnung')}
              className="w-full px-4 py-2.5 text-base bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 lg:p-6 hover:shadow-md transition-shadow">
            <div className="text-center mb-4">
              <span className="text-4xl">🙋</span>
            </div>
            <h3 className="text-base lg:text-lg font-semibold text-gray-900 text-center mb-2">
              Self-Service
            </h3>
            <p className="text-sm text-gray-900 text-center mb-4">
              Aenderungen oder Bescheinigungen anfragen
            </p>
            <button 
              onClick={() => setOpenForm('hr_self_service')}
              className="w-full px-4 py-2.5 text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Formular öffnen
            </button>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 lg:p-6 border-b border-gray-200">
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">Self-Service Antraege (Admin)</h2>
            <p className="text-sm text-gray-500">Status aktualisieren und interne Kommentare erfassen.</p>
          </div>
          <div className="divide-y divide-gray-200">
            {selfServiceSubmissions.length === 0 && (
              <div className="p-4 lg:p-6 text-sm text-gray-500">
                Keine Self-Service Antraege vorhanden.
              </div>
            )}
            {selfServiceSubmissions.map((submission) => {
              const fallbackComment = (submission.formData as any)?.adminComment || ''
              const editState = adminEdits[submission.id] || { status: submission.status, comment: fallbackComment }
              return (
                <div key={submission.id} className="p-4 lg:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <h3 className="text-base font-semibold text-gray-900">{submission.title}</h3>
                      <p className="text-sm text-gray-700">{submission.description}</p>
                      <p className="text-xs text-gray-500">
                        Eingereicht von {submission.submittedBy} am {formatDate(submission.submittedAt)}
                      </p>
                    </div>
                    <div className="w-full lg:w-64 space-y-2">
                      <label className="block text-xs font-semibold text-gray-600 uppercase">Status</label>
                      <select
                        value={editState.status}
                        onChange={(e) =>
                          setAdminEdits((prev) => ({
                            ...prev,
                            [submission.id]: { status: e.target.value, comment: editState.comment }
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Eingegangen">Eingegangen</option>
                        <option value="In Bearbeitung">In Bearbeitung</option>
                        <option value="Abgeschlossen">Abgeschlossen</option>
                      </select>
                      <label className="block text-xs font-semibold text-gray-600 uppercase">Kommentar</label>
                      <textarea
                        value={editState.comment}
                        onChange={(e) =>
                          setAdminEdits((prev) => ({
                            ...prev,
                            [submission.id]: { status: editState.status, comment: e.target.value }
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                        placeholder="Interner Kommentar..."
                      />
                      <button
                        onClick={() => handleAdminSaveSelfService(submission)}
                        className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Speichern
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Submissions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <h2 className="text-base lg:text-lg font-semibold text-gray-900">Ihre letzten Einreichungen</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-4 lg:p-6 text-center">
              <div className="text-base text-gray-900">Lade Formulare...</div>
            </div>
          ) : submissions.slice(0, 3).map((submission) => (
            <div key={submission.id} className="p-4 lg:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <div className={`w-10 h-12 rounded flex items-center justify-center flex-shrink-0 ${
                    submission.status === 'Abgeschlossen' ? 'bg-green-100' :
                    submission.status === 'In Bearbeitung' ? 'bg-yellow-100' :
                    'bg-blue-100'
                  }`}>
                    <span className={`text-lg ${
                      submission.status === 'Abgeschlossen' ? 'text-green-600' :
                      submission.status === 'In Bearbeitung' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {submission.status === 'Abgeschlossen' ? '✅' :
                       submission.status === 'In Bearbeitung' ? '⏳' : '📝'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 break-words">{submission.title}</h3>
                    <p className="text-sm text-gray-900 mt-1 break-words">{submission.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        submission.status === 'Abgeschlossen' ? 'bg-green-100 text-green-900' :
                        submission.status === 'In Bearbeitung' ? 'bg-yellow-100 text-yellow-900' :
                        'bg-blue-100 text-blue-900'
                      }`}>
                        {submission.status}
                      </span>
                      <span className="text-xs text-gray-900">📅 {formatDate(submission.submittedAt)}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleViewSubmission(submission)}
                  className="self-start p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
                  title="Formular anzeigen"
                >
                  👁️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table View */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">Alle Formulareinreichungen</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Status</option>
                <option value="Eingegangen">Eingegangen</option>
                <option value="In Bearbeitung">In Bearbeitung</option>
                <option value="Abgeschlossen">Abgeschlossen</option>
              </select>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Alle Formulare</option>
                <option value="urlaubsantrag">Urlaubsantrag</option>
                <option value="dienstreiseantrag">Dienstreiseantrag</option>
                <option value="beschaffungsantrag">Beschaffungsantrag</option>
                <option value="reisekostenabrechnung">Reisekostenabrechnung</option>
                <option value="hr_self_service">Self-Service</option>
              </select>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Formular
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Titel
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="hidden sm:table-cell px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Eingereicht von
                </th>
                <th className="hidden md:table-cell px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-3 lg:px-6 py-4 text-center text-base text-gray-900">
                    Lade Formulare...
                  </td>
                </tr>
              ) : filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 lg:px-6 py-4 text-center text-base text-gray-900">
                    Keine Formulare gefunden, die den Filterkriterien entsprechen.
                  </td>
                </tr>
              ) : filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded flex items-center justify-center mr-3 ${
                        submission.type === 'urlaubsantrag' ? 'bg-blue-100' :
                        submission.type === 'dienstreiseantrag' ? 'bg-green-100' :
                        submission.type === 'beschaffungsantrag' ? 'bg-purple-100' :
                        submission.type === 'reisekostenabrechnung' ? 'bg-orange-100' :
                        'bg-gray-100'
                      }`}>
                        <span className={`text-sm ${
                          submission.type === 'urlaubsantrag' ? 'text-blue-600' :
                          submission.type === 'dienstreiseantrag' ? 'text-green-600' :
                          submission.type === 'beschaffungsantrag' ? 'text-purple-600' :
                          submission.type === 'reisekostenabrechnung' ? 'text-orange-600' :
                          'text-gray-600'
                        }`}>
                          {submission.type === 'urlaubsantrag' ? '🏖️' :
                           submission.type === 'dienstreiseantrag' ? '✈️' :
                           submission.type === 'beschaffungsantrag' ? '🛒' :
                           submission.type === 'reisekostenabrechnung' ? '💳' :
                           '📝'}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {submission.type.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900 break-words">{submission.title}</div>
                    <div className="text-xs text-gray-900 mt-1 break-words">{submission.description}</div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full ${
                      submission.status === 'Abgeschlossen' ? 'bg-green-100 text-green-900' :
                      submission.status === 'In Bearbeitung' ? 'bg-yellow-100 text-yellow-900' :
                      'bg-blue-100 text-blue-900'
                    }`}>
                      {submission.status}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {submission.submittedBy}
                  </td>
                  <td className="hidden md:table-cell px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatDate(submission.submittedAt)}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                      <button 
                        onClick={() => handleViewSubmission(submission)}
                        className="text-blue-600 hover:text-blue-900 transition-colors text-xs sm:text-sm px-2 py-1 hover:bg-blue-50 rounded"
                        title="Formular anzeigen"
                      >
                        <span className="inline sm:hidden">👁️</span>
                        <span className="hidden sm:inline">👁️ Anzeigen</span>
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(submission)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors text-xs sm:text-sm px-2 py-1 hover:bg-indigo-50 rounded"
                        title="Als PDF herunterladen"
                      >
                        <span className="inline sm:hidden">⬇️</span>
                        <span className="hidden sm:inline">⬇️ PDF</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteSubmission(submission)}
                        className="text-red-600 hover:text-red-900 transition-colors text-xs sm:text-sm px-2 py-1 hover:bg-red-50 rounded"
                        title="Formular löschen"
                      >
                        <span className="inline sm:hidden">🗑️</span>
                        <span className="hidden sm:inline">🗑️ Löschen</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submission Details Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${
                    selectedSubmission.type === 'urlaubsantrag' ? 'bg-blue-100' :
                    selectedSubmission.type === 'dienstreiseantrag' ? 'bg-green-100' :
                    selectedSubmission.type === 'beschaffungsantrag' ? 'bg-purple-100' :
                    selectedSubmission.type === 'reisekostenabrechnung' ? 'bg-orange-100' :
                    'bg-gray-100'
                  }`}>
                    <span className={`text-lg ${
                      selectedSubmission.type === 'urlaubsantrag' ? 'text-blue-600' :
                      selectedSubmission.type === 'dienstreiseantrag' ? 'text-green-600' :
                      selectedSubmission.type === 'beschaffungsantrag' ? 'text-purple-600' :
                      selectedSubmission.type === 'reisekostenabrechnung' ? 'text-orange-600' :
                      'text-gray-600'
                    }`}>
                      {selectedSubmission.type === 'urlaubsantrag' ? '🏖️' :
                       selectedSubmission.type === 'dienstreiseantrag' ? '✈️' :
                       selectedSubmission.type === 'beschaffungsantrag' ? '🛒' :
                       selectedSubmission.type === 'reisekostenabrechnung' ? '💳' :
                       '📝'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedSubmission.title}</h3>
                    <p className="text-sm text-gray-800">{getFormTypeLabel(selectedSubmission.type)}</p>
                  </div>
                </div>
                <button
                  onClick={closeSubmissionModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              {/* Status and Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                    selectedSubmission.status === 'Abgeschlossen' ? 'bg-green-100 text-green-800' :
                    selectedSubmission.status === 'In Bearbeitung' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Eingereicht von</p>
                  <p className="text-sm text-gray-900 mt-1">{selectedSubmission.submittedBy}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Datum</p>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(selectedSubmission.submittedAt)}</p>
                </div>
              </div>

              {/* Form Data */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Formulardaten</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(selectedSubmission.formData).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="text-sm text-gray-900 mt-1">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Beschreibung</h4>
                <p className="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                  {selectedSubmission.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 text-lg">⚠️</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">Formular löschen</h3>
                    {isAdmin && (
                      <span className="text-xs bg-purple-500/50 text-white px-2 py-0.5 rounded-full">Admin</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">Diese Aktion kann nicht rückgängig gemacht werden</p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="text-sm font-medium text-gray-900">{showDeleteConfirm.title}</p>
                <p className="text-sm text-gray-800 mt-1">{showDeleteConfirm.description}</p>
              </div>

              {!isAdmin && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
                  <p className="text-xs text-yellow-800">
                    ⚠️ Sie benötigen ein Passwort zum Löschen
                  </p>
                </div>
              )}

              {isAdmin && (
                <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-4">
                  <p className="text-xs text-purple-800">
                    👑 Admin: Keine Passwort-Eingabe erforderlich
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Löschen
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Popup Forms */}
      <UrlaubsantragForm
        isOpen={openForm === 'urlaubsantrag'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('urlaubsantrag', data)}
      />
      
      <DienstreiseantragForm
        isOpen={openForm === 'dienstreiseantrag'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('dienstreiseantrag', data)}
      />
      
      <BeschaffungsantragForm
        isOpen={openForm === 'beschaffungsantrag'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('beschaffungsantrag', data)}
      />
      
      <ReisekostenabrechnungForm
        isOpen={openForm === 'reisekostenabrechnung'}
        onClose={() => setOpenForm(null)}
        onSubmit={(data) => handleFormSubmit('reisekostenabrechnung', data)}
      />

      {openForm === 'hr_self_service' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Self-Service Antrag</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
                <input
                  type="text"
                  value={selfServiceForm.employeeName}
                  onChange={(e) => setSelfServiceForm({ ...selfServiceForm, employeeName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Vor- und Nachname"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anliegen</label>
                <select
                  value={selfServiceForm.requestType}
                  onChange={(e) => setSelfServiceForm({ ...selfServiceForm, requestType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="adressaenderung">Adressaenderung</option>
                  <option value="bankverbindung">Bankverbindung aktualisieren</option>
                  <option value="steuerklasse">Steuerklasse aendern</option>
                  <option value="familienstand">Familienstand aktualisieren</option>
                  <option value="bescheinigung">Bescheinigung anfordern</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                <textarea
                  value={selfServiceForm.details}
                  onChange={(e) => setSelfServiceForm({ ...selfServiceForm, details: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={4}
                  placeholder="Bitte beschreiben Sie kurz Ihr Anliegen."
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  handleFormSubmit('hr_self_service', selfServiceForm)
                  setSelfServiceForm({ employeeName: '', requestType: 'adressaenderung', details: '' })
                  setOpenForm(null)
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Antrag absenden
              </button>
              <button
                onClick={() => setOpenForm(null)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
