'use client'

import { useState } from 'react'

interface Task {
  id: string
  title: string
  description: string
  status: 'Neu' | 'In Planung' | 'In Bearbeitung' | 'In Review' | 'Abgeschlossen' | 'Blockiert'
  priority: 'Niedrig' | 'Normal' | 'Hoch' | 'Kritisch'
  assignedTo: string
  dueDate: string
  project: string
  dependencies: string[]
  tags: string[]
  estimatedHours: number
  actualHours: number
  createdAt: string
}

export default function TaskManagement() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Projektplan erstellen',
      description: 'Detaillierter Projektplan für Q1 2026',
      status: 'In Bearbeitung',
      priority: 'Hoch',
      assignedTo: 'Eva Klein',
      dueDate: '2026-01-15',
      project: 'Digitalisierung 2026',
      dependencies: [],
      tags: ['Planung', 'Strategie'],
      estimatedHours: 16,
      actualHours: 8,
      createdAt: '2025-12-01'
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'gantt'>('kanban')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')
  const [filterProject, setFilterProject] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Neu' as Task['status'],
    priority: 'Normal' as Task['priority'],
    assignedTo: '',
    dueDate: '',
    project: '',
    dependencies: [] as string[],
    tags: [] as string[],
    estimatedHours: 0
  })

  const statusColumns = ['Neu', 'In Planung', 'In Bearbeitung', 'In Review', 'Abgeschlossen', 'Blockiert']
  const priorityColors = {
    Niedrig: 'bg-gray-100 text-gray-800',
    Normal: 'bg-blue-100 text-blue-800',
    Hoch: 'bg-orange-100 text-orange-800',
    Kritisch: 'bg-red-100 text-red-800'
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filterStatus || task.status === filterStatus
    const matchesPriority = !filterPriority || task.priority === filterPriority
    const matchesProject = !filterProject || task.project === filterProject
    return matchesStatus && matchesPriority && matchesProject
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedTask) {
      setTasks(tasks.map(t => t.id === selectedTask.id ? { ...selectedTask, ...formData } : t))
    } else {
      const newTask: Task = {
        id: Date.now().toString(),
        ...formData,
        dependencies: formData.dependencies,
        tags: formData.tags,
        actualHours: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }
      setTasks([...tasks, newTask])
    }
    setShowForm(false)
    setSelectedTask(null)
    setFormData({
      title: '',
      description: '',
      status: 'Neu',
      priority: 'Normal',
      assignedTo: '',
      dueDate: '',
      project: '',
      dependencies: [],
      tags: [],
      estimatedHours: 0
    })
  }

  const handleEdit = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      project: task.project,
      dependencies: task.dependencies,
      tags: task.tags,
      estimatedHours: task.estimatedHours
    })
    setShowForm(true)
  }

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Aufgabenverwaltung</h2>
          <p className="text-sm text-gray-600">Erstellen, zuweisen und verfolgen Sie Projekttasks</p>
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
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('gantt')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'gantt' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Gantt
            </button>
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setSelectedTask(null)
              setFormData({
                title: '',
                description: '',
                status: 'Neu',
                priority: 'Normal',
                assignedTo: '',
                dueDate: '',
                project: '',
                dependencies: [],
                tags: [],
                estimatedHours: 0
              })
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Neue Aufgabe
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle Status</option>
          {statusColumns.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alle Prioritäten</option>
          <option value="Niedrig">Niedrig</option>
          <option value="Normal">Normal</option>
          <option value="Hoch">Hoch</option>
          <option value="Kritisch">Kritisch</option>
        </select>
        <input
          type="text"
          value={filterProject}
          onChange={(e) => setFilterProject(e.target.value)}
          placeholder="Projekt filtern..."
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statusColumns.map(status => {
            const columnTasks = filteredTasks.filter(t => t.status === status)
            return (
              <div key={status} className="bg-gray-50 rounded-lg p-3 min-h-[400px]">
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                  {status} ({columnTasks.length})
                </h3>
                <div className="space-y-3">
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleEdit(task)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm text-gray-900">{task.title}</h4>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>👤 {task.assignedTo}</span>
                        <span>📅 {new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
                      </div>
                      {task.dependencies.length > 0 && (
                        <div className="mt-2 text-xs text-orange-600">
                          🔗 {task.dependencies.length} Abhängigkeit(en)
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Aufgabe</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Priorität</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Zugewiesen</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Fällig</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Projekt</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{task.title}</div>
                    <div className="text-xs text-gray-500">{task.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as Task['status'])}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      {statusColumns.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{task.assignedTo}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{new Date(task.dueDate).toLocaleDateString('de-DE')}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{task.project}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Bearbeiten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Gantt View Placeholder */}
      {viewMode === 'gantt' && (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Gantt-Chart-Ansicht</p>
          <p className="text-sm text-gray-500">Die Gantt-Chart-Funktionalität wird in der Zeitplanung & Terminierung implementiert.</p>
        </div>
      )}

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  {selectedTask ? 'Aufgabe bearbeiten' : 'Neue Aufgabe erstellen'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setSelectedTask(null)
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titel *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {statusColumns.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priorität *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Niedrig">Niedrig</option>
                    <option value="Normal">Normal</option>
                    <option value="Hoch">Hoch</option>
                    <option value="Kritisch">Kritisch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zugewiesen an *</label>
                  <select
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Bitte wählen</option>
                    <option value="Eva Klein">Eva Klein</option>
                    <option value="Jonas Meier">Jonas Meier</option>
                    <option value="Carla Nguyen">Carla Nguyen</option>
                    <option value="Felix Sturm">Felix Sturm</option>
                    <option value="Mara Schubert">Mara Schubert</option>
                    <option value="Leon Fuchs">Leon Fuchs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fälligkeitsdatum *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Projekt *</label>
                  <input
                    type="text"
                    value={formData.project}
                    onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Geschätzte Stunden</label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (kommagetrennt)</label>
                  <input
                    type="text"
                    placeholder="z.B. Planung, Strategie, Wichtig"
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(t => t.trim()) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Abhängigkeiten (IDs kommagetrennt)</label>
                  <input
                    type="text"
                    placeholder="z.B. 1, 2, 3"
                    value={formData.dependencies.join(', ')}
                    onChange={(e) => setFormData({ ...formData, dependencies: e.target.value.split(',').map(d => d.trim()) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Geben Sie die IDs der Aufgaben ein, von denen diese Aufgabe abhängt</p>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedTask(null)
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {selectedTask ? 'Aktualisieren' : 'Erstellen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


