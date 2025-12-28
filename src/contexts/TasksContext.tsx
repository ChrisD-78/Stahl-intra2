'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface StatusChange {
  status: 'Neu' | 'Bearbeitung' | 'Review' | 'Abschluss'
  changedBy: string
  changedAt: string
  action?: string // z.B. "In Bearbeitung verschieben", "Protokoll hinzugefügt", etc.
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'Neu' | 'Bearbeitung' | 'Review' | 'Abschluss'
  priority: 'Niedrig' | 'Normal' | 'Hoch' | 'Kritisch'
  assignedTo: string
  dueDate: string
  estimatedHours: number
  createdAt: string
  createdBy?: string
  statusHistory?: StatusChange[] // Historie der Statusänderungen
  // Felder für Status "Neu" (nach Bearbeitung durch zugewiesene Person)
  requiredInfo?: string
  requiredCollaboration?: string
  ideaCollection?: string
  scheduling?: string
  // Felder für Status "Bearbeitung"
  protocols?: Array<{ author: string; content: string; date: string }>
  meetingProtocols?: Array<{ title: string; content: string; date: string }>
  documents?: Array<{ name: string; type: string; url?: string }>
  attachments?: Array<{ name: string; type: string; url?: string }>
  // Felder für Status "Review"
  interimReport?: string
  approvals?: Array<{ approver: string; status: 'pending' | 'approved' | 'rejected'; comment?: string; date?: string }>
  finalReport?: string
  summary?: string
}

interface TasksContextType {
  tasks: Task[]
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>, changedBy?: string, action?: string) => void
  deleteTask: (taskId: string) => void
}

const TasksContext = createContext<TasksContextType | undefined>(undefined)

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Projektplan erstellen',
      description: 'Detaillierter Projektplan für Q1 2026',
      status: 'Neu',
      priority: 'Hoch',
      assignedTo: 'Eva Klein',
      dueDate: '2026-01-15',
      estimatedHours: 16,
      createdAt: '2025-12-01',
      createdBy: 'System',
      statusHistory: [
        {
          status: 'Neu',
          changedBy: 'System',
          changedAt: '2025-12-01T10:00:00',
          action: 'Aufgabe erstellt'
        }
      ]
    }
  ])

  const addTask = (task: Task) => {
    setTasks(prev => [...prev, task])
  }

  const updateTask = (taskId: string, updates: Partial<Task>, changedBy?: string, action?: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newTask = { ...task, ...updates }
        
        // Wenn Status geändert wurde, füge zur Historie hinzu
        if (updates.status && updates.status !== task.status) {
          const statusChange: StatusChange = {
            status: updates.status,
            changedBy: changedBy || task.assignedTo || 'Unbekannt',
            changedAt: new Date().toISOString(),
            action: action || `Status geändert zu ${updates.status}`
          }
          newTask.statusHistory = [
            ...(task.statusHistory || []),
            statusChange
          ]
        }
        
        return newTask
      }
      return task
    }))
  }

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  return (
    <TasksContext.Provider value={{ tasks, setTasks, addTask, updateTask, deleteTask }}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TasksContext)
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider')
  }
  return context
}

