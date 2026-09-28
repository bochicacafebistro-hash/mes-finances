# 📋 CONTEXTE — Mes Finances

## 🏠 Description
Application web **personnelle** de gestion des finances pour Alvaro Bustos.
- Vanilla JS + Firebase Firestore
- PWA installable (Android + iOS + Desktop)
- Bilingue FR/ES
- Design « Aujourd'hui » : crème + vert forêt, Bricolage Grotesque + Figtree (voir REDESIGN-AUJOURDHUI.md)

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
│   ├── pages.js              ← renderDashboard (« Aujourd'hui »), renderAccounts, renderTransactions (Activité),
│   │                             renderCategoriesPage + modals associés
│   ├── quick-add.js          ← Ajout rapide (pavé numérique), recherche ⌘K, toasts
│   ├── sidebar.js            ← Navigation (barre latérale / rail / onglets) + renderPage()
│   ├── auth.js               ← Login PIN + session localStorage
│   └── firebase-listeners.js ← Listeners temps réel (accounts, transactions, categories)
├── images/                   ← Icônes PWA (192, 512, maskable)
└── archive/                  ← Anciennes maquettes (design_handoff_serene_minimal — ne plus s'en servir)
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

## 🎨 Design System — « Aujourd'hui » (sept. 2026)

Spécification complète : `REDESIGN-AUJOURDHUI.md`. Remplace « Crystalline » (blanc + indigo, Geist).

**Principe** : l'accueil répond à « Combien il me reste à dépenser ce mois-ci? », puis montre
ce qui demande mon attention (« À regarder ») et ce qui vient de se passer.

**Couleurs** (`:root` / `.dark` dans `css/style.css` — les noms de variables historiques sont gardés) :
| Rôle | Variable | Clair | Sombre |
|---|---|---|---|
| Fond | `--bg` | `#F5F3EE` crème | `#121412` |
| Cartes | `--surface` | `#FFFFFF` | `#1B1E1C` |
| Surface douce | `--surface2` | `#F0EDE6` | `#252926` |
| Bordure | `--border` | `#E6E2D9` | `#2C302D` |
| Texte | `--text` / `--text2` / `--text3` | `#17181B` / `#5E6168` / `#6B6E75` | `#EDEBE6` / `#A9ADA8` / `#8F938E` |
| Argent (accent) | `--accent` | `#1E6B4E` vert forêt | `#4FB38A` |
| Fond accent | `--accent-bg` / `--accent-ink` | `#E4F0EA` / `#134A36` | `rgba(79,179,138,.14)` / `#8FD6B4` |
| Action principale | `--ink-btn` | `#17181B` | `#EDEBE6` |
| Attention | `--status-yellow` / `-bg` | `#8A5310` / `#FBEFDD` | `#E7B56A` |
| Négatif | `--status-red` / `-bg` | `#9B2C2C` / `#F7E4E1` | `#F08A80` |
| Bloc héros | `--hero-bg` | `#1E6B4E` (rouge `#9B2C2C` si dépassé) | idem |

Règles : dépenses en texte normal avec « − », revenus en vert avec « + ». Le rouge est réservé
aux soldes négatifs et budgets dépassés. Jamais la couleur seule pour porter une info. Pas de dégradés, pas d'emoji.

**Typo** : Bricolage Grotesque 500/700 (titres, montants) + Figtree 400/500/600 (interface).
Montant héros 88px (cell 56px), titres de page 28px, sections 22px, texte 15px, jamais sous 12px.

**Formes** : cartes 18px, grandes cartes 20px, héros 28px (cell 24px), boutons 12px, pilules 999px.
Bordures 1px, presque pas d'ombres. Zones cliquables ≥ 44 × 44 px. Icônes Lucide (`js/icons.js`).

**Navigation** : ordi ≥ 1024px barre latérale 256px · tablette 768–1023px rail 72px ·
cellulaire < 768px barre d'onglets (Accueil · Activité · + · Budget · Plus).
Catégories, langue, mode sombre et déconnexion sont dans le menu profil (engrenage) / la feuille « Plus ».

**Raccourcis** : `N` = ajout rapide, `⌘K` / `Ctrl K` = recherche, `Échap` = fermer.
PWA : `/?add=expense` ouvre l'ajout rapide, `/?page=transactions` ouvre Activité.

**Formats** : `fmtMoney()` → `1 240,00 $` (espace insécable avant `$`), `fmtMoney0()` → `1 240 $` (héros),
`fmtMoneyShort()` retire les `,00` inutiles.

## 💡 Fonctionnalités V1 (implémentées)

### ☀️ Aujourd'hui (page d'accueil)
- Bloc héros « Il te reste » : prévu (somme des budgets, sinon revenus du mois) − dépensé,
  « environ X $ par jour », statut Dans les temps / Attention au rythme / Dépassé
- « À regarder » : 3 alertes max (budget dépassé, prélèvement ≤ 5 jours, budget ≥ 80 %,
  transactions à classer, solde négatif)
- Activité récente (6 dernières, groupées par jour)
- Colonne droite : Ce mois-ci, Prochains prélèvements, Mes comptes
- Les graphiques (Chart.js) ont déménagé dans Budget → onglet « Tendances »

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
4. Si le design ou les fichiers JS/CSS changent : incrémenter `CACHE_VERSION` dans `sw.js`

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
