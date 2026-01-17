'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'

type DocumentStatus = 'offen' | 'geprueft' | 'gebucht' | 'bezahlt'
type DocumentType = 'eingang' | 'ausgang' | 'quittung' | 'beleg'
type PaymentStatus = 'geplant' | 'gezahlt' | 'storniert'
type TravelStatus = 'eingereicht' | 'geprueft' | 'freigegeben' | 'ausgezahlt'

interface AccountingDocument {
  id: string
  doc_type: DocumentType
  title: string
  vendor_name?: string | null
  amount: number
  currency: string
  category?: string | null
  status: DocumentStatus
  document_date?: string | null
  due_date?: string | null
  description?: string | null
  file_name?: string | null
  file_url?: string | null
  uploaded_by: string
  created_at: string
  updated_at: string
}

interface DocumentComment {
  id: string
  document_id: string
  comment: string
  created_by: string
  created_at: string
}

interface Counterparty {
  id: string
  counterparty_type: 'lieferant' | 'kunde'
  name: string
  iban?: string | null
  bic?: string | null
  tax_id?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
}

interface Payment {
  id: string
  document_id?: string | null
  label: string
  amount: number
  due_date?: string | null
  status: PaymentStatus
  paid_at?: string | null
  method?: string | null
}

interface CashbookEntry {
  id: string
  entry_type: 'ein' | 'aus'
  amount: number
  entry_date: string
  description?: string | null
  category?: string | null
  reference?: string | null
  created_by: string
}

interface TravelExpense {
  id: string
  employee_name: string
  start_date?: string | null
  end_date?: string | null
  purpose?: string | null
  kilometers?: number | null
  mileage_rate?: number | null
  meals?: number | null
  lodging?: number | null
  other_costs?: number | null
  total_amount?: number | null
  status: TravelStatus
  created_by: string
}

const documentStatusOptions: DocumentStatus[] = ['offen', 'geprueft', 'gebucht', 'bezahlt']
const documentTypeOptions: { value: DocumentType; label: string }[] = [
  { value: 'eingang', label: 'Eingangsrechnung' },
  { value: 'ausgang', label: 'Ausgangsrechnung' },
  { value: 'quittung', label: 'Quittung' },
  { value: 'beleg', label: 'Beleg' }
]

const paymentStatusOptions: PaymentStatus[] = ['geplant', 'gezahlt', 'storniert']
const travelStatusOptions: TravelStatus[] = ['eingereicht', 'geprueft', 'freigegeben', 'ausgezahlt']

const formatCurrency = (value: number | null | undefined, currency = 'EUR') => {
  if (value === null || value === undefined || Number.isNaN(value)) return '-'
  return `${value.toFixed(2)} ${currency}`
}

const isPastDate = (value?: string | null) => {
  if (!value) return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.getTime() < Date.now()
}

export default function BuchhaltungPage() {
  const { isLoggedIn, currentUser, isAdmin, userRole } = useAuth()
  const resolvedRole = userRole || (isAdmin ? 'Admin' : 'Benutzer')
  const permissions = {
    documents: resolvedRole === 'Admin' || resolvedRole === 'Verwaltung',
    documentsEdit: resolvedRole === 'Admin' || resolvedRole === 'Verwaltung',
    payments: resolvedRole === 'Admin' || resolvedRole === 'Verwaltung',
    paymentsEdit: resolvedRole === 'Admin' || resolvedRole === 'Verwaltung',
    masterdata: resolvedRole === 'Admin' || resolvedRole === 'Verwaltung',
    masterdataEdit: resolvedRole === 'Admin' || resolvedRole === 'Verwaltung',
    cashbook: resolvedRole === 'Admin' || resolvedRole === 'Verwaltung',
    cashbookEdit: resolvedRole === 'Admin' || resolvedRole === 'Verwaltung',
    travel: true,
    travelEdit: true,
    reports: resolvedRole === 'Admin' || resolvedRole === 'Verwaltung'
  }

  const [documents, setDocuments] = useState<AccountingDocument[]>([])
  const [counterparties, setCounterparties] = useState<Counterparty[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [cashbookEntries, setCashbookEntries] = useState<CashbookEntry[]>([])
  const [travelExpenses, setTravelExpenses] = useState<TravelExpense[]>([])
  const [comments, setComments] = useState<DocumentComment[]>([])
  const [selectedDocument, setSelectedDocument] = useState<AccountingDocument | null>(null)

  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [loadingComments, setLoadingComments] = useState(false)

  const [docQuery, setDocQuery] = useState('')
  const [docStatusFilter, setDocStatusFilter] = useState<string>('')
  const [docTypeFilter, setDocTypeFilter] = useState<string>('')

  const [showDocForm, setShowDocForm] = useState(false)
  const [showCounterpartyForm, setShowCounterpartyForm] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [showCashbookForm, setShowCashbookForm] = useState(false)
  const [showTravelForm, setShowTravelForm] = useState(false)
  const [showCommentModal, setShowCommentModal] = useState(false)

  const [commentText, setCommentText] = useState('')
  const [docForm, setDocForm] = useState({
    doc_type: 'eingang' as DocumentType,
    title: '',
    vendor_name: '',
    amount: '',
    currency: 'EUR',
    category: '',
    status: 'offen' as DocumentStatus,
    document_date: '',
    due_date: '',
    description: ''
  })
  const [docFile, setDocFile] = useState<File | null>(null)

  const [counterpartyForm, setCounterpartyForm] = useState({
    counterparty_type: 'lieferant' as Counterparty['counterparty_type'],
    name: '',
    iban: '',
    bic: '',
    tax_id: '',
    email: '',
    phone: '',
    address: ''
  })

  const [paymentForm, setPaymentForm] = useState({
    label: '',
    amount: '',
    due_date: '',
    status: 'geplant' as PaymentStatus,
    method: ''
  })

  const [cashbookForm, setCashbookForm] = useState({
    entry_type: 'ein' as CashbookEntry['entry_type'],
    amount: '',
    entry_date: '',
    description: '',
    category: '',
    reference: ''
  })

  const [travelForm, setTravelForm] = useState({
    employee_name: '',
    start_date: '',
    end_date: '',
    purpose: '',
    kilometers: '',
    mileage_rate: '',
    meals: '',
    lodging: '',
    other_costs: '',
    total_amount: '',
    status: 'eingereicht' as TravelStatus
  })

  const loadDocuments = async () => {
    setLoadingDocuments(true)
    try {
      const params = new URLSearchParams()
      if (docQuery) params.set('q', docQuery)
      if (docStatusFilter) params.set('status', docStatusFilter)
      if (docTypeFilter) params.set('type', docTypeFilter)
      const response = await fetch(`/api/buchhaltung/documents?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error('Failed to load documents:', error)
    } finally {
      setLoadingDocuments(false)
    }
  }

  const loadCounterparties = async () => {
    try {
      const response = await fetch('/api/buchhaltung/counterparties')
      if (response.ok) {
        setCounterparties(await response.json())
      }
    } catch (error) {
      console.error('Failed to load counterparties:', error)
    }
  }

  const loadPayments = async () => {
    try {
      const response = await fetch('/api/buchhaltung/payments')
      if (response.ok) {
        setPayments(await response.json())
      }
    } catch (error) {
      console.error('Failed to load payments:', error)
    }
  }

  const loadCashbookEntries = async () => {
    try {
      const response = await fetch('/api/buchhaltung/cashbook')
      if (response.ok) {
        setCashbookEntries(await response.json())
      }
    } catch (error) {
      console.error('Failed to load cashbook entries:', error)
    }
  }

  const loadTravelExpenses = async () => {
    try {
      const response = await fetch('/api/buchhaltung/travel-expenses')
      if (response.ok) {
        setTravelExpenses(await response.json())
      }
    } catch (error) {
      console.error('Failed to load travel expenses:', error)
    }
  }

  const loadComments = async (documentId: string) => {
    setLoadingComments(true)
    try {
      const response = await fetch(`/api/buchhaltung/comments?document_id=${documentId}`)
      if (response.ok) {
        setComments(await response.json())
      }
    } catch (error) {
      console.error('Failed to load comments:', error)
    } finally {
      setLoadingComments(false)
    }
  }

  useEffect(() => {
    if (!isLoggedIn || !permissions.documents) return
    loadDocuments()
  }, [isLoggedIn, permissions.documents, docQuery, docStatusFilter, docTypeFilter])

  useEffect(() => {
    if (!isLoggedIn) return
    if (permissions.masterdata) loadCounterparties()
    if (permissions.payments) loadPayments()
    if (permissions.cashbook) loadCashbookEntries()
    if (permissions.travel) loadTravelExpenses()
  }, [isLoggedIn, permissions])

  const handleCreateDocument = async () => {
    if (!currentUser) return
    if (!docForm.title || !docForm.amount) return

    let filePayload: { name?: string; publicUrl?: string } = {}
    if (docFile) {
      const uploadData = new FormData()
      uploadData.append('file', docFile)
      const uploadResponse = await fetch('/api/upload/document', { method: 'POST', body: uploadData })
      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json()
        filePayload = {
          name: uploadResult.name,
          publicUrl: uploadResult.publicUrl
        }
      }
    }

    const response = await fetch('/api/buchhaltung/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...docForm,
        amount: parseFloat(docForm.amount),
        file_name: filePayload.name || docFile?.name || null,
        file_url: filePayload.publicUrl || null,
        uploaded_by: currentUser
      })
    })

    if (response.ok) {
      setShowDocForm(false)
      setDocForm({
        doc_type: 'eingang',
        title: '',
        vendor_name: '',
        amount: '',
        currency: 'EUR',
        category: '',
        status: 'offen',
        document_date: '',
        due_date: '',
        description: ''
      })
      setDocFile(null)
      loadDocuments()
    }
  }

  const handleUpdateDocumentStatus = async (docId: string, status: DocumentStatus) => {
    await fetch(`/api/buchhaltung/documents/${docId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    loadDocuments()
  }

  const handleCreateCounterparty = async () => {
    const response = await fetch('/api/buchhaltung/counterparties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(counterpartyForm)
    })
    if (response.ok) {
      setShowCounterpartyForm(false)
      setCounterpartyForm({
        counterparty_type: 'lieferant',
        name: '',
        iban: '',
        bic: '',
        tax_id: '',
        email: '',
        phone: '',
        address: ''
      })
      loadCounterparties()
    }
  }

  const handleCreatePayment = async () => {
    if (!paymentForm.label || !paymentForm.amount) return
    const response = await fetch('/api/buchhaltung/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        label: paymentForm.label,
        amount: parseFloat(paymentForm.amount),
        due_date: paymentForm.due_date || null,
        status: paymentForm.status,
        method: paymentForm.method || null
      })
    })
    if (response.ok) {
      setShowPaymentForm(false)
      setPaymentForm({ label: '', amount: '', due_date: '', status: 'geplant', method: '' })
      loadPayments()
    }
  }

  const handleCreateCashbookEntry = async () => {
    if (!currentUser) return
    if (!cashbookForm.amount || !cashbookForm.entry_date) return
    const response = await fetch('/api/buchhaltung/cashbook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entry_type: cashbookForm.entry_type,
        amount: parseFloat(cashbookForm.amount),
        entry_date: cashbookForm.entry_date,
        description: cashbookForm.description || null,
        category: cashbookForm.category || null,
        reference: cashbookForm.reference || null,
        created_by: currentUser
      })
    })
    if (response.ok) {
      setShowCashbookForm(false)
      setCashbookForm({
        entry_type: 'ein',
        amount: '',
        entry_date: '',
        description: '',
        category: '',
        reference: ''
      })
      loadCashbookEntries()
    }
  }

  const handleCreateTravelExpense = async () => {
    if (!currentUser) return
    if (!travelForm.employee_name) return
    const response = await fetch('/api/buchhaltung/travel-expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_name: travelForm.employee_name,
        start_date: travelForm.start_date || null,
        end_date: travelForm.end_date || null,
        purpose: travelForm.purpose || null,
        kilometers: travelForm.kilometers ? parseFloat(travelForm.kilometers) : null,
        mileage_rate: travelForm.mileage_rate ? parseFloat(travelForm.mileage_rate) : null,
        meals: travelForm.meals ? parseFloat(travelForm.meals) : null,
        lodging: travelForm.lodging ? parseFloat(travelForm.lodging) : null,
        other_costs: travelForm.other_costs ? parseFloat(travelForm.other_costs) : null,
        total_amount: travelForm.total_amount ? parseFloat(travelForm.total_amount) : null,
        status: travelForm.status,
        created_by: currentUser
      })
    })
    if (response.ok) {
      setShowTravelForm(false)
      setTravelForm({
        employee_name: '',
        start_date: '',
        end_date: '',
        purpose: '',
        kilometers: '',
        mileage_rate: '',
        meals: '',
        lodging: '',
        other_costs: '',
        total_amount: '',
        status: 'eingereicht'
      })
      loadTravelExpenses()
    }
  }

  const handleAddComment = async () => {
    if (!currentUser || !selectedDocument || !commentText.trim()) return
    const response = await fetch('/api/buchhaltung/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        document_id: selectedDocument.id,
        comment: commentText.trim(),
        created_by: currentUser
      })
    })
    if (response.ok) {
      setCommentText('')
      loadComments(selectedDocument.id)
    }
  }

  const offeneEingang = useMemo(
    () => documents.filter((doc) => doc.doc_type === 'eingang' && doc.status !== 'bezahlt'),
    [documents]
  )
  const offeneAusgang = useMemo(
    () => documents.filter((doc) => doc.doc_type === 'ausgang' && doc.status !== 'bezahlt'),
    [documents]
  )
  const mahnungen = useMemo(
    () => documents.filter((doc) => doc.status === 'offen' && isPastDate(doc.due_date)),
    [documents]
  )
  const anstehendeZahlungen = useMemo(
    () => payments.filter((payment) => payment.status === 'geplant'),
    [payments]
  )

  const quickStats = [
    {
      label: 'Offene Eingangsrechnungen',
      value: `${offeneEingang.length}`,
      trend: `${offeneEingang.slice(0, 3).map((doc) => doc.vendor_name).filter(Boolean).join(', ') || 'Keine faelligen'}`
    },
    {
      label: 'Offene Ausgangsrechnungen',
      value: `${offeneAusgang.length}`,
      trend: `${formatCurrency(offeneAusgang.reduce((sum, doc) => sum + doc.amount, 0), 'EUR')}`
    },
    {
      label: 'Anstehende Zahlungen',
      value: `${anstehendeZahlungen.length}`,
      trend: `${anstehendeZahlungen[0]?.due_date ? `naechster Lauf: ${anstehendeZahlungen[0].due_date}` : 'kein Termin'}`
    },
    {
      label: 'Freigaben in Bearbeitung',
      value: `${documents.filter((doc) => doc.status === 'geprueft').length}`,
      trend: 'wartet auf Buchung'
    }
  ]

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-xl p-6 lg:p-10 text-white">
        <h1 className="text-2xl lg:text-4xl font-extrabold mb-2">💶 Buchhaltung</h1>
        <p className="text-white/90 max-w-3xl">
          Zentrale Uebersicht fuer Belege, offene Posten, Zahlungsverkehr und Auswertungen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            <p className="text-xs text-emerald-700 mt-2">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Belegverwaltung</h2>
              {permissions.documentsEdit && (
                <button
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  onClick={() => setShowDocForm(!showDocForm)}
                >
                  Neuer Beleg
                </button>
              )}
            </div>

            {showDocForm && permissions.documentsEdit && (
              <div className="border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                    <select
                      value={docForm.doc_type}
                      onChange={(e) => setDocForm({ ...docForm, doc_type: e.target.value as DocumentType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    >
                      {documentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                    <input
                      value={docForm.title}
                      onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lieferant/Kunde</label>
                    <input
                      value={docForm.vendor_name}
                      onChange={(e) => setDocForm({ ...docForm, vendor_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Betrag</label>
                    <input
                      type="number"
                      value={docForm.amount}
                      onChange={(e) => setDocForm({ ...docForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategorie</label>
                    <input
                      value={docForm.category}
                      onChange={(e) => setDocForm({ ...docForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={docForm.status}
                      onChange={(e) => setDocForm({ ...docForm, status: e.target.value as DocumentStatus })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    >
                      {documentStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Belegdatum</label>
                    <input
                      type="date"
                      value={docForm.document_date}
                      onChange={(e) => setDocForm({ ...docForm, document_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faelligkeit</label>
                    <input
                      type="date"
                      value={docForm.due_date}
                      onChange={(e) => setDocForm({ ...docForm, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                    <textarea
                      value={docForm.description}
                      onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                      rows={2}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Beleg-Datei</label>
                    <input
                      type="file"
                      onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCreateDocument}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setShowDocForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {permissions.documents ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Belegsuche</label>
                    <input
                      type="search"
                      value={docQuery}
                      onChange={(e) => setDocQuery(e.target.value)}
                      placeholder="Suche nach Datum, Lieferant, Betrag, Kategorie"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={docStatusFilter}
                      onChange={(e) => setDocStatusFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    >
                      <option value="">Alle</option>
                      {documentStatusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
                    <select
                      value={docTypeFilter}
                      onChange={(e) => setDocTypeFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900"
                    >
                      <option value="">Alle</option>
                      {documentTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Archiv</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="text-left text-gray-500">
                        <tr>
                          <th className="py-2 pr-4">Datum</th>
                          <th className="py-2 pr-4">Typ</th>
                          <th className="py-2 pr-4">Lieferant</th>
                          <th className="py-2 pr-4">Betrag</th>
                          <th className="py-2 pr-4">Kategorie</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2 pr-4">Aktion</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-700">
                        {loadingDocuments && (
                          <tr>
                            <td className="py-3" colSpan={7}>Lade Belege...</td>
                          </tr>
                        )}
                        {!loadingDocuments && documents.length === 0 && (
                          <tr>
                            <td className="py-3" colSpan={7}>Keine Belege gefunden</td>
                          </tr>
                        )}
                        {documents.map((doc) => (
                          <tr key={doc.id} className="border-t border-gray-100">
                            <td className="py-2 pr-4">{doc.document_date || '-'}</td>
                            <td className="py-2 pr-4">
                              {documentTypeOptions.find((option) => option.value === doc.doc_type)?.label || doc.doc_type}
                            </td>
                            <td className="py-2 pr-4">{doc.vendor_name || '-'}</td>
                            <td className="py-2 pr-4">{formatCurrency(doc.amount, doc.currency)}</td>
                            <td className="py-2 pr-4">{doc.category || '-'}</td>
                            <td className="py-2 pr-4">
                              {permissions.documentsEdit ? (
                                <select
                                  value={doc.status}
                                  onChange={(e) => handleUpdateDocumentStatus(doc.id, e.target.value as DocumentStatus)}
                                  className="border border-gray-200 rounded px-2 py-1 text-sm"
                                >
                                  {documentStatusOptions.map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                              ) : (
                                doc.status
                              )}
                            </td>
                            <td className="py-2 pr-4">
                              <button
                                onClick={() => {
                                  setSelectedDocument(doc)
                                  setShowCommentModal(true)
                                  loadComments(doc.id)
                                }}
                                className="text-emerald-700 text-sm"
                              >
                                Kommentare
                              </button>
                              {doc.file_url && (
                                <a
                                  href={doc.file_url}
                                  className="ml-3 text-sm text-gray-500"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Datei
                                </a>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Zugriff nur fuer Verwaltung oder Admin.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Offene Posten</h2>
            {permissions.documents ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Eingangsrechnungen</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {formatCurrency(offeneEingang.reduce((sum, doc) => sum + doc.amount, 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{offeneEingang.length} offen</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Ausgangsrechnungen</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">
                    {formatCurrency(offeneAusgang.reduce((sum, doc) => sum + doc.amount, 0))}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">{offeneAusgang.length} offen</p>
                </div>
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Mahnwesen</p>
                  <p className="text-lg font-semibold text-gray-900 mt-2">{mahnungen.length} faellig</p>
                  <p className="text-xs text-gray-500 mt-2">Ueberfaellige Belege</p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Zugriff nur fuer Verwaltung oder Admin.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Zahlungsverkehr</h2>
              {permissions.paymentsEdit && (
                <button
                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                >
                  Neue Zahlung
                </button>
              )}
            </div>

            {showPaymentForm && permissions.paymentsEdit && (
              <div className="border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bezeichnung</label>
                    <input
                      value={paymentForm.label}
                      onChange={(e) => setPaymentForm({ ...paymentForm, label: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Betrag</label>
                    <input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Faelligkeit</label>
                    <input
                      type="date"
                      value={paymentForm.due_date}
                      onChange={(e) => setPaymentForm({ ...paymentForm, due_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={paymentForm.status}
                      onChange={(e) => setPaymentForm({ ...paymentForm, status: e.target.value as PaymentStatus })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    >
                      {paymentStatusOptions.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zahlungsmethode</label>
                    <input
                      value={paymentForm.method}
                      onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCreatePayment}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {permissions.payments ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{payment.label}</p>
                      <p className="text-xs text-gray-500">Faellig am {payment.due_date || '-'}</p>
                      <p className="text-xs text-gray-500">Status: {payment.status}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                  </div>
                ))}
                {payments.length === 0 && <p className="text-sm text-gray-500">Keine Zahlungen erfasst</p>}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Zugriff nur fuer Verwaltung oder Admin.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Auswertungen & Reports</h2>
            {permissions.reports ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Monatliche Umsatzuebersicht', filename: 'Monatliche-Umsatzuebersicht.txt' },
                  { title: 'Kostenstellenauswertung', filename: 'Kostenstellenauswertung.txt' },
                  { title: 'Liquiditaetsuebersicht', filename: 'Liquiditaetsuebersicht.txt' }
                ].map((report) => (
                  <div key={report.title} className="border border-gray-200 rounded-xl p-4">
                    <p className="text-sm font-medium text-gray-900">{report.title}</p>
                    <a
                      href="/buchhaltung-dummy-report.pdf"
                      download={report.filename}
                      className="mt-3 inline-flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      Dummy-Download
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Zugriff nur fuer Verwaltung oder Admin.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Stammdaten</h2>
              {permissions.masterdataEdit && (
                <button
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setShowCounterpartyForm(!showCounterpartyForm)}
                >
                  Neuer Kontakt
                </button>
              )}
            </div>

            {showCounterpartyForm && permissions.masterdataEdit && (
              <div className="border border-gray-200 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 gap-3">
                  <select
                    value={counterpartyForm.counterparty_type}
                    onChange={(e) => setCounterpartyForm({ ...counterpartyForm, counterparty_type: e.target.value as Counterparty['counterparty_type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="lieferant">Lieferant</option>
                    <option value="kunde">Kunde</option>
                  </select>
                  <input
                    placeholder="Name"
                    value={counterpartyForm.name}
                    onChange={(e) => setCounterpartyForm({ ...counterpartyForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    placeholder="IBAN"
                    value={counterpartyForm.iban}
                    onChange={(e) => setCounterpartyForm({ ...counterpartyForm, iban: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    placeholder="BIC"
                    value={counterpartyForm.bic}
                    onChange={(e) => setCounterpartyForm({ ...counterpartyForm, bic: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    placeholder="Steuernummer"
                    value={counterpartyForm.tax_id}
                    onChange={(e) => setCounterpartyForm({ ...counterpartyForm, tax_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    placeholder="E-Mail"
                    value={counterpartyForm.email}
                    onChange={(e) => setCounterpartyForm({ ...counterpartyForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    placeholder="Telefon"
                    value={counterpartyForm.phone}
                    onChange={(e) => setCounterpartyForm({ ...counterpartyForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <textarea
                    placeholder="Adresse"
                    value={counterpartyForm.address}
                    onChange={(e) => setCounterpartyForm({ ...counterpartyForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCreateCounterparty}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setShowCounterpartyForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {permissions.masterdata ? (
              <div className="space-y-3 text-sm text-gray-600">
                {counterparties.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-gray-900 font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.counterparty_type.toUpperCase()}</p>
                    <p className="text-xs text-gray-500">IBAN: {item.iban || '-'}</p>
                  </div>
                ))}
                {counterparties.length === 0 && <p>Keine Stammdaten erfasst</p>}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Zugriff nur fuer Verwaltung oder Admin.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Kassenbuch</h2>
              {permissions.cashbookEdit && (
                <button
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  onClick={() => setShowCashbookForm(!showCashbookForm)}
                >
                  Neue Buchung
                </button>
              )}
            </div>

            {showCashbookForm && permissions.cashbookEdit && (
              <div className="border border-gray-200 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 gap-3">
                  <select
                    value={cashbookForm.entry_type}
                    onChange={(e) => setCashbookForm({ ...cashbookForm, entry_type: e.target.value as CashbookEntry['entry_type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    <option value="ein">Einnahme</option>
                    <option value="aus">Ausgabe</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Betrag"
                    value={cashbookForm.amount}
                    onChange={(e) => setCashbookForm({ ...cashbookForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    type="date"
                    value={cashbookForm.entry_date}
                    onChange={(e) => setCashbookForm({ ...cashbookForm, entry_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    placeholder="Kategorie"
                    value={cashbookForm.category}
                    onChange={(e) => setCashbookForm({ ...cashbookForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    placeholder="Referenz"
                    value={cashbookForm.reference}
                    onChange={(e) => setCashbookForm({ ...cashbookForm, reference: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <textarea
                    placeholder="Beschreibung"
                    value={cashbookForm.description}
                    onChange={(e) => setCashbookForm({ ...cashbookForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    rows={2}
                  />
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCreateCashbookEntry}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setShowCashbookForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {permissions.cashbook ? (
              <div className="space-y-3 text-sm text-gray-600">
                {cashbookEntries.map((entry) => (
                  <div key={entry.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-gray-900 font-medium">
                      {entry.entry_type === 'ein' ? 'Einnahme' : 'Ausgabe'} - {formatCurrency(entry.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{entry.entry_date} · {entry.category || 'Ohne Kategorie'}</p>
                  </div>
                ))}
                {cashbookEntries.length === 0 && <p>Keine Kassenbuch-Eintraege</p>}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Zugriff nur fuer Verwaltung oder Admin.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Reisekostenabrechnung</h2>
            {permissions.travelEdit && (
              <button
                className="mb-4 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                onClick={() => setShowTravelForm(!showTravelForm)}
              >
                Neue Abrechnung
              </button>
            )}

            {showTravelForm && permissions.travelEdit && (
              <div className="border border-gray-200 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-1 gap-3">
                  <input
                    placeholder="Mitarbeiter"
                    value={travelForm.employee_name}
                    onChange={(e) => setTravelForm({ ...travelForm, employee_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    type="date"
                    value={travelForm.start_date}
                    onChange={(e) => setTravelForm({ ...travelForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    type="date"
                    value={travelForm.end_date}
                    onChange={(e) => setTravelForm({ ...travelForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <textarea
                    placeholder="Zweck"
                    value={travelForm.purpose}
                    onChange={(e) => setTravelForm({ ...travelForm, purpose: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    rows={2}
                  />
                  <input
                    type="number"
                    placeholder="Kilometer"
                    value={travelForm.kilometers}
                    onChange={(e) => setTravelForm({ ...travelForm, kilometers: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Kilometersatz"
                    value={travelForm.mileage_rate}
                    onChange={(e) => setTravelForm({ ...travelForm, mileage_rate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Verpflegung"
                    value={travelForm.meals}
                    onChange={(e) => setTravelForm({ ...travelForm, meals: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Uebernachtung"
                    value={travelForm.lodging}
                    onChange={(e) => setTravelForm({ ...travelForm, lodging: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Sonstige Kosten"
                    value={travelForm.other_costs}
                    onChange={(e) => setTravelForm({ ...travelForm, other_costs: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Gesamt"
                    value={travelForm.total_amount}
                    onChange={(e) => setTravelForm({ ...travelForm, total_amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  />
                  <select
                    value={travelForm.status}
                    onChange={(e) => setTravelForm({ ...travelForm, status: e.target.value as TravelStatus })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    {travelStatusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCreateTravelExpense}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setShowTravelForm(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}

            {permissions.travel ? (
              <div className="space-y-3 text-sm text-gray-600">
                {travelExpenses.map((item) => (
                  <div key={item.id} className="border border-gray-100 rounded-lg p-3">
                    <p className="text-gray-900 font-medium">{item.employee_name}</p>
                    <p className="text-xs text-gray-500">{item.start_date || '-'} bis {item.end_date || '-'}</p>
                    <p className="text-xs text-gray-500">Status: {item.status}</p>
                  </div>
                ))}
                {travelExpenses.length === 0 && <p>Keine Reisekosten eingereicht</p>}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Zugriff nur fuer Verwaltung oder Admin.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Dokumentenverwaltung</h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Vertraege, Policen, Jahresabschluesse, BWAs</p>
              <p>Steuerunterlagen zentral ablegen</p>
              <p className="text-xs text-gray-500">Nutze die Dokumente-Seite fuer Uploads.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Praktische Features</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>Dashboard mit Kennzahlen auf einen Blick</li>
              <li>Erinnerungen fuer Zahlungsfristen und Mahnungen</li>
              <li>Berechtigungskonzept pro Bereich</li>
              <li>Workflow-Status fuer Freigaben</li>
              <li>Kommentarfunktion zu Belegen</li>
            </ul>
          </div>
        </div>
      </div>

      {showCommentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Kommentare: {selectedDocument.title}
              </h3>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {loadingComments && <p className="text-sm text-gray-500">Kommentare laden...</p>}
              {!loadingComments && comments.length === 0 && (
                <p className="text-sm text-gray-500">Keine Kommentare vorhanden.</p>
              )}
              {comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-3 text-sm text-gray-700">
                  <p>{comment.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {comment.created_by} · {new Date(comment.created_at).toLocaleString('de-DE')}
                  </p>
                </div>
              ))}
            </div>
            {permissions.documentsEdit && (
              <div className="mt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  rows={3}
                  placeholder="Kommentar hinzufuegen..."
                />
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={handleAddComment}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setShowCommentModal(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Schliessen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
