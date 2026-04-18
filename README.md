# 💰 Mes Finances

Application personnelle de gestion des finances — comptes, transactions, catégories.

## 🚀 Setup rapide

### 1. Configurer Firebase
1. Crée un projet sur https://console.firebase.google.com
2. Active **Firestore Database** (mode test)
3. Project Settings → Add app → Web → copie la config
4. Colle-la dans `js/config.js` (remplace `VOTRE_API_KEY`, etc.)

### 2. Changer le PIN
Dans `js/config.js`, remplace `ADMIN_PIN = "0000"` par ton PIN à 4 chiffres.

### 3. Déployer (Vercel)
1. Pousse sur GitHub
2. Importe le repo dans Vercel → déploie

## 📱 Installation mobile

Une fois en ligne, ouvre l'app sur ton téléphone :
- **iPhone Safari** : Bouton Partager → "Sur l'écran d'accueil"
- **Android Chrome** : Menu ⋮ → "Installer"

## 🎨 Stack

- Vanilla JS + HTML/CSS (pas de build)
- Firebase Firestore (BDD temps réel)
- PWA installable (offline app shell)
- i18n FR/ES intégré
- Design system aligné (Fraunces + Inter, palette bordeaux)
