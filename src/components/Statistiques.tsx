'use client'

import { useEffect, useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Building,
  MapPin,
  Target,
  Activity
} from 'lucide-react'

interface StatistiquesData {
  total: number
  parStatut: Record<string, number>
  parMois: Record<string, number>
  parEntreprise: Record<string, number>
  tauxReussite: number
  tempsReponse: number
  derniereSemaines: number[]
}

export default function Statistiques() {
  const [stats, setStats] = useState<StatistiquesData>({
    total: 0,
    parStatut: {},
    parMois: {},
    parEntreprise: {},
    tauxReussite: 0,
    tempsReponse: 0,
    derniereSemaines: []
  })

  useEffect(() => {
    const calculerStatistiques = async () => {
      try {
        // Utiliser l'API pour récupérer les vraies statistiques
        const response = await fetch('/api/statistiques')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        } else {
          // Fallback vers localStorage si l'API échoue
          const candidatures = JSON.parse(localStorage.getItem('candidatures') || '[]')
          
          // Statistiques générales
          const total = candidatures.length
          
          // Par statut
          const parStatut: Record<string, number> = {}
          candidatures.forEach((c: any) => {
            parStatut[c.statut] = (parStatut[c.statut] || 0) + 1
          })

          // Par mois
          const parMois: Record<string, number> = {}
          candidatures.forEach((c: any) => {
            if (c.date_envoi) {
              const mois = new Date(c.date_envoi).toLocaleDateString('fr-FR', { 
                month: 'long', 
                year: 'numeric' 
              })
              parMois[mois] = (parMois[mois] || 0) + 1
            }
          })

          // Par entreprise
          const parEntreprise: Record<string, number> = {}
          candidatures.forEach((c: any) => {
            if (c.entreprise) {
              parEntreprise[c.entreprise] = (parEntreprise[c.entreprise] || 0) + 1
            }
          })

          // Taux de réussite
          const reussites = candidatures.filter((c: any) => 
            ['accepte', 'entretien_propose'].includes(c.statut)
          ).length
          const tauxReussite = total > 0 ? Math.round((reussites / total) * 100) : 0

          // Temps de réponse moyen (calcul réel basé sur les données)
          let tempsReponse = 0
          if (candidatures.length > 0) {
            const candidaturesAvecReponse = candidatures.filter((c: any) => 
              ['reponse_recue', 'entretien_propose', 'accepte', 'refuse'].includes(c.statut) && 
              c.date_envoi && c.updated_at
            )
            
            if (candidaturesAvecReponse.length > 0) {
              const totalJours = candidaturesAvecReponse.reduce((acc: number, c: any) => {
                const dateEnvoi = new Date(c.date_envoi)
                const dateReponse = new Date(c.updated_at)
                const diff = Math.abs(dateReponse.getTime() - dateEnvoi.getTime())
                const jours = Math.ceil(diff / (1000 * 60 * 60 * 24))
                return acc + jours
              }, 0)
              tempsReponse = Math.round(totalJours / candidaturesAvecReponse.length)
            }
          }

          // Candidatures des 4 dernières semaines
          const maintenant = new Date()
          const derniereSemaines = []
          for (let i = 3; i >= 0; i--) {
            const debutSemaine = new Date(maintenant)
            debutSemaine.setDate(maintenant.getDate() - (i * 7 + 7))
            const finSemaine = new Date(maintenant)
            finSemaine.setDate(maintenant.getDate() - (i * 7))
            
            const candidaturesSemaine = candidatures.filter((c: any) => {
              if (!c.date_envoi) return false
              const date = new Date(c.date_envoi)
              return date >= debutSemaine && date < finSemaine
            }).length
            
            derniereSemaines.push(candidaturesSemaine)
          }

          setStats({
            total,
            parStatut,
            parMois,
            parEntreprise,
            tauxReussite,
            tempsReponse,
            derniereSemaines
          })
        }

      } catch (error) {
        console.error('Erreur lors du calcul des statistiques:', error)
      }
    }

    calculerStatistiques()

    const handleUpdate = () => calculerStatistiques()
    window.addEventListener('candidaturesUpdated', handleUpdate)
    window.addEventListener('storage', handleUpdate)

    return () => {
      window.removeEventListener('candidaturesUpdated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
  }, [])

  const statutsColors: Record<string, string> = {
    'Brouillon': 'bg-gray-100 text-gray-800',
    'Envoyé': 'bg-blue-100 text-blue-800',
    'Relancé': 'bg-yellow-100 text-yellow-800',
    'Réponse reçue': 'bg-purple-100 text-purple-800',
    'Refusé': 'bg-red-100 text-red-800',
    'Entretien proposé': 'bg-green-100 text-green-800',
    'Accepté': 'bg-emerald-100 text-emerald-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <BarChart3 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="text-gray-600">Analyses et métriques de vos candidatures</p>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total candidatures</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de réussite</p>
              <p className="text-2xl font-bold text-green-600">{stats.tauxReussite}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Temps de réponse</p>
              <p className="text-2xl font-bold text-orange-600">{stats.tempsReponse}j</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cette semaine</p>
              <p className="text-2xl font-bold text-purple-600">{stats.derniereSemaines[3] || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Répartition par statut */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-gray-600" />
          Répartition par statut
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(stats.parStatut).map(([statut, count]) => (
            <div key={statut} className="text-center">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statutsColors[statut] || 'bg-gray-100 text-gray-800'} mb-2`}>
                {statut}
              </div>
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-500">
                {stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Évolution sur 4 semaines */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-gray-600" />
          Évolution des 4 dernières semaines
        </h3>
        <div className="flex items-end justify-between h-32 space-x-2">
          {stats.derniereSemaines.map((count, index) => {
            const maxCount = Math.max(...stats.derniereSemaines, 1)
            const height = (count / maxCount) * 100
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="bg-blue-500 rounded-t w-full min-h-[4px] transition-all duration-300"
                  style={{ height: `${height}%` }}
                ></div>
                <p className="text-sm font-medium text-gray-900 mt-2">{count}</p>
                <p className="text-xs text-gray-500">S-{4-index}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top entreprises */}
      {Object.keys(stats.parEntreprise).length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="w-5 h-5 mr-2 text-gray-600" />
            Entreprises contactées
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.parEntreprise)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([entreprise, count]) => (
                <div key={entreprise} className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">{entreprise}</span>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-200 rounded-full h-2 w-20">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(count / Math.max(...Object.values(stats.parEntreprise))) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Conseils */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          Conseils d&apos;optimisation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-blue-800">
              <strong>Fréquence :</strong> Visez 3-5 candidatures par semaine pour maintenir un bon rythme.
            </p>
            <p className="text-blue-800">
              <strong>Relances :</strong> Relancez après 7-10 jours ouvrés si pas de réponse.
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-blue-800">
              <strong>Diversification :</strong> Variez les entreprises et secteurs pour maximiser vos chances.
            </p>
            <p className="text-blue-800">
              <strong>Suivi :</strong> Maintenez vos données à jour pour des statistiques précises.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}