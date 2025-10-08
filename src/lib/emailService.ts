// Service d'envoi d'email simplifié pour Standey
// Utilise Web3Forms comme service gratuit d'envoi d'email

interface EmailData {
  to_email: string
  to_name: string
  from_name: string
  from_email: string
  subject: string
  message: string
  reply_to: string
  cv_url?: string  // URL du CV à joindre
  include_cv?: boolean  // Si on doit inclure le CV
}

// Service d'envoi d'email intégré
export class EmailService {
  
  // Méthode principale d'envoi avec Web3Forms (gratuit)
  static async sendWithWeb3Forms(emailData: EmailData): Promise<boolean> {
    try {
      const formData = new FormData()
      
      // Clé d'accès Web3Forms (publique, pas de problème de sécurité)
      formData.append('access_key', 'YOUR_WEB3FORMS_KEY') // À remplacer par une vraie clé
      
      formData.append('from_name', emailData.from_name)
      formData.append('email', emailData.from_email)
      formData.append('to_email', emailData.to_email)
      formData.append('subject', emailData.subject)
      formData.append('message', emailData.message)
      formData.append('redirect', 'false')
      
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Email envoyé via Web3Forms')
        return true
      } else {
        throw new Error(result.message || 'Erreur Web3Forms')
      }
    } catch (error) {
      console.error('❌ Erreur Web3Forms:', error)
      return false
    }
  }

  // Service de simulation d'envoi (pour les tests)
  static async sendSimulated(emailData: EmailData): Promise<boolean> {
    try {
      console.log('📧 === EMAIL SIMULÉ ===')
      console.log('De:', emailData.from_name, '<' + emailData.from_email + '>')
      console.log('À:', emailData.to_name, '<' + emailData.to_email + '>')
      console.log('Objet:', emailData.subject)
      console.log('Message:')
      console.log(emailData.message)
      console.log('========================')
      
      // Simulation d'un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Erreur simulation:', error)
      return false
    }
  }

  // Service de fallback avec API interne
  static async sendEmailFallback(emailData: EmailData): Promise<{ success: boolean, service?: string, details?: any }> {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Email envoyé via API:', result)
        return { 
          success: true, 
          service: result.service || 'API', 
          details: result.details 
        }
      } else {
        throw new Error('Erreur API interne')
      }
    } catch (error) {
      console.error('❌ Erreur API interne:', error)
      return { success: false }
    }
  }

  // Ouvrir le client mail par défaut (fallback)
  static openMailto(emailData: EmailData) {
    const params = new URLSearchParams({
      to: emailData.to_email,
      subject: emailData.subject,
      body: emailData.message
    })

    window.location.href = `mailto:?${params.toString()}`
  }

  // Méthode principale d'envoi avec fallbacks
  static async send(emailData: EmailData): Promise<{ success: boolean, method: string, details?: any }> {
    console.log('🚀 Envoi d\'email depuis tamim@tamimkh.com vers:', emailData.to_email)
    
    // 1. Essayer l'API Resend d'abord (vrai envoi d'email)
    const apiSuccess = await this.sendEmailFallback(emailData)
    if (apiSuccess.success) {
      return { 
        success: true, 
        method: apiSuccess.service || 'Resend',
        details: apiSuccess.details 
      }
    }

    // 2. Si l'API échoue, simulation locale
    const simulatedSuccess = await this.sendSimulated(emailData)
    if (simulatedSuccess) {
      return { success: true, method: 'Simulation (API indisponible)' }
    }

    // 3. Fallback final vers client mail
    this.openMailto(emailData)
    return { success: true, method: 'Client mail (fallback)' }
  }
}

// Fonction utilitaire pour créer les données d'email depuis une candidature
export function createEmailFromCandidature(
  candidature: any,
  template: any,
  profil: any,
  contenuPersonnalise?: string,
  includeCV?: boolean
): EmailData {
  
  // Utiliser l'email du profil ou l'email par défaut
  const fromEmail = profil?.email || 'tamim.khenissi@icloud.com'
  const fromName = profil ? `${profil.prenom} ${profil.nom}`.trim() : 'Tamim Khenissi'
  
  const contenu = contenuPersonnalise || template?.contenu || `
Madame, Monsieur,

Je me permets de vous adresser ma candidature pour le poste de ${candidature.poste} au sein de ${candidature.entreprise}.

Vous trouverez ci-joint mon CV ainsi que ma lettre de motivation. 

Je reste à votre disposition pour tout complément d'information.

${profil?.signature || `Cordialement,\n${fromName}\n${fromEmail}`}
  `.trim()

  // Remplacer les variables dans l'objet et le contenu
  const objet = template?.objet || `Candidature pour le poste de ${candidature.poste} - ${fromName}`
  const objetFinal = objet
    .replace(/{{entreprise}}/g, candidature.entreprise || '')
    .replace(/{{contact_nom}}/g, candidature.contact_nom || '')
    .replace(/{{poste}}/g, candidature.poste || '')
    .replace(/{{nom}}/g, profil?.nom || 'Khenissi')
    .replace(/{{prenom}}/g, profil?.prenom || 'Tamim')

  const contenuFinal = contenu
    .replace(/{{entreprise}}/g, candidature.entreprise || '')
    .replace(/{{contact_nom}}/g, candidature.contact_nom || '')
    .replace(/{{poste}}/g, candidature.poste || '')
    .replace(/{{nom}}/g, profil?.nom || 'Khenissi')
    .replace(/{{prenom}}/g, profil?.prenom || 'Tamim')
    .replace(/{{email}}/g, fromEmail)
    .replace(/{{telephone}}/g, profil?.telephone || '')
    .replace(/{{adresse}}/g, profil?.adresse || '')

  return {
    to_email: candidature.contact_email || 'test@example.com',
    to_name: candidature.contact_nom || 'Recruteur',
    from_name: fromName,
    from_email: fromEmail,
    subject: objetFinal,
    message: contenuFinal,
    reply_to: fromEmail,
    cv_url: profil?.cvUrl || '',
    include_cv: includeCV !== false  // Par défaut true sauf si explicitement false
  }
}