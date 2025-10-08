# Configuration Resend pour tamim@tamimkh.com

## 🚀 Étapes pour envoyer de vrais emails depuis votre domaine

### 1. Créer un compte Resend
- Aller sur https://resend.com
- Créer un compte gratuit (100 emails/jour gratuits)
- Se connecter au dashboard

### 2. Ajouter votre domaine
- Dans le dashboard Resend, aller dans "Domains"
- Cliquer "Add Domain"
- Entrer `tamimkh.com`

### 3. Configurer les enregistrements DNS
Resend vous donnera des enregistrements DNS à ajouter chez votre hébergeur :

```
Type: TXT
Name: _resend
Value: [clé fournie par Resend]

Type: CNAME  
Name: resend._domainkey
Value: [valeur fournie par Resend]

Type: TXT
Name: @
Value: v=spf1 include:spf.resend.com ~all
```

### 4. Obtenir la clé API
- Dans Resend, aller dans "API Keys"
- Créer une nouvelle clé API
- Copier la clé (commence par `re_...`)

### 5. Configurer l'application
- Ouvrir le fichier `.env.local`
- Remplacer `your_resend_api_key_here` par votre vraie clé
- Exemple : `RESEND_API_KEY=re_123456789abcdef`

### 6. Test
- Redémarrer le serveur : `npm run dev`
- Envoyer un email test depuis l'application
- Vérifier les logs de la console

## 🎯 Résultat
✅ Les emails seront envoyés depuis `tamim@tamimkh.com`
✅ Les destinataires recevront un vrai email
✅ L'email de réponse sera votre adresse configurée
✅ Domaine personnalisé professionnel

## 🆓 Alternative temporaire
En attendant la configuration du domaine, vous pouvez :
- Utiliser `onboarding@resend.dev` (limité)
- Ou laisser l'application en mode simulation
- Les emails apparaîtront dans les logs de la console

## 🔧 Debugging
Si les emails n'arrivent pas :
1. Vérifier les logs de la console
2. Contrôler la configuration DNS
3. Tester avec un email simple d'abord
4. Vérifier les spams du destinataire