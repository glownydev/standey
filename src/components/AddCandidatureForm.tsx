'use client'

import { useState } from 'react'
import { StatutCandidature } from '@/types'
import { X } from 'lucide-react'
import { ENTREPRISES_PREDEFINIES, POSTES_PREDEFINIES } from '@/lib/constants'

interface AddCandidatureFormProps {
  onClose: () => void
  onSave: () => void
}

const statutOptions: { value: StatutCandidature; label: string }[] = [
  { value: 'brouillon', label: 'Brouillon' },
  { value: 'envoye', label: 'Envoyé' },
  { value: 'relance', label: 'Relancé' },
  { value: 'reponse_recue', label: 'Réponse reçue' },
  { value: 'refuse', label: 'Refusé' },
  { value: 'entretien_propose', label: 'Entretien proposé' },
  { value: 'accepte', label: 'Accepté' }
]

export default function AddCandidatureForm({ onClose, onSave }: AddCandidatureFormProps) {
  const [formData, setFormData] = useState({
    entreprise: '',
    contact_nom: '',
    contact_email: '',
    contact_telephone: '',
    poste: '',
    date_envoi: new Date().toISOString().split('T')[0],
    statut: 'brouillon' as StatutCandidature,
    notes: ''
  })

  const [loading, setLoading] = useState(false)
  const [showEntrepriseDropdown, setShowEntrepriseDropdown] = useState(false)
  const [showPosteDropdown, setShowPosteDropdown] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/candidatures', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
      } else {
        alert('Erreur lors de la création de la candidature')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création de la candidature')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const filteredEntreprises = ENTREPRISES_PREDEFINIES.filter(entreprise =>
    entreprise.toLowerCase().includes(formData.entreprise.toLowerCase())
  )

  const filteredPostes = POSTES_PREDEFINIES.filter(poste =>
    poste.toLowerCase().includes(formData.poste.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full w-full max-w-sm mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Nouvelle candidature
                    </h3>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <label htmlFor="entreprise" className="block text-sm font-medium text-gray-700">
                        Entreprise *
                      </label>
                      <input
                        type="text"
                        name="entreprise"
                        id="entreprise"
                        required
                        value={formData.entreprise}
                        onChange={handleChange}
                        onFocus={() => setShowEntrepriseDropdown(true)}
                        onBlur={() => setTimeout(() => setShowEntrepriseDropdown(false), 200)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Sélectionnez ou tapez une entreprise"
                      />
                      {showEntrepriseDropdown && formData.entreprise && filteredEntreprises.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredEntreprises.slice(0, 10).map((entreprise) => (
                            <button
                              key={entreprise}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, entreprise }))
                                setShowEntrepriseDropdown(false)
                              }}
                              className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 focus:bg-gray-100 border-none bg-transparent"
                            >
                              {entreprise}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <label htmlFor="poste" className="block text-sm font-medium text-gray-700">
                        Poste *
                      </label>
                      <input
                        type="text"
                        name="poste"
                        id="poste"
                        required
                        value={formData.poste}
                        onChange={handleChange}
                        onFocus={() => setShowPosteDropdown(true)}
                        onBlur={() => setTimeout(() => setShowPosteDropdown(false), 200)}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Tapez pour rechercher un poste..."
                      />
                      {showPosteDropdown && formData.poste && filteredPostes.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredPostes.slice(0, 10).map((poste) => (
                            <button
                              key={poste}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, poste }))
                                setShowPosteDropdown(false)
                              }}
                              className="w-full text-left px-4 py-2 text-gray-900 hover:bg-gray-100 focus:bg-gray-100 border-none bg-transparent"
                            >
                              {poste}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="contact_nom" className="block text-sm font-medium text-gray-700">
                        Nom du contact *
                      </label>
                      <input
                        type="text"
                        name="contact_nom"
                        id="contact_nom"
                        required
                        value={formData.contact_nom}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Nom du contact"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">
                        Email du contact *
                      </label>
                      <input
                        type="email"
                        name="contact_email"
                        id="contact_email"
                        required
                        value={formData.contact_email}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="contact@entreprise.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="contact_telephone" className="block text-sm font-medium text-gray-700">
                        Téléphone (optionnel)
                      </label>
                      <input
                        type="tel"
                        name="contact_telephone"
                        id="contact_telephone"
                        value={formData.contact_telephone}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="06 12 34 56 78"
                      />
                    </div>

                    <div>
                      <label htmlFor="date_envoi" className="block text-sm font-medium text-gray-700">
                        Date d&apos;envoi *
                      </label>
                      <input
                        type="date"
                        name="date_envoi"
                        id="date_envoi"
                        required
                        value={formData.date_envoi}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="statut" className="block text-sm font-medium text-gray-700">
                        Statut *
                      </label>
                      <select
                        name="statut"
                        id="statut"
                        required
                        value={formData.statut}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        {statutOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                        Notes/Remarques
                      </label>
                      <textarea
                        name="notes"
                        id="notes"
                        rows={3}
                        value={formData.notes}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Notes ou remarques sur cette candidature..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}