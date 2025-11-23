'use client'

import { useState } from 'react'

interface ReisekostenabrechnungFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function ReisekostenabrechnungForm({ isOpen, onClose, onSubmit }: ReisekostenabrechnungFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    abteilung: '',
    reiseziel: '',
    vonDatum: '',
    bisDatum: '',
    fahrtkosten: '',
    uebernachtung: '',
    verpflegung: '',
    sonstigeKosten: '',
    gesamtkosten: '',
    budgetstelle: ''
  })

  if (!isOpen) return null

  const calculateTotal = () => {
    const fahrt = parseFloat(formData.fahrtkosten) || 0
    const uebernachtung = parseFloat(formData.uebernachtung) || 0
    const verpflegung = parseFloat(formData.verpflegung) || 0
    const sonstige = parseFloat(formData.sonstigeKosten) || 0
    return (fahrt + uebernachtung + verpflegung + sonstige).toFixed(2)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = calculateTotal()
    onSubmit({ ...formData, gesamtkosten: total })
    setFormData({
      name: '',
      abteilung: '',
      reiseziel: '',
      vonDatum: '',
      bisDatum: '',
      fahrtkosten: '',
      uebernachtung: '',
      verpflegung: '',
      sonstigeKosten: '',
      gesamtkosten: '',
      budgetstelle: ''
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Reisekostenabrechnung</h2>
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Von Datum *
              </label>
              <input
                type="date"
                value={formData.vonDatum}
                onChange={(e) => setFormData({ ...formData, vonDatum: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Kostenaufstellung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fahrtkosten (€) *
                </label>
                <input
                  type="number"
                  value={formData.fahrtkosten}
                  onChange={(e) => setFormData({ ...formData, fahrtkosten: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Übernachtung (€)
                </label>
                <input
                  type="number"
                  value={formData.uebernachtung}
                  onChange={(e) => setFormData({ ...formData, uebernachtung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verpflegung (€)
                </label>
                <input
                  type="number"
                  value={formData.verpflegung}
                  onChange={(e) => setFormData({ ...formData, verpflegung: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sonstige Kosten (€)
                </label>
                <input
                  type="number"
                  value={formData.sonstigeKosten}
                  onChange={(e) => setFormData({ ...formData, sonstigeKosten: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gesamtkosten (€) *
                </label>
                <input
                  type="text"
                  value={calculateTotal() + ' €'}
                  readOnly
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 font-semibold text-lg"
                />
              </div>
            </div>
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
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Abrechnung einreichen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


