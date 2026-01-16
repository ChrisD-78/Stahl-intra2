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
  materialType?: string // Für Materialressourcen
}

const materialTypes = [
  'Besprechungszimmer',
  'Arbeitsplatz',
  'Arbeitsort',
  'Arbeitsmaterialien',
  'KFZ',
  'IT-Ausstattung',
  'Möbel',
  'Technische Geräte',
  'Sonstiges'
]

const mockProjects = [
  'Digitalisierung 2026',
  'Kundenprojekt Alpha',
  'Interne Optimierung',
  'Neue Standorte',
  'Schulungsprogramm'
]

export default function ResourceManagement() {
  const [resources, setResources] = useState<Resource[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'Mitarbeiter' as Resource['type'],
    capacity: 0,
    project: '',
    materialType: ''
  })

  const getUtilizationColor = (allocated: number, capacity: number) => {
    const percentage = (allocated / capacity) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getUtilizationPercentage = (allocated: number, capacity: number) => {
    return Math.round((allocated / capacity) * 100)
  }

  const calculateStatus = (allocated: number, capacity: number): Resource['status'] => {
    const percentage = (allocated / capacity) * 100
    if (percentage >= 100) return 'Überlastet'
    if (percentage >= 80) return 'Ausgelastet'
    return 'Verfügbar'
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.project) {
      alert('Bitte füllen Sie alle Pflichtfelder aus.')
      return
    }

    if (formData.type === 'Material' && !formData.materialType) {
      alert('Bitte wählen Sie einen Materialtyp aus.')
      return
    }

    if (formData.capacity <= 0) {
      alert('Die Kapazität muss größer als 0 sein.')
      return
    }

    const newResource: Resource = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      capacity: formData.capacity,
      allocated: 0, // Startet mit 0 allokiert
      project: formData.project,
      status: 'Verfügbar',
      materialType: formData.type === 'Material' ? formData.materialType : undefined
    }

    setResources([...resources, newResource])
    setShowForm(false)
    setFormData({
      name: '',
      type: 'Mitarbeiter',
      capacity: 0,
      project: '',
      materialType: ''
    })
  }

  const employeeCount = resources.filter(r => r.type === 'Mitarbeiter').length
  const totalBudget = resources.filter(r => r.type === 'Budget').reduce((sum, r) => sum + (r.capacity - r.allocated), 0)
  const materialCount = resources.filter(r => r.type === 'Material').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ressourcenmanagement</h2>
          <p className="text-sm text-gray-600">Mitarbeiterkapazität, Budget und Materialressourcen verwalten</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          + Ressource hinzufügen
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Mitarbeiter</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{employeeCount}</p>
            </div>
            <span className="text-3xl">👥</span>
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Budget verfügbar</p>
              <p className="text-2xl font-bold text-green-900 mt-1">€ {totalBudget.toLocaleString()}</p>
            </div>
            <span className="text-3xl">💰</span>
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">Materialressourcen</p>
              <p className="text-2xl font-bold text-orange-900 mt-1">{materialCount}</p>
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
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{resource.name}</div>
                      {resource.materialType && (
                        <div className="text-xs text-gray-500 mt-1">{resource.materialType}</div>
                      )}
                    </td>
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
                      {resource.type === 'Mitarbeiter' && <span className="text-gray-500">h/Woche</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {resource.type === 'Budget' ? `€ ${resource.allocated.toLocaleString()}` : resource.allocated}
                      {resource.type === 'Mitarbeiter' && <span className="text-gray-500">h</span>}
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

      {/* Material Resources Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Materialressourcen</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.filter(r => r.type === 'Material').map(resource => {
            const percentage = getUtilizationPercentage(resource.allocated, resource.capacity)
            return (
              <div key={resource.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-semibold text-gray-900">{resource.name}</span>
                    {resource.materialType && (
                      <div className="text-xs text-gray-500 mt-1">{resource.materialType}</div>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    resource.status === 'Verfügbar' ? 'bg-green-100 text-green-800' :
                    resource.status === 'Ausgelastet' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {resource.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {resource.allocated} / {resource.capacity} genutzt
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUtilizationColor(resource.allocated, resource.capacity)}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700 w-10 text-right">{percentage}%</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">Projekt: {resource.project}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Resource Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Neue Ressource hinzufügen</h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      name: '',
                      type: 'Mitarbeiter',
                      capacity: 0,
                      project: '',
                      materialType: ''
                    })
                  }}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ressourcenname *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                    placeholder={formData.type === 'Mitarbeiter' ? 'z.B. Max Mustermann' : formData.type === 'Budget' ? 'z.B. IT-Budget Q1 2026' : 'z.B. Besprechungszimmer 1'}
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ressourcentyp *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      type: e.target.value as Resource['type'],
                      materialType: e.target.value !== 'Material' ? '' : formData.materialType
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                    required
                  >
                    <option value="Mitarbeiter">Mitarbeiter</option>
                    <option value="Budget">Budget</option>
                    <option value="Material">Material</option>
                  </select>
                </div>

                {formData.type === 'Material' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Materialtyp *</label>
                    <select
                      value={formData.materialType}
                      onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                      required
                    >
                      <option value="">Bitte wählen</option>
                      {materialTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.type === 'Mitarbeiter' ? 'Kapazität (Stunden pro Woche) *' :
                     formData.type === 'Budget' ? 'Budget (€) *' :
                     'Kapazität (Anzahl) *'}
                  </label>
                  <input
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                    placeholder={formData.type === 'Mitarbeiter' ? 'z.B. 40' : formData.type === 'Budget' ? 'z.B. 50000' : 'z.B. 10'}
                    min="0"
                    step={formData.type === 'Budget' ? '100' : '1'}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.type === 'Mitarbeiter' && 'Geben Sie die wöchentliche Arbeitszeit in Stunden ein'}
                    {formData.type === 'Budget' && 'Geben Sie den verfügbaren Budgetbetrag in Euro ein'}
                    {formData.type === 'Material' && 'Geben Sie die Anzahl der verfügbaren Einheiten ein'}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Projekt *</label>
                  <select
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
                    required
                  >
                    <option value="">Bitte wählen</option>
                    {mockProjects.map(project => (
                      <option key={project} value={project}>{project}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setFormData({
                      name: '',
                      type: 'Mitarbeiter',
                      capacity: 0,
                      project: '',
                      materialType: ''
                    })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Ressource hinzufügen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
