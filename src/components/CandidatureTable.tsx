'use client'

import { useState } from 'react'
import { Candidature, StatutCandidature } from '@/types'
import { Edit, Trash2, Mail, Eye, Send } from 'lucide-react'
import SendMailModal from './SendMailModal'
import EnvoiMailModal from './EnvoiMailModal'

interface CandidatureTableProps {
  candidatures: Candidature[]
  onRefresh: () => void
}

const statutLabels: Record<StatutCandidature, string> = {
  brouillon: 'Brouillon',
  envoye: 'Envoyé',
  relance: 'Relancé',
  reponse_recue: 'Réponse reçue',
  refuse: 'Refusé',
  entretien_propose: 'Entretien proposé',
  accepte: 'Accepté'
}

const statutColors: Record<StatutCandidature, string> = {
  brouillon: 'bg-gray-100 text-gray-800',
  envoye: 'bg-blue-100 text-blue-800',
  relance: 'bg-yellow-100 text-yellow-800',
  reponse_recue: 'bg-green-100 text-green-800',
  refuse: 'bg-red-100 text-red-800',
  entretien_propose: 'bg-purple-100 text-purple-800',
  accepte: 'bg-green-200 text-green-900'
}

export default function CandidatureTable({ candidatures, onRefresh }: CandidatureTableProps) {
  const [sortField, setSortField] = useState<keyof Candidature>('date_envoi')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterStatut, setFilterStatut] = useState<StatutCandidature | ''>('')
  const [showMailModal, setShowMailModal] = useState(false)
  const [selectedCandidature, setSelectedCandidature] = useState<Candidature | null>(null)

  const handleSort = (field: keyof Candidature) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const filteredCandidatures = candidatures.filter(candidature =>
    filterStatut === '' || candidature.statut === filterStatut
  )

  const sortedCandidatures = [...filteredCandidatures].sort((a, b) => {
    const aValue = a[sortField] || ''
    const bValue = b[sortField] || ''
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleDeleteCandidature = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      try {
        const response = await fetch(`/api/candidatures/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          onRefresh()
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const handleSendMail = (candidature: Candidature) => {
    setSelectedCandidature(candidature)
    setShowMailModal(true)
  }

  const handleQuickSend = async (candidature: Candidature) => {
    try {
      // Récupérer le profil utilisateur
      const profilData = localStorage.getItem('profil-utilisateur')
      if (!profilData) {
        alert('Veuillez d\'abord configurer votre profil dans l\'onglet Compte')
        return
      }

      const profil = JSON.parse(profilData)
      if (!profil.email) {
        alert('Veuillez configurer votre email dans votre profil')
        return
      }

      // Template rapide par défaut
      const objetRapide = `Candidature pour le poste de ${candidature.poste} - ${profil.prenom} ${profil.nom}`
      const contenuRapide = `Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste de ${candidature.poste} au sein de ${candidature.entreprise}.

${profil.signature || `Cordialement,\n${profil.prenom} ${profil.nom}`}`

      // Créer le lien mailto
      const params = new URLSearchParams({
        to: candidature.contact_email || '',
        subject: objetRapide,
        body: contenuRapide
      })

      // Ouvrir le client mail
      window.location.href = `mailto:?${params.toString()}`

      // Mettre à jour le statut
      const response = await fetch(`/api/candidatures/${candidature.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...candidature,
          statut: 'envoye',
          date_derniere_relance: new Date().toISOString().split('T')[0]
        }),
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi rapide:', error)
      alert('Erreur lors de l\'envoi du mail')
    }
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Mes candidatures ({candidatures.length})
          </h3>
          <div className="mt-3 sm:mt-0 sm:ml-4">
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value as StatutCandidature | '')}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Tous les statuts</option>
              {Object.entries(statutLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('entreprise')}
                >
                  Entreprise
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('poste')}
                >
                  Poste
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('contact_nom')}
                >
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('date_envoi')}
                >
                  Date d&apos;envoi
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('statut')}
                >
                  Statut
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCandidatures.map((candidature) => (
                <tr key={candidature.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {candidature.entreprise}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {candidature.poste}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>
                      <div>{candidature.contact_nom}</div>
                      <div className="text-gray-400">{candidature.contact_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(candidature.date_envoi).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statutColors[candidature.statut]}`}>
                      {statutLabels[candidature.statut]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleQuickSend(candidature)}
                        className="text-green-600 hover:text-green-900"
                        title="Envoi rapide"
                        disabled={!candidature.contact_email}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleSendMail(candidature)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Composer un mail"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button
                        className="text-green-600 hover:text-green-900"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCandidature(candidature.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sortedCandidatures.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Aucune candidature trouvée</p>
            </div>
          )}
        </div>
      </div>

      {showMailModal && selectedCandidature && (
        <EnvoiMailModal
          candidature={selectedCandidature}
          onClose={() => {
            setShowMailModal(false)
            setSelectedCandidature(null)
          }}
          onSent={() => {
            onRefresh()
          }}
        />
      )}
    </div>
  )
}