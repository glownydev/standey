'use client'

import { useState, useEffect } from 'react'
import { Candidature, Template } from '@/types'
import { X, Send, Eye } from 'lucide-react'
import { generateMailtoLink } from '@/lib/utils'

interface SendMailModalProps {
  candidature: Candidature
  onClose: () => void
}

export default function SendMailModal({ candidature, onClose }: SendMailModalProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [customSubject, setCustomSubject] = useState('')
  const [customBody, setCustomBody] = useState('')
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template)
    
    // Remplacer les variables dans le template
    const processedSubject = template.sujet
      .replace(/\{\{entreprise\}\}/g, candidature.entreprise)
      .replace(/\{\{contact_nom\}\}/g, candidature.contact_nom)
      .replace(/\{\{poste\}\}/g, candidature.poste)

    const processedBody = template.contenu
      .replace(/\{\{entreprise\}\}/g, candidature.entreprise)
      .replace(/\{\{contact_nom\}\}/g, candidature.contact_nom)
      .replace(/\{\{poste\}\}/g, candidature.poste)

    setCustomSubject(processedSubject)
    setCustomBody(processedBody)
  }

  const handleSendMail = () => {
    const mailtoUrl = `mailto:${candidature.contact_email}?subject=${encodeURIComponent(customSubject)}&body=${encodeURIComponent(customBody)}`
    window.open(mailtoUrl, '_blank')
    onClose()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6">
          <p>Chargement des templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Envoyer un mail à {candidature.contact_nom}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Templates */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Choisir un template</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template)}
                      className={`w-full p-3 text-left border rounded-lg hover:bg-gray-50 ${
                        selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="font-medium">{template.nom}</div>
                      <div className="text-sm text-gray-500">{template.type}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prévisualisation et édition */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Aperçu du mail</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Destinataire
                    </label>
                    <input
                      type="email"
                      value={candidature.contact_email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sujet
                    </label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Sujet du mail"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={12}
                      value={customBody}
                      onChange={(e) => setCustomBody(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Contenu du mail"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={handleSendMail}
              disabled={!customSubject || !customBody}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Ouvrir dans le client mail
            </button>
            <button
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}