'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

interface Complaint {
  id: string
  title: string
  description: string
  category: string
  area: string
  submittedBy: string
  submittedAt: string
  assignedTo: string
  status: 'Neu' | 'Zugewiesen' | 'In Bearbeitung' | 'Beantwortet' | 'Abgeschlossen'
  responseMethod?: 'E-Mail' | 'Telefon' | 'Persönlich'
  responseDate?: string
  responseBy?: string
  responseText?: string
  resolution?: string
  resolvedAt?: string
}

interface User {
  id: string
  name: string
  email: string
}

const categories = ['Service', 'Qualität', 'Preis', 'Kommunikation', 'Sonstiges']
const areas = ['Festhalle', 'Altes Kaufhaus', 'LA OLA', 'Freibad', 'Verwaltung', 'IT', 'Personal', 'Sonstiges']

export default function BeschwerdemanagementPage() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load complaints
        const complaintsResponse = await fetch('/api/complaints')
        if (complaintsResponse.ok) {
          const complaintsData = await complaintsResponse.json()
          setComplaints(complaintsData.map((c: any) => ({
            ...c,
            submittedAt: c.submittedAt || new Date().toISOString(),
            responseDate: c.responseDate || undefined,
            resolvedAt: c.resolvedAt || undefined
          })))
        }

        // Load users
        const usersResponse = await fetch('/api/complaint-users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [])
  const [showForm, setShowForm] = useState(false)
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '' })
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'analysis'>('list')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    area: '',
    assignedTo: ''
  })

  const [responseData, setResponseData] = useState({
    responseMethod: 'E-Mail' as Complaint['responseMethod'],
    responseText: '',
    resolution: ''
  })

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          area: formData.area,
          submittedBy: currentUser || 'Unbekannt',
          assignedTo: formData.assignedTo
        })
      })
      if (!response.ok) throw new Error('Failed to create complaint')
      const newComplaint = await response.json()
      setComplaints([...complaints, {
        ...newComplaint,
        submittedAt: newComplaint.submittedAt || new Date().toISOString()
      }])
      
      // E-Mail-Benachrichtigung senden
      const assignedUser = users.find(u => u.name === formData.assignedTo)
      if (assignedUser) {
        sendNotificationEmail(assignedUser.email, {
          ...newComplaint,
          submittedAt: newComplaint.submittedAt || new Date().toISOString()
        })
      }
      
      setShowForm(false)
      setFormData({
        title: '',
        description: '',
        category: '',
        area: '',
        assignedTo: ''
      })
    } catch (error) {
      console.error('Failed to create complaint:', error)
      alert('Fehler beim Erstellen der Beschwerde. Bitte versuchen Sie es erneut.')
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = newUser.name.trim()
    const trimmedEmail = newUser.email.trim()
    
    if (!trimmedName || !trimmedEmail) {
      alert('Bitte füllen Sie alle Felder aus.')
      return
    }

    // E-Mail-Validierung
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.')
      return
    }

    // Prüfe auf doppelte Namen oder E-Mails
    if (users.some(u => u.name.toLowerCase() === trimmedName.toLowerCase())) {
      alert('Ein Mitarbeiter mit diesem Namen existiert bereits.')
      return
    }

    if (users.some(u => u.email.toLowerCase() === trimmedEmail.toLowerCase())) {
      alert('Diese E-Mail-Adresse wird bereits verwendet.')
      return
    }

    try {
      const response = await fetch('/api/complaint-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail
        })
      })
      if (!response.ok) throw new Error('Failed to create user')
      const newUserObj = await response.json()
      setUsers([...users, newUserObj])
      setNewUser({ name: '', email: '' })
      setShowAddUserModal(false)
    } catch (error) {
      console.error('Failed to create user:', error)
      alert('Fehler beim Hinzufügen des Mitarbeiters. Bitte versuchen Sie es erneut.')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    if (user && confirm(`Möchten Sie "${user.name}" wirklich entfernen?`)) {
      try {
        const response = await fetch(`/api/complaint-users?id=${userId}`, {
          method: 'DELETE'
        })
        if (!response.ok) throw new Error('Failed to delete user')
        setUsers(users.filter(u => u.id !== userId))
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('Fehler beim Löschen des Mitarbeiters. Bitte versuchen Sie es erneut.')
      }
    }
  }

  const sendNotificationEmail = (userEmail: string, complaint: Complaint) => {
    // In einer echten App würde hier eine E-Mail-API aufgerufen werden
    console.log(`E-Mail würde gesendet werden an: ${userEmail}`)
    console.log(`Betreff: Neue Beschwerde zugewiesen: ${complaint.title}`)
    console.log(`Inhalt: Eine neue Beschwerde wurde Ihnen zugewiesen.`)
    
    // Für Demo-Zwecke: Alert anzeigen
    alert(`E-Mail-Benachrichtigung würde gesendet werden an: ${userEmail}\n\nBetreff: Neue Beschwerde zugewiesen: ${complaint.title}`)
  }

  const handleAssign = async (complaintId: string, assignedTo: string) => {
    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo,
          status: 'Zugewiesen'
        })
      })
      if (!response.ok) throw new Error('Failed to assign complaint')
      const updatedComplaint = await response.json()
      setComplaints(complaints.map(c => 
        c.id === complaintId ? {
          ...updatedComplaint,
          submittedAt: updatedComplaint.submittedAt || c.submittedAt
        } : c
      ))
      
      // E-Mail-Benachrichtigung senden
      const assignedUser = users.find(u => u.name === assignedTo)
      if (assignedUser) {
        sendNotificationEmail(assignedUser.email, {
          ...updatedComplaint,
          submittedAt: updatedComplaint.submittedAt || new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('Failed to assign complaint:', error)
      alert('Fehler beim Zuweisen der Beschwerde. Bitte versuchen Sie es erneut.')
    }
  }

  const handleStartResponse = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setResponseData({
      responseMethod: 'E-Mail',
      responseText: '',
      resolution: ''
    })
    setShowResponseForm(true)
  }

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedComplaint) {
      try {
        const status = responseData.resolution ? 'Abgeschlossen' : 'Beantwortet'
        const response = await fetch(`/api/complaints/${selectedComplaint.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status,
            responseMethod: responseData.responseMethod,
            responseText: responseData.responseText,
            resolution: responseData.resolution,
            responseBy: currentUser || 'Unbekannt'
          })
        })
        if (!response.ok) throw new Error('Failed to update complaint')
        const updatedComplaint = await response.json()
        setComplaints(complaints.map(c => c.id === selectedComplaint.id ? {
          ...updatedComplaint,
          submittedAt: updatedComplaint.submittedAt || c.submittedAt
        } : c))
        setShowResponseForm(false)
        setSelectedComplaint(null)
        setResponseData({
          responseMethod: 'E-Mail',
          responseText: '',
          resolution: ''
        })
      } catch (error) {
        console.error('Failed to submit response:', error)
        alert('Fehler beim Speichern der Antwort. Bitte versuchen Sie es erneut.')
      }
    }
  }

  // Analyse-Daten berechnen
  const analysisData = useMemo(() => {
    const byCategory = complaints.reduce((acc, c) => {
      acc[c.category] = (acc[c.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byArea = complaints.reduce((acc, c) => {
      acc[c.area] = (acc[c.area] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byStatus = complaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byResponseMethod = complaints
      .filter(c => c.responseMethod)
      .reduce((acc, c) => {
        acc[c.responseMethod!] = (acc[c.responseMethod!] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const resolvedCount = complaints.filter(c => c.status === 'Abgeschlossen').length
    const totalCount = complaints.length
    const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0

    // Häufigste Beschwerden nach Thema
    const byTitle = complaints.reduce((acc, c) => {
      const key = c.title.toLowerCase()
      if (!acc[key]) {
        acc[key] = { title: c.title, count: 0, category: c.category, area: c.area }
      }
      acc[key].count++
      return acc
    }, {} as Record<string, { title: string; count: number; category: string; area: string }>)

    const mostFrequent = Object.values(byTitle)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    return {
      byCategory,
      byArea,
      byStatus,
      byResponseMethod,
      resolutionRate,
      resolvedCount,
      totalCount,
      mostFrequent
    }
  }, [complaints])

  const getStatusColor = (status: Complaint['status']) => {
    switch (status) {
      case 'Neu': return 'bg-gray-100 text-gray-800'
      case 'Zugewiesen': return 'bg-blue-100 text-blue-800'
      case 'In Bearbeitung': return 'bg-yellow-100 text-yellow-800'
      case 'Beantwortet': return 'bg-orange-100 text-orange-800'
      case 'Abgeschlossen': return 'bg-green-100 text-green-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">Beschwerdemanagement</h1>
          <p className="text-sm text-gray-600 mt-1">Beschwerden erfassen, zuweisen und bearbeiten</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode('analysis')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'analysis' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Auswertung
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Neue Beschwerde
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Titel</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kategorie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bereich</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Eingereicht von</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Zugewiesen an</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Aktionen</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {complaints.map(complaint => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{complaint.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">{complaint.description}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{complaint.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{complaint.area}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>{complaint.submittedBy}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(complaint.submittedAt).toLocaleDateString('de-DE')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {complaint.assignedTo ? (
                        <div className="text-sm text-gray-700">{complaint.assignedTo}</div>
                      ) : (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAssign(complaint.id, e.target.value)
                            }
                          }}
                          className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-900"
                        >
                          <option value="">Zuweisen...</option>
                          {users.map(user => (
                            <option key={user.id} value={user.name}>{user.name}</option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {complaint.assignedTo && (
                          <button
                            onClick={() => handleStartResponse(complaint)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Antworten
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {complaints.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Noch keine Beschwerden erfasst
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analysis View */}
      {viewMode === 'analysis' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Gesamt Beschwerden</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{analysisData.totalCount}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium">Abgeschlossen</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{analysisData.resolvedCount}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">Lösungsrate</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{analysisData.resolutionRate}%</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">Offen</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">
                {analysisData.totalCount - analysisData.resolvedCount}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Nach Kategorie */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Beschwerden nach Kategorie</h3>
              <div className="space-y-3">
                {Object.entries(analysisData.byCategory)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, count]) => (
                    <div key={category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{category}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / analysisData.totalCount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Nach Bereich */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Beschwerden nach Bereich</h3>
              <div className="space-y-3">
                {Object.entries(analysisData.byArea)
                  .sort(([, a], [, b]) => b - a)
                  .map(([area, count]) => (
                    <div key={area}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{area}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(count / analysisData.totalCount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Nach Status */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status-Verteilung</h3>
              <div className="space-y-3">
                {Object.entries(analysisData.byStatus).map(([status, count]) => (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{status}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === 'Abgeschlossen' ? 'bg-green-500' :
                          status === 'Beantwortet' ? 'bg-orange-500' :
                          status === 'In Bearbeitung' ? 'bg-yellow-500' :
                          status === 'Zugewiesen' ? 'bg-blue-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${(count / analysisData.totalCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Nach Antwortmethode */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Antwortmethoden</h3>
              <div className="space-y-3">
                {Object.entries(analysisData.byResponseMethod).map(([method, count]) => (
                  <div key={method}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700">{method}</span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${(count / Object.values(analysisData.byResponseMethod).reduce((a, b) => a + b, 0)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Häufigste Beschwerden */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Häufigste Beschwerden</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Thema</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Anzahl</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kategorie</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bereich</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysisData.mostFrequent.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{item.title}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                          {item.count}x
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{item.area}</td>
                    </tr>
                  ))}
                  {analysisData.mostFrequent.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Noch keine Daten verfügbar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detaillierte Liste aller Beschwerden */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Alle Beschwerden - Detaillierte Übersicht</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Titel</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kategorie</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bereich</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Antwortmethode</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Beantwortet von</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Beantwortet am</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Lösung</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {complaints.map(complaint => (
                    <tr key={complaint.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{complaint.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{complaint.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{complaint.area}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {complaint.responseMethod || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {complaint.responseBy || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {complaint.responseDate 
                          ? new Date(complaint.responseDate).toLocaleDateString('de-DE')
                          : '-'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {complaint.resolution ? (
                          <span className="text-green-600">✓ Behoben</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {complaints.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        Noch keine Beschwerden erfasst
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Complaint Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Neue Beschwerde erfassen</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateComplaint} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titel *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Bitte wählen</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bereich *</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Bitte wählen</option>
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Zuweisen an *</label>
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    + Mitarbeiter hinzufügen
                  </button>
                </div>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Bitte wählen</option>
                    {users.map(user => (
                      <option key={user.id} value={user.name}>{user.name}</option>
                    ))}
                  </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Beschwerde erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Response Form Modal */}
      {showResponseForm && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-blue-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Antwort auf Beschwerde</h3>
                <button
                  onClick={() => {
                    setShowResponseForm(false)
                    setSelectedComplaint(null)
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Complaint Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">{selectedComplaint.title}</h4>
                <p className="text-sm text-gray-600">{selectedComplaint.description}</p>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>Kategorie: {selectedComplaint.category}</span>
                  <span>Bereich: {selectedComplaint.area}</span>
                  <span>Von: {selectedComplaint.submittedBy}</span>
                </div>
              </div>

              <form onSubmit={handleSubmitResponse} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Antwortmethode *</label>
                  <select
                    value={responseData.responseMethod}
                    onChange={(e) => setResponseData({ ...responseData, responseMethod: e.target.value as Complaint['responseMethod'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="E-Mail">E-Mail</option>
                    <option value="Telefon">Telefon</option>
                    <option value="Persönlich">Persönlich</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Antworttext *</label>
                  <textarea
                    value={responseData.responseText}
                    onChange={(e) => setResponseData({ ...responseData, responseText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={6}
                    placeholder="Schreiben Sie hier Ihre Antwort auf die Beschwerde..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lösung/Behebung (optional)</label>
                  <textarea
                    value={responseData.resolution}
                    onChange={(e) => setResponseData({ ...responseData, resolution: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={3}
                    placeholder="Beschreiben Sie, wie die Beschwerde behoben wurde..."
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>Von:</strong> {currentUser || 'Unbekannt'}<br />
                    <strong>Am:</strong> {new Date().toLocaleDateString('de-DE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResponseForm(false)
                      setSelectedComplaint(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Antwort speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Neuen Mitarbeiter hinzufügen</h3>
                <button
                  onClick={() => {
                    setShowAddUserModal(false)
                    setNewUserName('')
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name des Mitarbeiters *</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="z.B. Max Mustermann"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail-Adresse *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="z.B. max.mustermann@stadtholding.de"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Der Mitarbeiter wird per E-Mail benachrichtigt, wenn ihm eine Beschwerde zugewiesen wird.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Aktuelle Mitarbeiter:</p>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {users.map(user => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-700">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium ml-2"
                      >
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false)
                    setNewUser({ name: '', email: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Mitarbeiter hinzufügen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

