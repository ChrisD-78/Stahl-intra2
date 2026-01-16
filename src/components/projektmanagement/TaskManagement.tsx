'use client'

import { useState, useRef } from 'react'
import { useTasks, Task } from '@/contexts/TasksContext'

const mockUsers = ['Eva Klein', 'Jonas Meier', 'Carla Nguyen', 'Felix Sturm', 'Mara Schubert', 'Leon Fuchs']
const mockDecisionMakers = ['Geschäftsführung', 'Projektleitung', 'Abteilungsleitung', 'Vorstand']

export default function TaskManagement() {
  const { tasks, setTasks, updateTask } = useTasks()
  const [showForm, setShowForm] = useState(false)
  const [showTaskDetail, setShowTaskDetail] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterPriority, setFilterPriority] = useState<string>('')
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Normal' as Task['priority'],
    assignedTo: '',
    dueDate: '',
    estimatedHours: 0
  })

  const statusColumns: Task['status'][] = ['Neu', 'Bearbeitung', 'Review', 'Abschluss']
  const priorityColors = {
    Niedrig: 'bg-gray-100 text-gray-800',
    Normal: 'bg-blue-100 text-blue-800',
    Hoch: 'bg-orange-100 text-orange-800',
    Kritisch: 'bg-red-100 text-red-800'
  }

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = !filterStatus || task.status === filterStatus
    const matchesPriority = !filterPriority || task.priority === filterPriority
    return matchesStatus && matchesPriority
  })

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    const newTask: Task = {
      id: Date.now().toString(),
      ...formData,
      status: 'Neu',
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: formData.assignedTo || 'System',
      statusHistory: [
        {
          status: 'Neu',
          changedBy: formData.assignedTo || 'System',
          changedAt: now,
          action: 'Aufgabe erstellt'
        }
      ]
    }
    setTasks((prev: Task[]) => [...prev, newTask])
    setShowForm(false)
    setFormData({
      title: '',
      description: '',
      priority: 'Normal',
      assignedTo: '',
      dueDate: '',
      estimatedHours: 0
    })
  }

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task)
    setShowTaskDetail(true)
  }

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, status: Task['status']) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(status)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, targetStatus: Task['status']) => {
    e.preventDefault()
    if (draggedTask) {
      updateTask(
        draggedTask.id, 
        { status: targetStatus },
        draggedTask.assignedTo || 'System',
        `Status geändert zu ${targetStatus} (per Drag & Drop)`
      )
      setDraggedTask(null)
      setDragOverColumn(null)
    }
  }

  const handleUpdateTask = (updatedTask: Task) => {
    // Update all fields of the task
    const { id, ...updates } = updatedTask
    updateTask(id, updates)
    setShowTaskDetail(false)
    setSelectedTask(null)
  }

  const handleMoveToStatus = (taskId: string, newStatus: Task['status'], changedBy?: string, action?: string) => {
    const task = tasks.find(t => t.id === taskId)
    updateTask(
      taskId, 
      { status: newStatus },
      changedBy || task?.assignedTo || 'System',
      action || `Status geändert zu ${newStatus}`
    )
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
          </div>
          <button
            onClick={() => {
              setShowForm(true)
              setFormData({
                title: '',
                description: '',
                priority: 'Normal',
                assignedTo: '',
                dueDate: '',
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
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Alle Status</option>
          {statusColumns.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
        >
          <option value="">Alle Prioritäten</option>
          <option value="Niedrig">Niedrig</option>
          <option value="Normal">Normal</option>
          <option value="Hoch">Hoch</option>
          <option value="Kritisch">Kritisch</option>
        </select>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusColumns.map(status => {
            const columnTasks = filteredTasks.filter(t => t.status === status)
            return (
              <div
                key={status}
                className={`bg-gray-50 rounded-lg p-3 min-h-[400px] transition-colors ${
                  dragOverColumn === status ? 'bg-blue-100 border-2 border-blue-400' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                  {status} ({columnTasks.length})
                </h3>
                <div className="space-y-3">
                  {columnTasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-move"
                      onClick={() => handleTaskClick(task)}
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
                      {task.estimatedHours > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          ⏱️ {task.estimatedHours}h geschätzt
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
                      onChange={(e) => handleMoveToStatus(task.id, e.target.value as Task['status'])}
                      className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-900"
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
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTaskClick(task)}
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

      {/* New Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Neue Aufgabe erstellen</h3>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titel *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priorität *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
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
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fälligkeitsdatum *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Geschätzte Stunden *</label>
                  <input
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData({ ...formData, estimatedHours: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    min="0"
                    required
                  />
                </div>
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
                  Erstellen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {showTaskDetail && selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => {
            setShowTaskDetail(false)
            setSelectedTask(null)
          }}
          onUpdate={handleUpdateTask}
          onMoveToStatus={handleMoveToStatus}
        />
      )}
    </div>
  )
}

// Task Detail Modal Component
function TaskDetailModal({ 
  task, 
  onClose, 
  onUpdate,
  onMoveToStatus 
}: { 
  task: Task
  onClose: () => void
  onUpdate: (task: Task) => void
  onMoveToStatus: (taskId: string, status: Task['status'], changedBy?: string, action?: string) => void
}) {
  const [editedTask, setEditedTask] = useState<Task>(task)
  const [activeTab, setActiveTab] = useState<'details' | 'work'>('details')
  const [showProtocolModal, setShowProtocolModal] = useState(false)
  const [showMeetingProtocolModal, setShowMeetingProtocolModal] = useState(false)
  const [protocolForm, setProtocolForm] = useState({ author: '', content: '' })
  const [meetingProtocolForm, setMeetingProtocolForm] = useState({ title: '', content: '' })

  const handleSave = () => {
    onUpdate(editedTask)
  }

  const handleAddProtocol = () => {
    setShowProtocolModal(true)
    setProtocolForm({ author: '', content: '' })
  }

  const handleSaveProtocol = () => {
    if (protocolForm.author && protocolForm.content) {
      setEditedTask({
        ...editedTask,
        protocols: [
          ...(editedTask.protocols || []),
          { author: protocolForm.author, content: protocolForm.content, date: new Date().toISOString().split('T')[0] }
        ]
      })
      setShowProtocolModal(false)
      setProtocolForm({ author: '', content: '' })
    }
  }

  const handleAddMeetingProtocol = () => {
    setShowMeetingProtocolModal(true)
    setMeetingProtocolForm({ title: '', content: '' })
  }

  const handleSaveMeetingProtocol = () => {
    if (meetingProtocolForm.title && meetingProtocolForm.content) {
      setEditedTask({
        ...editedTask,
        meetingProtocols: [
          ...(editedTask.meetingProtocols || []),
          { title: meetingProtocolForm.title, content: meetingProtocolForm.content, date: new Date().toISOString().split('T')[0] }
        ]
      })
      setShowMeetingProtocolModal(false)
      setMeetingProtocolForm({ title: '', content: '' })
    }
  }

  const handleAddDocument = () => {
    const name = prompt('Dokumentenname:')
    const type = prompt('Typ (PDF, Word, Excel, etc.):')
    if (name && type) {
      setEditedTask({
        ...editedTask,
        documents: [
          ...(editedTask.documents || []),
          { name, type }
        ]
      })
    }
  }

  const handleAddAttachment = () => {
    const name = prompt('Anhang-Name:')
    const type = prompt('Typ:')
    if (name && type) {
      setEditedTask({
        ...editedTask,
        attachments: [
          ...(editedTask.attachments || []),
          { name, type }
        ]
      })
    }
  }

  const handleRequestApproval = (approver: string) => {
    setEditedTask({
      ...editedTask,
      approvals: [
        ...(editedTask.approvals || []),
        { approver, status: 'pending' as const }
      ]
    })
  }

  const handleApprove = (approver: string, approved: boolean) => {
    setEditedTask({
      ...editedTask,
      approvals: (editedTask.approvals || []).map(a =>
        a.approver === approver
          ? { ...a, status: approved ? 'approved' as const : 'rejected' as const, date: new Date().toISOString().split('T')[0] }
          : a
      )
    })
  }

  const canMoveToNextStatus = () => {
    if (task.status === 'Neu') {
      return editedTask.requiredInfo && editedTask.requiredCollaboration && editedTask.ideaCollection && editedTask.scheduling
    }
    if (task.status === 'Bearbeitung') {
      return (editedTask.protocols && editedTask.protocols.length > 0) || 
             (editedTask.meetingProtocols && editedTask.meetingProtocols.length > 0)
    }
    if (task.status === 'Review') {
      return editedTask.interimReport && 
             editedTask.approvals && 
             editedTask.approvals.every(a => a.status === 'approved')
    }
    return false
  }

  const getNextStatus = (): Task['status'] | null => {
    const statusFlow: Task['status'][] = ['Neu', 'Bearbeitung', 'Review', 'Abschluss']
    const currentIndex = statusFlow.indexOf(task.status)
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white">{task.title}</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('work')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'work' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              Bearbeitung
            </button>
          </div>

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Beschreibung</label>
                <textarea
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">{task.status}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priorität</label>
                  <select
                    value={editedTask.priority}
                    onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as Task['priority'] })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  >
                    <option value="Niedrig">Niedrig</option>
                    <option value="Normal">Normal</option>
                    <option value="Hoch">Hoch</option>
                    <option value="Kritisch">Kritisch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zugewiesen an</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">{task.assignedTo}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fälligkeitsdatum</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">{new Date(task.dueDate).toLocaleDateString('de-DE')}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Geschätzte Stunden</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">{task.estimatedHours}h</div>
                </div>
              </div>
            </div>
          )}

          {/* Work Tab - Status-specific fields */}
          {activeTab === 'work' && (
            <div className="space-y-6">
              {/* Status: Neu - Bearbeitungsfelder */}
              {task.status === 'Neu' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Bearbeitungsfelder (von zugewiesener Person auszufüllen)</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Erforderliche Informationen</label>
                    <textarea
                      value={editedTask.requiredInfo || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, requiredInfo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                      placeholder="Welche Informationen werden benötigt?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Erforderliche Mitarbeit</label>
                    <textarea
                      value={editedTask.requiredCollaboration || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, requiredCollaboration: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                      placeholder="Welche Mitarbeiter werden benötigt?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ideensammlung</label>
                    <textarea
                      value={editedTask.ideaCollection || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, ideaCollection: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                      placeholder="Ideen und Vorschläge..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Terminierung</label>
                    <textarea
                      value={editedTask.scheduling || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, scheduling: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={3}
                      placeholder="Termine und Zeitplanung..."
                    />
                  </div>
                  {canMoveToNextStatus() && (
                    <button
                      onClick={() => {
                        handleSave()
                        onMoveToStatus(task.id, 'Bearbeitung', task.assignedTo, 'In Bearbeitung verschieben')
                        onClose()
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      In Bearbeitung verschieben
                    </button>
                  )}
                </div>
              )}

              {/* Status: Bearbeitung */}
              {task.status === 'Bearbeitung' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Bearbeitungsdokumentation</h4>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Protokolle</label>
                      <button
                        onClick={handleAddProtocol}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Protokoll erstellen
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editedTask.protocols || []).map((protocol, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">{protocol.author} - {protocol.date}</div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">{protocol.content}</div>
                        </div>
                      ))}
                      {(!editedTask.protocols || editedTask.protocols.length === 0) && (
                        <p className="text-sm text-gray-500 italic">Noch keine Protokolle vorhanden</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Besprechungsprotokolle</label>
                      <button
                        onClick={handleAddMeetingProtocol}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Besprechungsprotokoll erstellen
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editedTask.meetingProtocols || []).map((protocol, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                          <div className="font-medium text-sm mb-1">{protocol.title}</div>
                          <div className="text-xs text-gray-500 mb-1">{protocol.date}</div>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap">{protocol.content}</div>
                        </div>
                      ))}
                      {(!editedTask.meetingProtocols || editedTask.meetingProtocols.length === 0) && (
                        <p className="text-sm text-gray-500 italic">Noch keine Besprechungsprotokolle vorhanden</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Unterlagen</label>
                      <button
                        onClick={handleAddDocument}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Unterlage hinzufügen
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editedTask.documents || []).map((doc, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                          <span className="text-sm text-gray-700">{doc.name} ({doc.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Anhänge (PDF, etc.)</label>
                      <button
                        onClick={handleAddAttachment}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Anhang hinzufügen
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(editedTask.attachments || []).map((att, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                          <span className="text-sm text-gray-700">{att.name} ({att.type})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {canMoveToNextStatus() && (
                    <button
                      onClick={() => {
                        handleSave()
                        onMoveToStatus(task.id, 'Review', task.assignedTo, 'In Review verschieben')
                        onClose()
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                    >
                      In Review verschieben
                    </button>
                  )}
                </div>
              )}

              {/* Status: Review */}
              {task.status === 'Review' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Review & Freigabe</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zwischenbericht</label>
                    <textarea
                      value={editedTask.interimReport || ''}
                      onChange={(e) => setEditedTask({ ...editedTask, interimReport: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                      rows={5}
                      placeholder="Zwischenbericht erstellen..."
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Freigaben von Entscheidungsträgern</label>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleRequestApproval(e.target.value)
                            e.target.value = ''
                          }
                        }}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-900"
                      >
                        <option value="">Freigabe anfordern...</option>
                        {mockDecisionMakers.map(dm => (
                          <option key={dm} value={dm}>{dm}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      {(editedTask.approvals || []).map((approval, idx) => (
                        <div key={idx} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                          <span className="text-sm text-gray-700">{approval.approver}</span>
                          <div className="flex gap-2">
                            {approval.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApprove(approval.approver, true)}
                                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                  Genehmigen
                                </button>
                                <button
                                  onClick={() => handleApprove(approval.approver, false)}
                                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                  Ablehnen
                                </button>
                              </>
                            )}
                            {approval.status === 'approved' && (
                              <span className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded">✓ Genehmigt</span>
                            )}
                            {approval.status === 'rejected' && (
                              <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded">✗ Abgelehnt</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {canMoveToNextStatus() && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Abschlussbericht (Zusammenfassung)</label>
                        <textarea
                          value={editedTask.finalReport || ''}
                          onChange={(e) => setEditedTask({ ...editedTask, finalReport: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          rows={5}
                          placeholder="Abschlussbericht schreiben..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Zusammenfassung</label>
                        <textarea
                          value={editedTask.summary || ''}
                          onChange={(e) => setEditedTask({ ...editedTask, summary: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                          rows={3}
                          placeholder="Kurze Zusammenfassung..."
                        />
                      </div>
                      <button
                        onClick={() => {
                          handleSave()
                          onMoveToStatus(task.id, 'Abschluss', task.assignedTo, 'In Abschluss verschieben')
                          onClose()
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        In Abschluss verschieben
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Status: Abschluss */}
              {task.status === 'Abschluss' && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-900">Abgeschlossene Aufgabe</h4>
                  {editedTask.finalReport && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Abschlussbericht</label>
                      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                        {editedTask.finalReport}
                      </div>
                    </div>
                  )}
                  {editedTask.summary && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zusammenfassung</label>
                      <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
                        {editedTask.summary}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Schließen
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Speichern
            </button>
          </div>
        </div>

        {/* Protocol Creation Modal */}
        {showProtocolModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Protokoll erstellen</h3>
                  <button
                    onClick={() => {
                      setShowProtocolModal(false)
                      setProtocolForm({ author: '', content: '' })
                    }}
                    className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Autor *</label>
                  <select
                    value={protocolForm.author}
                    onChange={(e) => setProtocolForm({ ...protocolForm, author: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  >
                    <option value="">Bitte wählen</option>
                    {mockUsers.map(user => (
                      <option key={user} value={user}>{user}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protokoll-Inhalt *</label>
                  <textarea
                    value={protocolForm.content}
                    onChange={(e) => setProtocolForm({ ...protocolForm, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={10}
                    placeholder="Geben Sie hier den Protokoll-Inhalt ein..."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProtocolModal(false)
                      setProtocolForm({ author: '', content: '' })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveProtocol}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Protokoll speichern
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meeting Protocol Creation Modal */}
        {showMeetingProtocolModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-white">Besprechungsprotokoll erstellen</h3>
                  <button
                    onClick={() => {
                      setShowMeetingProtocolModal(false)
                      setMeetingProtocolForm({ title: '', content: '' })
                    }}
                    className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Besprechungstitel *</label>
                  <input
                    type="text"
                    value={meetingProtocolForm.title}
                    onChange={(e) => setMeetingProtocolForm({ ...meetingProtocolForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    placeholder="z.B. Projektbesprechung Q1 2026"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Protokoll-Inhalt *</label>
                  <textarea
                    value={meetingProtocolForm.content}
                    onChange={(e) => setMeetingProtocolForm({ ...meetingProtocolForm, content: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                    rows={10}
                    placeholder="Geben Sie hier den Besprechungsprotokoll-Inhalt ein..."
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMeetingProtocolModal(false)
                      setMeetingProtocolForm({ title: '', content: '' })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={handleSaveMeetingProtocol}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Protokoll speichern
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
