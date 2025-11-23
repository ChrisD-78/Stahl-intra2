'use client'

import { useState } from 'react'

interface Milestone {
  id: string
  name: string
  date: string
  project: string
  status: 'Geplant' | 'In Arbeit' | 'Abgeschlossen'
}

export default function TimePlanning() {
  const [viewMode, setViewMode] = useState<'gantt' | 'kanban' | 'timeline'>('gantt')
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', name: 'Projektstart', date: '2026-01-01', project: 'Digitalisierung 2026', status: 'Abgeschlossen' },
    { id: '2', name: 'Phase 1 Abschluss', date: '2026-02-15', project: 'Digitalisierung 2026', status: 'In Arbeit' },
    { id: '3', name: 'Phase 2 Start', date: '2026-03-01', project: 'Digitalisierung 2026', status: 'Geplant' },
  ])
  const [showMilestoneForm, setShowMilestoneForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zeitplanung & Terminierung</h2>
          <p className="text-sm text-gray-600">Gantt-Charts, Kanban-Boards und Meilensteinplanung</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'gantt' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Gantt
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Timeline
            </button>
          </div>
          <button
            onClick={() => setShowMilestoneForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            + Meilenstein
          </button>
        </div>
      </div>

      {/* Gantt Chart View */}
      {viewMode === 'gantt' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gantt-Chart</h3>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Timeline Header */}
                <div className="flex border-b border-gray-200 pb-2 mb-4">
                  <div className="w-48 font-semibold text-gray-700">Aufgabe</div>
                  <div className="flex-1 grid grid-cols-12 gap-2">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="text-center text-xs text-gray-600">
                        KW {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
                {/* Gantt Bars */}
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-48 text-sm text-gray-700">Projektplan erstellen</div>
                    <div className="flex-1 grid grid-cols-12 gap-2">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className={`h-8 rounded ${i < 2 ? 'bg-blue-500' : ''}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-48 text-sm text-gray-700">Implementierung Phase 1</div>
                    <div className="flex-1 grid grid-cols-12 gap-2">
                      {Array.from({ length: 12 }, (_, i) => (
                        <div key={i} className={`h-8 rounded ${i >= 2 && i < 6 ? 'bg-green-500' : ''}`}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Geplant', 'In Arbeit', 'Abgeschlossen'].map(status => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">{status}</h3>
              <div className="space-y-2">
                {milestones.filter(m => m.status === status).map(milestone => (
                  <div key={milestone.id} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                    <h4 className="font-semibold text-sm text-gray-900">{milestone.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{milestone.project}</p>
                    <p className="text-xs text-gray-500">📅 {new Date(milestone.date).toLocaleDateString('de-DE')}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Meilenstein-Timeline</h3>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-300"></div>
            <div className="space-y-6">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative flex items-start gap-4">
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center ${
                    milestone.status === 'Abgeschlossen' ? 'bg-green-500' :
                    milestone.status === 'In Arbeit' ? 'bg-yellow-500' :
                    'bg-gray-300'
                  }`}>
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div className="flex-1 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{milestone.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{milestone.project}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(milestone.date).toLocaleDateString('de-DE')}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          milestone.status === 'Abgeschlossen' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'In Arbeit' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deadline Management */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deadline-Management</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
            <div>
              <p className="font-semibold text-red-900">Projektplan erstellen</p>
              <p className="text-sm text-red-700">Fällig: 15.01.2026</p>
            </div>
            <span className="px-3 py-1 bg-red-600 text-white text-xs font-semibold rounded-full">
              Kritisch
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div>
              <p className="font-semibold text-yellow-900">Implementierung Phase 1</p>
              <p className="text-sm text-yellow-700">Fällig: 28.01.2026</p>
            </div>
            <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-full">
              Bald fällig
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

