# Handoff: Mes Finances — Redesign "Serene Minimal"

## Overview

Ce package contient le redesign **Serene Minimal** de l'application **Mes Finances** (gestionnaire de budget personnel, marché québécois). Il couvre trois vues clés :

1. **Landing page** — page d'accueil publique
2. **Feature page** — page fonction "Abonnements détectés"
3. **Dashboard** — tableau de bord connecté (vue mensuelle)

## About the Design Files

Les fichiers HTML/JSX dans ce dossier sont des **références de design** — des prototypes qui montrent l'apparence et le comportement souhaités, **pas du code à copier tel quel en production**.

Ta mission : **recréer ces designs dans le codebase existant de Mes Finances**, en utilisant ses patterns, sa stack et ses composants déjà en place (React, Vue, Next, SvelteKit, etc. — adapte-toi à ce qui est là). Si l'app n'a pas encore de frontend, choisis le framework le plus adapté au projet et implémente depuis ces références.

Les fichiers `.jsx` utilisent du JSX inline avec Babel in-browser — c'est un format de prototypage, pas un format de prod. Tu peux t'en inspirer pour la structure de composants mais tu dois les réécrire proprement (TypeScript, CSS-in-JS ou CSS modules, etc. selon le projet).

## Fidelity

**Haute fidélité (hi-fi)** sur : couleurs, typographie, hiérarchie, espacements, composition générale.

**Fidélité moyenne** sur : microinteractions, animations, états hover/focus (indications générales seulement — à affiner avec la stack cible).

**Données d'exemple** : les transactions, comptes, abonnements et catégories dans les mocks sont fictifs. À remplacer par les vraies données du backend.

---

## Design System — Serene Minimal

### Philosophie

- **Éditorial calme** : typographie serif display, beaucoup de blanc, chiffres mis en valeur
- **Ton sérieux et sophistiqué** : pas d'emoji, pas de gradient agressif, pas d'iconographie infantile
- **Confiance par la sobriété** : l'UI disparaît au profit des données
- **Lisibilité des montants** : les chiffres sont toujours en display serif, taille généreuse

### Palette (par défaut — "Sage")

| Rôle              | Variable CSS  | Hex        | Usage                                    |
|-------------------|---------------|------------|------------------------------------------|
| Background        | `--s-bg`      | `#f3efe7`  | Fond principal (papier chaud)           |
| Ink (texte)       | `--s-ink`     | `#1a1915`  | Texte principal, boutons primaires      |
| Accent            | `--s-accent`  | `#6b7a4a`  | Italique, progress bars sous budget, CTA highlights |
| Muted text        | —             | `#6b6a64`  | Texte secondaire, labels mono           |
| Body text         | —             | `#44433e`  | Texte de paragraphe                     |
| Card background   | —             | `#fbf8f2`  | Fond des cartes (légèrement plus clair) |
| Border            | —             | `rgba(26,25,21,0.08)` | Bordures fines (divisions)   |
| Warning / Over    | —             | `#a04a34`  | Dépassement budget, montant négatif     |

**Palettes alternatives disponibles** (toutes partagent la même structure, seul l'accent + ink change) :
- **Ochre** : bg `#f4ede0`, ink `#1a1915`, accent `#b37a2a`
- **Indigo** : bg `#eeeae2`, ink `#14131a`, accent `#3d4a7a`
- **Clay** : bg `#f1e9e0`, ink `#201815`, accent `#a04a34`

### Typographie

| Rôle        | Famille (Google Fonts)       | Poids     | Notes                                    |
|-------------|------------------------------|-----------|------------------------------------------|
| Display     | **Instrument Serif**         | 400, italic 400 | Titres, chiffres, headings de cartes |
| Body / UI   | **Inter**                    | 300–700   | Navigation, paragraphes, labels          |
| Mono / Label| **JetBrains Mono**           | 400–500   | Petits caps, montants tabulaires, métadonnées |

**Échelle de taille (comfortable — défaut)**
- H1 hero : `clamp(48px, 7vw, 108px)`, line-height `0.98`, letter-spacing `-0.025em`
- H2 section : `clamp(32px, 4vw, 56px)`, line-height `1.02`, letter-spacing `-0.02em`
- Display number : `clamp(32px, 3vw, 48px)` à `clamp(48px, 6vw, 86px)` selon importance
- Card title : `22px` Instrument Serif
- Body : `15.5px` Inter, line-height `1.55`
- Label mono : `10–11px` JetBrains Mono, letter-spacing `0.14–0.18em`, uppercase

### Espacements (variables — "comfortable" par défaut)

| Variable    | Compact | Comfortable | Spacious |
|-------------|---------|-------------|----------|
| `--pad`     | 24px    | 40px        | 64px     |
| `--gap`     | 16px    | 28px        | 44px     |
| `--card-p`  | 18px    | 28px        | 40px     |
| `--body`    | 14px    | 15.5px      | 16.5px   |

### Border radius
- Cartes : `16–18px`
- Boutons pill : `100px` (full round)
- Chips / tags : `100px`

### Shadows
- Cartes flottantes : `0 40px 80px -40px rgba(26,25,21,0.18)`
- Cartes normales : pas d'ombre (bordure 1px suffit)

### Iconographie
- **Traits de 1.6px, style outline**, pas de remplissage
- Set minimaliste : leaf, fork, home, doc, star, tool, repeat, gift, tag, arrow, plus, etc.
- Voir `src/shared.jsx` → composant `Icon` pour les paths SVG exacts
- Taille standard : 13–16px dans le texte, 14–20px dans les badges circulaires

---

## Screens / Views

### 1. Landing page

**Purpose** : convertir un visiteur en utilisateur. Montrer la promesse (finances sereines), un aperçu du produit, une liste de fonctions.

**Layout** :
- Header sticky (56px) : logo "Mes Finan*ces*" à gauche, nav horizontal au centre, date + avatar à droite. Bordure basse `1px rgba(26,25,21,0.08)`.
- Section hero : padding `100px var(--pad) 120px`, max-width `1280px`.
  - Kicker mono en haut (texte "GESTION · ÉPARGNE · CLARTÉ — DEPUIS 2024")
  - H1 sur 2 lignes avec italique accent sur "sereines"
  - Paragraphe lead (max 540px)
  - Row boutons : pill primaire noir + lien souligné secondaire
- Section produit fragment (grille 1.1fr / 0.9fr) :
  - Carte "Solde total" avec chiffre géant Instrument Serif (86px)
  - Liste des budgets par catégorie avec progress bar 2px
- Section features (grille 1fr / 2fr) :
  - Titre éditorial à gauche
  - Grille 2×2 de features à droite (titre serif + description)

**Content / copy exact** — voir `src/dir1_serene.jsx`.

### 2. Feature page — Abonnements détectés

**Purpose** : vendre la fonction "détection d'abonnements", démontrer la valeur sur données réelles.

**Layout** :
- Même header que landing
- Hero compact : kicker mono → H1 2 lignes → paragraphe lead (48px padding top)
- Carte summary (3 colonnes) : coût mensuel estimé (chiffre 72px) / Confirmés (40px) / À vérifier (40px, accent)
- Liste d'abonnements : rows en grille `44px 1fr 140px 120px 40px`
  - Badge rond 40px (icône catégorie sur fond accent 10% opacity)
  - Libellé (Instrument Serif 18px) + métadonnées mono 12px
  - Catégorie (mono 13px muted)
  - Montant (Instrument Serif 22px, aligné droite)
  - Chevron "arrow" icon

### 3. Dashboard

**Purpose** : vue principale de l'utilisateur connecté. Voir l'état du mois d'un coup d'œil.

**Layout** :
- Header sticky
- Hero header (40px padding top) :
  - Greeting mono "BONJOUR, SAMIA — AVRIL 2026" en kicker
  - H1 "Tu es à 62 $ près d'équilibrer le mois." avec italique accent sur "à 62 $ près"
  - Segment control droite : Jour / Semaine / Mois (actif) / Année — pills noir actif / transparent border inactif
- Grille KPI 4 colonnes : Solde total, Revenus, Dépenses, Épargne
  - Chaque carte : label uppercase mono → chiffre display 48px → sous-texte muted
  - Épargne en accent vert
- Grille principale (1.3fr / 1fr) :
  - **Gauche** : carte "Flux sur 30 jours" avec chart pulse (2 aires empilées, traits 1.6px — voir `SerenePulseChart`)
  - **Droite** : carte "Budgets du mois" avec rows progress (catégorie + icône → montant → barre 4px)
- Section transactions (full-width) : groupées par jour, rows en grille `1fr 120px 140px`
  - Libellé + catégorie muted
  - Compte (mono)
  - Montant (Instrument Serif 18px, vert accent si revenu)

---

## Interactions & Behavior

| Élément                | Comportement                                                                 |
|------------------------|------------------------------------------------------------------------------|
| Segment control période| Click change la période. Transition background/color 150ms.                  |
| Progress bar budget    | Width transition `.6s ease` au changement de valeur. Rouge si > 100%.        |
| Hover row transaction  | Background `rgba(26,25,21,0.03)` (à ajouter en prod)                         |
| Hover carte            | Légère élévation `translateY(-1px)` + shadow plus marquée (optionnel)        |
| Click catégorie        | Navigue vers la page catégorie (filtre transactions)                         |
| Click abonnement       | Ouvre détail (non mocké — à définir)                                         |

**Responsive** :
- Desktop (> 1024px) : layouts pleine largeur tels que décrits
- Tablette (768–1024px) : grilles 2-col deviennent 1-col empilées, hero KPI 2×2 au lieu de 4×1
- Mobile (< 768px) : tout en colonne unique, header nav → hamburger, réduire padding hero à `40px 20px 60px`

---

## State Management

### Dashboard
```
currentMonth: Date           // mois actif
period: 'day'|'week'|'month'|'year'
accounts: Account[]          // depuis /api/accounts
transactions: Transaction[]  // filtrées par période
categories: Category[]       // avec spent, limit calculés
alerts: Alert[]              // calculés côté front ou back
```

### Feature (Abonnements)
```
subscriptions: Subscription[]  // détectées
confirmed: number              // compte
pending: number                // à vérifier
monthlyEstimate: number        // somme
```

### Landing
- Stateless — contenu statique

---

## Design Tokens (récap pour implémenter via CSS vars ou Tailwind theme)

```css
:root {
  /* Colors */
  --s-bg:       #f3efe7;
  --s-ink:      #1a1915;
  --s-accent:   #6b7a4a;
  --s-muted:    #6b6a64;
  --s-body:     #44433e;
  --s-card:     #fbf8f2;
  --s-border:   rgba(26,25,21,0.08);
  --s-warn:     #a04a34;

  /* Typography */
  --font-display: 'Instrument Serif', serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', monospace;

  /* Spacing (comfortable default) */
  --pad:    40px;
  --gap:    28px;
  --card-p: 28px;

  /* Radii */
  --radius-card: 16px;
  --radius-card-lg: 18px;
  --radius-pill: 100px;

  /* Shadows */
  --shadow-float: 0 40px 80px -40px rgba(26,25,21,0.18);
}
```

### Tailwind config equivalent

```js
theme: {
  extend: {
    colors: {
      paper: '#f3efe7',
      ink: '#1a1915',
      sage: '#6b7a4a',
      cream: '#fbf8f2',
      warn: '#a04a34',
    },
    fontFamily: {
      display: ['"Instrument Serif"', 'serif'],
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['"JetBrains Mono"', 'monospace'],
    },
    borderRadius: {
      card: '16px',
      'card-lg': '18px',
    },
    boxShadow: {
      float: '0 40px 80px -40px rgba(26,25,21,0.18)',
    },
  },
}
```

---

## Assets

- **Fonts** : Google Fonts — Instrument Serif, Inter, JetBrains Mono
- **Icons** : set custom SVG outline 1.6px défini dans `src/shared.jsx` (composant `Icon`). 13 icônes couvrent tout le design.
- **Illustrations** : aucune — le design est purement typographique + data + bordures fines. Si besoin d'imagery, utiliser photos éditoriales (pas d'illustrations AI).

---

## Files in this package

| Fichier                    | Rôle                                                 |
|----------------------------|------------------------------------------------------|
| `Redesigns.html`           | Shell principal (navigation, tweaks, loader)         |
| `src/shared.jsx`           | Données d'exemple + helpers (`money`, `pct`, `Icon`) |
| `src/dir1_serene.jsx`      | **Les 3 vues Serene Minimal — à référencer en priorité** |
| `src/app.jsx`              | Orchestrateur (switcher direction/vue)               |

Pour isoler juste Serene Minimal, ouvrir `Redesigns.html` en local et ignorer les fichiers `dir2_*`, `dir3_*`, `dir4_*`.

---

## Recommandations d'implémentation

1. **Stack suggérée** : Next.js + TypeScript + Tailwind CSS + shadcn/ui. Convient au ton éditorial et au besoin de SSR pour la landing.
2. **Fonts** : utiliser `next/font/google` pour précharger Instrument Serif, Inter, JetBrains Mono.
3. **Charts** : le chart pulse utilise SVG custom. En prod, utiliser **Recharts** ou **Visx** avec les mêmes couleurs et le même style (traits fins, aires en gradient opacity).
4. **Icônes** : porter le set custom vers un composant `<Icon name="..." />` ou utiliser **Lucide React** (styles proches — adapter stroke-width à 1.6).
5. **Données** : créer un layer `lib/finance.ts` qui expose des hooks typés. Ne pas hard-coder les montants.
6. **Accessibilité** : contraste paper/ink ≈ 15:1 (AAA). Attention aux textes muted `#6b6a64` sur `#fbf8f2` (≈ 4.3:1 — borderline AA normal, OK pour labels uniquement).
7. **i18n** : le design est en français québécois (montants en `$ CAD`, virgule décimale, dates en français). Prévoir i18n pour anglais si besoin.

---

## Questions ouvertes à clarifier avec le PO

- Comment les abonnements sont-ils détectés (backend ? heuristique côté client) ?
- Les alertes du dashboard ("Loisirs dépassé", etc.) — générées où ?
- État vide : pas de transactions, pas de comptes connectés — à designer
- États de chargement (skeletons) — à designer
- Mode sombre ? Le design actuel n'en prévoit pas — à discuter
