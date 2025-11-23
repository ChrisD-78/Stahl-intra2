'use client'

import { useState } from 'react'

interface DienstreiseantragFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function DienstreiseantragForm({ isOpen, onClose, onSubmit }: DienstreiseantragFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    abteilung: '',
    reiseziel: '',
    vonDatum: '',
    bisDatum: '',
    reisegrund: '',
    verkehrsmittel: '',
    geschaetzteKosten: '',
    budgetstelle: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      name: '',
      abteilung: '',
      reiseziel: '',
      vonDatum: '',
      bisDatum: '',
      reisegrund: '',
      verkehrsmittel: '',
      geschaetzteKosten: '',
      budgetstelle: ''
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Dienstreiseantrag</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Abteilung *
              </label>
              <input
                type="text"
                value={formData.abteilung}
                onChange={(e) => setFormData({ ...formData, abteilung: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reiseziel *
              </label>
              <input
                type="text"
                value={formData.reiseziel}
                onChange={(e) => setFormData({ ...formData, reiseziel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verkehrsmittel *
              </label>
              <select
                value={formData.verkehrsmittel}
                onChange={(e) => setFormData({ ...formData, verkehrsmittel: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                <option value="">Bitte wählen</option>
                <option value="Auto">Auto</option>
                <option value="Bahn">Bahn</option>
                <option value="Flugzeug">Flugzeug</option>
                <option value="ÖPNV">ÖPNV</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Von Datum *
              </label>
              <input
                type="date"
                value={formData.vonDatum}
                onChange={(e) => setFormData({ ...formData, vonDatum: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bis Datum *
              </label>
              <input
                type="date"
                value={formData.bisDatum}
                onChange={(e) => setFormData({ ...formData, bisDatum: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geschätzte Kosten (€) *
              </label>
              <input
                type="number"
                value={formData.geschaetzteKosten}
                onChange={(e) => setFormData({ ...formData, geschaetzteKosten: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budgetstelle *
              </label>
              <input
                type="text"
                value={formData.budgetstelle}
                onChange={(e) => setFormData({ ...formData, budgetstelle: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reisegrund *
            </label>
            <textarea
              value={formData.reisegrund}
              onChange={(e) => setFormData({ ...formData, reisegrund: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Antrag einreichen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


