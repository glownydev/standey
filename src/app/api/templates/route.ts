import { NextRequest, NextResponse } from 'next/server'
import db from '@/lib/database'

export async function GET() {
  try {
    const templates = db.prepare('SELECT * FROM templates ORDER BY created_at DESC').all()
    
    // Parser les variables JSON
    const templatesWithVariables = templates.map((template: any) => ({
      ...template,
      variables: Array.isArray(template.variables) ? template.variables : 
                 (typeof template.variables === 'string' ? 
                   (template.variables.startsWith('[') ? JSON.parse(template.variables) : []) : 
                   [])
    }))
    
    return NextResponse.json(templatesWithVariables)
  } catch (error) {
    console.error('Erreur lors de la récupération des templates:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const { nom, sujet, contenu, type } = data

    if (!nom || !sujet || !contenu || !type) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    // Extraire les variables du contenu et du sujet
    const variables = extractVariables(contenu + ' ' + sujet)

    const stmt = db.prepare(`
      INSERT INTO templates (nom, sujet, contenu, variables, type)
      VALUES (?, ?, ?, ?, ?)
    `)

    const result = stmt.run(nom, sujet, contenu, JSON.stringify(variables), type)

    return NextResponse.json({ id: result.lastInsertRowid, message: 'Template créé' }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du template:', error)
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