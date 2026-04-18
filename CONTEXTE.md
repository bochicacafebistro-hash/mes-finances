# 📋 CONTEXTE — Mes Finances

## 🏠 Description
Application web **personnelle** de gestion des finances pour Alvaro Bustos.
- Vanilla JS + Firebase Firestore
- PWA installable (Android + iOS + Desktop)
- Bilingue FR/ES
- Design system aligné sur bochica-inventaire (Fraunces + Inter, bordeaux)

## 🗂️ Structure des fichiers
```
mes-finances/
├── index.html                ← Squelette HTML + shell
├── manifest.json             ← PWA manifest
├── sw.js                     ← Service Worker (cache offline)
├── favicon.ico
├── CONTEXTE.md               ← ce fichier
├── README.md
├── .gitignore
├── css/
│   └── style.css             ← Design system (issu de bochica-inventaire)
├── js/
│   ├── config.js             ← ⚠️ Firebase + ADMIN_PIN + DEFAULT_CATEGORIES
│   ├── state.js              ← État global (accounts, transactions, categories)
│   ├── icons.js              ← Lucide SVG inline
│   ├── i18n.js               ← Traductions FR/ES + fonctions t(), setUILang()
│   ├── utils.js              ← Helpers (fmtMoney, fmtDate, getAccountBalance, modals…)
│   ├── pages.js              ← renderDashboard, renderAccounts, renderTransactions,
│   │                             renderCategoriesPage + modals associés
│   ├── sidebar.js            ← Navigation + routing renderPage()
│   ├── auth.js               ← Login PIN + session localStorage
│   └── firebase-listeners.js ← Listeners temps réel (accounts, transactions, categories)
└── images/                   ← Icônes PWA (192, 512, maskable)
```

## 🔥 Firebase Firestore

**Collections** :
- `accounts` — comptes bancaires/cartes/espèces
  - `id`, `name`, `type`, `initialBalance`, `currency`, `color`, `notes`, `sortOrder`
  - Types : `checking` | `savings` | `credit` | `cash` | `investment` | `other`
- `transactions` — revenus, dépenses, virements
  - `id`, `type`, `amount`, `date` (YYYY-MM-DD), `accountId`, `toAccountId` (transfer only),
    `categoryId`, `description`, `notes`, `createdAt`, `updatedAt`
  - Types : `expense` | `income` | `transfer`
- `categories` — catégories personnalisables
  - `id`, `name_fr`, `name_es`, `type` (`expense` | `income`), `icon`, `color`

## 🎨 Design System

Réutilisé depuis bochica-inventaire :
- **Palette** : bordeaux `--accent: #6b1a1f`, crème `#faf6f0`, tricolore Colombie (jaune/bleu/rouge) pour les accents
- **Typo** : Fraunces (titres, prix, marges), Inter (UI)
- **Dark mode** automatique (fond `#13100f`, accent `#c44b51`)
- **Icônes** : Lucide SVG inline

## 💡 Fonctionnalités V1 (implémentées)

### 📊 Tableau de bord (page d'accueil)
- Solde total de tous les comptes
- Revenus / Dépenses / Solde du mois
- Aperçu des comptes avec couleur et solde
- 5 transactions récentes
- Top 5 catégories de dépenses du mois

### 💳 Comptes
- CRUD complet
- Types : chèques, épargne, carte crédit, espèces, investissement, autre
- Solde de départ + calcul auto du solde courant (depuis les transactions)
- Couleur personnalisée (8 choix)
- Notes

### 💸 Transactions
- 3 types : **Dépense**, **Revenu**, **Virement** (entre 2 comptes)
- Sélecteur de mois avec navigation ◀ ▶
- Filtres : recherche, type, compte, catégorie
- Stats du mois : revenus, dépenses, balance
- Liste compacte avec icône de catégorie, description, compte, date, montant coloré

### 🏷️ Catégories
- CRUD complet
- Séparées par type (dépenses / revenus)
- Icône + couleur personnalisables (13 icônes, 10 couleurs)
- Noms bilingues FR + ES
- Bouton "Initialiser catégories par défaut" au 1er lancement (10 dépenses + 5 revenus)

## 🔐 Authentification
- PIN à 4 chiffres (`ADMIN_PIN` dans `config.js`, défaut `0000` ⚠️ à changer)
- Session sauvegardée dans localStorage (pas de déconnexion au rechargement)
- Accès clavier + support mobile

## 🌐 Bilinguisme
- FR / ES via `t('key')` et helpers `tAccountType`, `tCategoryName`, `tTxType`
- Bouton de langue dans la sidebar + écran de login
- Persistance dans localStorage (`finances-ui-lang`)

## 📱 PWA
- Installable Android, iOS, Desktop
- App shell cachée (HTML, CSS, JS, fonts) → fonctionne hors ligne
- Firebase toujours en réseau (pas de cache stale)

## 🚀 Workflow
1. Modifier le code (via GitHub.com ou éditeur local)
2. Commit + push sur `main` → Vercel déploie automatiquement
3. Refresh → changements visibles en ~30 secondes

## 📝 Ce qu'il reste à faire (post-V1 / V2)

- [ ] **Budgets mensuels** par catégorie avec alerte si dépassement
- [ ] **Transactions récurrentes** (loyer, abonnements, salaire)
- [ ] **Objectifs d'épargne** avec progression
- [ ] **Import CSV/OFX** de relevés bancaires
- [ ] **Graphiques** évolution du solde sur 6 mois (Chart.js)
- [ ] **Comparaison** mois sur mois avec ↑↓
- [ ] **Export** des transactions en Excel/PDF
- [ ] **Multi-devises** (CAD/USD) avec conversion
- [ ] **Photos de reçus** attachées aux transactions
- [ ] **Règles de catégorisation** automatique par mots-clés
