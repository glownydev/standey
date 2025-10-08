'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Accueil from '@/components/Accueil'
import CandidatureTable from '@/components/CandidatureTable'
import AddCandidatureForm from '@/components/AddCandidatureForm'
import TemplateManager from '@/components/TemplateManager'
import Statistiques from '@/components/Statistiques'
import Compte from '@/components/Compte'
import { Plus, Download } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('accueil')
  const [candidatures, setCandidatures] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    // Charger les candidatures depuis l'API
    fetchCandidatures()
  }, [])

  const fetchCandidatures = async () => {
    try {
      const response = await fetch('/api/candidatures')
      const data = await response.json()
      setCandidatures(data)
    } catch (error) {
      console.error('Erreur lors du chargement des candidatures:', error)
    }
  }

  const handleAddCandidature = () => {
    setShowAddForm(true)
  }

  const handleCandidatureAdded = () => {
    setShowAddForm(false)
    fetchCandidatures()
  }

  const exportToCSV = () => {
    // Logique d'export CSV
    import('@/lib/utils').then(({ exportToCSV }) => {
      exportToCSV(candidatures, `candidatures-${new Date().toISOString().split('T')[0]}.csv`)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Actions globales */}
      {activeTab === 'candidatures' && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Mes candidatures</h2>
                <p className="text-sm text-gray-500">Gérez et suivez toutes vos candidatures</p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </button>
                <button
                  onClick={handleAddCandidature}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle candidature
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'accueil' && (
          <div className="px-4 py-6 sm:px-0">
            <Accueil 
              candidatures={candidatures} 
              onTabChange={setActiveTab}
              onAddCandidature={handleAddCandidature}
            />
          </div>
        )}
        
        {activeTab === 'candidatures' && (
          <div className="px-4 py-6 sm:px-0">
            <CandidatureTable 
              candidatures={candidatures} 
              onRefresh={fetchCandidatures}
            />
          </div>
        )}
        
        {activeTab === 'statistiques' && (
          <div className="px-4 py-6 sm:px-0">
            <Statistiques />
          </div>
        )}
        
        {activeTab === 'templates' && (
          <div className="px-4 py-6 sm:px-0">
            <TemplateManager />
          </div>
        )}
        
        {activeTab === 'compte' && (
          <div className="px-4 py-6 sm:px-0">
            <Compte />
          </div>
        )}
      </main>

      {showAddForm && (
        <AddCandidatureForm
          onClose={() => setShowAddForm(false)}
          onSave={handleCandidatureAdded}
        />
      )}

      {/* Bouton flottant pour ajouter une candidature */}
      <button
        onClick={handleAddCandidature}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 z-50"
        title="Ajouter une candidature"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}