'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/AuthProvider'

// Types
interface BrainstormingComment {
  id: string
  text: string
  author: string
  timestamp: Date
}

interface BrainstormingNote {
  id: string
  text: string
  author: string
  timestamp: Date
  comments: BrainstormingComment[]
}

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string[]
  createdFrom: string // Brainstorming session ID
  status: 'draft' | 'in-progress' | 'review' | 'approved' | 'completed'
  progress: number
  assignedBy: string
  createdAt: Date
  reviewer?: string
  reviewNotes?: string
  completedAt?: Date
  documentation?: string
}

interface BrainstormingSession {
  id: string
  title: string
  description: string
  createdBy: string
  createdAt: Date
  participants: string[]
  notes: BrainstormingNote[]
  status: 'active' | 'completed'
}

interface Process {
  id: string
  title: string
  description: string
  brainstormingSession?: BrainstormingSession
  tasks: Task[]
  status: 'planning' | 'in-progress' | 'review' | 'completed'
  createdAt: Date
  completedAt?: Date
}

export default function ProzessePage() {
  const { isLoggedIn, currentUser } = useAuth()
  const [processes, setProcesses] = useState<Process[]>([])
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'brainstorming' | 'tasks' | 'workflow' | 'documentation'>('overview')
  const [showNewProcessModal, setShowNewProcessModal] = useState(false)
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [showBrainstormingModal, setShowBrainstormingModal] = useState(false)
  const [showStartBrainstormingModal, setShowStartBrainstormingModal] = useState(false)
  const [showTaskFromIdeaModal, setShowTaskFromIdeaModal] = useState(false)
  const [selectedNote, setSelectedNote] = useState<BrainstormingNote | null>(null)
  const [showCommentsForNote, setShowCommentsForNote] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')

  // Mock users
  const mockUsers = ['Max Mustermann', 'Anna Schmidt', 'Tom Weber', 'Lisa Müller', 'Peter Klein']

  // Load mock data
  useEffect(() => {
    const mockProcesses: Process[] = [
      {
        id: '1',
        title: 'Website Relaunch',
        description: 'Neugestaltung der Unternehmenswebsite',
        brainstormingSession: {
          id: 'bs-1',
          title: 'Website Relaunch Planung',
          description: 'Ideensammlung für den Website Relaunch',
          createdBy: 'Max Mustermann',
          createdAt: new Date('2025-01-15'),
          participants: ['Max Mustermann', 'Anna Schmidt', 'Tom Weber'],
          notes: [
            { 
              id: 'n1', 
              text: 'Modernes, responsives Design implementieren', 
              author: 'Max Mustermann', 
              timestamp: new Date('2025-01-15T10:00:00'),
              comments: [
                { id: 'c1', text: 'Sollten wir Tailwind CSS verwenden?', author: 'Anna Schmidt', timestamp: new Date('2025-01-15T10:05:00') },
                { id: 'c2', text: 'Ja, das wäre eine gute Wahl!', author: 'Max Mustermann', timestamp: new Date('2025-01-15T10:10:00') }
              ]
            },
            { 
              id: 'n2', 
              text: 'Neue Produktseiten mit besseren Bildern', 
              author: 'Anna Schmidt', 
              timestamp: new Date('2025-01-15T10:15:00'),
              comments: []
            },
            { 
              id: 'n3', 
              text: 'Integration eines Kontaktformulars', 
              author: 'Tom Weber', 
              timestamp: new Date('2025-01-15T10:30:00'),
              comments: [
                { id: 'c3', text: 'Mit CAPTCHA gegen Spam?', author: 'Lisa Müller', timestamp: new Date('2025-01-15T10:35:00') }
              ]
            },
            { 
              id: 'n4', 
              text: 'SEO-Optimierung durchführen', 
              author: 'Max Mustermann', 
              timestamp: new Date('2025-01-15T10:45:00'),
              comments: []
            },
          ],
          status: 'completed'
        },
        tasks: [
          {
            id: 't1',
            title: 'Design-Konzept erstellen',
            description: 'Wireframes und Mockups für neue Website erstellen',
            assignedTo: ['Anna Schmidt'],
            createdFrom: 'bs-1',
            status: 'completed',
            progress: 100,
            assignedBy: 'Max Mustermann',
            createdAt: new Date('2025-01-16'),
            reviewer: 'Max Mustermann',
            reviewNotes: 'Design genehmigt',
            completedAt: new Date('2025-01-20'),
            documentation: 'Design-Konzept wurde erstellt und genehmigt. Alle Mockups sind im Design-Ordner verfügbar.'
          },
          {
            id: 't2',
            title: 'Frontend-Entwicklung',
            description: 'HTML/CSS/JS Implementation des Designs',
            assignedTo: ['Tom Weber'],
            createdFrom: 'bs-1',
            status: 'review',
            progress: 90,
            assignedBy: 'Max Mustermann',
            createdAt: new Date('2025-01-21'),
            reviewer: 'Anna Schmidt',
            documentation: 'Frontend ist zu 90% fertig. Wartet auf finales Review.'
          },
          {
            id: 't3',
            title: 'Kontaktformular implementieren',
            description: 'Backend und Frontend für Kontaktformular',
            assignedTo: ['Tom Weber', 'Lisa Müller'],
            createdFrom: 'bs-1',
            status: 'in-progress',
            progress: 60,
            assignedBy: 'Max Mustermann',
            createdAt: new Date('2025-01-22')
          },
          {
            id: 't4',
            title: 'SEO-Optimierung',
            description: 'Meta-Tags, Sitemap, robots.txt einrichten',
            assignedTo: ['Peter Klein'],
            createdFrom: 'bs-1',
            status: 'draft',
            progress: 0,
            assignedBy: 'Max Mustermann',
            createdAt: new Date('2025-01-22')
          }
        ],
        status: 'in-progress',
        createdAt: new Date('2025-01-15')
      }
    ]
    setProcesses(mockProcesses)
  }, [])

  // New process form
  const [newProcess, setNewProcess] = useState({
    title: '',
    description: ''
  })

  // New brainstorming form
  const [newBrainstorming, setNewBrainstorming] = useState({
    title: '',
    description: '',
    participants: [] as string[]
  })

  // New task form
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: [] as string[]
  })

  // Brainstorming note
  const [newNote, setNewNote] = useState('')

  const handleCreateProcess = () => {
    if (!newProcess.title) return

    const process: Process = {
      id: `p-${Date.now()}`,
      title: newProcess.title,
      description: newProcess.description,
      tasks: [],
      status: 'planning',
      createdAt: new Date()
    }

    setProcesses([...processes, process])
    setSelectedProcess(process)
    setShowNewProcessModal(false)
    setNewProcess({ title: '', description: '' })
  }

  const handleStartBrainstorming = () => {
    if (!selectedProcess || !newBrainstorming.title) return

    const brainstormingSession: BrainstormingSession = {
      id: `bs-${Date.now()}`,
      title: newBrainstorming.title,
      description: newBrainstorming.description,
      createdBy: currentUser || 'Unbekannt',
      createdAt: new Date(),
      participants: [currentUser || 'Unbekannt', ...newBrainstorming.participants],
      notes: [],
      status: 'active'
    }

    const updatedProcesses = processes.map(p => {
      if (p.id === selectedProcess.id) {
        return {
          ...p,
          brainstormingSession
        }
      }
      return p
    })

    setProcesses(updatedProcesses)
    setSelectedProcess(updatedProcesses.find(p => p.id === selectedProcess.id) || null)
    setShowStartBrainstormingModal(false)
    setNewBrainstorming({ title: '', description: '', participants: [] })
    setActiveTab('brainstorming')
  }

  const handleAddBrainstormingNote = () => {
    if (!selectedProcess || !selectedProcess.brainstormingSession || !newNote.trim()) return

    const note: BrainstormingNote = {
      id: `n-${Date.now()}`,
      text: newNote,
      author: currentUser || 'Unbekannt',
      timestamp: new Date(),
      comments: []
    }

    const updatedProcesses = processes.map(p => {
      if (p.id === selectedProcess.id && p.brainstormingSession) {
        return {
          ...p,
          brainstormingSession: {
            ...p.brainstormingSession,
            notes: [...p.brainstormingSession.notes, note]
          }
        }
      }
      return p
    })

    setProcesses(updatedProcesses)
    setSelectedProcess(updatedProcesses.find(p => p.id === selectedProcess.id) || null)
    setNewNote('')
  }

  const handleAddComment = (noteId: string) => {
    if (!selectedProcess || !selectedProcess.brainstormingSession || !newComment.trim()) return

    const comment: BrainstormingComment = {
      id: `c-${Date.now()}`,
      text: newComment,
      author: currentUser || 'Unbekannt',
      timestamp: new Date()
    }

    const updatedProcesses = processes.map(p => {
      if (p.id === selectedProcess.id && p.brainstormingSession) {
        return {
          ...p,
          brainstormingSession: {
            ...p.brainstormingSession,
            notes: p.brainstormingSession.notes.map(note => 
              note.id === noteId 
                ? { ...note, comments: [...note.comments, comment] }
                : note
            )
          }
        }
      }
      return p
    })

    setProcesses(updatedProcesses)
    setSelectedProcess(updatedProcesses.find(p => p.id === selectedProcess.id) || null)
    setNewComment('')
  }

  const handleCreateTaskFromIdea = () => {
    if (!selectedProcess || !selectedNote) return

    const task: Task = {
      id: `t-${Date.now()}`,
      title: selectedNote.text.substring(0, 50) + (selectedNote.text.length > 50 ? '...' : ''),
      description: `Aus Brainstorming-Idee:\n\n"${selectedNote.text}"\n\n- Von: ${selectedNote.author}\n- Am: ${selectedNote.timestamp.toLocaleDateString('de-DE')}`,
      assignedTo: newTask.assignedTo,
      createdFrom: selectedProcess.brainstormingSession?.id || '',
      status: 'draft',
      progress: 0,
      assignedBy: currentUser || 'Unbekannt',
      createdAt: new Date()
    }

    const updatedProcesses = processes.map(p => {
      if (p.id === selectedProcess.id) {
        return {
          ...p,
          tasks: [...p.tasks, task],
          status: p.status === 'planning' ? 'in-progress' as const : p.status
        }
      }
      return p
    })

    setProcesses(updatedProcesses)
    setSelectedProcess(updatedProcesses.find(p => p.id === selectedProcess.id) || null)
    setShowTaskFromIdeaModal(false)
    setSelectedNote(null)
    setNewTask({ title: '', description: '', assignedTo: [] })
    setActiveTab('tasks')
  }

  const handleCreateTask = () => {
    if (!selectedProcess || !newTask.title || newTask.assignedTo.length === 0) return

    const task: Task = {
      id: `t-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      createdFrom: selectedProcess.brainstormingSession.id,
      status: 'draft',
      progress: 0,
      assignedBy: currentUser || 'Unbekannt',
      createdAt: new Date()
    }

    const updatedProcesses = processes.map(p => {
      if (p.id === selectedProcess.id) {
        return {
          ...p,
          tasks: [...p.tasks, task],
          status: p.status === 'planning' ? 'in-progress' as const : p.status
        }
      }
      return p
    })

    setProcesses(updatedProcesses)
    setSelectedProcess(updatedProcesses.find(p => p.id === selectedProcess.id) || null)
    setShowNewTaskModal(false)
    setNewTask({ title: '', description: '', assignedTo: [] })
  }

  const handleUpdateTaskStatus = (taskId: string, newStatus: Task['status'], reviewer?: string) => {
    if (!selectedProcess) return

    const updatedProcesses = processes.map(p => {
      if (p.id === selectedProcess.id) {
        const updatedTasks = p.tasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: newStatus,
              reviewer: reviewer || t.reviewer,
              completedAt: newStatus === 'completed' ? new Date() : t.completedAt
            }
          }
          return t
        })
        return { ...p, tasks: updatedTasks }
      }
      return p
    })

    setProcesses(updatedProcesses)
    setSelectedProcess(updatedProcesses.find(p => p.id === selectedProcess.id) || null)
  }

  const handleUpdateTaskProgress = (taskId: string, progress: number) => {
    if (!selectedProcess) return

    const updatedProcesses = processes.map(p => {
      if (p.id === selectedProcess.id) {
        const updatedTasks = p.tasks.map(t => {
          if (t.id === taskId) {
            return { ...t, progress }
          }
          return t
        })
        return { ...p, tasks: updatedTasks }
      }
      return p
    })

    setProcesses(updatedProcesses)
    setSelectedProcess(updatedProcesses.find(p => p.id === selectedProcess.id) || null)
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'review': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: Task['status']) => {
    switch (status) {
      case 'draft': return 'Entwurf'
      case 'in-progress': return 'In Bearbeitung'
      case 'review': return 'Zur Freigabe'
      case 'approved': return 'Freigegeben'
      case 'completed': return 'Abgeschlossen'
      default: return status
    }
  }

  if (!isLoggedIn) {
    return null
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Prozessmanagement</h1>
              <p className="text-gray-600">Kollaborative Prozesse mit Brainstorming, Aufgabenverwaltung und Workflow-Tracking</p>
            </div>

            {/* Process Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Prozesse</h2>
                <button
                  onClick={() => setShowNewProcessModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Neuer Prozess</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {processes.map(process => (
                  <div
                    key={process.id}
                    onClick={() => {
                      setSelectedProcess(process)
                      setActiveTab('overview')
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedProcess?.id === process.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400 bg-white'
                    }`}
                  >
                    <h3 className="font-bold text-gray-900 mb-2">{process.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{process.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`px-2 py-1 rounded-full ${
                        process.status === 'completed' ? 'bg-green-100 text-green-800' :
                        process.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        process.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {process.status === 'planning' ? 'Planung' :
                         process.status === 'in-progress' ? 'In Arbeit' :
                         process.status === 'review' ? 'Review' : 'Abgeschlossen'}
                      </span>
                      <span className="text-gray-500">{process.tasks.length} Aufgaben</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Process Details */}
            {selectedProcess && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Tabs */}
                <div className="flex space-x-1 mb-6 border-b border-gray-200">
                  {[
                    { key: 'overview', label: 'Übersicht', icon: '📊' },
                    { key: 'brainstorming', label: 'Brainstorming', icon: '💡' },
                    { key: 'tasks', label: 'Aufgaben', icon: '📋' },
                    { key: 'workflow', label: 'Workflow', icon: '🔄' },
                    { key: 'documentation', label: 'Dokumentation', icon: '📄' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                        activeTab === tab.key
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-2">{tab.icon}</span>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedProcess.title}</h2>
                      <p className="text-gray-600">{selectedProcess.description}</p>
                    </div>

                    {/* Brainstorming Status */}
                    {!selectedProcess.brainstormingSession && (
                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-2 border-teal-200 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-teal-900 mb-2">💡 Brainstorming-Sitzung starten</h3>
                            <p className="text-teal-700 text-sm">
                              Laden Sie Kollegen ein und sammeln Sie gemeinsam Ideen für diesen Prozess.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowStartBrainstormingModal(true)}
                            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap"
                          >
                            Brainstorming starten
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm text-blue-600 mb-1">Brainstorming-Notizen</div>
                        <div className="text-2xl font-bold text-blue-900">
                          {selectedProcess.brainstormingSession?.notes.length || 0}
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm text-green-600 mb-1">Aufgaben gesamt</div>
                        <div className="text-2xl font-bold text-green-900">
                          {selectedProcess.tasks.length}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm text-purple-600 mb-1">Abgeschlossene Aufgaben</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {selectedProcess.tasks.filter(t => t.status === 'completed').length}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-900 mb-3">Fortschritt</h3>
                      <div className="space-y-2">
                        {selectedProcess.tasks.map(task => (
                          <div key={task.id} className="flex items-center space-x-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{task.title}</span>
                                <span className="text-sm text-gray-500">{task.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Brainstorming Tab */}
                {activeTab === 'brainstorming' && (
                  <div className="space-y-6">
                    {!selectedProcess.brainstormingSession ? (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">💡</div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Keine Brainstorming-Sitzung</h3>
                        <p className="text-gray-600 mb-6">Starten Sie eine Brainstorming-Sitzung und laden Sie Kollegen ein.</p>
                        <button
                          onClick={() => setShowStartBrainstormingModal(true)}
                          className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                        >
                          Brainstorming starten
                        </button>
                      </div>
                    ) : (
                      <>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            {selectedProcess.brainstormingSession.title}
                          </h2>
                          <p className="text-gray-600 mb-4">{selectedProcess.brainstormingSession.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                            <span>👤 Erstellt von: {selectedProcess.brainstormingSession.createdBy}</span>
                            <span>📅 {selectedProcess.brainstormingSession.createdAt.toLocaleDateString('de-DE')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700">👥 Teilnehmer:</span>
                            {selectedProcess.brainstormingSession.participants.map((participant, index) => (
                              <span key={index} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                                {participant}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Add Note */}
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h3 className="font-bold text-gray-900 mb-3">Neue Idee hinzufügen</h3>
                          <div className="flex space-x-3">
                            <textarea
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="Ihre Idee oder Anmerkung..."
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              rows={2}
                            />
                            <button
                              onClick={handleAddBrainstormingNote}
                              disabled={!newNote.trim()}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Hinzufügen
                            </button>
                          </div>
                        </div>

                        {/* Notes List */}
                        <div className="space-y-4">
                          <h3 className="font-bold text-gray-900">Gesammelte Ideen ({selectedProcess.brainstormingSession.notes.length})</h3>
                          {selectedProcess.brainstormingSession.notes.map(note => (
                            <div key={note.id} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                              <p className="text-gray-900 mb-3 font-medium">{note.text}</p>
                              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <span>👤 {note.author}</span>
                                <span>{note.timestamp.toLocaleString('de-DE')}</span>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-gray-200">
                                <button
                                  onClick={() => {
                                    setSelectedNote(note)
                                    setShowTaskFromIdeaModal(true)
                                  }}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors text-sm font-medium flex items-center space-x-1"
                                >
                                  <span>✓</span>
                                  <span>Aufgabe erstellen</span>
                                </button>
                                <button
                                  onClick={() => setShowCommentsForNote(showCommentsForNote === note.id ? null : note.id)}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium flex items-center space-x-1"
                                >
                                  <span>💬</span>
                                  <span>Kommentare ({note.comments.length})</span>
                                </button>
                              </div>

                              {/* Comments Section */}
                              {showCommentsForNote === note.id && (
                                <div className="mt-3 space-y-3">
                                  {/* Existing Comments */}
                                  {note.comments.length > 0 && (
                                    <div className="space-y-2">
                                      {note.comments.map(comment => (
                                        <div key={comment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                          <p className="text-sm text-gray-800 mb-1">{comment.text}</p>
                                          <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>👤 {comment.author}</span>
                                            <span>{comment.timestamp.toLocaleString('de-DE')}</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Add Comment */}
                                  <div className="flex space-x-2">
                                    <input
                                      type="text"
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                      placeholder="Kommentar hinzufügen..."
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter' && newComment.trim()) {
                                          handleAddComment(note.id)
                                        }
                                      }}
                                    />
                                    <button
                                      onClick={() => handleAddComment(note.id)}
                                      disabled={!newComment.trim()}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                                    >
                                      Senden
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Aufgaben</h2>
                      <button
                        onClick={() => setShowNewTaskModal(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                      >
                        <span>➕</span>
                        <span>Neue Aufgabe</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {selectedProcess.tasks.map(task => (
                        <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 mb-1">{task.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                              {getStatusLabel(task.status)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                            <div>
                              <span className="text-gray-500">Zugewiesen an:</span>
                              <div className="font-medium text-gray-900">{task.assignedTo.join(', ')}</div>
                            </div>
                            <div>
                              <span className="text-gray-500">Erstellt von:</span>
                              <div className="font-medium text-gray-900">{task.assignedBy}</div>
                            </div>
                          </div>

                          {task.reviewer && (
                            <div className="text-sm mb-3">
                              <span className="text-gray-500">Reviewer:</span>
                              <span className="font-medium text-gray-900 ml-2">{task.reviewer}</span>
                            </div>
                          )}

                          <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm text-gray-600">Fortschritt</span>
                              <span className="text-sm font-medium text-gray-900">{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            {task.status === 'draft' && (
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                In Bearbeitung
                              </button>
                            )}
                            {task.status === 'in-progress' && (
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, 'review', mockUsers[0])}
                                className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
                              >
                                Zur Freigabe senden
                              </button>
                            )}
                            {task.status === 'review' && (
                              <>
                                <button
                                  onClick={() => handleUpdateTaskStatus(task.id, 'approved')}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                >
                                  Freigeben
                                </button>
                                <button
                                  onClick={() => handleUpdateTaskStatus(task.id, 'in-progress')}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                >
                                  Zurückweisen
                                </button>
                              </>
                            )}
                            {task.status === 'approved' && (
                              <button
                                onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                                className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                              >
                                Als erledigt markieren
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workflow Tab */}
                {activeTab === 'workflow' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Workflow-Übersicht</h2>

                    {/* Visual Workflow */}
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-8">
                        {['Entwurf', 'In Bearbeitung', 'Zur Freigabe', 'Freigegeben', 'Abgeschlossen'].map((stage, index) => (
                          <div key={stage} className="flex items-center">
                            <div className="text-center">
                              <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-white mb-2 ${
                                index === 0 ? 'bg-gray-500' :
                                index === 1 ? 'bg-blue-500' :
                                index === 2 ? 'bg-yellow-500' :
                                index === 3 ? 'bg-green-500' :
                                'bg-purple-500'
                              }`}>
                                {selectedProcess.tasks.filter(t => 
                                  (index === 0 && t.status === 'draft') ||
                                  (index === 1 && t.status === 'in-progress') ||
                                  (index === 2 && t.status === 'review') ||
                                  (index === 3 && t.status === 'approved') ||
                                  (index === 4 && t.status === 'completed')
                                ).length}
                              </div>
                              <div className="text-sm font-medium text-gray-700">{stage}</div>
                            </div>
                            {index < 4 && (
                              <div className="w-12 h-1 bg-gray-300 mx-2" />
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Tasks by Status */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        {[
                          { status: 'draft', label: 'Entwurf', color: 'gray' },
                          { status: 'in-progress', label: 'In Bearbeitung', color: 'blue' },
                          { status: 'review', label: 'Zur Freigabe', color: 'yellow' },
                          { status: 'approved', label: 'Freigegeben', color: 'green' },
                          { status: 'completed', label: 'Abgeschlossen', color: 'purple' }
                        ].map(({ status, label, color }) => (
                          <div key={status} className="bg-white rounded-lg p-4 border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-3 text-sm">{label}</h3>
                            <div className="space-y-2">
                              {selectedProcess.tasks
                                .filter(t => t.status === status)
                                .map(task => (
                                  <div key={task.id} className={`p-2 rounded bg-${color}-50 border border-${color}-200`}>
                                    <div className="text-xs font-medium text-gray-900 truncate" title={task.title}>
                                      {task.title}
                                    </div>
                                    <div className="text-xs text-gray-600 mt-1">
                                      {task.assignedTo[0]}
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Documentation Tab */}
                {activeTab === 'documentation' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-gray-900">Vollständige Dokumentation</h2>

                    {/* Process Summary */}
                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="font-bold text-blue-900 mb-3">Prozess-Zusammenfassung</h3>
                      <div className="space-y-2 text-sm">
                        <div><span className="font-medium">Titel:</span> {selectedProcess.title}</div>
                        <div><span className="font-medium">Beschreibung:</span> {selectedProcess.description}</div>
                        <div><span className="font-medium">Erstellt am:</span> {selectedProcess.createdAt.toLocaleDateString('de-DE')}</div>
                        <div><span className="font-medium">Status:</span> {selectedProcess.status}</div>
                        <div><span className="font-medium">Anzahl Aufgaben:</span> {selectedProcess.tasks.length}</div>
                        <div><span className="font-medium">Abgeschlossene Aufgaben:</span> {selectedProcess.tasks.filter(t => t.status === 'completed').length}</div>
                      </div>
                    </div>

                    {/* Brainstorming Documentation */}
                    {selectedProcess.brainstormingSession ? (
                      <div className="bg-white border border-gray-200 rounded-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-3">Brainstorming-Sitzung</h3>
                        <div className="space-y-3">
                          <div>
                            <div className="font-medium text-gray-900">{selectedProcess.brainstormingSession.title}</div>
                            <div className="text-sm text-gray-600">{selectedProcess.brainstormingSession.description}</div>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Teilnehmer:</span> {selectedProcess.brainstormingSession.participants.join(', ')}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 mb-2">Gesammelte Ideen:</div>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                              {selectedProcess.brainstormingSession.notes.map(note => (
                                <li key={note.id}>{note.text}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h3 className="font-bold text-gray-900 mb-2">Brainstorming-Sitzung</h3>
                        <p className="text-sm text-gray-600">Keine Brainstorming-Sitzung durchgeführt.</p>
                      </div>
                    )}

                    {/* Tasks Documentation */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900">Aufgaben-Dokumentation</h3>
                      {selectedProcess.tasks.map(task => (
                        <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-gray-900">{task.title}</h4>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
                              {getStatusLabel(task.status)}
                            </span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div><span className="font-medium">Beschreibung:</span> {task.description}</div>
                            <div><span className="font-medium">Zugewiesen an:</span> {task.assignedTo.join(', ')}</div>
                            <div><span className="font-medium">Zugewiesen von:</span> {task.assignedBy}</div>
                            <div><span className="font-medium">Erstellt am:</span> {task.createdAt.toLocaleDateString('de-DE')}</div>
                            <div><span className="font-medium">Fortschritt:</span> {task.progress}%</div>
                            {task.reviewer && (
                              <div><span className="font-medium">Reviewer:</span> {task.reviewer}</div>
                            )}
                            {task.reviewNotes && (
                              <div><span className="font-medium">Review-Notizen:</span> {task.reviewNotes}</div>
                            )}
                            {task.completedAt && (
                              <div><span className="font-medium">Abgeschlossen am:</span> {task.completedAt.toLocaleDateString('de-DE')}</div>
                            )}
                            {task.documentation && (
                              <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
                                <div className="font-medium text-green-900 mb-1">Dokumentation:</div>
                                <div className="text-green-800">{task.documentation}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Export Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => alert('Export-Funktion wird in einer zukünftigen Version implementiert')}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <span>📥</span>
                        <span>Dokumentation exportieren (PDF)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

      {/* New Process Modal */}
      {showNewProcessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Neuen Prozess erstellen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prozess-Titel</label>
                <input
                  type="text"
                  value={newProcess.title}
                  onChange={(e) => setNewProcess({ ...newProcess, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Website Relaunch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prozess-Beschreibung</label>
                <textarea
                  value={newProcess.description}
                  onChange={(e) => setNewProcess({ ...newProcess, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Beschreiben Sie den Prozess..."
                />
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-800">
                  💡 Nach dem Erstellen können Sie eine Brainstorming-Sitzung starten und Kollegen einladen.
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateProcess}
                disabled={!newProcess.title}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prozess erstellen
              </button>
              <button
                onClick={() => {
                  setShowNewProcessModal(false)
                  setNewProcess({ title: '', description: '' })
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Brainstorming Modal */}
      {showStartBrainstormingModal && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 Brainstorming-Sitzung starten</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sitzungs-Titel</label>
                <input
                  type="text"
                  value={newBrainstorming.title}
                  onChange={(e) => setNewBrainstorming({ ...newBrainstorming, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="z.B. Ideensammlung für Website Relaunch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={newBrainstorming.description}
                  onChange={(e) => setNewBrainstorming({ ...newBrainstorming, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                  placeholder="Worum geht es in dieser Brainstorming-Sitzung?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">👥 Kollegen einladen</label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {mockUsers.filter(user => user !== currentUser).map(user => (
                    <label key={user} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBrainstorming.participants.includes(user)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewBrainstorming({ ...newBrainstorming, participants: [...newBrainstorming.participants, user] })
                          } else {
                            setNewBrainstorming({ ...newBrainstorming, participants: newBrainstorming.participants.filter(u => u !== user) })
                          }
                        }}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{user}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {newBrainstorming.participants.length === 0 
                    ? 'Keine Teilnehmer ausgewählt' 
                    : `${newBrainstorming.participants.length} Teilnehmer ausgewählt`}
                </p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <p className="text-sm text-teal-800">
                  Sie werden automatisch als Organisator hinzugefügt. Die eingeladenen Kollegen können Ideen beitragen.
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleStartBrainstorming}
                disabled={!newBrainstorming.title}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Brainstorming starten
              </button>
              <button
                onClick={() => {
                  setShowStartBrainstormingModal(false)
                  setNewBrainstorming({ title: '', description: '', participants: [] })
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Neue Aufgabe erstellen</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aufgaben-Titel</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="z.B. Design-Konzept erstellen"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Beschreiben Sie die Aufgabe..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zuweisen an (mehrere möglich)</label>
                <div className="space-y-2">
                  {mockUsers.map(user => (
                    <label key={user} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTask.assignedTo.includes(user)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTask({ ...newTask, assignedTo: [...newTask.assignedTo, user] })
                          } else {
                            setNewTask({ ...newTask, assignedTo: newTask.assignedTo.filter(u => u !== user) })
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{user}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateTask}
                disabled={!newTask.title || newTask.assignedTo.length === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aufgabe erstellen
              </button>
              <button
                onClick={() => {
                  setShowNewTaskModal(false)
                  setNewTask({ title: '', description: '', assignedTo: [] })
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task from Idea Modal */}
      {showTaskFromIdeaModal && selectedNote && selectedProcess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">✓ Aufgabe aus Idee erstellen</h2>
            
            {/* Show the original idea */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Ursprüngliche Idee:</p>
              <p className="text-blue-800">{selectedNote.text}</p>
              <p className="text-xs text-blue-600 mt-2">Von: {selectedNote.author} • {selectedNote.timestamp.toLocaleString('de-DE')}</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aufgaben-Titel (optional anpassen)</label>
                <input
                  type="text"
                  value={newTask.title || selectedNote.text.substring(0, 50) + (selectedNote.text.length > 50 ? '...' : '')}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zusätzliche Beschreibung (optional)</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Weitere Details zur Aufgabe..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zuweisen an (mehrere möglich)</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {mockUsers.map(user => (
                    <label key={user} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newTask.assignedTo.includes(user)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewTask({ ...newTask, assignedTo: [...newTask.assignedTo, user] })
                          } else {
                            setNewTask({ ...newTask, assignedTo: newTask.assignedTo.filter(u => u !== user) })
                          }
                        }}
                        className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">{user}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {newTask.assignedTo.length === 0 
                    ? 'Mindestens eine Person auswählen' 
                    : `${newTask.assignedTo.length} Person(en) ausgewählt`}
                </p>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateTaskFromIdea}
                disabled={newTask.assignedTo.length === 0}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aufgabe erstellen
              </button>
              <button
                onClick={() => {
                  setShowTaskFromIdeaModal(false)
                  setSelectedNote(null)
                  setNewTask({ title: '', description: '', assignedTo: [] })
                }}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

