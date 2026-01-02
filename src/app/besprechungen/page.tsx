'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface Erledigungsvermerk {
  id: string
  text: string
  erstelltVon: string
  erstelltAm: string
}

interface Besprechungspunkt {
  id: string
  titel: string
  beschreibung: string
  verantwortlich: string
  frist?: string
  prioritaet?: 'Niedrig' | 'Mittel' | 'Hoch'
  status: 'offen' | 'in_arbeit' | 'erledigt'
  notizen?: string
  erledigungsvermerke?: Erledigungsvermerk[]
  erstelltVon?: string
  erstelltAm?: string
}

interface Besprechung {
  id: string
  titel: string
  bereich: string
  datum: string
  uhrzeit: string
  ort?: string
  teilnehmer: string[]
  protokoll?: string
  status: 'geplant' | 'durchgefuehrt' | 'verschoben' | 'abgesagt'
  punkte: Besprechungspunkt[]
  erstelltVon: string
  erstelltAm: string
  aktualisiertAm: string
}

const mockBereiche = [
  'FZB - Freizeitbad',
  'FB - Freibad',
  'FH - Freizeithalle',
  'AK - Allgemeine Verwaltung',
  'BL - Betriebsleitung',
  'IT - Informationstechnik',
  'HR - Personalwesen',
  'Finanzen',
  'Marketing',
  'Technik'
]

const mockUsers = ['Drost', 'Klement', 'Hartmann', 'Müller', 'Schmidt', 'Weber', 'Fischer', 'Wagner']

export default function BesprechungenPage() {
  const { currentUser } = useAuth()
  const [besprechungen, setBesprechungen] = useState<Besprechung[]>([])
  const [selectedBesprechung, setSelectedBesprechung] = useState<Besprechung | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showPunktForm, setShowPunktForm] = useState(false)
  const [editingPunkt, setEditingPunkt] = useState<Besprechungspunkt | null>(null)
  const [filterBereich, setFilterBereich] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [showPunktDetailModal, setShowPunktDetailModal] = useState(false)
  const [selectedPunkt, setSelectedPunkt] = useState<Besprechungspunkt | null>(null)
  const [punktNotizen, setPunktNotizen] = useState('')
  const [neuerErledigungsvermerk, setNeuerErledigungsvermerk] = useState('')

  const [formData, setFormData] = useState({
    titel: '',
    bereich: '',
    datum: '',
    uhrzeit: '',
    ort: '',
    teilnehmer: [] as string[]
  })

  const [punktFormData, setPunktFormData] = useState({
    titel: '',
    beschreibung: '',
    verantwortlich: '',
    frist: '',
    prioritaet: 'Mittel' as 'Niedrig' | 'Mittel' | 'Hoch',
    notizen: ''
  })

  // Besprechungen beim Laden abrufen
  useEffect(() => {
    loadBesprechungen()
  }, [])

  // Aktualisiere ausgewählte Besprechung nach dem Laden
  useEffect(() => {
    if (selectedBesprechung) {
      const updated = besprechungen.find(b => b.id === selectedBesprechung.id)
      if (updated) {
        setSelectedBesprechung(updated)
      }
    }
  }, [besprechungen])

  const loadBesprechungen = async () => {
    try {
      const response = await fetch('/api/besprechungen')
      if (response.ok) {
        const data = await response.json()
        setBesprechungen(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Besprechungen:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/besprechungen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          erstelltVon: currentUser || 'System'
        })
      })

      if (response.ok) {
        await loadBesprechungen()
        setShowForm(false)
        setFormData({
          titel: '',
          bereich: '',
          datum: '',
          uhrzeit: '',
          ort: '',
          teilnehmer: []
        })
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Besprechung:', error)
      alert('Fehler beim Erstellen der Besprechung')
    }
  }

  const handlePunktSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBesprechung) return

    const neuerPunkt: Besprechungspunkt = {
      id: Date.now().toString(),
      ...punktFormData,
      status: 'offen',
      erledigungsvermerke: [],
      erstelltVon: currentUser || 'System',
      erstelltAm: new Date().toISOString()
    }

    const updatedBesprechung: Besprechung = {
      ...selectedBesprechung,
      punkte: [...selectedBesprechung.punkte, neuerPunkt],
      aktualisiertAm: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/besprechungen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBesprechung)
      })

      if (response.ok) {
        await loadBesprechungen()
        setShowPunktForm(false)
        setEditingPunkt(null)
        setPunktFormData({
          titel: '',
          beschreibung: '',
          verantwortlich: '',
          frist: '',
          notizen: ''
        })
        // Aktualisiere die ausgewählte Besprechung
        const refreshed = await fetch(`/api/besprechungen?id=${selectedBesprechung.id}`)
        if (refreshed.ok) {
          const data = await refreshed.json()
          setSelectedBesprechung(data)
        }
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Besprechungspunkts:', error)
      alert('Fehler beim Erstellen des Besprechungspunkts')
    }
  }

  const handlePunktUpdate = async (punkt: Besprechungspunkt) => {
    if (!selectedBesprechung) return

    const updatedPunkte = selectedBesprechung.punkte.map(p =>
      p.id === punkt.id ? punkt : p
    )

    const updatedBesprechung: Besprechung = {
      ...selectedBesprechung,
      punkte: updatedPunkte,
      aktualisiertAm: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/besprechungen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBesprechung)
      })

      if (response.ok) {
        await loadBesprechungen()
        const refreshed = await fetch(`/api/besprechungen?id=${selectedBesprechung.id}`)
        if (refreshed.ok) {
          const data = await refreshed.json()
          setSelectedBesprechung(data)
          // Aktualisiere auch den ausgewählten Punkt im Modal, falls geöffnet
          if (showPunktDetailModal && selectedPunkt && selectedPunkt.id === punkt.id) {
            const updatedPunktInBesprechung = data.punkte.find((p: Besprechungspunkt) => p.id === punkt.id)
            if (updatedPunktInBesprechung) {
              setSelectedPunkt(updatedPunktInBesprechung)
            }
          }
        } else {
          setSelectedBesprechung(updatedBesprechung)
        }
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren des Besprechungspunkts:', error)
    }
  }

  const handleBesprechungUpdate = async (besprechung: Besprechung) => {
    try {
      const response = await fetch('/api/besprechungen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(besprechung)
      })

      if (response.ok) {
        await loadBesprechungen()
        const refreshed = await fetch(`/api/besprechungen?id=${besprechung.id}`)
        if (refreshed.ok) {
          const data = await refreshed.json()
          setSelectedBesprechung(data)
        } else {
          setSelectedBesprechung(besprechung)
        }
      }
    } catch (error) {
      console.error('Fehler beim Aktualisieren der Besprechung:', error)
    }
  }

  const handlePunktClick = async (punkt: Besprechungspunkt) => {
    // Lade die aktuelle Version des Punkts aus der Besprechung
    if (selectedBesprechung) {
      const aktuellerPunkt = selectedBesprechung.punkte.find(p => p.id === punkt.id)
      if (aktuellerPunkt) {
        setSelectedPunkt(aktuellerPunkt)
        setPunktNotizen(aktuellerPunkt.notizen || '')
        setNeuerErledigungsvermerk('')
        setShowPunktDetailModal(true)
      }
    }
  }

  const handleNotizenSave = async () => {
    if (!selectedBesprechung || !selectedPunkt) return

    const updatedPunkt: Besprechungspunkt = {
      ...selectedPunkt,
      notizen: punktNotizen
    }

    await handlePunktUpdate(updatedPunkt)
    
    // Aktualisiere den ausgewählten Punkt im Modal
    setSelectedPunkt(updatedPunkt)
  }

  const handleErledigungsvermerkHinzufuegen = async () => {
    if (!selectedBesprechung || !selectedPunkt || !neuerErledigungsvermerk.trim()) return

    const neuerVermerk: Erledigungsvermerk = {
      id: Date.now().toString(),
      text: neuerErledigungsvermerk,
      erstelltVon: currentUser || 'System',
      erstelltAm: new Date().toISOString()
    }

    const updatedPunkt: Besprechungspunkt = {
      ...selectedPunkt,
      erledigungsvermerke: [...(selectedPunkt.erledigungsvermerke || []), neuerVermerk]
    }

    await handlePunktUpdate(updatedPunkt)
    
    // Aktualisiere den ausgewählten Punkt im Modal
    setSelectedPunkt(updatedPunkt)
    setNeuerErledigungsvermerk('')
  }

  const handleErledigungsvermerkLoeschen = async (vermerkId: string) => {
    if (!selectedBesprechung || !selectedPunkt) return

    const updatedPunkt: Besprechungspunkt = {
      ...selectedPunkt,
      erledigungsvermerke: (selectedPunkt.erledigungsvermerke || []).filter(v => v.id !== vermerkId)
    }

    await handlePunktUpdate(updatedPunkt)
    
    // Aktualisiere den ausgewählten Punkt im Modal
    setSelectedPunkt(updatedPunkt)
  }

  const handleDeleteBesprechung = async (id: string) => {
    if (!confirm('Möchten Sie diese Besprechung wirklich löschen?')) return

    try {
      const response = await fetch(`/api/besprechungen?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await loadBesprechungen()
        if (selectedBesprechung?.id === id) {
          setSelectedBesprechung(null)
        }
      }
    } catch (error) {
      console.error('Fehler beim Löschen der Besprechung:', error)
      alert('Fehler beim Löschen der Besprechung')
    }
  }

  const handleDeletePunkt = async (punktId: string) => {
    if (!selectedBesprechung) return
    if (!confirm('Möchten Sie diesen Besprechungspunkt wirklich löschen?')) return

    const updatedPunkte = selectedBesprechung.punkte.filter(p => p.id !== punktId)
    const updatedBesprechung: Besprechung = {
      ...selectedBesprechung,
      punkte: updatedPunkte,
      aktualisiertAm: new Date().toISOString()
    }

    try {
      const response = await fetch('/api/besprechungen', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBesprechung)
      })

      if (response.ok) {
        await loadBesprechungen()
        setSelectedBesprechung(updatedBesprechung)
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Besprechungspunkts:', error)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const filteredBesprechungen = besprechungen.filter(b => {
    const matchesBereich = !filterBereich || b.bereich === filterBereich
    const matchesStatus = !filterStatus || b.status === filterStatus
    return matchesBereich && matchesStatus
  })

  const sortedBesprechungen = [...filteredBesprechungen].sort((a, b) => {
    if (!sortColumn) return 0

    let aValue: any
    let bValue: any

    switch (sortColumn) {
      case 'titel':
        aValue = a.titel.toLowerCase()
        bValue = b.titel.toLowerCase()
        break
      case 'bereich':
        aValue = a.bereich.toLowerCase()
        bValue = b.bereich.toLowerCase()
        break
      case 'datum':
        aValue = new Date(a.datum).getTime()
        bValue = new Date(b.datum).getTime()
        break
      case 'status':
        aValue = a.status
        bValue = b.status
        break
      default:
        return 0
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const getStatusColor = (status: Besprechung['status']) => {
    switch (status) {
      case 'geplant':
        return 'bg-blue-100 text-blue-800'
      case 'durchgefuehrt':
        return 'bg-green-100 text-green-800'
      case 'verschoben':
        return 'bg-yellow-100 text-yellow-800'
      case 'abgesagt':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPunktStatusColor = (status: Besprechungspunkt['status']) => {
    switch (status) {
      case 'offen':
        return 'bg-gray-100 text-gray-800'
      case 'in_arbeit':
        return 'bg-blue-100 text-blue-800'
      case 'erledigt':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 lg:p-10 text-white">
        <h1 className="text-2xl lg:text-4xl font-extrabold mb-2">Besprechungen</h1>
        <p className="text-white/90 max-w-3xl">
          Erstellen und verwalten Sie Besprechungsprotokolle für verschiedene Bereiche der Stadtholding Landau
        </p>
      </div>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Gesamt</p>
              <p className="text-3xl font-bold text-gray-800">{besprechungen.length}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Geplant</p>
              <p className="text-3xl font-bold text-blue-600">
                {besprechungen.filter(b => b.status === 'geplant').length}
              </p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Durchgeführt</p>
              <p className="text-3xl font-bold text-green-600">
                {besprechungen.filter(b => b.status === 'durchgefuehrt').length}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Offene Punkte</p>
              <p className="text-3xl font-bold text-orange-600">
                {besprechungen.reduce((sum, b) => sum + b.punkte.filter(p => p.status !== 'erledigt').length, 0)}
              </p>
            </div>
            <div className="text-4xl">📌</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Spalte: Liste der Besprechungen */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">Besprechungen</h2>
              <button
                onClick={() => {
                  setShowForm(true)
                  setSelectedBesprechung(null)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                + Neu
              </button>
            </div>

            {/* Filter */}
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bereich</label>
                <select
                  value={filterBereich}
                  onChange={(e) => setFilterBereich(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Alle Bereiche</option>
                  {mockBereiche.map(bereich => (
                    <option key={bereich} value={bereich}>{bereich}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Alle Status</option>
                  <option value="geplant">Geplant</option>
                  <option value="durchgefuehrt">Durchgeführt</option>
                  <option value="verschoben">Verschoben</option>
                  <option value="abgesagt">Abgesagt</option>
                </select>
              </div>
            </div>

            {/* Besprechungsliste */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {sortedBesprechungen.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Keine Besprechungen gefunden</p>
              ) : (
                sortedBesprechungen.map(besprechung => (
                  <div
                    key={besprechung.id}
                    onClick={() => setSelectedBesprechung(besprechung)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBesprechung?.id === besprechung.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-sm">{besprechung.titel}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(besprechung.status)}`}>
                        {besprechung.status === 'geplant' ? 'Geplant' :
                         besprechung.status === 'durchgefuehrt' ? 'Durchgeführt' :
                         besprechung.status === 'verschoben' ? 'Verschoben' : 'Abgesagt'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{besprechung.bereich}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(besprechung.datum).toLocaleDateString('de-DE')} {besprechung.uhrzeit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {besprechung.punkte.length} Punkt{besprechung.punkte.length !== 1 ? 'e' : ''}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Rechte Spalte: Details der ausgewählten Besprechung */}
        <div className="lg:col-span-2">
          {selectedBesprechung ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedBesprechung.titel}</h2>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                    <span className="font-medium">{selectedBesprechung.bereich}</span>
                    <span>•</span>
                    <span>{new Date(selectedBesprechung.datum).toLocaleDateString('de-DE')}</span>
                    <span>•</span>
                    <span>{selectedBesprechung.uhrzeit}</span>
                    {selectedBesprechung.ort && (
                      <>
                        <span>•</span>
                        <span>{selectedBesprechung.ort}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const updated = { ...selectedBesprechung, status: 'durchgefuehrt' as const }
                      handleBesprechungUpdate(updated)
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Als durchgeführt markieren
                  </button>
                  <button
                    onClick={() => handleDeleteBesprechung(selectedBesprechung.id)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Löschen
                  </button>
                </div>
              </div>

              {/* Teilnehmer */}
              {selectedBesprechung.teilnehmer.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Teilnehmer</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBesprechung.teilnehmer.map((teilnehmer, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {teilnehmer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Besprechungspunkte */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Besprechungspunkte</h3>
                  <button
                    onClick={() => {
                      setShowPunktForm(true)
                      setEditingPunkt(null)
                      setPunktFormData({
                        titel: '',
                        beschreibung: '',
                        verantwortlich: '',
                        frist: '',
                        prioritaet: 'Mittel',
                        notizen: ''
                      })
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    + Punkt hinzufügen
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedBesprechung.punkte.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Noch keine Besprechungspunkte</p>
                  ) : (
                    selectedBesprechung.punkte.map(punkt => (
                      <div 
                        key={punkt.id} 
                        onClick={() => handlePunktClick(punkt)}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800 mb-1">{punkt.titel}</h4>
                            {punkt.beschreibung && (
                              <p className="text-sm text-gray-600 mb-2">{punkt.beschreibung}</p>
                            )}
                            {punkt.notizen && (
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mb-2">
                                <p className="text-xs text-gray-700"><strong>Notizen:</strong> {punkt.notizen.substring(0, 100)}{punkt.notizen.length > 100 ? '...' : ''}</p>
                              </div>
                            )}
                            {punkt.erledigungsvermerke && punkt.erledigungsvermerke.length > 0 && (
                              <div className="bg-blue-50 border-l-4 border-blue-400 p-2 mb-2">
                                <p className="text-xs text-gray-700">
                                  <strong>{punkt.erledigungsvermerke.length} Erledigungsvermerk{punkt.erledigungsvermerke.length !== 1 ? 'e' : ''}</strong>
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <select
                              value={punkt.status}
                              onChange={(e) => {
                                e.stopPropagation()
                                const updated = { ...punkt, status: e.target.value as Besprechungspunkt['status'] }
                                handlePunktUpdate(updated)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`px-3 py-1 rounded text-xs font-medium border ${getPunktStatusColor(punkt.status)}`}
                            >
                              <option value="offen">Offen</option>
                              <option value="in_arbeit">In Arbeit</option>
                              <option value="erledigt">Erledigt</option>
                            </select>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeletePunkt(punkt.id)
                              }}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                          <div>
                            <span className="text-gray-600">Verantwortlich:</span>
                            <span className="ml-2 font-medium text-gray-800">{punkt.verantwortlich || 'Nicht zugewiesen'}</span>
                          </div>
                          {punkt.frist && (
                            <div>
                              <span className="text-gray-600">Frist:</span>
                              <span className="ml-2 font-medium text-gray-800">
                                {new Date(punkt.frist).toLocaleDateString('de-DE')}
                              </span>
                            </div>
                          )}
                          {punkt.prioritaet && (
                            <div>
                              <span className="text-gray-600">Priorität:</span>
                              <span className={`ml-2 font-medium ${
                                punkt.prioritaet === 'Hoch' ? 'text-red-600' :
                                punkt.prioritaet === 'Mittel' ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                                {punkt.prioritaet}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 text-xs text-blue-600 font-medium">
                          👆 Klicken für Details, Notizen und Erledigungsvermerke
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Protokoll */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Protokoll</h3>
                <textarea
                  value={selectedBesprechung.protokoll || ''}
                  onChange={(e) => {
                    const updated = { ...selectedBesprechung, protokoll: e.target.value }
                    setSelectedBesprechung(updated)
                  }}
                  onBlur={() => {
                    if (selectedBesprechung) {
                      handleBesprechungUpdate(selectedBesprechung)
                    }
                  }}
                  placeholder="Protokoll der Besprechung..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
                />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Keine Besprechung ausgewählt</h3>
              <p className="text-gray-600 mb-6">Wählen Sie eine Besprechung aus der Liste aus oder erstellen Sie eine neue</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Neue Besprechung erstellen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Neue Besprechung */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Neue Besprechung</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                <input
                  type="text"
                  value={formData.titel}
                  onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bereich *</label>
                  <select
                    value={formData.bereich}
                    onChange={(e) => setFormData({ ...formData, bereich: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Bitte wählen</option>
                    {mockBereiche.map(bereich => (
                      <option key={bereich} value={bereich}>{bereich}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                  <input
                    type="text"
                    value={formData.ort}
                    onChange={(e) => setFormData({ ...formData, ort: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Datum *</label>
                  <input
                    type="date"
                    value={formData.datum}
                    onChange={(e) => setFormData({ ...formData, datum: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uhrzeit *</label>
                  <input
                    type="time"
                    value={formData.uhrzeit}
                    onChange={(e) => setFormData({ ...formData, uhrzeit: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teilnehmer</label>
                <div className="space-y-2">
                  {mockUsers.map(user => (
                    <label key={user} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.teilnehmer.includes(user)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, teilnehmer: [...formData.teilnehmer, user] })
                          } else {
                            setFormData({ ...formData, teilnehmer: formData.teilnehmer.filter(t => t !== user) })
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">{user}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Erstellen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      titel: '',
                      bereich: '',
                      datum: '',
                      uhrzeit: '',
                      ort: '',
                      teilnehmer: []
                    })
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Neuer Besprechungspunkt */}
      {showPunktForm && selectedBesprechung && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Neuer Besprechungspunkt</h2>
            </div>
            <form onSubmit={handlePunktSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel *</label>
                <input
                  type="text"
                  value={punktFormData.titel}
                  onChange={(e) => setPunktFormData({ ...punktFormData, titel: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={punktFormData.beschreibung}
                  onChange={(e) => setPunktFormData({ ...punktFormData, beschreibung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verantwortlich</label>
                  <select
                    value={punktFormData.verantwortlich}
                    onChange={(e) => setPunktFormData({ ...punktFormData, verantwortlich: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Bitte wählen</option>
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                  <select
                    value={punktFormData.prioritaet}
                    onChange={(e) => setPunktFormData({ ...punktFormData, prioritaet: e.target.value as 'Niedrig' | 'Mittel' | 'Hoch' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Niedrig">Niedrig</option>
                    <option value="Mittel">Mittel</option>
                    <option value="Hoch">Hoch</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frist</label>
                <input
                  type="date"
                  value={punktFormData.frist}
                  onChange={(e) => setPunktFormData({ ...punktFormData, frist: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notizen (für Vorbereitung)</label>
                <textarea
                  value={punktFormData.notizen}
                  onChange={(e) => setPunktFormData({ ...punktFormData, notizen: e.target.value })}
                  placeholder="Notizen, die vor der Besprechung gemacht werden können..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Hinzufügen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPunktForm(false)
                    setEditingPunkt(null)
                    setPunktFormData({
                      titel: '',
                      beschreibung: '',
                      verantwortlich: '',
                      frist: '',
                      prioritaet: 'Mittel',
                      notizen: ''
                    })
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Besprechungspunkt Details - Notizen und Erledigungsvermerke */}
      {showPunktDetailModal && selectedPunkt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedPunkt.titel}</h2>
                  {selectedPunkt.beschreibung && (
                    <p className="text-gray-600 text-sm">{selectedPunkt.beschreibung}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowPunktDetailModal(false)
                    setSelectedPunkt(null)
                    setPunktNotizen('')
                    setNeuerErledigungsvermerk('')
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Informationen */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Verantwortlich:</span>
                  <p className="font-medium text-gray-800">{selectedPunkt.verantwortlich || 'Nicht zugewiesen'}</p>
                </div>
                {selectedPunkt.frist && (
                  <div>
                    <span className="text-gray-600">Frist:</span>
                    <p className="font-medium text-gray-800">
                      {new Date(selectedPunkt.frist).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                )}
                {selectedPunkt.prioritaet && (
                  <div>
                    <span className="text-gray-600">Priorität:</span>
                    <p className={`font-medium ${
                      selectedPunkt.prioritaet === 'Hoch' ? 'text-red-600' :
                      selectedPunkt.prioritaet === 'Mittel' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {selectedPunkt.prioritaet}
                    </p>
                  </div>
                )}
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getPunktStatusColor(selectedPunkt.status)}`}>
                    {selectedPunkt.status === 'offen' ? 'Offen' :
                     selectedPunkt.status === 'in_arbeit' ? 'In Arbeit' : 'Erledigt'}
                  </span>
                </div>
              </div>

              {/* Notizen */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notizen</label>
                <textarea
                  value={punktNotizen}
                  onChange={(e) => setPunktNotizen(e.target.value)}
                  onBlur={handleNotizenSave}
                  placeholder="Notizen zu diesem Besprechungspunkt..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px]"
                />
                <p className="text-xs text-gray-500 mt-1">Notizen werden automatisch gespeichert, wenn Sie das Feld verlassen.</p>
              </div>

              {/* Erledigungsvermerke */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Erledigungsvermerke</label>
                <div className="space-y-3 mb-4">
                  {selectedPunkt.erledigungsvermerke && selectedPunkt.erledigungsvermerke.length > 0 ? (
                    selectedPunkt.erledigungsvermerke.map(vermerk => (
                      <div key={vermerk.id} className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-gray-800 text-sm mb-1">{vermerk.text}</p>
                            <p className="text-xs text-gray-500">
                              {vermerk.erstelltVon} • {new Date(vermerk.erstelltAm).toLocaleDateString('de-DE', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <button
                            onClick={() => handleErledigungsvermerkLoeschen(vermerk.id)}
                            className="ml-4 text-red-600 hover:text-red-800 text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">Noch keine Erledigungsvermerke</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={neuerErledigungsvermerk}
                    onChange={(e) => setNeuerErledigungsvermerk(e.target.value)}
                    placeholder="Neuen Erledigungsvermerk hinzufügen..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
                  />
                  <button
                    onClick={handleErledigungsvermerkHinzufuegen}
                    disabled={!neuerErledigungsvermerk.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                  >
                    Hinzufügen
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowPunktDetailModal(false)
                  setSelectedPunkt(null)
                  setPunktNotizen('')
                  setNeuerErledigungsvermerk('')
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

