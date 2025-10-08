import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/database'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const idNum = parseInt(id)
    
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const stmt = db.prepare('DELETE FROM candidatures WHERE id = ?')
    const result = stmt.run(idNum)

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Candidature supprimée' })
  } catch (error) {
    console.error('Erreur lors de la suppression:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const idNum = parseInt(id)
    const data = await request.json()
    
    if (isNaN(idNum)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 })
    }

    const { entreprise, contact_nom, contact_email, contact_telephone, poste, date_envoi, statut, notes } = data

    // Récupérer l'ancien statut pour l'historique
    const oldRecord = db.prepare('SELECT statut FROM candidatures WHERE id = ?').get(idNum) as any

    const stmt = db.prepare(`
      UPDATE candidatures 
      SET entreprise = ?, contact_nom = ?, contact_email = ?, contact_telephone = ?, 
          poste = ?, date_envoi = ?, statut = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    const result = stmt.run(entreprise, contact_nom, contact_email, contact_telephone || null, poste, date_envoi, statut, notes || null, idNum)

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Candidature non trouvée' }, { status: 404 })
    }

    // Ajouter à l'historique si le statut a changé
    if (oldRecord && oldRecord.statut !== statut) {
      const histoireStmt = db.prepare(`
        INSERT INTO historique_statuts (candidature_id, ancien_statut, nouveau_statut)
        VALUES (?, ?, ?)
      `)
      histoireStmt.run(idNum, oldRecord.statut, statut)
    }

    return NextResponse.json({ message: 'Candidature mise à jour' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}