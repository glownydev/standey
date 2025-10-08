import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialiser Resend avec votre clé API
// Vous devez créer un compte sur resend.com et ajouter votre domaine
const resend = new Resend(process.env.RESEND_API_KEY || 'your_resend_api_key')

export async function POST(request: NextRequest) {
  try {
    const emailData = await request.json()
    
    // Validation des données
    if (!emailData.to_email || !emailData.subject || !emailData.message) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    console.log('🚀 Tentative d\'envoi d\'email réel...')
    console.log('De:', emailData.from_email)
    console.log('À:', emailData.to_email)
    console.log('Objet:', emailData.subject)

    try {
      // Configuration de base pour l'email
      const emailConfig: any = {
        from: 'tamim@tamimkh.com', // Votre adresse depuis votre domaine
        to: [emailData.to_email],
        subject: emailData.subject,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #2563eb;">Candidature - ${emailData.subject}</h2>
            
            <div style="white-space: pre-line; margin: 20px 0;">
              ${emailData.message.replace(/\n/g, '<br>')}
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <div style="font-size: 14px; color: #6b7280;">
              <p><strong>Expéditeur :</strong> ${emailData.from_name}</p>
              <p><strong>Email de réponse :</strong> ${emailData.reply_to || emailData.from_email}</p>
              <p><strong>Envoyé depuis :</strong> Standey - Tracker de candidatures</p>
            </div>
          </div>
        `,
        text: emailData.message,
        replyTo: emailData.reply_to || emailData.from_email,
      }

      // Ajouter la pièce jointe CV si nécessaire
      if (emailData.include_cv && emailData.cv_url) {
        try {
          // Télécharger le CV depuis l'URL pour l'envoyer en pièce jointe
          const cvResponse = await fetch(emailData.cv_url)
          if (cvResponse.ok) {
            const cvBuffer = await cvResponse.arrayBuffer()
            const cvBase64 = Buffer.from(cvBuffer).toString('base64')
            
            emailConfig.attachments = [{
              filename: 'CV.pdf',
              content: cvBase64,
            }]
            console.log('📎 CV ajouté en pièce jointe')
          } else {
            console.log('⚠️ Impossible de récupérer le CV, envoi sans pièce jointe')
          }
        } catch (cvError) {
          console.log('⚠️ Erreur lors du traitement du CV:', cvError)
        }
      }

      // Envoi réel avec Resend
      const result = await resend.emails.send(emailConfig)

      console.log('✅ Email envoyé avec succès via Resend:', result)

      return NextResponse.json({ 
        success: true, 
        message: 'Email envoyé avec succès via Resend',
        emailId: result.data?.id || 'resend_' + Date.now(),
        service: 'Resend',
        details: {
          from: 'tamim@tamimkh.com',
          to: emailData.to_email,
          subject: emailData.subject,
          timestamp: new Date().toISOString(),
          resendId: result.data?.id
        }
      })

    } catch (resendError: any) {
      console.log('❌ Erreur Resend:', resendError)
      
      return NextResponse.json(
        { 
          error: 'Impossible d\'envoyer l\'email - Service non configuré', 
          details: resendError.message,
          service: 'Resend',
          configuration_required: true
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('❌ Erreur générale envoi email:', error)
    return NextResponse.json(
      { 
        error: 'Erreur serveur lors de l\'envoi', 
        details: error.message,
        service: 'API' 
      },
      { status: 500 }
    )
  }
}