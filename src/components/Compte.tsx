'use client'

import { useState, useEffect } from 'react'
import { User, Upload, FileText, Check, AlertCircle, Mail, Phone, MapPin } from 'lucide-react'

interface ProfilUtilisateur {
  nom: string
  prenom: string
  email: string
  telephone: string
  adresse: string
  cv: File | null
  cvUrl: string
  signature: string
}

export default function Compte() {
  const [profil, setProfil] = useState<ProfilUtilisateur>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    cv: null,
    cvUrl: '',
    signature: ''
  })
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    // Charger le profil depuis localStorage
    const profilSauvegarde = localStorage.getItem('profil-utilisateur')
    if (profilSauvegarde) {
      const data = JSON.parse(profilSauvegarde)
      setProfil(data)
    }
  }, [])

  const sauvegarderProfil = () => {
    try {
      // Sauvegarder tout sauf le fichier CV (on garde juste l'URL)
      const profilASauvegarder = {
        ...profil,
        cv: null // Ne pas sauvegarder l'objet File
      }
      localStorage.setItem('profil-utilisateur', JSON.stringify(profilASauvegarder))
      setMessage({ type: 'success', text: 'Profil sauvegardé avec succès !' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' })
      setTimeout(() => setMessage(null), 3000)
    }
  }

  const handleFileUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'Veuillez sélectionner un fichier PDF' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      setMessage({ type: 'error', text: 'Le fichier doit faire moins de 5MB' })
      setTimeout(() => setMessage(null), 3000)
      return
    }

    // Créer une URL pour le fichier
    const url = URL.createObjectURL(file)
    setProfil(prev => ({
      ...prev,
      cv: file,
      cvUrl: url
    }))
    setMessage({ type: 'success', text: 'CV ajouté avec succès !' })
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const genererSignatureAutomatique = () => {
    const signature = `${profil.prenom} ${profil.nom}
${profil.email}
${profil.telephone}
${profil.adresse}`
    setProfil(prev => ({ ...prev, signature }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Compte</h1>
            <p className="text-gray-600">Gérez votre profil et vos documents</p>
          </div>
        </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-gray-600" />
            Informations personnelles
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={profil.prenom}
                  onChange={(e) => setProfil(prev => ({ ...prev, prenom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Votre prénom"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={profil.nom}
                  onChange={(e) => setProfil(prev => ({ ...prev, nom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={profil.email}
                onChange={(e) => setProfil(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="votre.email@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                Téléphone
              </label>
              <input
                type="tel"
                value={profil.telephone}
                onChange={(e) => setProfil(prev => ({ ...prev, telephone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="06 12 34 56 78"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Adresse
              </label>
              <textarea
                value={profil.adresse}
                onChange={(e) => setProfil(prev => ({ ...prev, adresse: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="Votre adresse complète"
              />
            </div>
          </div>
        </div>

        {/* CV et documents */}
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-600" />
            CV et documents
          </h3>

          {/* Zone de drop pour le CV */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {profil.cvUrl ? (
              <div className="space-y-3">
                <FileText className="w-12 h-12 text-green-600 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-900">CV ajouté avec succès</p>
                  <p className="text-xs text-gray-500">
                    {profil.cv?.name || 'CV.pdf'}
                  </p>
                </div>
                <button
                  onClick={() => setProfil(prev => ({ ...prev, cv: null, cvUrl: '' }))}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Supprimer
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Glissez votre CV ici ou
                  </p>
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-800 font-medium">
                      parcourez vos fichiers
                    </span>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file)
                      }}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PDF uniquement, max 5MB</p>
              </div>
            )}
          </div>

          {/* Signature email */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Signature email
              </label>
              <button
                onClick={genererSignatureAutomatique}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Générer automatiquement
              </button>
            </div>
            <textarea
              value={profil.signature}
              onChange={(e) => setProfil(prev => ({ ...prev, signature: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm"
              placeholder="Votre signature pour les emails..."
            />
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <button
          onClick={sauvegarderProfil}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Check className="w-5 h-5" />
          <span>Sauvegarder le profil</span>
        </button>
      </div>
      </div>
    </div>
  )
}