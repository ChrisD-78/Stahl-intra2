'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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
  const [tasks, setTasks] = useState<Task[]>([])

  // Load tasks from database on mount
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const response = await fetch('/api/tasks')
        if (!response.ok) throw new Error('Failed to fetch tasks')
        const data = await response.json()
        // Map database fields to Task interface
        const mappedTasks: Task[] = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          status: (t.status === 'Offen' ? 'Neu' : t.status) as Task['status'],
          priority: t.priority as Task['priority'],
          assignedTo: t.assigned_to,
          dueDate: t.due_date,
          estimatedHours: 0, // Not in database yet
          createdAt: t.created_at || new Date().toISOString().split('T')[0],
          createdBy: t.created_by,
          statusHistory: []
        }))
        setTasks(mappedTasks)
      } catch (error) {
        console.error('Failed to load tasks:', error)
      }
    }
    loadTasks()
  }, [])

  const addTask = async (task: Task) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status === 'Neu' ? 'Offen' : task.status,
          due_date: task.dueDate,
          assigned_to: task.assignedTo
        })
      })
      if (!response.ok) throw new Error('Failed to create task')
      const newTask = await response.json()
      // Map back to Task interface
      const mappedTask: Task = {
        ...task,
        id: newTask.id,
        status: (newTask.status === 'Offen' ? 'Neu' : newTask.status) as Task['status'],
        createdAt: newTask.created_at || new Date().toISOString().split('T')[0]
      }
      setTasks(prev => [...prev, mappedTask])
    } catch (error) {
      console.error('Failed to create task:', error)
      // Fallback: add to local state
      setTasks(prev => [...prev, task])
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>, changedBy?: string, action?: string) => {
    try {
      // Map Task fields to database fields
      const dbUpdates: any = {}
      if (updates.title !== undefined) dbUpdates.title = updates.title
      if (updates.description !== undefined) dbUpdates.description = updates.description
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority
      if (updates.status !== undefined) dbUpdates.status = updates.status === 'Neu' ? 'Offen' : updates.status
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate
      if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbUpdates)
      })
      if (!response.ok) throw new Error('Failed to update task')
      const updatedTask = await response.json()

      // Update local state
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
    } catch (error) {
      console.error('Failed to update task:', error)
      // Fallback: update local state
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          const newTask = { ...task, ...updates }
          
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
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to delete task')
      setTasks(prev => prev.filter(task => task.id !== taskId))
    } catch (error) {
      console.error('Failed to delete task:', error)
      // Fallback: delete from local state
      setTasks(prev => prev.filter(task => task.id !== taskId))
    }
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

