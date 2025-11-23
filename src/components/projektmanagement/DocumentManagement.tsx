'use client'

import { useState } from 'react'

interface Document {
  id: string
  name: string
  type: string
  size: string
  version: string
  project: string
  uploadedBy: string
  uploadedAt: string
  accessLevel: 'Öffentlich' | 'Team' | 'Privat'
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Projektplan_Q1_2026.pdf', type: 'PDF', size: '2.4 MB', version: '1.2', project: 'Digitalisierung 2026', uploadedBy: 'Eva Klein', uploadedAt: '2025-12-15', accessLevel: 'Team' },
    { id: '2', name: 'Budget_Übersicht.xlsx', type: 'Excel', size: '156 KB', version: '2.0', project: 'Digitalisierung 2026', uploadedBy: 'Jonas Meier', uploadedAt: '2025-12-20', accessLevel: 'Team' },
    { id: '3', name: 'Meeting_Notizen_15.12.docx', type: 'Word', size: '89 KB', version: '1.0', project: 'Digitalisierung 2026', uploadedBy: 'Carla Nguyen', uploadedAt: '2025-12-15', accessLevel: 'Öffentlich' },
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterProject, setFilterProject] = useState('')
  const [filterType, setFilterType] = useState('')

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesProject = !filterProject || doc.project === filterProject
    const matchesType = !filterType || doc.type === filterType
    return matchesSearch && matchesProject && matchesType
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF': return '📄'
      case 'Excel': return '📊'
      case 'Word': return '📝'
      case 'PowerPoint': return '📽️'
      default: return '📁'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dokumentenmanagement</h2>
          <p className="text-sm text-gray-600">Zentrale Dateispeicherung mit Versionskontrolle</p>
        </div>
        <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium">
          + Dokument hochladen
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Dokumente durchsuchen..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Alle Projekte</option>
            <option value="Digitalisierung 2026">Digitalisierung 2026</option>
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Alle Typen</option>
            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
            <option value="Word">Word</option>
            <option value="PowerPoint">PowerPoint</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            Filter zurücksetzen
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map(doc => (
          <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{getFileIcon(doc.type)}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{doc.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{doc.type} • {doc.size}</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                doc.accessLevel === 'Öffentlich' ? 'bg-green-100 text-green-800' :
                doc.accessLevel === 'Team' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {doc.accessLevel}
              </span>
            </div>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center justify-between">
                <span>Version:</span>
                <span className="font-semibold">{doc.version}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Projekt:</span>
                <span className="font-semibold">{doc.project}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Hochgeladen von:</span>
                <span>{doc.uploadedBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Datum:</span>
                <span>{new Date(doc.uploadedAt).toLocaleDateString('de-DE')}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
              <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                📥 Herunterladen
              </button>
              <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                👁️ Vorschau
              </button>
              <button className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                ⋮
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Version Control Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Versionskontrolle</h3>
        <p className="text-sm text-blue-800 mb-4">
          Alle Dokumente werden automatisch versioniert. Sie können jederzeit auf frühere Versionen zugreifen.
        </p>
        <div className="space-y-2">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{getFileIcon(doc.type)}</span>
                <div>
                  <p className="font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-500">Version {doc.version}</p>
                </div>
              </div>
              <button className="px-3 py-1 text-xs font-medium text-blue-700 hover:text-blue-900">
                Versionshistorie
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Access Permissions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Zugriffsberechtigungen</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Öffentlich</p>
              <p className="text-xs text-gray-600">Alle Mitarbeiter können zugreifen</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Aktiv</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Team</p>
              <p className="text-xs text-gray-600">Nur Projektteam-Mitglieder</p>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Aktiv</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900">Privat</p>
              <p className="text-xs text-gray-600">Nur Ersteller und Administratoren</p>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">Aktiv</span>
          </div>
        </div>
      </div>
    </div>
  )
}

