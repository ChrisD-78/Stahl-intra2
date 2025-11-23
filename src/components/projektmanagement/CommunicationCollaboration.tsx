'use client'

import { useState } from 'react'

interface Message {
  id: string
  from: string
  to: string
  subject: string
  message: string
  timestamp: string
  read: boolean
  project: string
}

interface Comment {
  id: string
  author: string
  content: string
  timestamp: string
  task: string
  project: string
}

export default function CommunicationCollaboration() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', from: 'Eva Klein', to: 'Team', subject: 'Projektstatus Update', message: 'Das Projekt schreitet gut voran...', timestamp: '2025-12-20T10:30:00', read: false, project: 'Digitalisierung 2026' },
    { id: '2', from: 'Jonas Meier', to: 'Eva Klein', subject: 'Budget-Anfrage', message: 'Ich benötige eine Budgetfreigabe für...', timestamp: '2025-12-19T14:15:00', read: true, project: 'Digitalisierung 2026' },
  ])
  const [comments, setComments] = useState<Comment[]>([
    { id: '1', author: 'Carla Nguyen', content: 'Gute Arbeit! Die Implementierung sieht vielversprechend aus.', timestamp: '2025-12-20T09:00:00', task: 'Projektplan erstellen', project: 'Digitalisierung 2026' },
    { id: '2', author: 'Felix Sturm', content: 'Können wir hier noch eine Anpassung vornehmen?', timestamp: '2025-12-19T16:45:00', task: 'Implementierung Phase 1', project: 'Digitalisierung 2026' },
  ])
  const [activeTab, setActiveTab] = useState<'messages' | 'comments' | 'notifications'>('messages')
  const [showMessageForm, setShowMessageForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kommunikation & Kollaboration</h2>
          <p className="text-sm text-gray-600">Messaging, Kommentare und Benachrichtigungen</p>
        </div>
        <button
          onClick={() => setShowMessageForm(true)}
          className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors font-medium"
        >
          + Neue Nachricht
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'messages'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          💬 Nachrichten ({messages.filter(m => !m.read).length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'comments'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          💭 Kommentare ({comments.length})
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'notifications'
              ? 'border-pink-600 text-pink-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          🔔 Benachrichtigungen
        </button>
      </div>

      {/* Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`bg-white rounded-lg border-2 p-4 hover:shadow-md transition-shadow ${
                !message.read ? 'border-pink-200 bg-pink-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{message.subject}</h3>
                    {!message.read && (
                      <span className="px-2 py-0.5 bg-pink-600 text-white text-xs font-semibold rounded-full">
                        Neu
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Von: {message.from} → {message.to} • {message.project}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleString('de-DE')}
                </span>
              </div>
              <p className="text-sm text-gray-700 mt-2">{message.message}</p>
              <div className="flex gap-2 mt-4">
                <button className="px-3 py-1.5 text-xs font-medium bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors">
                  Antworten
                </button>
                <button className="px-3 py-1.5 text-xs font-medium bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                  Weiterleiten
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{comment.author.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.timestamp).toLocaleString('de-DE')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{comment.content}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>📋 {comment.task}</span>
                    <span>•</span>
                    <span>📁 {comment.project}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <textarea
              placeholder="Neuen Kommentar hinzufügen..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 resize-none"
              rows={3}
            ></textarea>
            <button className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors text-sm font-medium">
              Kommentar hinzufügen
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Benachrichtigungseinstellungen</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">E-Mail-Benachrichtigungen</p>
                  <p className="text-xs text-gray-600">Erhalten Sie E-Mails bei wichtigen Updates</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Push-Benachrichtigungen</p>
                  <p className="text-xs text-gray-600">In-App-Benachrichtigungen aktivieren</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Task-Updates</p>
                  <p className="text-xs text-gray-600">Benachrichtigungen bei Task-Änderungen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-900">Meeting-Erinnerungen</p>
                  <p className="text-xs text-gray-600">Automatische Erinnerungen vor Meetings</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Meeting Integration */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting-Integration</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div>
                  <p className="font-semibold text-blue-900">Projektbesprechung Q1</p>
                  <p className="text-sm text-blue-700">15.01.2026, 10:00 - 11:30 Uhr</p>
                </div>
                <button className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700">
                  Kalender öffnen
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-semibold text-green-900">Sprint Review</p>
                  <p className="text-sm text-green-700">22.01.2026, 14:00 - 15:00 Uhr</p>
                </div>
                <button className="px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700">
                  Kalender öffnen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

