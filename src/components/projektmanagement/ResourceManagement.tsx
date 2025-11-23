'use client'

import { useState } from 'react'

interface Resource {
  id: string
  name: string
  type: 'Mitarbeiter' | 'Material' | 'Budget'
  capacity: number
  allocated: number
  project: string
  status: 'Verfügbar' | 'Ausgelastet' | 'Überlastet'
}

export default function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([
    { id: '1', name: 'Eva Klein', type: 'Mitarbeiter', capacity: 40, allocated: 35, project: 'Digitalisierung 2026', status: 'Ausgelastet' },
    { id: '2', name: 'Jonas Meier', type: 'Mitarbeiter', capacity: 40, allocated: 25, project: 'Digitalisierung 2026', status: 'Verfügbar' },
    { id: '3', name: 'IT-Budget Q1', type: 'Budget', capacity: 50000, allocated: 32000, project: 'Digitalisierung 2026', status: 'Verfügbar' },
    { id: '4', name: 'Server-Infrastruktur', type: 'Material', capacity: 10, allocated: 8, project: 'Digitalisierung 2026', status: 'Ausgelastet' },
  ])

  const getUtilizationColor = (allocated: number, capacity: number) => {
    const percentage = (allocated / capacity) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUtilizationPercentage = (allocated: number, capacity: number) => {
    return Math.round((allocated / capacity) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ressourcenmanagement</h2>
          <p className="text-sm text-gray-600">Mitarbeiterkapazität, Budget und Materialressourcen verwalten</p>
        </div>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
          + Ressource hinzufügen
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Mitarbeiter</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">12</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Budget verfügbar</p>
              <p className="text-2xl font-bold text-green-900 mt-1">€ 180.000</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">Materialressourcen</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">24</p>
            </div>
            <span className="text-3xl">📦</span>
          </div>
        </div>
      </div>

      {/* Resource List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ressource</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Typ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Kapazität</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Allokiert</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Auslastung</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Projekt</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {resources.map(resource => {
                const percentage = getUtilizationPercentage(resource.allocated, resource.capacity)
                const displayValue = resource.type === 'Budget' 
                  ? `€ ${resource.allocated.toLocaleString()} / € ${resource.capacity.toLocaleString()}`
                  : `${resource.allocated} / ${resource.capacity}`
                
                return (
                  <tr key={resource.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{resource.name}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        resource.type === 'Mitarbeiter' ? 'bg-blue-100 text-blue-800' :
                        resource.type === 'Budget' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {resource.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {resource.type === 'Budget' ? `€ ${resource.capacity.toLocaleString()}` : resource.capacity}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {resource.type === 'Budget' ? `€ ${resource.allocated.toLocaleString()}` : resource.allocated}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getUtilizationColor(resource.allocated, resource.capacity)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-12 text-right">{percentage}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        resource.status === 'Verfügbar' ? 'bg-green-100 text-green-800' :
                        resource.status === 'Ausgelastet' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {resource.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{resource.project}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Capacity Planning */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mitarbeiterkapazitätsplanung</h3>
        <div className="space-y-4">
          {resources.filter(r => r.type === 'Mitarbeiter').map(resource => {
            const percentage = getUtilizationPercentage(resource.allocated, resource.capacity)
            return (
              <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{resource.name}</span>
                  <span className="text-sm text-gray-600">{resource.allocated}h / {resource.capacity}h</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getUtilizationColor(resource.allocated, resource.capacity)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">{percentage}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budgetverwaltung</h3>
        <div className="space-y-3">
          {resources.filter(r => r.type === 'Budget').map(resource => {
            const percentage = getUtilizationPercentage(resource.allocated, resource.capacity)
            const remaining = resource.capacity - resource.allocated
            return (
              <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{resource.name}</span>
                  <span className="text-sm font-semibold text-green-600">€ {remaining.toLocaleString()} verfügbar</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getUtilizationColor(resource.allocated, resource.capacity)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">{percentage}%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Verwendet: € {resource.allocated.toLocaleString()}</span>
                  <span>Gesamt: € {resource.capacity.toLocaleString()}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

