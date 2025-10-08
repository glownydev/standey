import { Candidature } from '@/types'

export function exportToCSV(candidatures: Candidature[], filename = 'candidatures.csv') {
  if (candidatures.length === 0) {
    alert('Aucune candidature à exporter')
    return
  }

  const headers = [
    'ID',
    'Entreprise',
    'Contact Nom',
    'Contact Email', 
    'Contact Téléphone',
    'Poste',
    'Date d\'envoi',
    'Statut',
    'Notes',
    'Date de création',
    'Dernière modification'
  ]

  const csvContent = [
    headers.join(','),
    ...candidatures.map(candidature => [
      candidature.id,
      `"${candidature.entreprise}"`,
      `"${candidature.contact_nom}"`,
      candidature.contact_email,
      candidature.contact_telephone || '',
      `"${candidature.poste}"`,
      candidature.date_envoi,
      candidature.statut,
      `"${candidature.notes || ''}"`,
      candidature.created_at,
      candidature.updated_at
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export function generateMailtoLink(candidature: Candidature, template?: string): string {
  const subject = template ? 
    template.replace(/\{\{poste\}\}/g, candidature.poste)
           .replace(/\{\{entreprise\}\}/g, candidature.entreprise) :
    `Candidature - ${candidature.poste}`

  const body = template ?
    template.replace(/\{\{contact_nom\}\}/g, candidature.contact_nom)
           .replace(/\{\{entreprise\}\}/g, candidature.entreprise)
           .replace(/\{\{poste\}\}/g, candidature.poste) :
    `Bonjour ${candidature.contact_nom},\n\nJe vous contacte concernant le poste de ${candidature.poste} chez ${candidature.entreprise}.\n\nCordialement,`

  return `mailto:${candidature.contact_email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}