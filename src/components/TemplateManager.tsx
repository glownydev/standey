'use client'

import { useState, useEffect } from 'react'
import { Template, TypeTemplate } from '@/types'
import { Plus, Edit, Trash2, Copy } from 'lucide-react'

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      const data = await response.json()
      setTemplates(data)
    } catch (error) {
      console.error('Erreur lors du chargement des templates:', error)
    }
  }

  const handleAddTemplate = () => {
    setEditingTemplate(null)
    setShowForm(true)
  }

  const handleEditTemplate = (template: Template) => {
    setEditingTemplate(template)
    setShowForm(true)
  }

  const handleDeleteTemplate = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      try {
        const response = await fetch(`/api/templates/${id}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          fetchTemplates()
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error)
      }
    }
  }

  const typeLabels: Record<TypeTemplate, string> = {
    candidature: 'Candidature',
    relance: 'Relance',
    remerciement: 'Remerciement'
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Templates de mail
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos modèles d&apos;emails avec variables personnalisables
            </p>
          </div>
          <button
            onClick={handleAddTemplate}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau template
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div key={template.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{template.nom}</h4>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {typeLabels[template.type]}
                  </span>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditTemplate(template)}
                    className="text-gray-400 hover:text-gray-600"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    title="Dupliquer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-400 hover:text-red-600"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700">Sujet:</p>
                <p className="text-sm text-gray-600">{template.sujet}</p>
              </div>
              
              <div className="mb-3">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {template.contenu.substring(0, 150)}...
                </p>
              </div>
              
              {template.variables.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-1">Variables:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.variables.map((variable, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun template trouvé</p>
            <button
              onClick={handleAddTemplate}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer votre premier template
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <TemplateForm
          template={editingTemplate}
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false)
            fetchTemplates()
          }}
        />
      )}
    </div>
  )
}

interface TemplateFormProps {
  template: Template | null
  onClose: () => void
  onSave: () => void
}

function TemplateForm({ template, onClose, onSave }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    nom: template?.nom || '',
    sujet: template?.sujet || '',
    contenu: template?.contenu || '',
    type: template?.type || 'candidature' as TypeTemplate,
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = template ? `/api/templates/${template.id}` : '/api/templates'
      const method = template ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSave()
      } else {
        alert('Erreur lors de la sauvegarde du template')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la sauvegarde du template')
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {template ? 'Modifier le template' : 'Nouveau template'}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                        Nom du template *
                      </label>
                      <input
                        type="text"
                        name="nom"
                        id="nom"
                        required
                        value={formData.nom}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                        Type *
                      </label>
                      <select
                        name="type"
                        id="type"
                        required
                        value={formData.type}
                        onChange={handleChange}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      >
                        <option value="candidature">Candidature</option>
                        <option value="relance">Relance</option>
                        <option value="remerciement">Remerciement</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="sujet" className="block text-sm font-medium text-gray-700">
                        Sujet *
                      </label>
                      <input
                        type="text"
                        name="sujet"
                        id="sujet"
                        required
                        value={formData.sujet}
                        onChange={handleChange}
                        placeholder="Ex: Candidature pour le poste de {{poste}}"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="contenu" className="block text-sm font-medium text-gray-700">
                        Contenu du mail *
                      </label>
                      <textarea
                        name="contenu"
                        id="contenu"
                        rows={12}
                        required
                        value={formData.contenu}
                        onChange={handleChange}
                        placeholder="Bonjour {{contact_nom}},&#10;&#10;Je vous contacte au sujet du poste de {{poste}} chez {{entreprise}}...&#10;&#10;Variables disponibles: {{entreprise}}, {{contact_nom}}, {{poste}}, {{prenom}}, {{nom}}"
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Utilisez des variables comme: {'{'}{'{'} entreprise {'}'}{'}'}, {'{'}{'{'} contact_nom {'}'}{'}'}, {'{'}{'{'} poste {'}'}{'}'}, etc.
                      </p>
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
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
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