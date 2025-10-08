import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/database'
import { Candidature } from '@/types'

export async function GET() {
  try {
    const candidatures = db.prepare('SELECT * FROM candidatures ORDER BY created_at DESC').all()
    return NextResponse.json(candidatures)
  } catch (error) {
    console.error('Erreur lors de la récupération des candidatures:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { entreprise, contact_nom, contact_email, contact_telephone, poste, date_envoi, statut, notes } = data

    if (!entreprise || !contact_nom || !contact_email || !poste || !date_envoi) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const stmt = db.prepare(`
      INSERT INTO candidatures (entreprise, contact_nom, contact_email, contact_telephone, poste, date_envoi, statut, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(entreprise, contact_nom, contact_email, contact_telephone || null, poste, date_envoi, statut || 'brouillon', notes || null)

    // Ajouter à l'historique
    const histoireStmt = db.prepare(`
      INSERT INTO historique_statuts (candidature_id, nouveau_statut)
      VALUES (?, ?)
    `)
    histoireStmt.run(result.lastInsertRowid, statut || 'brouillon')

    // Programmer une notification de relance si statut = envoyé
    if (statut === 'envoye') {
      const notificationDate = new Date()
      notificationDate.setDate(notificationDate.getDate() + 7) // Relance dans 7 jours

      const notifStmt = db.prepare(`
        INSERT INTO notifications (candidature_id, type, date_prevue)
        VALUES (?, 'relance', ?)
      `)
      notifStmt.run(result.lastInsertRowid, notificationDate.toISOString())
    }

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Candidature créée' }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création de la candidature:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}