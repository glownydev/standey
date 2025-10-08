# Standey - Tracker de Candidatures

Une application web moderne pour le suivi des candidatures de stage et d'emploi avec templates de mail personnalisables.

## Fonctionnalités

### 📊 Gestion des Candidatures
- **Tableau de suivi complet** : Visualisez toutes vos candidatures en un coup d'œil
- **Champs détaillés** : Entreprise, contact, poste, date d'envoi, statut, notes
- **Filtrage et tri** : Organisez vos candidatures par statut, date, entreprise
- **Statuts multiples** : Brouillon, Envoyé, Relancé, Réponse reçue, Refusé, Entretien proposé, Accepté

### 📧 Templates de Mail
- **Bibliothèque de modèles** : Templates prédéfinis pour candidature, relance, remerciements
- **Variables dynamiques** : Personnalisation automatique avec {{entreprise}}, {{contact_nom}}, {{poste}}, {{nom}}, {{prenom}}
- **Éditeur intégré** : Créez et modifiez vos propres templates
- **Envoi direct** : Ouverture automatique de votre client mail avec CV en pièce jointe

### 👤 Gestion de Profil
- **Informations personnelles** : Nom, prénom, email, téléphone, adresse
- **Upload de CV** : Glisser-déposer ou sélection de fichier PDF (max 5MB)
- **Signature automatique** : Génération automatique de signature email
- **Intégration mail** : Données automatiquement utilisées dans les candidatures

### 📊 Statistiques Avancées
- **Métriques en temps réel** : Total, taux de réussite, temps de réponse moyen
- **Analyses détaillées** : Répartition par statut, évolution temporelle
- **Visualisations** : Graphiques interactifs et barres de progression
- **Conseils personnalisés** : Recommandations pour optimiser vos candidatures

### 🔔 Notifications et Rappels
- **Relances automatiques** : Notifications programmées après 7 jours sans réponse
- **Historique des statuts** : Suivi complet des changements de statut
- **Alertes visuelles** : Interface claire pour ne rien oublier

### 📥📤 Import/Export
- **Export CSV** : Sauvegardez vos données localement
- **Import en lots** : Importez une liste existante de candidatures
- **Sauvegarde automatique** : Persistance des données en localStorage

## Technologies Utilisées

- **Frontend** : Next.js 15, React 18, TypeScript
- **Styling** : Tailwind CSS, Design responsive mobile-first
- **Backend** : Next.js API Routes
- **Base de données** : localStorage (persistance côté client)
- **Icons** : Lucide React

## Guide d'Utilisation

### 🚀 Première Configuration
1. **Configurez votre profil** dans l'onglet "Compte"
   - Renseignez vos informations personnelles
   - Uploadez votre CV (PDF, max 5MB)
   - Générez votre signature email automatiquement

2. **Créez vos templates** dans l'onglet "Templates"
   - Utilisez les variables : {{entreprise}}, {{contact_nom}}, {{poste}}, {{nom}}, {{prenom}}
   - Sauvegardez vos modèles de candidature et relance

### 📝 Gestion des Candidatures
1. **Ajoutez une candidature** avec le bouton "+"
2. **Suivez l'évolution** dans le tableau
3. **Envoyez un mail** de deux façons :
   - **Envoi rapide** ⚡ (icône Send verte) : Template automatique avec vos données
   - **Composer un mail** ✉️ (icône Mail bleue) : Personnalisez avec templates
   - Le CV est automatiquement rappelé pour être joint
   - Le statut se met à jour automatiquement

### 📊 Analyses
- Consultez vos **statistiques** dans l'onglet dédié
- Suivez votre **taux de réussite** et vos **tendances**
- Recevez des **conseils** pour optimiser vos candidatures

## Installation

1. **Cloner le projet**
   ```bash
   git clone <url-du-repo>
   cd standey
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer l'application**
   ```bash
   npm run dev
   ```

4. **Accéder à l'application**
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur

## Structure du Projet

```
src/
├── app/                    # Pages et API routes (App Router)
│   ├── api/               # API backend
│   │   ├── candidatures/  # CRUD candidatures
│   │   └── templates/     # CRUD templates
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Page d'accueil
├── components/            # Composants React
│   ├── CandidatureTable.tsx
│   ├── AddCandidatureForm.tsx
│   └── TemplateManager.tsx
├── lib/                   # Utilitaires
│   └── database.ts        # Configuration SQLite
└── types/                 # Types TypeScript
    └── index.ts
```

## Base de Données

### Tables principales :
- **candidatures** : Stockage des candidatures
- **templates** : Modèles de mail
- **historique_statuts** : Historique des changements
- **notifications** : Système de rappels

## Utilisation

### 1. Ajouter une Candidature
- Cliquez sur "Nouvelle candidature"
- Remplissez les informations de l'entreprise et du contact
- Sélectionnez le statut approprié
- Ajoutez des notes si nécessaire

### 2. Gérer les Templates
- Accédez à l'onglet "Templates de mail"
- Utilisez les templates prédéfinis ou créez les vôtres
- Insérez des variables avec la syntaxe {{nom_variable}}
- Variables disponibles : {{entreprise}}, {{contact_nom}}, {{poste}}, etc.

### 3. Envoyer un Mail
- Depuis le tableau des candidatures, cliquez sur l'icône mail
- Votre client mail s'ouvre avec les informations préremplies
- Personnalisez le message si nécessaire et envoyez

### 4. Suivre les Relances
- Les relances sont programmées automatiquement 7 jours après envoi
- Consultez l'historique des statuts pour chaque candidature
- Utilisez les filtres pour voir les candidatures nécessitant une relance

## Personnalisation

### Variables Disponibles dans les Templates
- `{{entreprise}}` : Nom de l'entreprise
- `{{contact_nom}}` : Nom du contact
- `{{contact_email}}` : Email du contact
- `{{poste}}` : Intitulé du poste
- `{{date_envoi}}` : Date d'envoi de la candidature

### Statuts Disponibles
- **Brouillon** : Candidature en préparation
- **Envoyé** : Candidature envoyée
- **Relancé** : Relance effectuée
- **Réponse reçue** : L'entreprise a répondu
- **Refusé** : Candidature refusée
- **Entretien proposé** : Entretien programmé
- **Accepté** : Candidature acceptée

## Scripts Disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run start` : Lance l'application en mode production
- `npm run lint` : Vérifie la qualité du code

## Évolutions Futures

- [ ] Authentification multi-utilisateur
- [ ] Statistiques et tableaux de bord
- [ ] Intégration API email (Gmail, Outlook)
- [ ] Automatisation complète des relances
- [ ] Export PDF avancé
- [ ] Gestion des pièces jointes
- [ ] Synchronisation cloud

## Support

Pour toute question ou suggestion, n'hésitez pas à ouvrir une issue sur le repository.

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.