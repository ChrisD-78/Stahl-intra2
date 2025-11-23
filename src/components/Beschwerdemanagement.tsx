'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { getFormSubmissions, insertFormSubmission, deleteFormSubmissionById } from '@/lib/db'

interface Complaint {
  id: string
  title: string
  description: string
  status: string
  priority: string
  category: string
  submittedBy: string
  assignedTo: string
  submittedAt: string
  formData: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function Beschwerdemanagement() {
  const { currentUser, isAdmin } = useAuth()
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'Normal',
    assignedTo: ''
  })

  useEffect(() => {
    loadComplaints()
  }, [])

  const loadComplaints = async () => {
    try {
      const allSubmissions = await getFormSubmissions()
      const complaintsData = allSubmissions
        .filter(sub => sub.type === 'beschwerde')
        .map(sub => ({
          id: sub.id || '',
          title: sub.title,
          description: sub.description || '',
          status: sub.status,
          priority: (sub.form_data as any)?.priority || 'Normal', // eslint-disable-line @typescript-eslint/no-explicit-any
          category: (sub.form_data as any)?.category || '', // eslint-disable-line @typescript-eslint/no-explicit-any
          submittedBy: sub.submitted_by,
          assignedTo: (sub.form_data as any)?.assignedTo || '', // eslint-disable-line @typescript-eslint/no-explicit-any
          submittedAt: sub.submitted_at || '',
          formData: sub.form_data
        }))
      setComplaints(complaintsData)
    } catch (error) {
      console.error('Error loading complaints:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const submissionData = {
        type: 'beschwerde',
        title: formData.title,
        description: formData.description,
        status: 'Neu',
        form_data: {
          ...formData,
          submittedBy: currentUser
        },
        submitted_by: currentUser || 'Unbekannt'
      }

      await insertFormSubmission(submissionData)
      await loadComplaints()
      setShowForm(false)
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'Normal',
        assignedTo: ''
      })
    } catch (error) {
      console.error('Error submitting complaint:', error)
      alert('Fehler beim Speichern der Beschwerde.')
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/form-submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (response.ok) {
        await loadComplaints()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Fehler beim Aktualisieren des Status.')
    }
  }

  const handleAssign = async (id: string, assignedTo: string) => {
    try {
      const complaint = complaints.find(c => c.id === id)
      if (!complaint) return

      const updatedFormData = {
        ...complaint.formData,
        assignedTo
      }

      const response = await fetch(`/api/form-submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          form_data: updatedFormData 
        })
      })
      if (response.ok) {
        await loadComplaints()
      }
    } catch (error) {
      console.error('Error assigning complaint:', error)
      alert('Fehler beim Zuweisen der Beschwerde.')
    }
  }

  const handleEdit = (complaint: Complaint) => {
    setEditingComplaint(complaint)
    setFormData({
      title: complaint.title,
      description: complaint.description,
      category: complaint.category,
      priority: complaint.priority,
      assignedTo: complaint.assignedTo
    })
    setShowForm(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingComplaint) return

    try {
      const updatedFormData = {
        ...editingComplaint.formData,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        assignedTo: formData.assignedTo
      }

      const response = await fetch(`/api/form-submissions/${editingComplaint.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          form_data: updatedFormData
        })
      })
      if (response.ok) {
        await loadComplaints()
        setShowForm(false)
        setEditingComplaint(null)
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: 'Normal',
          assignedTo: ''
        })
      }
    } catch (error) {
      console.error('Error updating complaint:', error)
      alert('Fehler beim Aktualisieren der Beschwerde.')
    }
  }

  const formatDate = (dateString: string): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}.${month}.${year}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Abgeschlossen': return 'bg-green-100 text-green-800'
      case 'In Bearbeitung': return 'bg-yellow-100 text-yellow-800'
      case 'Zugewiesen': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Hoch': return 'bg-red-100 text-red-800'
      case 'Mittel': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = !filterStatus || complaint.status === filterStatus
    const matchesPriority = !filterPriority || complaint.priority === filterPriority
    return matchesStatus && matchesPriority
  })

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Beschwerdemanagement</h2>
          <p className="text-sm text-gray-600">Beschwerden erfassen, bearbeiten und verfolgen</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingComplaint(null)
            setFormData({
              title: '',
              description: '',
              category: '',
              priority: 'Normal',
              assignedTo: ''
            })
          }}
          className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          + Neue Beschwerde
        </button>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Alle Status</option>
          <option value="Neu">Neu</option>
          <option value="Zugewiesen">Zugewiesen</option>
          <option value="In Bearbeitung">In Bearbeitung</option>
          <option value="Abgeschlossen">Abgeschlossen</option>
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">Alle Prioritäten</option>
          <option value="Niedrig">Niedrig</option>
          <option value="Normal">Normal</option>
          <option value="Mittel">Mittel</option>
          <option value="Hoch">Hoch</option>
        </select>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Lade Beschwerden...</div>
      ) : filteredComplaints.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <span className="text-4xl">📋</span>
          <p className="mt-2">Keine Beschwerden gefunden</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{complaint.title}</h3>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{complaint.description}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span>📅 {formatDate(complaint.submittedAt)}</span>
                    <span>👤 Von: {complaint.submittedBy}</span>
                    {complaint.assignedTo && (
                      <span className="text-blue-600 font-semibold">
                        🔧 Bearbeitet von: {complaint.assignedTo}
                      </span>
                    )}
                    {complaint.category && (
                      <span>🏷️ {complaint.category}</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {isAdmin && (
                    <>
                      <select
                        value={complaint.assignedTo}
                        onChange={(e) => handleAssign(complaint.id, e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Zuweisen...</option>
                        <option value="Eva Klein">Eva Klein</option>
                        <option value="Jonas Meier">Jonas Meier</option>
                        <option value="Carla Nguyen">Carla Nguyen</option>
                        <option value="Felix Sturm">Felix Sturm</option>
                        <option value="Mara Schubert">Mara Schubert</option>
                        <option value="Leon Fuchs">Leon Fuchs</option>
                      </select>
                      <select
                        value={complaint.status}
                        onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="Neu">Neu</option>
                        <option value="Zugewiesen">Zugewiesen</option>
                        <option value="In Bearbeitung">In Bearbeitung</option>
                        <option value="Abgeschlossen">Abgeschlossen</option>
                      </select>
                      <button
                        onClick={() => handleEdit(complaint)}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        ✏️ Bearbeiten
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-red-600 to-pink-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingComplaint ? 'Beschwerde bearbeiten' : 'Neue Beschwerde'}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingComplaint(null)
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={editingComplaint ? handleUpdate : handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibung *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Bitte wählen</option>
                    <option value="Service">Service</option>
                    <option value="Qualität">Qualität</option>
                    <option value="Prozess">Prozess</option>
                    <option value="Kommunikation">Kommunikation</option>
                    <option value="Sonstiges">Sonstiges</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priorität *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  >
                    <option value="Niedrig">Niedrig</option>
                    <option value="Normal">Normal</option>
                    <option value="Mittel">Mittel</option>
                    <option value="Hoch">Hoch</option>
                  </select>
                </div>
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zuweisen an
                  </label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Nicht zugewiesen</option>
                    <option value="Eva Klein">Eva Klein</option>
                    <option value="Jonas Meier">Jonas Meier</option>
                    <option value="Carla Nguyen">Carla Nguyen</option>
                    <option value="Felix Sturm">Felix Sturm</option>
                    <option value="Mara Schubert">Mara Schubert</option>
                    <option value="Leon Fuchs">Leon Fuchs</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingComplaint(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  {editingComplaint ? 'Aktualisieren' : 'Beschwerde einreichen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}


