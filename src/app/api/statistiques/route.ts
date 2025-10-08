import { NextResponse } from 'next/server'
import db from '@/lib/database'

export async function GET() {
  try {
    const candidatures = db.prepare('SELECT * FROM candidatures').all() as any[]
    
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

    // Taux de réussite (accepté + entretien)
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

    // Calcul des tendances
    const candidaturesCeMois = candidatures.filter((c: any) => {
      if (!c.date_envoi) return false
      const date = new Date(c.date_envoi)
      const maintenant = new Date()
      return date.getMonth() === maintenant.getMonth() && 
             date.getFullYear() === maintenant.getFullYear()
    }).length

    const candidaturesMoisDernier = candidatures.filter((c: any) => {
      if (!c.date_envoi) return false
      const date = new Date(c.date_envoi)
      const moisDernier = new Date()
      moisDernier.setMonth(moisDernier.getMonth() - 1)
      return date.getMonth() === moisDernier.getMonth() && 
             date.getFullYear() === moisDernier.getFullYear()
    }).length

    return NextResponse.json({
      total,
      parStatut,
      parMois,
      parEntreprise,
      tauxReussite,
      tempsReponse,
      derniereSemaines,
      tendances: {
        ceMois: candidaturesCeMois,
        moisDernier: candidaturesMoisDernier,
        evolution: candidaturesMoisDernier > 0 ? 
          Math.round(((candidaturesCeMois - candidaturesMoisDernier) / candidaturesMoisDernier) * 100) : 0
      },
      detailsStatuts: {
        brouillon: parStatut.brouillon || 0,
        envoye: parStatut.envoye || 0,
        reponse_recue: parStatut.reponse_recue || 0,
        entretien_propose: parStatut.entretien_propose || 0,
        accepte: parStatut.accepte || 0,
        refuse: parStatut.refuse || 0
      }
    })
  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}