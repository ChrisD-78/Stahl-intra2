'use client'

import { useState } from 'react'

export default function ReportingAnalytics() {
  const [reportType, setReportType] = useState<'overview' | 'tasks' | 'resources' | 'budget' | 'timeline'>('overview')
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')

  const stats = {
    totalProjects: 8,
    activeProjects: 5,
    completedProjects: 3,
    totalTasks: 142,
    completedTasks: 98,
    inProgressTasks: 32,
    pendingTasks: 12,
    totalBudget: 500000,
    usedBudget: 320000,
    remainingBudget: 180000,
    teamUtilization: 78,
    onTimeDelivery: 85
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
          onClick={() => setReportType('resources')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            reportType === 'resources'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Ressourcen
        </button>
        <button
          onClick={() => setReportType('budget')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            reportType === 'budget'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Budget
        </button>
        <button
          onClick={() => setReportType('timeline')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
            reportType === 'timeline'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Zeitplan
        </button>
      </div>

      {/* Overview Report */}
      {reportType === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Aktive Projekte</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.activeProjects}</p>
              <p className="text-xs text-blue-600 mt-1">von {stats.totalProjects} insgesamt</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-700 font-medium">Abgeschlossene Tasks</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.completedTasks}</p>
              <p className="text-xs text-green-600 mt-1">von {stats.totalTasks} insgesamt</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">Team-Auslastung</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.teamUtilization}%</p>
              <p className="text-xs text-purple-600 mt-1">Durchschnitt</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <p className="text-sm text-orange-700 font-medium">Pünktlichkeit</p>
              <p className="text-3xl font-bold text-orange-900 mt-1">{stats.onTimeDelivery}%</p>
              <p className="text-xs text-orange-600 mt-1">Termineinhaltung</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Task-Status Verteilung</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Abgeschlossen</span>
                    <span className="font-semibold text-gray-900">{stats.completedTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${(stats.completedTasks / stats.totalTasks) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">In Bearbeitung</span>
                    <span className="font-semibold text-gray-900">{stats.inProgressTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${(stats.inProgressTasks / stats.totalTasks) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">Ausstehend</span>
                    <span className="font-semibold text-gray-900">{stats.pendingTasks}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gray-500 h-3 rounded-full" style={{ width: `${(stats.pendingTasks / stats.totalTasks) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget-Verbrauch</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700">Verwendet</span>
                    <span className="font-semibold text-gray-900">€ {stats.usedBudget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-indigo-500 h-4 rounded-full" style={{ width: `${(stats.usedBudget / stats.totalBudget) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-700">Verfügbar</span>
                    <span className="font-semibold text-green-600">€ {stats.remainingBudget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div className="bg-green-500 h-4 rounded-full" style={{ width: `${(stats.remainingBudget / stats.totalBudget) * 100}%` }}></div>
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold text-gray-900">Gesamtbudget</span>
                    <span className="text-sm font-semibold text-gray-900">€ {stats.totalBudget.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Report */}
      {reportType === 'tasks' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aufgaben-Report</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 font-medium">Abgeschlossen</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.completedTasks}</p>
                <p className="text-xs text-green-600 mt-1">{Math.round((stats.completedTasks / stats.totalTasks) * 100)}%</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-yellow-700 font-medium">In Bearbeitung</p>
                <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.inProgressTasks}</p>
                <p className="text-xs text-yellow-600 mt-1">{Math.round((stats.inProgressTasks / stats.totalTasks) * 100)}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700 font-medium">Ausstehend</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingTasks}</p>
                <p className="text-xs text-gray-600 mt-1">{Math.round((stats.pendingTasks / stats.totalTasks) * 100)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resource Report */}
      {reportType === 'resources' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ressourcen-Report</h3>
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <p className="text-sm text-purple-700 font-medium mb-2">Team-Auslastung</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${stats.teamUtilization}%` }}></div>
                </div>
                <span className="text-lg font-bold text-purple-900">{stats.teamUtilization}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Report */}
      {reportType === 'budget' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget-Report</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                <p className="text-sm text-indigo-700 font-medium">Gesamtbudget</p>
                <p className="text-2xl font-bold text-indigo-900 mt-1">€ {stats.totalBudget.toLocaleString()}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-orange-700 font-medium">Verwendet</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">€ {stats.usedBudget.toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">{Math.round((stats.usedBudget / stats.totalBudget) * 100)}%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-sm text-green-700 font-medium">Verfügbar</p>
                <p className="text-2xl font-bold text-green-900 mt-1">€ {stats.remainingBudget.toLocaleString()}</p>
                <p className="text-xs text-green-600 mt-1">{Math.round((stats.remainingBudget / stats.totalBudget) * 100)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline Report */}
      {reportType === 'timeline' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Zeitplan-Report</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-2">Pünktlichkeit</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div className="bg-blue-500 h-4 rounded-full" style={{ width: `${stats.onTimeDelivery}%` }}></div>
                </div>
                <span className="text-lg font-bold text-blue-900">{stats.onTimeDelivery}%</span>
              </div>
              <p className="text-xs text-blue-600 mt-2">Projekte werden zu {stats.onTimeDelivery}% pünktlich abgeschlossen</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

