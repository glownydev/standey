'use client'

import { useEffect, useState } from 'react'
import { Briefcase, Mail, TrendingUp, Clock, Users, Award } from 'lucide-react'

interface AccueilProps {
  candidatures: any[]
  onTabChange?: (tab: string) => void
  onAddCandidature?: () => void
}

export default function Accueil({ candidatures, onTabChange, onAddCandidature }: AccueilProps) {
  const [stats, setStats] = useState({
    total: 0,
    envoye: 0,
    reponse: 0,
    entretien: 0,
    accepte: 0,
    refuse: 0
  })

  useEffect(() => {
    if (candidatures.length > 0) {
      const newStats = {
        total: candidatures.length,
        envoye: candidatures.filter(c => c.statut === 'envoye').length,
        reponse: candidatures.filter(c => c.statut === 'reponse_recue').length,
        entretien: candidatures.filter(c => c.statut === 'entretien_propose').length,
        accepte: candidatures.filter(c => c.statut === 'accepte').length,
        refuse: candidatures.filter(c => c.statut === 'refuse').length
      }
      setStats(newStats)
    }
  }, [candidatures])

  const recentCandidatures = candidatures
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  const tauxReponse = stats.total > 0 ? Math.round((stats.reponse / stats.total) * 100) : 0
  const tauxSucces = stats.total > 0 ? Math.round((stats.accepte / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Bienvenue sur Standey ! 👋</h2>
            <p className="text-blue-100">
              Suivez efficacement vos candidatures et optimisez votre recherche d&apos;emploi
            </p>
          </div>
          <div className="hidden md:block">
            <Briefcase className="w-16 h-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total candidatures</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taux de réponse</p>
              <p className="text-2xl font-semibold text-gray-900">{tauxReponse}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Entretiens</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.entretien}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Taux de succès</p>
              <p className="text-2xl font-semibold text-gray-900">{tauxSucces}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par statut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par statut</h3>
          <div className="space-y-3">
            {[
              { label: 'Envoyées', count: stats.envoye, color: 'bg-blue-500' },
              { label: 'Réponses reçues', count: stats.reponse, color: 'bg-green-500' },
              { label: 'Entretiens', count: stats.entretien, color: 'bg-purple-500' },
              { label: 'Acceptées', count: stats.accepte, color: 'bg-emerald-500' },
              { label: 'Refusées', count: stats.refuse, color: 'bg-red-500' }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                  <span className="text-sm text-gray-600">{item.label}</span>
                </div>
                <span className="font-medium text-gray-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Candidatures récentes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Candidatures récentes</h3>
          {recentCandidatures.length > 0 ? (
            <div className="space-y-3">
              {recentCandidatures.map((candidature) => (
                <div key={candidature.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{candidature.entreprise}</p>
                    <p className="text-sm text-gray-500">{candidature.poste}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      candidature.statut === 'envoye' ? 'bg-blue-100 text-blue-800' :
                      candidature.statut === 'reponse_recue' ? 'bg-green-100 text-green-800' :
                      candidature.statut === 'entretien_propose' ? 'bg-purple-100 text-purple-800' :
                      candidature.statut === 'accepte' ? 'bg-emerald-100 text-emerald-800' :
                      candidature.statut === 'refuse' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {candidature.statut}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune candidature pour le moment</p>
              <p className="text-sm text-gray-400 mt-2">Commencez par ajouter votre première candidature !</p>
            </div>
          )}
        </div>
      </div>

      {/* Conseils et actions rapides */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={onAddCandidature}
            className="text-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Briefcase className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Nouvelle candidature</p>
            <p className="text-sm text-gray-500">Ajouter une nouvelle candidature</p>
          </button>
          <button 
            onClick={() => onTabChange?.('templates')}
            className="text-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Créer un template</p>
            <p className="text-sm text-gray-500">Nouveau modèle de mail</p>
          </button>
          <button 
            onClick={() => onTabChange?.('statistiques')}
            className="text-center p-4 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-medium text-gray-900">Voir les statistiques</p>
            <p className="text-sm text-gray-500">Analyser vos performances</p>
          </button>
        </div>
      </div>
    </div>
  )
}