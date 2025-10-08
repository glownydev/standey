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

    const stmt = db.prepare('DELETE FROM templates WHERE id = ?')
    const result = stmt.run(idNum)

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Template supprimé' })
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

    const { nom, sujet, contenu, type } = data

    if (!nom || !sujet || !contenu || !type) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Extraire les variables du contenu et du sujet
    const variables = extractVariables(contenu + ' ' + sujet)

    const stmt = db.prepare(`
      UPDATE templates 
      SET nom = ?, sujet = ?, contenu = ?, variables = ?, type = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)

    const result = stmt.run(nom, sujet, contenu, JSON.stringify(variables), type, idNum)

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Template non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Template mis à jour' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function extractVariables(text: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g
  const variables = new Set<string>()
  let match

  while ((match = regex.exec(text)) !== null) {
    variables.add(match[1].trim())
  }

  return Array.from(variables)
}