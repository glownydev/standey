'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Mail, Paperclip, Send, FileText, User, CheckCircle } from 'lucide-react'
import { Candidature } from '@/types'
import { EmailService, createEmailFromCandidature } from '@/lib/emailService'

interface EnvoiMailModalProps {
  candidature: Candidature
  onClose: () => void
  onSent?: () => void
}

interface Template {
  id: number
  nom: string
  objet: string
  contenu: string
  type: string
}

interface ProfilUtilisateur {
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  cvUrl: string
  signature: string
}

export default function EnvoiMailModal({ candidature, onClose, onSent }: EnvoiMailModalProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [profil, setProfil] = useState<ProfilUtilisateur | null>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<number | ''>('')
  const [objet, setObjet] = useState('')
  const [contenu, setContenu] = useState('')
  const [includeCV, setIncludeCV] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [methodeEnvoi, setMethodeEnvoi] = useState<'integre' | 'client'>('integre')
  const [statutEnvoi, setStatutEnvoi] = useState<string>('')

  useEffect(() => {
    // Charger les templates depuis l'API et localStorage
    const loadTemplates = async () => {
      try {
        // Essayer l'API d'abord
        const response = await fetch('/api/templates')
        if (response.ok) {
          const apiTemplates = await response.json()
          setTemplates(apiTemplates)
          console.log('Templates chargés depuis API:', apiTemplates)
        } else {
          throw new Error('API non disponible')
        }
      } catch (error) {
        console.log('Chargement depuis localStorage...')
        // Fallback vers localStorage
        const templatesData = localStorage.getItem('standey-data')
        if (templatesData) {
          const data = JSON.parse(templatesData)
          setTemplates(data.templates || [])
          console.log('Templates chargés depuis localStorage:', data.templates)
        }
      }
    }

    loadTemplates()

    // Charger le profil utilisateur
    const profilData = localStorage.getItem('profil-utilisateur')
    if (profilData) {
      setProfil(JSON.parse(profilData))
    }
  }, [])

  const remplacerVariables = useCallback((texte: string) => {
    // Vérification que texte n'est pas undefined ou null
    if (!texte || typeof texte !== 'string') {
      return ''
    }
    
    return texte
      .replace(/{{entreprise}}/g, candidature.entreprise || '')
      .replace(/{{contact_nom}}/g, candidature.contact_nom || '')
      .replace(/{{poste}}/g, candidature.poste || '')
      .replace(/{{nom}}/g, profil?.nom || '')
      .replace(/{{prenom}}/g, profil?.prenom || '')
      .replace(/{{email}}/g, profil?.email || '')
      .replace(/{{telephone}}/g, profil?.telephone || '')
      .replace(/{{adresse}}/g, profil?.adresse || '')
  }, [candidature, profil])

  useEffect(() => {
    // Appliquer le template sélectionné
    if (selectedTemplate && templates.length > 0) {
      const template = templates.find(t => t.id === selectedTemplate)
      if (template) {
        // Vérifier que les propriétés existent avant de les utiliser
        if (template.objet) {
          setObjet(remplacerVariables(template.objet))
        }
        if (template.contenu) {
          setContenu(remplacerVariables(template.contenu))
        }
      }
    }
  }, [selectedTemplate, templates, candidature, profil, remplacerVariables])

  const genererContenuAvecSignature = () => {
    let contenuFinal = contenu
    
    if (profil?.signature) {
      contenuFinal += '\n\n' + profil.signature
    }
    
    return contenuFinal
  }

  const envoyerMail = async () => {
    if (!profil?.email) {
      alert('Veuillez configurer votre email dans votre profil')
      return
    }

    if (!objet.trim() || !contenu.trim()) {
      alert('Veuillez remplir l\'objet et le contenu du mail')
      return
    }

    if (!candidature.contact_email) {
      alert('Aucun email de contact pour cette candidature')
      return
    }

    setIsLoading(true)
    setStatutEnvoi('Envoi en cours...')

    try {
      if (methodeEnvoi === 'integre') {
        // Envoi intégré avec notre service
        const template = templates.find(t => t.id === selectedTemplate)
        const emailData = createEmailFromCandidature(
          candidature,
          template,
          profil,
          genererContenuAvecSignature(),
          includeCV
        )

        const result = await EmailService.send(emailData)
        
        if (result.success) {
          setStatutEnvoi(`✅ Email envoyé via ${result.method}`)
          
          // Mettre à jour le statut de la candidature
          await mettreAJourStatut()
          
          // Fermer le modal après un délai
          setTimeout(() => {
            onSent?.()
            onClose()
          }, 2000)
        } else {
          throw new Error('Échec de l\'envoi intégré')
        }
      } else {
        // Méthode client mail classique
        const mailto = creerLienMailto()
        window.location.href = mailto
        
        setStatutEnvoi('✅ Client mail ouvert')
        await mettreAJourStatut()
        
        setTimeout(() => {
          onSent?.()
          onClose()
        }, 1000)
      }

    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error)
      setStatutEnvoi('❌ Erreur lors de l\'envoi')
      
      // Fallback vers client mail en cas d'erreur
      setTimeout(() => {
        const mailto = creerLienMailto()
        window.location.href = mailto
        setStatutEnvoi('📧 Fallback: Client mail ouvert')
      }, 1000)
    } finally {
      setTimeout(() => {
        setIsLoading(false)
        setStatutEnvoi('')
      }, 3000)
    }
  }

  const creerLienMailto = () => {
    const contenuFinal = genererContenuAvecSignature()
    const destinataire = candidature.contact_email || ''
    
    // Note: Les pièces jointes ne peuvent pas être ajoutées via mailto
    // On ajoute une note dans le contenu pour rappeler d'ajouter le CV
    let contenuAvecCV = contenuFinal
    if (includeCV && profil?.cvUrl) {
      contenuAvecCV += '\n\n--- \nN\'oubliez pas d\'ajouter votre CV en pièce jointe depuis votre client mail.'
    }

    const params = new URLSearchParams({
      to: destinataire,
      subject: objet,
      body: contenuAvecCV
    })

    return `mailto:?${params.toString()}`
  }

  const mettreAJourStatut = async () => {
    try {
      const response = await fetch(`/api/candidatures/${candidature.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...candidature,
          statut: 'envoye'
        }),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Erreur API:', errorData)
        throw new Error(`Erreur lors de la mise à jour: ${response.status}`)
      }
      
      console.log('✅ Statut mis à jour avec succès')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error)
    }
  }

  if (!profil) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
          <div className="text-center">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Profil non configuré
            </h3>
            <p className="text-gray-600 mb-4">
              Veuillez d&apos;abord configurer votre profil dans l&apos;onglet &quot;Compte&quot; pour pouvoir envoyer des mails.
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Envoyer un mail
              </h2>
              <p className="text-sm text-gray-600">
                {candidature.entreprise} - {candidature.poste}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Configuration</h3>
              
              {/* Debug - Afficher les templates */}
              {templates.length === 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Aucun template trouvé. Chargement depuis API...
                  </p>
                </div>
              )}
              
              {templates.length > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ {templates.length} template(s) disponible(s)
                  </p>
                </div>
              )}              {/* Sélection de template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Aucun template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destinataire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Destinataire
                </label>
                <input
                  type="email"
                  value={candidature.contact_email || ''}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                />
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Méthode d&apos;envoi
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="methodeEnvoi"
                        checked={methodeEnvoi === 'integre'}
                        onChange={() => setMethodeEnvoi('integre')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Envoi intégré (recommandé)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="methodeEnvoi"
                        checked={methodeEnvoi === 'client'}
                        onChange={() => setMethodeEnvoi('client')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Client mail externe</span>
                    </label>
                  </div>
                </div>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeCV}
                    onChange={(e) => setIncludeCV(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Mentionner le CV</span>
                </label>
                
                {includeCV && (
                  <div className="ml-6 text-xs text-gray-500 flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>
                      {profil.cvUrl ? 'CV prêt à être joint' : 'Aucun CV configuré'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Composition du mail */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-medium text-gray-900">Composition</h3>
              
              {/* Objet */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Objet *
                </label>
                <input
                  type="text"
                  value={objet}
                  onChange={(e) => setObjet(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Objet du mail"
                />
              </div>

              {/* Contenu */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  value={contenu}
                  onChange={(e) => setContenu(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Votre message..."
                />
              </div>

              {/* Aperçu signature */}
              {profil.signature && (
                <div className="bg-gray-50 p-3 rounded border">
                  <p className="text-xs text-gray-600 mb-1">Signature qui sera ajoutée :</p>
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {profil.signature}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-6">
            <div className="text-sm text-gray-500">
              {statutEnvoi && (
                <div className="flex items-center space-x-2 text-sm font-medium">
                  <span>{statutEnvoi}</span>
                </div>
              )}
              {!statutEnvoi && includeCV && profil.cvUrl && methodeEnvoi === 'client' && (
                <div className="flex items-center space-x-1">
                  <Paperclip className="w-4 h-4" />
                  <span>CV sera à joindre manuellement dans votre client mail</span>
                </div>
              )}
              {!statutEnvoi && methodeEnvoi === 'integre' && (
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Envoi direct depuis l&apos;application</span>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={envoyerMail}
                disabled={isLoading || !objet.trim() || !contenu.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Envoyer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}