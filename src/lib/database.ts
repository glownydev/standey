// Système de stockage en mémoire pour le développement
// En production, il serait recommandé d'utiliser une vraie base de données

interface DbData {
  candidatures: any[]
  templates: any[]
  historique_statuts: any[]
  notifications: any[]
}

class InMemoryDatabase {
  private data: DbData
  private nextIds: Record<string, number>

  constructor() {
    this.data = {
      candidatures: [],
      templates: this.getDefaultTemplates(),
      historique_statuts: [],
      notifications: []
    }
    this.nextIds = {
      candidatures: 1,
      templates: 4,
      historique_statuts: 1,
      notifications: 1
    }
    
    // Charger les données depuis localStorage si disponible
    this.loadFromStorage()
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('standey-data')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          this.data = { ...this.data, ...parsed }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error)
        }
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('standey-data', JSON.stringify(this.data))
      localStorage.setItem('candidatures', JSON.stringify(this.data.candidatures))
      // Déclencher un événement pour mettre à jour les statistiques
      window.dispatchEvent(new CustomEvent('candidaturesUpdated'))
    }
  }

  private getDefaultTemplates() {
    return [
      {
        id: 1,
        nom: 'Candidature spontanée',
        sujet: 'Candidature pour le poste de {{poste}}',
        contenu: `Bonjour {{contact_nom}},

Je me permets de vous contacter concernant des opportunités d'emploi au sein de {{entreprise}}.

Actuellement étudiant(e) et à la recherche d'un stage/emploi dans le domaine de {{poste}}, je serais ravi(e) de pouvoir contribuer aux projets de votre équipe.

Mon profil pourrait correspondre à vos besoins, et je serais disponible pour un entretien à votre convenance.

Vous trouverez mon CV en pièce jointe.

Cordialement,
[Votre nom]`,
        variables: ['entreprise', 'contact_nom', 'poste'],
        type: 'candidature',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        nom: 'Relance',
        sujet: 'Relance - Candidature {{poste}}',
        contenu: `Bonjour {{contact_nom}},

Je me permets de revenir vers vous concernant ma candidature pour le poste de {{poste}} chez {{entreprise}}.

N'ayant pas eu de retour suite à mon premier mail, je souhaitais savoir si ma candidature avait retenu votre attention.

Je reste disponible pour tout complément d'information.

Cordialement,
[Votre nom]`,
        variables: ['entreprise', 'contact_nom', 'poste'],
        type: 'relance',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        nom: 'Remerciement',
        sujet: 'Remerciements suite à notre entretien',
        contenu: `Bonjour {{contact_nom}},

Je tenais à vous remercier pour le temps que vous m'avez accordé lors de notre entretien concernant le poste de {{poste}}.

Cet échange a confirmé mon intérêt pour rejoindre {{entreprise}} et contribuer aux projets de votre équipe.

J'espère avoir l'opportunité de collaborer avec vous et reste à votre disposition pour toute information complémentaire.

Cordialement,
[Votre nom]`,
        variables: ['entreprise', 'contact_nom', 'poste'],
        type: 'remerciement',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]
  }

  // Méthodes pour simuler SQLite
  prepare(sql: string) {
    return {
      all: () => {
        if (sql.includes('SELECT * FROM candidatures')) {
          return this.data.candidatures.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        }
        if (sql.includes('SELECT * FROM templates')) {
          return this.data.templates.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        }
        return []
      },
      get: (id?: number) => {
        if (sql.includes('SELECT statut FROM candidatures WHERE id = ?')) {
          return this.data.candidatures.find(c => c.id === id)
        }
        return null
      },
      run: (...params: any[]) => {
        if (sql.includes('INSERT INTO candidatures')) {
          const [entreprise, contact_nom, contact_email, contact_telephone, poste, date_envoi, statut, notes] = params
          const newId = this.nextIds.candidatures++
          const now = new Date().toISOString()
          
          const candidature = {
            id: newId,
            entreprise,
            contact_nom,
            contact_email,
            contact_telephone,
            poste,
            date_envoi,
            statut: statut || 'brouillon',
            dernier_mail: null,
            notes,
            created_at: now,
            updated_at: now
          }
          
          this.data.candidatures.push(candidature)
          this.saveToStorage()
          
          return { lastInsertRowid: newId, changes: 1 }
        }
        
        if (sql.includes('INSERT INTO templates')) {
          const [nom, sujet, contenu, variables, type] = params
          const newId = this.nextIds.templates++
          const now = new Date().toISOString()
          
          const template = {
            id: newId,
            nom,
            sujet,
            contenu,
            variables: JSON.parse(variables),
            type,
            created_at: now,
            updated_at: now
          }
          
          this.data.templates.push(template)
          this.saveToStorage()
          
          return { lastInsertRowid: newId, changes: 1 }
        }
        
        if (sql.includes('DELETE FROM candidatures WHERE id = ?')) {
          const [id] = params
          const index = this.data.candidatures.findIndex(c => c.id === id)
          if (index > -1) {
            this.data.candidatures.splice(index, 1)
            this.saveToStorage()
            return { changes: 1 }
          }
          return { changes: 0 }
        }
        
        if (sql.includes('DELETE FROM templates WHERE id = ?')) {
          const [id] = params
          const index = this.data.templates.findIndex(t => t.id === id)
          if (index > -1) {
            this.data.templates.splice(index, 1)
            this.saveToStorage()
            return { changes: 1 }
          }
          return { changes: 0 }
        }
        
        if (sql.includes('UPDATE candidatures')) {
          const [entreprise, contact_nom, contact_email, contact_telephone, poste, date_envoi, statut, notes, id] = params
          const candidature = this.data.candidatures.find(c => c.id === id)
          if (candidature) {
            Object.assign(candidature, {
              entreprise,
              contact_nom,
              contact_email,
              contact_telephone,
              poste,
              date_envoi,
              statut,
              notes,
              updated_at: new Date().toISOString()
            })
            this.saveToStorage()
            return { changes: 1 }
          }
          return { changes: 0 }
        }
        
        if (sql.includes('UPDATE templates')) {
          const [nom, sujet, contenu, variables, type, id] = params
          const template = this.data.templates.find(t => t.id === id)
          if (template) {
            Object.assign(template, {
              nom,
              sujet,
              contenu,
              variables: JSON.parse(variables),
              type,
              updated_at: new Date().toISOString()
            })
            this.saveToStorage()
            return { changes: 1 }
          }
          return { changes: 0 }
        }
        
        if (sql.includes('INSERT INTO historique_statuts')) {
          const [candidature_id, ancien_statut, nouveau_statut] = params
          const newId = this.nextIds.historique_statuts++
          const now = new Date().toISOString()
          
          const historique = {
            id: newId,
            candidature_id,
            ancien_statut: ancien_statut || null,
            nouveau_statut,
            created_at: now
          }
          
          this.data.historique_statuts.push(historique)
          return { lastInsertRowid: newId, changes: 1 }
        }
        
        if (sql.includes('INSERT INTO notifications')) {
          const [candidature_id, type, date_prevue] = params
          const newId = this.nextIds.notifications++
          const now = new Date().toISOString()
          
          const notification = {
            id: newId,
            candidature_id,
            type,
            date_prevue,
            status: 'active',
            created_at: now
          }
          
          this.data.notifications.push(notification)
          return { lastInsertRowid: newId, changes: 1 }
        }
        
        return { changes: 0 }
      }
    }
  }
}

const db = new InMemoryDatabase()
export default db