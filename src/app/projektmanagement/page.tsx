'use client'

import { useState } from 'react'
import TaskManagement from '@/components/projektmanagement/TaskManagement'
import TimePlanning from '@/components/projektmanagement/TimePlanning'
import ResourceManagement from '@/components/projektmanagement/ResourceManagement'
import DocumentManagement from '@/components/projektmanagement/DocumentManagement'
import CommunicationCollaboration from '@/components/projektmanagement/CommunicationCollaboration'
import ReportingAnalytics from '@/components/projektmanagement/ReportingAnalytics'

type ModuleType = 'tasks' | 'planning' | 'resources' | 'documents' | 'communication' | 'reporting'

export default function ProjektmanagementPage() {
  const [activeModule, setActiveModule] = useState<ModuleType>('tasks')

  const handleModuleClick = (moduleId: ModuleType) => {
    console.log('Module clicked:', moduleId)
    setActiveModule(moduleId)
  }

  const modules = [
    { id: 'tasks' as ModuleType, label: 'Aufgabenverwaltung', icon: '📋', color: 'blue' },
    { id: 'planning' as ModuleType, label: 'Zeitplanung & Terminierung', icon: '📅', color: 'green' },
    { id: 'resources' as ModuleType, label: 'Ressourcenmanagement', icon: '👥', color: 'purple' },
    { id: 'documents' as ModuleType, label: 'Dokumentenmanagement', icon: '📄', color: 'orange' },
    { id: 'communication' as ModuleType, label: 'Kommunikation & Kollaboration', icon: '💬', color: 'pink' },
    { id: 'reporting' as ModuleType, label: 'Reporting & Analytics', icon: '📊', color: 'indigo' },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; hover: string; text: string; border: string }> = {
      blue: { bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', hover: 'hover:bg-green-100', text: 'text-green-700', border: 'border-green-200' },
      purple: { bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
      orange: { bg: 'bg-orange-50', hover: 'hover:bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
      pink: { bg: 'bg-pink-50', hover: 'hover:bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
      indigo: { bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 lg:p-10 text-white">
        <h1 className="text-2xl lg:text-4xl font-extrabold mb-2">Projektmanagement</h1>
        <p className="text-white/90 max-w-3xl">
          Zentrale Verwaltung für Projekte, Aufgaben, Ressourcen und Kollaboration
        </p>
      </div>

      {/* Module Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 lg:p-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {modules.map((module) => {
            const colors = getColorClasses(module.color)
            const isActive = activeModule === module.id
            return (
              <button
                key={module.id}
                type="button"
                onClick={() => handleModuleClick(module.id)}
                className={`p-4 lg:p-5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center justify-center min-h-[120px] lg:min-h-[140px] w-full cursor-pointer ${
                  isActive
                    ? `${colors.bg} ${colors.border} border-2 shadow-md`
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-3xl lg:text-4xl mb-2 lg:mb-3 flex-shrink-0">{module.icon}</div>
                <div className={`text-xs lg:text-sm font-semibold text-center leading-tight px-1 w-full overflow-hidden ${isActive ? colors.text : 'text-gray-600'}`} style={{ wordBreak: 'break-word', hyphens: 'auto' }}>
                  {module.label}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Module Content */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 min-h-[400px]">
        {activeModule === 'tasks' && <TaskManagement />}
        {activeModule === 'planning' && <TimePlanning />}
        {activeModule === 'resources' && <ResourceManagement />}
        {activeModule === 'documents' && <DocumentManagement />}
        {activeModule === 'communication' && <CommunicationCollaboration />}
        {activeModule === 'reporting' && <ReportingAnalytics />}
        {!activeModule && (
          <div className="text-center text-gray-500 py-8">
            Bitte wählen Sie ein Modul aus
          </div>
        )}
      </div>
    </div>
  )
}

