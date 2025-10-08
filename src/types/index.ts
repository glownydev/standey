export interface Candidature {
  id: number;
  entreprise: string;
  contact_nom: string;
  contact_email: string;
  contact_telephone?: string;
  poste: string;
  date_envoi: string;
  statut: StatutCandidature;
  dernier_mail?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type StatutCandidature = 
  | 'brouillon'
  | 'envoye'
  | 'relance'
  | 'reponse_recue'
  | 'refuse'
  | 'entretien_propose'
  | 'accepte';

export interface Template {
  id: number;
  nom: string;
  sujet: string;
  contenu: string;
  variables: string[];
  type: TypeTemplate;
  created_at: string;
  updated_at: string;
}

export type TypeTemplate = 'candidature' | 'relance' | 'remerciement';

export interface HistoriqueStatut {
  id: number;
  candidature_id: number;
  ancien_statut: StatutCandidature;
  nouveau_statut: StatutCandidature;
  date_changement: string;
  commentaire?: string;
}

export interface Notification {
  id: number;
  candidature_id: number;
  type: 'relance' | 'rappel';
  date_prevue: string;
  envoye: boolean;
  created_at: string;
}