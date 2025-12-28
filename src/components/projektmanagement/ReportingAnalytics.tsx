'use client'

import { useState, useMemo } from 'react'
import { useTasks, Task, StatusChange } from '@/contexts/TasksContext'

interface Activity {
  type: 'status' | 'protocol' | 'meeting' | 'document' | 'attachment' | 'approval' | 'report'
  taskId: string
  taskTitle: string
  changedBy: string
  changedAt: string
  action: string
  details?: string
}

export default function ReportingAnalytics() {
  const { tasks } = useTasks()
  const [reportType, setReportType] = useState<'overview' | 'tasks' | 'resources' | 'budget' | 'timeline'>('tasks')
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Berechne Statistiken aus tatsächlichen Aufgaben
  const stats = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'Abschluss').length
    const inProgressTasks = tasks.filter(t => t.status === 'Bearbeitung' || t.status === 'Review').length
    const pendingTasks = tasks.filter(t => t.status === 'Neu').length
    
    // Berechne Pünktlichkeit
    const completedWithDueDate = tasks.filter(t => t.status === 'Abschluss' && t.dueDate)
    const onTime = completedWithDueDate.filter(t => {
      const dueDate = new Date(t.dueDate)
      const lastStatusChange = t.statusHistory?.[t.statusHistory.length - 1]
      if (!lastStatusChange) return false
      const completedAt = new Date(lastStatusChange.changedAt)
      return completedAt <= dueDate
    }).length
    const onTimeDelivery = completedWithDueDate.length > 0 
      ? Math.round((onTime / completedWithDueDate.length) * 100) 
      : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      onTimeDelivery
    }
  }, [tasks])

  // Filtere Aufgaben nach Datumsbereich
  const filteredTasks = useMemo(() => {
    const now = new Date()
    const rangeStart = new Date()
    
    switch (dateRange) {
      case 'week':
        rangeStart.setDate(now.getDate() - 7)
        break
      case 'month':
        rangeStart.setMonth(now.getMonth() - 1)
        break
      case 'quarter':
        rangeStart.setMonth(now.getMonth() - 3)
        break
      case 'year':
        rangeStart.setFullYear(now.getFullYear() - 1)
        break
    }

    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= rangeStart
    })
  }, [tasks, dateRange])

  // Sammle alle Aktivitäten (Statusänderungen, Protokolle, etc.)
  const allActivities = useMemo(() => {
    const activities: Activity[] = []
    
    tasks.forEach(task => {
      // Statusänderungen
      if (task.statusHistory) {
        task.statusHistory.forEach(change => {
          activities.push({
            type: 'status',
            taskId: task.id,
            taskTitle: task.title,
            changedBy: change.changedBy,
            changedAt: change.changedAt,
            action: change.action || `Status geändert zu ${change.status}`,
            details: change.status
          })
        })
      }

      // Protokolle
      if (task.protocols) {
        task.protocols.forEach(protocol => {
          activities.push({
            type: 'protocol',
            taskId: task.id,
            taskTitle: task.title,
            changedBy: protocol.author,
            changedAt: protocol.date + 'T12:00:00', // Falls nur Datum vorhanden
            action: 'Protokoll hinzugefügt',
            details: protocol.content.substring(0, 100) + (protocol.content.length > 100 ? '...' : '')
          })
        })
      }

      // Besprechungsprotokolle
      if (task.meetingProtocols) {
        task.meetingProtocols.forEach(meeting => {
          activities.push({
            type: 'meeting',
            taskId: task.id,
            taskTitle: task.title,
            changedBy: 'System', // Könnte erweitert werden
            changedAt: meeting.date + 'T12:00:00',
            action: `Besprechungsprotokoll: ${meeting.title}`,
            details: meeting.content.substring(0, 100) + (meeting.content.length > 100 ? '...' : '')
          })
        })
      }

      // Dokumente
      if (task.documents) {
        task.documents.forEach(doc => {
          activities.push({
            type: 'document',
            taskId: task.id,
            taskTitle: task.title,
            changedBy: task.assignedTo,
            changedAt: new Date().toISOString(), // Könnte erweitert werden
            action: `Dokument hinzugefügt: ${doc.name}`,
            details: doc.type
          })
        })
      }

      // Anhänge
      if (task.attachments) {
        task.attachments.forEach(att => {
          activities.push({
            type: 'attachment',
            taskId: task.id,
            taskTitle: task.title,
            changedBy: task.assignedTo,
            changedAt: new Date().toISOString(), // Könnte erweitert werden
            action: `Anhang hinzugefügt: ${att.name}`,
            details: att.type
          })
        })
      }

      // Freigaben
      if (task.approvals) {
        task.approvals.forEach(approval => {
          if (approval.date) {
            activities.push({
              type: 'approval',
              taskId: task.id,
              taskTitle: task.title,
              changedBy: approval.approver,
              changedAt: approval.date + 'T12:00:00',
              action: `Freigabe ${approval.status === 'approved' ? 'erteilt' : 'abgelehnt'}`,
              details: approval.comment || ''
            })
          }
        })
      }

      // Zwischenbericht
      if (task.interimReport) {
        activities.push({
          type: 'report',
          taskId: task.id,
          taskTitle: task.title,
          changedBy: task.assignedTo,
          changedAt: new Date().toISOString(), // Könnte erweitert werden
          action: 'Zwischenbericht erstellt',
          details: task.interimReport.substring(0, 100) + (task.interimReport.length > 100 ? '...' : '')
        })
      }

      // Abschlussbericht
      if (task.finalReport) {
        activities.push({
          type: 'report',
          taskId: task.id,
          taskTitle: task.title,
          changedBy: task.assignedTo,
          changedAt: new Date().toISOString(), // Könnte erweitert werden
          action: 'Abschlussbericht erstellt',
          details: task.finalReport.substring(0, 100) + (task.finalReport.length > 100 ? '...' : '')
        })
      }
    })
    
    return activities.sort((a, b) => 
      new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    )
  }, [tasks])

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Neu': return 'bg-blue-100 text-blue-800'
      case 'Bearbeitung': return 'bg-yellow-100 text-yellow-800'
      case 'Review': return 'bg-orange-100 text-orange-800'
      case 'Abschluss': return 'bg-green-100 text-green-800'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Niedrig': return 'bg-gray-100 text-gray-800'
      case 'Normal': return 'bg-blue-100 text-blue-800'
      case 'Hoch': return 'bg-orange-100 text-orange-800'
      case 'Kritisch': return 'bg-red-100 text-red-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reporting & Analytics</h2>
          <p className="text-sm text-gray-600">Projektkennzahlen, Berichte und Analysen</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="week">Letzte Woche</option>
            <option value="month">Letzter Monat</option>
            <option value="quarter">Letztes Quartal</option>
            <option value="year">Letztes Jahr</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
            📊 Bericht exportieren
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setReportType('overview')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            reportType === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Übersicht
        </button>
        <button
          onClick={() => setReportType('tasks')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            reportType === 'tasks'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Aufgaben
        </button>
        <button
          onClick={() => setReportType('timeline')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            reportType === 'timeline'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Aktivitäts-Timeline
        </button>
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Gesamt Aufgaben</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalTasks}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium">Abgeschlossen</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.completedTasks}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0}%
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-700 font-medium">In Bearbeitung</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.inProgressTasks}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {stats.totalTasks > 0 ? Math.round((stats.inProgressTasks / stats.totalTasks) * 100) : 0}%
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">Pünktlichkeit</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{stats.onTimeDelivery}%</p>
              <p className="text-xs text-orange-600 mt-1">Termineinhaltung</p>
            </div>
          </div>

          {/* Task Status Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Task-Status Verteilung</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Abgeschlossen</span>
                  <span className="font-semibold text-gray-900">{stats.completedTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-green-500 h-3 rounded-full" 
                    style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">In Bearbeitung</span>
                  <span className="font-semibold text-gray-900">{stats.inProgressTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full" 
                    style={{ width: `${stats.totalTasks > 0 ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">Neu</span>
                  <span className="font-semibold text-gray-900">{stats.pendingTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${stats.totalTasks > 0 ? (stats.pendingTasks / stats.totalTasks) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Report with Activity Timeline */}
      {reportType === 'tasks' && (
        <div className="space-y-6">
          {/* Task List */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Aufgaben-Übersicht</h3>
              <p className="text-sm text-gray-600 mt-1">{filteredTasks.length} Aufgaben im ausgewählten Zeitraum</p>
            </div>
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
                        <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{task.assignedTo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(task.dueDate).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedTask(task)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                          Details anzeigen
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredTasks.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        Keine Aufgaben im ausgewählten Zeitraum
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Task Detail Modal */}
          {selectedTask && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">{selectedTask.title}</h3>
                    <button
                      onClick={() => setSelectedTask(null)}
                      className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Task Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedTask.status)}`}>
                        {selectedTask.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priorität</label>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                        {selectedTask.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Zugewiesen an</label>
                      <p className="text-sm text-gray-900">{selectedTask.assignedTo}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fälligkeitsdatum</label>
                      <p className="text-sm text-gray-900">{new Date(selectedTask.dueDate).toLocaleDateString('de-DE')}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Erstellt am</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedTask.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Geschätzte Stunden</label>
                      <p className="text-sm text-gray-900">{selectedTask.estimatedHours}h</p>
                    </div>
                  </div>

                  {/* Activity Timeline */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Aktivitäts-Timeline</h4>
                    {(() => {
                      // Sammle alle Aktivitäten für diese Aufgabe
                      const taskActivities: Activity[] = []
                      
                      // Statusänderungen
                      if (selectedTask.statusHistory) {
                        selectedTask.statusHistory.forEach(change => {
                          taskActivities.push({
                            type: 'status',
                            taskId: selectedTask.id,
                            taskTitle: selectedTask.title,
                            changedBy: change.changedBy,
                            changedAt: change.changedAt,
                            action: change.action || `Status geändert zu ${change.status}`,
                            details: change.status
                          })
                        })
                      }

                      // Protokolle
                      if (selectedTask.protocols) {
                        selectedTask.protocols.forEach(protocol => {
                          taskActivities.push({
                            type: 'protocol',
                            taskId: selectedTask.id,
                            taskTitle: selectedTask.title,
                            changedBy: protocol.author,
                            changedAt: protocol.date + 'T12:00:00',
                            action: 'Protokoll hinzugefügt',
                            details: protocol.content.substring(0, 100) + (protocol.content.length > 100 ? '...' : '')
                          })
                        })
                      }

                      // Besprechungsprotokolle
                      if (selectedTask.meetingProtocols) {
                        selectedTask.meetingProtocols.forEach(meeting => {
                          taskActivities.push({
                            type: 'meeting',
                            taskId: selectedTask.id,
                            taskTitle: selectedTask.title,
                            changedBy: 'System',
                            changedAt: meeting.date + 'T12:00:00',
                            action: `Besprechungsprotokoll: ${meeting.title}`,
                            details: meeting.content.substring(0, 100) + (meeting.content.length > 100 ? '...' : '')
                          })
                        })
                      }

                      // Dokumente
                      if (selectedTask.documents) {
                        selectedTask.documents.forEach(doc => {
                          taskActivities.push({
                            type: 'document',
                            taskId: selectedTask.id,
                            taskTitle: selectedTask.title,
                            changedBy: selectedTask.assignedTo,
                            changedAt: new Date().toISOString(),
                            action: `Dokument hinzugefügt: ${doc.name}`,
                            details: doc.type
                          })
                        })
                      }

                      // Anhänge
                      if (selectedTask.attachments) {
                        selectedTask.attachments.forEach(att => {
                          taskActivities.push({
                            type: 'attachment',
                            taskId: selectedTask.id,
                            taskTitle: selectedTask.title,
                            changedBy: selectedTask.assignedTo,
                            changedAt: new Date().toISOString(),
                            action: `Anhang hinzugefügt: ${att.name}`,
                            details: att.type
                          })
                        })
                      }

                      // Freigaben
                      if (selectedTask.approvals) {
                        selectedTask.approvals.forEach(approval => {
                          if (approval.date) {
                            taskActivities.push({
                              type: 'approval',
                              taskId: selectedTask.id,
                              taskTitle: selectedTask.title,
                              changedBy: approval.approver,
                              changedAt: approval.date + 'T12:00:00',
                              action: `Freigabe ${approval.status === 'approved' ? 'erteilt' : 'abgelehnt'}`,
                              details: approval.comment || ''
                            })
                          }
                        })
                      }

                      // Zwischenbericht
                      if (selectedTask.interimReport) {
                        taskActivities.push({
                          type: 'report',
                          taskId: selectedTask.id,
                          taskTitle: selectedTask.title,
                          changedBy: selectedTask.assignedTo,
                          changedAt: new Date().toISOString(),
                          action: 'Zwischenbericht erstellt',
                          details: selectedTask.interimReport.substring(0, 100) + (selectedTask.interimReport.length > 100 ? '...' : '')
                        })
                      }

                      // Abschlussbericht
                      if (selectedTask.finalReport) {
                        taskActivities.push({
                          type: 'report',
                          taskId: selectedTask.id,
                          taskTitle: selectedTask.title,
                          changedBy: selectedTask.assignedTo,
                          changedAt: new Date().toISOString(),
                          action: 'Abschlussbericht erstellt',
                          details: selectedTask.finalReport.substring(0, 100) + (selectedTask.finalReport.length > 100 ? '...' : '')
                        })
                      }

                      // Sortiere chronologisch (neueste zuerst)
                      const sortedActivities = taskActivities.sort((a, b) => 
                        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
                      )

                      const getActivityIcon = (type: Activity['type']) => {
                        switch (type) {
                          case 'status': return '🔄'
                          case 'protocol': return '📝'
                          case 'meeting': return '👥'
                          case 'document': return '📄'
                          case 'attachment': return '📎'
                          case 'approval': return '✓'
                          case 'report': return '📊'
                          default: return '•'
                        }
                      }

                      const getActivityColor = (type: Activity['type']) => {
                        switch (type) {
                          case 'status': return 'bg-indigo-500'
                          case 'protocol': return 'bg-blue-500'
                          case 'meeting': return 'bg-purple-500'
                          case 'document': return 'bg-green-500'
                          case 'attachment': return 'bg-yellow-500'
                          case 'approval': return 'bg-emerald-500'
                          case 'report': return 'bg-orange-500'
                          default: return 'bg-gray-500'
                        }
                      }

                      return sortedActivities.length > 0 ? (
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200"></div>
                          <div className="space-y-4">
                            {sortedActivities.map((activity, index) => (
                              <div key={index} className="relative flex items-start gap-4 pl-4">
                                <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                  <span className="text-white text-xs">{getActivityIcon(activity.type)}</span>
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-semibold text-gray-900">{activity.action}</span>
                                      {activity.type === 'status' && activity.details && (
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.details as Task['status'])}`}>
                                          {activity.details}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      {new Date(activity.changedAt).toLocaleDateString('de-DE', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </span>
                                  </div>
                                  <div className="text-sm text-gray-700 mb-1">
                                    <span className="font-medium">Von:</span> {activity.changedBy}
                                  </div>
                                  {activity.details && activity.type !== 'status' && (
                                    <div className="text-xs text-gray-600 mt-2 italic">
                                      {activity.details}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">Noch keine Aktivitäten erfasst</p>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Activity Timeline Report */}
      {reportType === 'timeline' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivitäts-Timeline (Alle Aufgaben)</h3>
          <div className="space-y-4">
            {allActivities.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-indigo-200"></div>
                <div className="space-y-4">
                  {allActivities.map((activity, index) => {
                    const getActivityIcon = (type: Activity['type']) => {
                      switch (type) {
                        case 'status': return '🔄'
                        case 'protocol': return '📝'
                        case 'meeting': return '👥'
                        case 'document': return '📄'
                        case 'attachment': return '📎'
                        case 'approval': return '✓'
                        case 'report': return '📊'
                        default: return '•'
                      }
                    }

                    const getActivityColor = (type: Activity['type']) => {
                      switch (type) {
                        case 'status': return 'bg-indigo-500'
                        case 'protocol': return 'bg-blue-500'
                        case 'meeting': return 'bg-purple-500'
                        case 'document': return 'bg-green-500'
                        case 'attachment': return 'bg-yellow-500'
                        case 'approval': return 'bg-emerald-500'
                        case 'report': return 'bg-orange-500'
                        default: return 'bg-gray-500'
                      }
                    }

                    return (
                      <div key={index} className="relative flex items-start gap-4 pl-4">
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                          <span className="text-white text-xs">{getActivityIcon(activity.type)}</span>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">{activity.taskTitle}</span>
                              <span className="text-sm text-gray-600">{activity.action}</span>
                              {activity.type === 'status' && activity.details && (
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(activity.details as Task['status'])}`}>
                                  {activity.details}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(activity.changedAt).toLocaleDateString('de-DE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">Von:</span> {activity.changedBy}
                          </div>
                          {activity.details && activity.type !== 'status' && (
                            <div className="text-xs text-gray-600 mt-2 italic">
                              {activity.details}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">Noch keine Aktivitäten erfasst</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
