'use client'

import { useState } from 'react'

interface BeschaffungsantragFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function BeschaffungsantragForm({ isOpen, onClose, onSubmit }: BeschaffungsantragFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    abteilung: '',
    beschaffungsgegenstand: '',
    menge: '',
    einzelpreis: '',
    gesamtpreis: '',
    budgetstelle: '',
    lieferant: '',
    begruendung: '',
    dringlichkeit: ''
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      name: '',
      abteilung: '',
      beschaffungsgegenstand: '',
      menge: '',
      einzelpreis: '',
      gesamtpreis: '',
      budgetstelle: '',
      lieferant: '',
      begruendung: '',
      dringlichkeit: ''
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Beschaffungsantrag</h2>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Beschaffungsgegenstand *
              </label>
              <input
                type="text"
                value={formData.beschaffungsgegenstand}
                onChange={(e) => setFormData({ ...formData, beschaffungsgegenstand: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Menge *
              </label>
              <input
                type="number"
                value={formData.menge}
                onChange={(e) => {
                  const menge = e.target.value
                  const einzelpreis = formData.einzelpreis || '0'
                  const gesamtpreis = (parseFloat(einzelpreis) * parseFloat(menge)).toFixed(2)
                  setFormData({ ...formData, menge, gesamtpreis })
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Einzelpreis (€) *
              </label>
              <input
                type="number"
                value={formData.einzelpreis}
                onChange={(e) => {
                  const einzelpreis = e.target.value
                  const menge = formData.menge || '1'
                  const gesamtpreis = (parseFloat(einzelpreis) * parseFloat(menge)).toFixed(2)
                  setFormData({ ...formData, einzelpreis, gesamtpreis })
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gesamtpreis (€) *
              </label>
              <input
                type="number"
                value={formData.gesamtpreis}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dringlichkeit *
              </label>
              <select
                value={formData.dringlichkeit}
                onChange={(e) => setFormData({ ...formData, dringlichkeit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              >
                <option value="">Bitte wählen</option>
                <option value="Niedrig">Niedrig</option>
                <option value="Normal">Normal</option>
                <option value="Hoch">Hoch</option>
                <option value="Sehr hoch">Sehr hoch</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieferant / Anbieter
              </label>
              <input
                type="text"
                value={formData.lieferant}
                onChange={(e) => setFormData({ ...formData, lieferant: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Begründung *
            </label>
            <textarea
              value={formData.begruendung}
              onChange={(e) => setFormData({ ...formData, begruendung: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Antrag einreichen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

