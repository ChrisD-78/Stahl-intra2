'use client'

import { useState, useMemo } from 'react'
import { useTasks, Task } from '@/contexts/TasksContext'

export default function TimePlanning() {
  const { tasks } = useTasks()
  const [viewMode, setViewMode] = useState<'gantt' | 'timeline'>('gantt')
  const [dateRange, setDateRange] = useState<'month' | 'quarter' | 'year'>('quarter')

  // Berechne Start- und Enddatum für jede Aufgabe
  const tasksWithDates = useMemo(() => {
    return tasks.map(task => {
      const createdAt = new Date(task.createdAt)
      const dueDate = new Date(task.dueDate)
      const daysDiff = Math.ceil((dueDate.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))
      const startDate = createdAt
      const endDate = dueDate
      
      return {
        ...task,
        startDate,
        endDate,
        duration: Math.max(1, daysDiff)
      }
    })
  }, [tasks])

  // Generiere Wochen/Monate für Gantt
  const getTimeUnits = () => {
    const now = new Date()
    const units: Date[] = []
    
    if (dateRange === 'month') {
      for (let i = 0; i < 4; i++) {
        const date = new Date(now)
        date.setMonth(now.getMonth() + i)
        units.push(date)
      }
    } else if (dateRange === 'quarter') {
      for (let i = 0; i < 12; i++) {
        const date = new Date(now)
        date.setMonth(now.getMonth() + i)
        units.push(date)
      }
    } else {
      for (let i = 0; i < 24; i++) {
        const date = new Date(now)
        date.setMonth(now.getMonth() + i)
        units.push(date)
      }
    }
    
    return units
  }

  const timeUnits = getTimeUnits()
  const minDate = timeUnits[0]
  const maxDate = timeUnits[timeUnits.length - 1]
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))

  const getTaskPosition = (task: typeof tasksWithDates[0]) => {
    const start = task.startDate.getTime()
    const end = task.endDate.getTime()
    const min = minDate.getTime()
    const max = maxDate.getTime()
    
    if (start > max || end < min) return null
    
    const left = Math.max(0, ((start - min) / (max - min)) * 100)
    const width = Math.min(100 - left, ((end - min) / (max - min)) * 100 - left)
    
    return { left: `${left}%`, width: `${width}%` }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'Neu': return 'bg-blue-500'
      case 'Bearbeitung': return 'bg-yellow-500'
      case 'Review': return 'bg-orange-500'
      case 'Abschluss': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'Niedrig': return 'bg-gray-400'
      case 'Normal': return 'bg-blue-400'
      case 'Hoch': return 'bg-orange-400'
      case 'Kritisch': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  // Sortiere Aufgaben für Timeline nach Datum
  const sortedTasks = [...tasksWithDates].sort((a, b) => 
    a.startDate.getTime() - b.startDate.getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zeitplanung & Terminierung</h2>
          <p className="text-sm text-gray-600">Gantt-Charts und Timeline-Ansicht für Projektplanung</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
          >
            <option value="month">1 Monat</option>
            <option value="quarter">3 Monate</option>
            <option value="year">12 Monate</option>
          </select>
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
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'timeline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Chart View */}
      {viewMode === 'gantt' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gantt-Chart</h3>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Timeline Header */}
              <div className="flex border-b-2 border-gray-300 pb-2 mb-4">
                <div className="w-64 font-semibold text-gray-700 flex-shrink-0">Aufgabe</div>
                <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${timeUnits.length}, minmax(60px, 1fr))` }}>
                  {timeUnits.map((date, idx) => (
                    <div key={idx} className="text-center text-xs text-gray-600 border-l border-gray-200 pl-1">
                      <div className="font-medium">{date.toLocaleDateString('de-DE', { month: 'short' })}</div>
                      <div className="text-gray-500">{date.getFullYear()}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Gantt Bars */}
              <div className="space-y-3">
                {tasksWithDates.map((task) => {
                  const position = getTaskPosition(task)
                  if (!position) return null
                  
                  return (
                    <div key={task.id} className="flex items-center min-h-[40px]">
                      <div className="w-64 flex-shrink-0 pr-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`}></div>
                          <div>
                            <div className="font-semibold text-sm text-gray-900">{task.title}</div>
                            <div className="text-xs text-gray-500">{task.assignedTo}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 relative h-8 bg-gray-100 rounded">
                        <div
                          className={`absolute h-6 top-1 rounded ${getStatusColor(task.status)} shadow-sm flex items-center justify-center text-white text-xs font-medium`}
                          style={{ left: position.left, width: position.width, minWidth: '20px' }}
                          title={`${task.title} - ${new Date(task.startDate).toLocaleDateString('de-DE')} bis ${new Date(task.endDate).toLocaleDateString('de-DE')}`}
                        >
                          {parseFloat(position.width) > 5 && (
                            <span className="truncate px-2">{task.title}</span>
                          )}
                        </div>
                      </div>
                      <div className="w-24 flex-shrink-0 text-right text-xs text-gray-500 pl-4">
                        {new Date(task.dueDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                <span>Neu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                <span>Bearbeitung</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                <span>Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span>Abschluss</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Timeline-Ansicht</h3>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-400"></div>
            
            <div className="space-y-8">
              {sortedTasks.map((task, index) => {
                const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Abschluss'
                const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                
                return (
                  <div key={task.id} className="relative flex items-start gap-6 pl-4">
                    {/* Timeline Dot */}
                    <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                      task.status === 'Abschluss' ? 'bg-green-500' :
                      task.status === 'Review' ? 'bg-orange-500' :
                      task.status === 'Bearbeitung' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`}>
                      <span className="text-white text-2xl font-bold">{index + 1}</span>
                    </div>
                    
                    {/* Task Card */}
                    <div className={`flex-1 bg-white rounded-lg p-5 shadow-md border-2 ${
                      isOverdue ? 'border-red-300 bg-red-50' :
                      task.priority === 'Kritisch' ? 'border-red-200' :
                      task.priority === 'Hoch' ? 'border-orange-200' :
                      'border-gray-200'
                    }`}>
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-lg text-gray-900">{task.title}</h4>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              task.status === 'Abschluss' ? 'bg-green-100 text-green-800' :
                              task.status === 'Review' ? 'bg-orange-100 text-orange-800' :
                              task.status === 'Bearbeitung' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {task.status}
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              task.priority === 'Kritisch' ? 'bg-red-100 text-red-800' :
                              task.priority === 'Hoch' ? 'bg-orange-100 text-orange-800' :
                              task.priority === 'Normal' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">👤</span>
                              <span>{task.assignedTo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">⏱️</span>
                              <span>{task.estimatedHours}h geschätzt</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">📅</span>
                              <span>Erstellt: {new Date(task.createdAt).toLocaleDateString('de-DE')}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="lg:text-right">
                          <div className={`text-lg font-bold mb-1 ${
                            isOverdue ? 'text-red-600' :
                            daysUntilDue <= 7 ? 'text-orange-600' :
                            'text-gray-900'
                          }`}>
                            {new Date(task.dueDate).toLocaleDateString('de-DE', { 
                              weekday: 'short', 
                              day: '2-digit', 
                              month: '2-digit', 
                              year: 'numeric' 
                            })}
                          </div>
                          {isOverdue && (
                            <span className="text-xs text-red-600 font-semibold">⚠️ Überfällig</span>
                          )}
                          {!isOverdue && daysUntilDue <= 7 && (
                            <span className="text-xs text-orange-600 font-semibold">Bald fällig ({daysUntilDue} Tage)</span>
                          )}
                          {!isOverdue && daysUntilDue > 7 && (
                            <span className="text-xs text-gray-500">Noch {daysUntilDue} Tage</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Deadline Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deadline-Übersicht</h3>
        <div className="space-y-3">
          {tasksWithDates
            .filter(task => task.status !== 'Abschluss')
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
            .map(task => {
              const isOverdue = new Date(task.dueDate) < new Date()
              const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              
              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                    isOverdue ? 'bg-red-50 border-red-200' :
                    daysUntilDue <= 7 ? 'bg-yellow-50 border-yellow-200' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900">{task.title}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)} text-white`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{task.assignedTo}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      isOverdue ? 'text-red-600' :
                      daysUntilDue <= 7 ? 'text-orange-600' :
                      'text-gray-900'
                    }`}>
                      {new Date(task.dueDate).toLocaleDateString('de-DE')}
                    </p>
                    {isOverdue && (
                      <span className="text-xs text-red-600 font-semibold">⚠️ Überfällig</span>
                    )}
                    {!isOverdue && daysUntilDue <= 7 && (
                      <span className="text-xs text-orange-600 font-semibold">Bald fällig</span>
                    )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
