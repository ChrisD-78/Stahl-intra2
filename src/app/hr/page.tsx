'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface Employee {
  id: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  department?: string | null
  position?: string | null
  birthday?: string | null
  emergency_contact?: string | null
  emergency_phone?: string | null
  status: string
}

interface SickLeave {
  id: string
  employee_name: string
  department?: string | null
  start_date: string
  end_date?: string | null
  reason?: string | null
  status: string
  au_file_name?: string | null
  au_file_url?: string | null
  submitted_by: string
}

interface Benefit {
  id: string
  title: string
  description?: string | null
  category?: string | null
  is_active: boolean
  created_by: string
}

interface Review {
  id: string
  employee_name: string
  reviewer_name?: string | null
  review_date?: string | null
  review_type?: string | null
  goals?: string | null
  notes?: string | null
  status: string
  created_by: string
}

const sickStatusOptions = ['eingereicht', 'geprueft', 'freigegeben', 'abgeschlossen']
const reviewStatusOptions = ['geplant', 'durchgefuehrt', 'nachbereitung']

export default function HRPage() {
  const { isLoggedIn, currentUser, isAdmin, userRole } = useAuth()
  const resolvedRole = userRole || (isAdmin ? 'Admin' : 'Benutzer')
  const canView = resolvedRole === 'Admin' || resolvedRole === 'Personal' || resolvedRole === 'Verwaltung'
  const canManage = resolvedRole === 'Admin' || resolvedRole === 'Personal'
  const employeeSectionRef = useRef<HTMLDivElement | null>(null)
  const sickSectionRef = useRef<HTMLDivElement | null>(null)
  const benefitsSectionRef = useRef<HTMLDivElement | null>(null)
  const reviewSectionRef = useRef<HTMLDivElement | null>(null)

  const [employees, setEmployees] = useState<Employee[]>([])
  const [sickLeaves, setSickLeaves] = useState<SickLeave[]>([])
  const [benefits, setBenefits] = useState<Benefit[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  const [showEmployeeForm, setShowEmployeeForm] = useState(false)
  const [showSickForm, setShowSickForm] = useState(false)
  const [showBenefitForm, setShowBenefitForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false)
  const [showSickDetails, setShowSickDetails] = useState(false)
  const [showBenefitDetails, setShowBenefitDetails] = useState(false)
  const [showReviewDetails, setShowReviewDetails] = useState(false)

  const [employeeForm, setEmployeeForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    birthday: '',
    emergency_contact: '',
    emergency_phone: '',
    status: 'aktiv'
  })
  const [sickForm, setSickForm] = useState({
    employee_name: '',
    department: '',
    start_date: '',
    end_date: '',
    reason: ''
  })
  const [sickFile, setSickFile] = useState<File | null>(null)
  const [benefitForm, setBenefitForm] = useState({
    title: '',
    description: '',
    category: '',
    is_active: true
  })
  const [reviewForm, setReviewForm] = useState({
    employee_name: '',
    reviewer_name: '',
    review_date: '',
    review_type: '',
    goals: '',
    notes: '',
    status: 'geplant'
  })

  const loadEmployees = async () => {
    const response = await fetch('/api/hr/employees')
    if (response.ok) setEmployees(await response.json())
  }
  const loadSickLeaves = async () => {
    const response = await fetch('/api/hr/sick-leaves')
    if (response.ok) setSickLeaves(await response.json())
  }
  const loadBenefits = async () => {
    const response = await fetch('/api/hr/benefits')
    if (response.ok) setBenefits(await response.json())
  }
  const loadReviews = async () => {
    const response = await fetch('/api/hr/reviews')
    if (response.ok) setReviews(await response.json())
  }

  useEffect(() => {
    if (!isLoggedIn) return
    if (canManage) {
      loadEmployees()
      loadBenefits()
      loadReviews()
    }
    loadSickLeaves()
  }, [isLoggedIn, canManage])

  const overviewRows = useMemo(() => {
    const rows: Array<{ area: string; title: string; status?: string; detail?: string }> = []

    employees.forEach((employee) => {
      rows.push({
        area: 'Mitarbeiter',
        title: `${employee.first_name} ${employee.last_name}`,
        status: employee.status || 'aktiv',
        detail: `${employee.department || 'Ohne Abteilung'} · ${employee.position || 'Ohne Position'}`
      })
    })

    sickLeaves.forEach((entry) => {
      rows.push({
        area: 'Krankmeldung',
        title: entry.employee_name,
        status: entry.status,
        detail: `${entry.start_date} bis ${entry.end_date || '-'}`
      })
    })

    benefits.forEach((benefit) => {
      rows.push({
        area: 'Benefit',
        title: benefit.title,
        status: benefit.is_active ? 'aktiv' : 'inaktiv',
        detail: benefit.category || 'Allgemein'
      })
    })

    reviews.forEach((review) => {
      rows.push({
        area: 'Gespraech',
        title: review.employee_name,
        status: review.status,
        detail: review.review_date || '-'
      })
    })

    return rows
  }, [employees, sickLeaves, benefits, reviews])

  const handleCreateEmployee = async () => {
    if (!employeeForm.first_name || !employeeForm.last_name) return
    const response = await fetch('/api/hr/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeForm)
    })
    if (response.ok) {
      setShowEmployeeForm(false)
      setEmployeeForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        birthday: '',
        emergency_contact: '',
        emergency_phone: '',
        status: 'aktiv'
      })
      loadEmployees()
    }
  }

  const handleCreateSickLeave = async () => {
    if (!currentUser || !sickForm.employee_name || !sickForm.start_date) return
    let filePayload: { name?: string; publicUrl?: string } = {}
    if (sickFile) {
      const uploadData = new FormData()
      uploadData.append('file', sickFile)
      const uploadResponse = await fetch('/api/upload/document', { method: 'POST', body: uploadData })
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()
        filePayload = { name: uploadResult.name, publicUrl: uploadResult.publicUrl }
      }
    }
    const response = await fetch('/api/hr/sick-leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sickForm,
        au_file_name: filePayload.name || null,
        au_file_url: filePayload.publicUrl || null,
        submitted_by: currentUser
      })
    })
    if (response.ok) {
      setShowSickForm(false)
      setSickForm({ employee_name: '', department: '', start_date: '', end_date: '', reason: '' })
      setSickFile(null)
      loadSickLeaves()
    }
  }

  const handleCreateBenefit = async () => {
    if (!currentUser || !benefitForm.title) return
    const response = await fetch('/api/hr/benefits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...benefitForm, created_by: currentUser })
    })
    if (response.ok) {
      setShowBenefitForm(false)
      setBenefitForm({ title: '', description: '', category: '', is_active: true })
      loadBenefits()
    }
  }

  const handleCreateReview = async () => {
    if (!currentUser || !reviewForm.employee_name) return
    const response = await fetch('/api/hr/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...reviewForm, created_by: currentUser })
    })
    if (response.ok) {
      setShowReviewForm(false)
      setReviewForm({
        employee_name: '',
        reviewer_name: '',
        review_date: '',
        review_type: '',
        goals: '',
        notes: '',
        status: 'geplant'
      })
      loadReviews()
    }
  }


  const handleUpdateSickStatus = async (id: string, status: string) => {
    await fetch(`/api/hr/sick-leaves/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    loadSickLeaves()
  }

  const handleUpdateReviewStatus = async (id: string, status: string) => {
    await fetch(`/api/hr/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    loadReviews()
  }


  if (!isLoggedIn) {
    return null
  }
  if (!canView) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Kein Zugriff</h2>
        <p className="text-sm text-gray-600">Dieser Bereich ist nur fuer Personal, Verwaltung und Admin verfuegbar.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 lg:p-10 text-white">
        <h1 className="text-2xl lg:text-4xl font-extrabold mb-2">🧑‍💼 HR</h1>
        <p className="text-white/90 max-w-3xl">
          Mitarbeiterverwaltung, Krankmeldungen, Benefits, Mitarbeitergespraeche und Self-Service.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-shadow">
          <p className="text-xs uppercase tracking-wide text-gray-500">Mitarbeiterverwaltung</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{employees.length}</p>
          <p className="text-sm text-gray-600 mt-1">Aktive Datensaetze</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-shadow">
          <p className="text-xs uppercase tracking-wide text-gray-500">Krankmeldungen</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{sickLeaves.length}</p>
          <p className="text-sm text-gray-600 mt-1">Eintraege gesamt</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-shadow">
          <p className="text-xs uppercase tracking-wide text-gray-500">Benefits-Uebersicht</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{benefits.length}</p>
          <p className="text-sm text-gray-600 mt-1">Angebote</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 hover:shadow-xl transition-shadow">
          <p className="text-xs uppercase tracking-wide text-gray-500">Mitarbeitergespraeche</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{reviews.length}</p>
          <p className="text-sm text-gray-600 mt-1">Vorgaenge</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-4 lg:p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Gesamtuebersicht</h2>
          <p className="text-sm text-gray-500">Alle Daten aus den HR-Bereichen auf einen Blick.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Bereich</th>
                <th className="px-4 py-3 text-left font-semibold">Eintrag</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overviewRows.map((row, index) => (
                <tr key={`${row.area}-${row.title}-${index}`} className="text-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900">{row.area}</td>
                  <td className="px-4 py-3">{row.title}</td>
                  <td className="px-4 py-3">{row.status || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{row.detail || '-'}</td>
                </tr>
              ))}
              {overviewRows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={4}>
                    Keine Daten vorhanden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div ref={employeeSectionRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900">Mitarbeiterverwaltung</h2>
            <div className="flex flex-wrap gap-2">
              {canManage && (
                <button
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => setShowEmployeeForm(!showEmployeeForm)}
                >
                  Neuer Mitarbeiter
                </button>
              )}
              <button
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowEmployeeDetails((prev) => !prev)}
              >
                Details anzeigen
              </button>
            </div>
          </div>
          {showEmployeeForm && canManage && (
            <div className="border border-indigo-200 rounded-xl p-4 mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                placeholder="Vorname"
                value={employeeForm.first_name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Nachname"
                value={employeeForm.last_name}
                onChange={(e) => setEmployeeForm({ ...employeeForm, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="E-Mail"
                value={employeeForm.email}
                onChange={(e) => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Telefon"
                value={employeeForm.phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Abteilung"
                value={employeeForm.department}
                onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Position"
                value={employeeForm.position}
                onChange={(e) => setEmployeeForm({ ...employeeForm, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                type="date"
                value={employeeForm.birthday}
                onChange={(e) => setEmployeeForm({ ...employeeForm, birthday: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Notfallkontakt"
                value={employeeForm.emergency_contact}
                onChange={(e) => setEmployeeForm({ ...employeeForm, emergency_contact: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Notfalltelefon"
                value={employeeForm.emergency_phone}
                onChange={(e) => setEmployeeForm({ ...employeeForm, emergency_phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <div className="md:col-span-2 flex gap-3">
                <button
                  onClick={handleCreateEmployee}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setShowEmployeeForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
          <div className="space-y-3 text-sm text-gray-600">
            {employees.map((employee) => (
              <div key={employee.id} className="border border-gray-100 rounded-lg p-3">
                <p className="text-gray-900 font-medium">
                  {employee.first_name} {employee.last_name}
                </p>
                <p className="text-xs text-gray-500">
                  {employee.department || '-'} · {employee.position || '-'}
                </p>
                <p className="text-xs text-gray-500">Kontakt: {employee.email || employee.phone || '-'}</p>
              </div>
            ))}
            {employees.length === 0 && <p>Keine Mitarbeiter erfasst</p>}
            {!canManage && <p className="text-xs text-gray-500">Nur HR/Admin sieht die Mitarbeiterliste.</p>}
          </div>
          {showEmployeeDetails && (
            <div className="mt-5 overflow-x-auto border border-gray-100 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Abteilung</th>
                    <th className="px-4 py-2 text-left font-semibold">Position</th>
                    <th className="px-4 py-2 text-left font-semibold">Kontakt</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {employees.map((employee) => (
                    <tr key={`emp-${employee.id}`}>
                      <td className="px-4 py-2 font-medium text-gray-900">
                        {employee.first_name} {employee.last_name}
                      </td>
                      <td className="px-4 py-2">{employee.department || '-'}</td>
                      <td className="px-4 py-2">{employee.position || '-'}</td>
                      <td className="px-4 py-2">{employee.email || employee.phone || '-'}</td>
                      <td className="px-4 py-2">{employee.status || '-'}</td>
                    </tr>
                  ))}
                  {employees.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-center text-gray-500" colSpan={5}>
                        Keine Daten vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div ref={sickSectionRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900">Krankmeldungen</h2>
            <div className="flex flex-wrap gap-2">
              <button
                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                onClick={() => setShowSickForm(!showSickForm)}
              >
                Krankmeldung einreichen
              </button>
              <button
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowSickDetails((prev) => !prev)}
              >
                Details anzeigen
              </button>
            </div>
          </div>
          {showSickForm && (
            <div className="border border-indigo-200 rounded-xl p-4 mb-4 grid grid-cols-1 gap-3">
              <input
                placeholder="Mitarbeiter"
                value={sickForm.employee_name}
                onChange={(e) => setSickForm({ ...sickForm, employee_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Abteilung"
                value={sickForm.department}
                onChange={(e) => setSickForm({ ...sickForm, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                type="date"
                value={sickForm.start_date}
                onChange={(e) => setSickForm({ ...sickForm, start_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                type="date"
                value={sickForm.end_date}
                onChange={(e) => setSickForm({ ...sickForm, end_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <textarea
                placeholder="Grund/Notiz"
                value={sickForm.reason}
                onChange={(e) => setSickForm({ ...sickForm, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                rows={2}
              />
              <input
                type="file"
                onChange={(e) => setSickFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCreateSickLeave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Absenden
                </button>
                <button
                  onClick={() => setShowSickForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
          <div className="space-y-3 text-sm text-gray-600">
            {sickLeaves.map((entry) => (
              <div key={entry.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">{entry.employee_name}</p>
                    <p className="text-xs text-gray-500">
                      {entry.start_date} bis {entry.end_date || '-'} · {entry.department || '-'}
                    </p>
                  </div>
                  {canManage ? (
                    <select
                      value={entry.status}
                      onChange={(e) => handleUpdateSickStatus(entry.id, e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs"
                    >
                      {sickStatusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-500">{entry.status}</span>
                  )}
                </div>
                {entry.au_file_url && (
                  <a className="text-xs text-indigo-600" href={entry.au_file_url} target="_blank" rel="noreferrer">
                    AU anzeigen
                  </a>
                )}
              </div>
            ))}
            {sickLeaves.length === 0 && <p>Keine Krankmeldungen vorhanden</p>}
          </div>
          {showSickDetails && (
            <div className="mt-5 overflow-x-auto border border-gray-100 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Mitarbeiter</th>
                    <th className="px-4 py-2 text-left font-semibold">Abteilung</th>
                    <th className="px-4 py-2 text-left font-semibold">Zeitraum</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">AU</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {sickLeaves.map((entry) => (
                    <tr key={`sick-${entry.id}`}>
                      <td className="px-4 py-2 font-medium text-gray-900">{entry.employee_name}</td>
                      <td className="px-4 py-2">{entry.department || '-'}</td>
                      <td className="px-4 py-2">{entry.start_date} – {entry.end_date || '-'}</td>
                      <td className="px-4 py-2">{entry.status}</td>
                      <td className="px-4 py-2">
                        {entry.au_file_url ? (
                          <a className="text-indigo-600" href={entry.au_file_url} target="_blank" rel="noreferrer">
                            AU
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                  {sickLeaves.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-center text-gray-500" colSpan={5}>
                        Keine Daten vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div ref={benefitsSectionRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900">Benefits-Uebersicht</h2>
            <div className="flex flex-wrap gap-2">
              {canManage && (
                <button
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => setShowBenefitForm(!showBenefitForm)}
                >
                  Benefit Uebersicht
                </button>
              )}
              <button
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowBenefitDetails((prev) => !prev)}
              >
                Details anzeigen
              </button>
            </div>
          </div>
          {showBenefitForm && canManage && (
            <div className="border border-indigo-200 rounded-xl p-4 mb-4 grid grid-cols-1 gap-3">
              <input
                placeholder="Titel"
                value={benefitForm.title}
                onChange={(e) => setBenefitForm({ ...benefitForm, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Kategorie"
                value={benefitForm.category}
                onChange={(e) => setBenefitForm({ ...benefitForm, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <textarea
                placeholder="Beschreibung"
                value={benefitForm.description}
                onChange={(e) => setBenefitForm({ ...benefitForm, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                rows={2}
              />
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={benefitForm.is_active}
                  onChange={(e) => setBenefitForm({ ...benefitForm, is_active: e.target.checked })}
                />
                Aktiv
              </label>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateBenefit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setShowBenefitForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
          <div className="space-y-3 text-sm text-gray-600">
            {benefits.map((benefit) => (
              <div key={benefit.id} className="border border-gray-100 rounded-lg p-3">
                <p className="text-gray-900 font-medium">{benefit.title}</p>
                <p className="text-xs text-gray-500">{benefit.category || 'Allgemein'}</p>
                <p className="text-xs text-gray-500">{benefit.description || 'Keine Beschreibung'}</p>
              </div>
            ))}
            {benefits.length === 0 && <p>Keine Benefits hinterlegt</p>}
          </div>
          {showBenefitDetails && (
            <div className="mt-5 overflow-x-auto border border-gray-100 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Benefit</th>
                    <th className="px-4 py-2 text-left font-semibold">Kategorie</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Beschreibung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {benefits.map((benefit) => (
                    <tr key={`benefit-${benefit.id}`}>
                      <td className="px-4 py-2 font-medium text-gray-900">{benefit.title}</td>
                      <td className="px-4 py-2">{benefit.category || 'Allgemein'}</td>
                      <td className="px-4 py-2">{benefit.is_active ? 'aktiv' : 'inaktiv'}</td>
                      <td className="px-4 py-2">{benefit.description || '-'}</td>
                    </tr>
                  ))}
                  {benefits.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-center text-gray-500" colSpan={4}>
                        Keine Daten vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div ref={reviewSectionRef} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <h2 className="text-xl font-bold text-gray-900">Mitarbeitergespraeche</h2>
            <div className="flex flex-wrap gap-2">
              {canManage && (
                <button
                  className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  onClick={() => setShowReviewForm(!showReviewForm)}
                >
                  Mitarbeitergespraeche
                </button>
              )}
              <button
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowReviewDetails((prev) => !prev)}
              >
                Details anzeigen
              </button>
            </div>
          </div>
          {showReviewForm && canManage && (
            <div className="border border-indigo-200 rounded-xl p-4 mb-4 grid grid-cols-1 gap-3">
              <input
                placeholder="Mitarbeiter"
                value={reviewForm.employee_name}
                onChange={(e) => setReviewForm({ ...reviewForm, employee_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Vorgesetzter"
                value={reviewForm.reviewer_name}
                onChange={(e) => setReviewForm({ ...reviewForm, reviewer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                type="date"
                value={reviewForm.review_date}
                onChange={(e) => setReviewForm({ ...reviewForm, review_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <input
                placeholder="Typ (z.B. Jahresgespraech)"
                value={reviewForm.review_type}
                onChange={(e) => setReviewForm({ ...reviewForm, review_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              />
              <textarea
                placeholder="Ziele"
                value={reviewForm.goals}
                onChange={(e) => setReviewForm({ ...reviewForm, goals: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                rows={2}
              />
              <textarea
                placeholder="Notizen"
                value={reviewForm.notes}
                onChange={(e) => setReviewForm({ ...reviewForm, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                rows={2}
              />
              <select
                value={reviewForm.status}
                onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
              >
                {reviewStatusOptions.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateReview}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
          <div className="space-y-3 text-sm text-gray-600">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">{review.employee_name}</p>
                    <p className="text-xs text-gray-500">{review.review_date || '-'} · {review.review_type || 'Gespraech'}</p>
                  </div>
                  {canManage ? (
                    <select
                      value={review.status}
                      onChange={(e) => handleUpdateReviewStatus(review.id, e.target.value)}
                      className="border border-gray-200 rounded px-2 py-1 text-xs"
                    >
                      {reviewStatusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-gray-500">{review.status}</span>
                  )}
                </div>
              </div>
            ))}
            {reviews.length === 0 && <p>Keine Gespraeche geplant</p>}
          </div>
          {showReviewDetails && (
            <div className="mt-5 overflow-x-auto border border-gray-100 rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Mitarbeiter</th>
                    <th className="px-4 py-2 text-left font-semibold">Typ</th>
                    <th className="px-4 py-2 text-left font-semibold">Datum</th>
                    <th className="px-4 py-2 text-left font-semibold">Status</th>
                    <th className="px-4 py-2 text-left font-semibold">Vorgesetzter</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {reviews.map((review) => (
                    <tr key={`review-${review.id}`}>
                      <td className="px-4 py-2 font-medium text-gray-900">{review.employee_name}</td>
                      <td className="px-4 py-2">{review.review_type || 'Gespraech'}</td>
                      <td className="px-4 py-2">{review.review_date || '-'}</td>
                      <td className="px-4 py-2">{review.status}</td>
                      <td className="px-4 py-2">{review.reviewer_name || '-'}</td>
                    </tr>
                  ))}
                  {reviews.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-center text-gray-500" colSpan={5}>
                        Keine Daten vorhanden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
