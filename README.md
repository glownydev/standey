# Standey - Tracker de Candidatures

Standey est une application web moderne permettant de suivre efficacement ses candidatures d'emploi avec envoi d'emails professionnels.

## ✨ Fonctionnalités

- � **Gestion complète des candidatures** - Ajout, modification, suppression
- 📊 **Statistiques en temps réel** - Taux de réussite, temps de réponse, évolution
- 📧 **Envoi d'emails professionnels** - Intégration Resend avec votre domaine
- 📱 **Interface responsive** - Optimisée mobile et desktop
- 🎨 **Templates personnalisables** - Modèles d'emails avec variables dynamiques
- 💾 **Persistance locale** - Données sauvegardées automatiquement
- 🎯 **Statuts détaillés** - Suivi précis de chaque candidature

## � Installation

1. **Clonez le repository**
   ```bash
   git clone https://github.com/glownydev/standey.git
   cd standey
   ```

2. **Installez les dépendances**
   ```bash
   npm install
   ```

3. **Configurez l'envoi d'emails**
   ```bash
   cp .env.example .env.local
   ```
   Éditez `.env.local` et ajoutez votre clé API Resend.

4. **Lancez l'application**
   ```bash
   npm run dev
   ```

## 📧 Configuration Email (Resend)

Pour l'envoi d'emails depuis votre domaine :

1. **Créez un compte** sur [resend.com](https://resend.com)
2. **Ajoutez votre domaine** dans le dashboard Resend
3. **Configurez les DNS** selon les instructions Resend
4. **Obtenez votre clé API** et ajoutez-la dans `.env.local`

Voir `RESEND_CONFIG.md` pour les instructions détaillées.

## 🛠️ Technologies

- **Frontend** : Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend** : Next.js API Routes
- **Email** : Resend API
- **Base de données** : LocalStorage (développement)
- **Icons** : Lucide React

## 👤 Auteur

Créé par [glownydev](https://github.com/glownydev)

---

**Standey** - Simplifiez votre recherche d'emploi ! 🎯
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