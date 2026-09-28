# Redesign « Aujourd'hui » — Mes Finances

> Consignes pour Claude (ou toute personne qui code). À lire au complet avant de toucher au code.
> Maquette de référence : canevas Claude Design « Mes Finances — Nouveau design » (3 écrans : Accueil ordi, Accueil cellulaire, Ajout rapide).
> Ce redesign **remplace** le style « Crystalline » (blanc + indigo, Geist) et le handoff `design_handoff_serene_minimal/` (ne plus s'en servir).

---

## 1. L'idée en une phrase

On arrête le tableau de bord rempli de cartes et de graphiques. La page d'accueil répond à **une seule question** : *« Combien il me reste à dépenser ce mois-ci? »*, puis elle montre **ce qui demande mon attention** et **ce qui vient de se passer**.

### Principes

1. **Une réponse, pas 12 chiffres.** Un gros montant en haut, le reste est secondaire.
2. **L'app me dit quoi regarder.** Une section « À regarder » avec des alertes concrètes (facture qui s'en vient, budget presque atteint, transactions à classer).
3. **Ajouter une dépense en moins de 5 secondes**, surtout au cellulaire.
4. **Moins de navigation.** 5 entrées principales + une section Immobilier.
5. **Mobile d'abord.** Au cellulaire, une barre d'onglets en bas avec un gros bouton +.
6. **Calme et chaleureux.** Fond crème, vert forêt pour l'argent, pas de dégradés, pas d'emoji.

---

## 2. Stack — ne rien changer à l'architecture

- Vanilla JS + Firebase Firestore + PWA. **Pas** de React, pas de framework, pas de build.
- Les données (collections `accounts`, `transactions`, `categories`, budgets, abonnements, analyses immobilières, maisons) **ne changent pas**. Aucune migration Firestore.
- Ne pas toucher à : `js/config.js`, `js/firebase-listeners.js`, `js/centris-parser.js`, `js/duproprio-parser.js`, `api/`, la logique de calcul immobilier.
- Garder le bilinguisme FR / ES : **tout nouveau texte passe par `t('clé')`** avec les deux langues dans `js/i18n.js`.
- Garder le mode sombre (`body.dark`) — nouvelle palette ci-dessous.

---

## 3. Code de couleurs (design tokens)

Remplacer les valeurs du bloc `:root` dans `css/style.css`. **Garder les noms de variables existants** (ex. `--accent`, `--text2`, `--status-green`) pour ne pas casser les 6000 lignes de CSS; juste changer leurs valeurs et ajouter les nouvelles.

### Mode clair

| Rôle | Variable | Hex | Usage |
|---|---|---|---|
| Fond de page | `--bg` | `#F5F3EE` | Crème chaud, fond global |
| Surface (cartes) | `--surface` | `#FFFFFF` | Cartes, listes, champs |
| Surface douce | `--surface2` | `#F0EDE6` | Pastilles d'icônes, hovers, touches ⌘K |
| Bordure | `--border` | `#E6E2D9` | Contours de cartes |
| Bordure faible | `--border-soft` | `#F0EDE6` | Séparateurs de lignes |
| Texte principal | `--text` | `#17181B` | Presque noir |
| Texte secondaire | `--text2` | `#5E6168` | Sous-titres, métadonnées (contraste ≥ 4.5:1 sur blanc) |
| Texte discret | `--text3` | `#6B6E75` | Libellés en majuscules (ne pas aller plus pâle) |
| **Accent (argent)** | `--accent` | `#1E6B4E` | Vert forêt : bloc héros, liens, revenus, onglet actif |
| Accent hover | `--accent-hover` | `#134A36` | |
| Accent fond léger | `--accent-bg` | `#E4F0EA` | Onglet actif du menu, catégorie choisie, pastille « À classer » |
| Accent texte sur fond léger | `--accent-ink` *(nouveau)* | `#134A36` | |
| Action principale | `--ink-btn` *(nouveau)* | `#17181B` | Bouton « Ajouter une dépense », bouton +, « Enregistrer » |
| Attention (fond) | `--status-yellow-bg` | `#FBEFDD` | Pastilles « Dans 3 jours », « Budget à 85 % » |
| Attention (texte) | `--status-yellow` | `#8A5310` | Texte des pastilles d'attention |
| Négatif | `--status-red` | `#9B2C2C` | Solde négatif (carte de crédit), budget dépassé |
| Négatif (fond) | `--status-red-bg` | `#F7E4E1` | |
| Succès / revenus | `--status-green` | `#1E6B4E` | Montants positifs (revenus) |

Règles :
- **Dépenses** = texte normal (`--text`) précédé de « − ». **Revenus** = `--status-green` précédé de « + ». Pas de rouge pour les dépenses normales (ça stresse pour rien) — le rouge est réservé aux soldes négatifs et aux budgets dépassés.
- Le **bloc héros** (« Il te reste ») : fond `--accent` `#1E6B4E`, texte blanc. Sa barre de progression : piste `rgba(255,255,255,.22)`, remplissage `#FFFFFF`.
- Si le mois est **dans le rouge** (reste < 0), le bloc héros passe à `#9B2C2C` et le texte devient « Tu as dépassé de X $ ce mois-ci ».
- Aucune couleur ne doit être le seul moyen de transmettre une info (toujours un signe + / − ou un mot).

### Mode sombre (`body.dark`)

| Variable | Hex |
|---|---|
| `--bg` | `#121412` |
| `--surface` | `#1B1E1C` |
| `--surface2` | `#252926` |
| `--border` | `#2C302D` |
| `--border-soft` | `#232724` |
| `--text` | `#EDEBE6` |
| `--text2` | `#A9ADA8` |
| `--text3` | `#8F938E` |
| `--accent` | `#4FB38A` (liens, revenus, onglet actif) |
| `--accent-bg` | `rgba(79,179,138,.14)` |
| `--accent-ink` | `#8FD6B4` |
| `--ink-btn` | `#EDEBE6` (avec texte `#121412`) |
| `--status-yellow` / `-bg` | `#E7B56A` / `rgba(231,181,106,.14)` |
| `--status-red` / `-bg` | `#F08A80` / `rgba(240,138,128,.14)` |
| Bloc héros | fond `#1E6B4E`, texte blanc (on le garde pareil) |

Mettre aussi à jour `<meta name="theme-color">` dans `index.html` : clair `#F5F3EE`, sombre `#121412`, et `theme_color` / `background_color` dans `manifest.json` (`#F5F3EE`).

---

## 4. Typographie

Remplacer Geist par :

- **Titres et gros montants** : **Bricolage Grotesque** (poids 500 et 700)
- **Interface et texte** : **Figtree** (poids 400, 500, 600)

Lien Google Fonts à mettre dans `index.html` (remplace celui de Geist) :

```html
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Figtree:wght@400;500;600&display=swap" rel="stylesheet"/>
```

Variables :

```css
--font-heading:'Bricolage Grotesque',system-ui,sans-serif;
--font-body:'Figtree',system-ui,sans-serif;
--font-serif:var(--font-heading);
--c-display:var(--font-heading);
--c-body:var(--font-body);
/* --font-mono : on n'utilise plus de mono pour les libellés; garder la variable mais ne plus l'appliquer aux titres de sections */
```

Échelle :

| Élément | Police | Taille | Poids |
|---|---|---|---|
| Montant héros (ordi) | Bricolage | 88px, `letter-spacing:-0.03em`, `line-height:.9` | 700 |
| Montant héros (cell) | Bricolage | 56px | 700 |
| Montant saisie rapide | Bricolage | 64px | 700 |
| Titre de page | Bricolage | 28px | 700 |
| Titre de section | Bricolage | 22px (cell : 19px) | 700 |
| Titre de carte | Bricolage | 18px | 700 |
| Texte courant / lignes | Figtree | 15px | 400–600 |
| Métadonnées | Figtree | 13–14px | 400 |
| Libellé en majuscules (ex. « AUJOURD'HUI ») | Figtree | 12px, `letter-spacing:.06em`, uppercase | 600 |

Le texte ne descend jamais sous 12px. Les montants utilisent `font-variant-numeric: tabular-nums` dans les listes.

---

## 5. Formes, espacements, ombres

- Rayons : cartes `18px`, grandes cartes `20px`, bloc héros `28px` (cell : `24px`), boutons `12–14px`, pastilles et sélecteur de mois `999px`.
- Bordures : `1px solid var(--border)`. **Pas d'ombres** (ou presque : `0 1px 2px rgba(0,0,0,.04)` max).
- Espacement : grille de 4px. Entre sections : 28px. Padding cartes : 20–24px. Padding page ordi : `40px 56px`; cell : `24px 20px`.
- Zones cliquables **≥ 44 × 44 px** partout.
- Icônes : garder `js/icons.js` (Lucide, trait 2px). Pas d'emoji dans l'interface.

---

## 6. Navigation (fichier `js/sidebar.js` + `index.html` + CSS)

### Ordi (≥ 1024px) : barre latérale à gauche, 256px

Remplace le header horizontal `cr-header`. De haut en bas :

1. Logo : carré vert `--accent` 32px (rayon 10px) avec icône « tendance » blanche + « Mes Finances » (Bricolage 19px 700).
2. **Bouton Rechercher** (champ blanc, icône loupe, touche `⌘K` à droite). Ouvre une palette de commandes : chercher une transaction, un compte, ou taper « ajouter 12 metro » (voir §9, phase 3).
3. **Bouton « Ajouter une dépense »** : pleine largeur, 48px, fond `--ink-btn`, texte blanc, icône +.
4. Liens principaux (42px de haut, rayon 10px, actif = fond `--accent-bg` + texte `--accent-ink` 600) :
   - **Aujourd'hui** (page `dashboard`, renommée)
   - **Activité** (page `transactions`, renommée)
   - **Budget**
   - **Comptes**
   - **Abonnements**
5. Libellé « IMMOBILIER » en majuscules, puis :
   - **Analyses locatives** (page `realestate`)
   - **Maisons** (page `house`)
6. Espace flexible.
7. En bas : avatar (initiale) + « Mon profil » + bouton engrenage → menu avec : Catégories, Langue FR/ES, Mode sombre, Déconnexion.

➡️ **Catégories** sort du menu principal (c'est un réglage, on n'y va pas souvent). Accessible depuis le menu profil et depuis la page Budget.

### Tablette (768–1023px)
Même barre latérale mais réduite à 72px (icônes seulement, avec `aria-label` et infobulle).

### Cellulaire (< 768px) : barre d'onglets en bas

- Fixe en bas, 88px de haut (avec `padding-bottom: env(safe-area-inset-bottom)`), fond `--surface`, bordure du haut.
- 5 cases égales : **Accueil** · **Activité** · **[ + ]** · **Budget** · **Plus**
- Le **+** au centre : carré 56px, rayon 18px, fond `--ink-btn`, remonté de 24px (`margin-top:-24px`). Ouvre l'**Ajout rapide** (§8).
- « Plus » ouvre une feuille avec : Comptes, Abonnements, Analyses locatives, Maisons, Catégories, Langue, Mode sombre, Déconnexion.
- Onglet actif : icône + libellé en `--accent`, 600. Libellés 11px.
- Ajouter `padding-bottom: 110px` au contenu pour ne rien cacher sous la barre.
- Supprimer le menu hamburger actuel.

---

## 7. Page d'accueil « Aujourd'hui » (remplace `renderDashboard()` dans `js/pages.js`)

### Mise en page ordi
Deux colonnes : contenu principal (flexible) + colonne droite de **320px**, écart 40px.

**Colonne principale, de haut en bas :**

#### 7.1 En-tête
- Gauche : la date du jour en toutes lettres, `--text2` 15px (ex. « Lundi 28 septembre »). Au cellulaire, en dessous : « Bonjour » (Bricolage 24px) + avatar à droite.
- Droite : sélecteur de mois en pilule (‹ Septembre 2026 ›), fond blanc, bordure, boutons ronds 36px avec `aria-label`.

#### 7.2 Bloc héros « Il te reste »
- Petit texte : « Il te reste à dépenser ce mois-ci »
- **Gros montant** : `reste`
- À droite (cell : en dessous) : « environ **X $ par jour** pour les N derniers jours »
- Barre de progression : `dépensé / prévu`
- Sous la barre : « 2 960 $ dépensés sur 4 200 $ prévus » à gauche, statut à droite (« Dans les temps » / « Attention au rythme » / « Dépassé »).

**Calcul (important) :**
```
prévu   = somme des limites de budget du mois SI des budgets existent,
          sinon revenus du mois (transactions type income du mois sélectionné)
dépensé = somme des dépenses du mois (type expense, virements exclus)
reste   = prévu − dépensé
jours_restants = jours entre aujourd'hui et la fin du mois (inclus), min 1
par_jour = max(reste, 0) / jours_restants
statut:
  - "Dans les temps"       si (dépensé/prévu) <= (jour_du_mois/jours_du_mois) + 0.05
  - "Attention au rythme"  sinon, tant que reste >= 0
  - "Dépassé"              si reste < 0  (bloc héros en rouge #9B2C2C)
```
- Pour un mois passé : afficher « Tu as dépensé X $ en <mois> » + « Il t'est resté Y $ » (pas de « par jour »).
- **État vide** (aucun revenu ni budget) : « Commence par ajouter ton revenu du mois » + bouton « Ajouter un revenu » (ouvre l'ajout rapide en mode Revenu). Pas de « 0,00 $ » géant.

#### 7.3 « À regarder »
Titre de section + grille de **3 cartes max** (cell : défilement horizontal, cartes de 170px).
Chaque carte : pastille d'état (en haut), titre 16px 600, une ligne de détail `--text2`, et optionnellement un lien d'action.

Générer les alertes à partir des données, par ordre de priorité, garder les 3 premières :
1. **Budget dépassé** — pastille rouge « Dépassé » : « Restaurants — 340 $ sur 300 $ »
2. **Prélèvement dans ≤ 5 jours** (abonnements / récurrents) — pastille jaune « Dans 3 jours » : « Hydro-Québec — 118 $ » / « Prélevé du compte Desjardins le 1er octobre. »
3. **Budget ≥ 80 %** — pastille jaune « Budget à 85 % » : « Restaurants » / « Il reste 45 $ sur 300 $. »
4. **Transactions sans catégorie** — pastille verte « À classer » : « 4 transactions » / lien « Les classer en 1 minute → » (ouvre Activité filtrée sur « sans catégorie »)
5. **Solde de compte négatif** (sauf carte de crédit) — pastille rouge.

S'il n'y a aucune alerte : **une seule** carte pleine largeur, calme : « Rien à signaler. Tout roule. » (pas de section vide).

#### 7.4 « Activité récente »
- Titre + lien « Tout voir » (→ Activité).
- Une carte blanche contenant les **6 dernières transactions**, **groupées par jour** avec un libellé en majuscules : « AUJOURD'HUI », « HIER », puis « LUN. 21 SEPT. ».
- Chaque ligne (60px) : pastille 40px (rayon 12px, fond `--surface2`) avec l'icône de la catégorie (ou l'initiale du marchand) · nom (15px 600) · « Catégorie · Compte » (13px `--text2`) · montant à droite (− en `--text`, + en vert).
- Clic sur une ligne = ouvre la transaction pour modification.
- État vide : « Aucune transaction ce mois-ci » + bouton « Ajouter une dépense ».

**Colonne droite (ordi seulement; au cellulaire, ces blocs passent sous « Activité » ou sont retirés) :**

#### 7.5 « Ce mois-ci »
Entrées (+ vert) · Sorties (−) · séparateur · Épargné « 1 240 $ · 30 % ».

#### 7.6 « Prochains prélèvements »
Les 3 prochains abonnements / récurrents : « Vidéotron · 3 oct. — 95 $ ». Lien « Gérer les abonnements ».

#### 7.7 « Mes comptes »
Liste simple nom + solde. Solde négatif en `--status-red` avec « − ».

### ❌ À retirer de l'accueil
- Les 4 cartes « Solde total / Revenus / Dépenses / Épargne »
- « Top dépenses du mois », « Flux sur 30 jours », « Évolution du solde total » (graphiques Chart.js)
- Le mini-budget et le bloc abonnements actuels (remplacés par « À regarder » et « Prochains prélèvements »)

Les graphiques peuvent déménager dans la page **Budget** (onglet « Tendances ») si on veut les garder. Si Chart.js n'est plus utilisé nulle part, retirer le `<script>` de `index.html`.

---

## 8. Ajout rapide (nouveau — le cœur de l'app au cellulaire)

Remplace la modale de transaction actuelle **pour la création** (garder le formulaire complet pour la modification et pour les virements).

- **Cellulaire** : feuille plein écran qui glisse du bas. **Ordi** : fenêtre centrée de 420px.
- En haut : bouton fermer (rond 44px) à gauche; sélecteur segmenté **Dépense | Revenu** au centre (Dépense actif = fond `--ink-btn`, Revenu actif = fond `--accent`). Un lien discret « Virement » ouvre le formulaire complet.
- **Montant** géant au centre (Bricolage 64px), format québécois : virgule décimale, « $ » après, espace comme séparateur de milliers (`24,50 $`).
- **Catégories** en pastilles (40px de haut) : les 6 plus utilisées en premier + « Autre… ». Choisie = fond `--accent-bg`, bordure `--accent`.
- Deux boutons côte à côte : « Compte · Visa » (mémorise le dernier compte utilisé) et « Date · Aujourd'hui » (Hier / choisir).
- Champ optionnel « Description » (repliable, « + Ajouter une note »).
- **Pavé numérique** 3×4 : 1-9, « , », 0, ⌫ (avec `aria-label="Effacer"`). Au clavier physique, les chiffres, la virgule/le point et Retour arrière fonctionnent aussi.
- Bouton **Enregistrer** 56px pleine largeur, fond `--ink-btn`. Désactivé tant que montant = 0 ou pas de catégorie.
- Après l'enregistrement : la feuille se ferme, petit toast « Dépense ajoutée · Annuler » (5 s).
- Raccourci ordi : touche **N** (hors champ texte) ouvre l'ajout rapide.

---

## 9. Les autres pages — ajustements

Appliquer les nouveaux tokens partout. En plus :

- **Activité** (ex-Transactions) : liste groupée par jour comme l'accueil; filtres dans une rangée de pastilles (Tout · Dépenses · Revenus · Virements · Sans catégorie) + recherche; les stats du mois deviennent une ligne de texte (« Entrées 4 200 $ · Sorties 2 960 $ »), pas des cartes.
- **Budget** : une ligne par catégorie avec barre de progression (vert → jaune à 80 % → rouge au-delà de 100 %) et « reste X $ ». Bouton « Définir une limite ». Lien vers Catégories.
- **Comptes** : cartes simples avec pastille de couleur du compte, nom, type, solde.
- **Abonnements** : liste triée par prochaine date, total mensuel en haut en une phrase.
- **Analyses locatives / Maisons** : garder la logique, juste appliquer tokens, typo, rayons. Les tableaux gardent leur densité (c'est normal ici).
- **Écran de connexion (NIP)** : fond `--bg` crème (retirer le dégradé violet), carte blanche, logo vert, touches du pavé rondes 64px bordure `--border`.
- **Titres de sections** : retirer le style « mono en majuscules espacées » actuel (ex. « BONJOUR — SEPTEMBRE 2026 ») sauf pour les petits libellés de groupes de jours.

### Phase 3 (optionnel, plus tard)
- Palette de commandes ⌘K : recherche globale + saisie rapide « 12 metro » → dépense de 12 $ catégorie devinée.
- Catégorisation automatique par mots-clés (Metro → Épicerie).

---

## 10. Textes (i18n) à ajouter dans `js/i18n.js`

| Clé | FR | ES |
|---|---|---|
| `nav_today` | Aujourd'hui | Hoy |
| `nav_activity` | Activité | Actividad |
| `nav_more` | Plus | Más |
| `nav_realestate_group` | Immobilier | Inmuebles |
| `nav_realestate` | Analyses locatives | Análisis de alquiler |
| `search` | Rechercher… | Buscar… |
| `add_expense` | Ajouter une dépense | Agregar un gasto |
| `left_to_spend` | Il te reste à dépenser ce mois-ci | Te queda por gastar este mes |
| `per_day` | environ {x} par jour | aprox. {x} por día |
| `for_last_days` | pour les {n} derniers jours | para los últimos {n} días |
| `spent_of_planned` | {a} dépensés sur {b} prévus | {a} gastados de {b} previstos |
| `on_track` | Dans les temps | Vas bien |
| `watch_pace` | Attention au rythme | Cuidado con el ritmo |
| `over_budget` | Dépassé | Excedido |
| `to_watch` | À regarder | Para revisar |
| `in_n_days` | Dans {n} jours | En {n} días |
| `budget_at` | Budget à {p} % | Presupuesto al {p} % |
| `to_sort` | À classer | Por clasificar |
| `sort_in_a_minute` | Les classer en 1 minute → | Clasificarlas en 1 minuto → |
| `all_good` | Rien à signaler. Tout roule. | Nada que señalar. Todo bien. |
| `recent_activity` | Activité récente | Actividad reciente |
| `see_all` | Tout voir | Ver todo |
| `today` / `yesterday` | Aujourd'hui / Hier | Hoy / Ayer |
| `this_month` | Ce mois-ci | Este mes |
| `money_in` / `money_out` / `saved` | Entrées / Sorties / Épargné | Entradas / Salidas / Ahorrado |
| `upcoming_charges` | Prochains prélèvements | Próximos cargos |
| `manage_subscriptions` | Gérer les abonnements | Gestionar suscripciones |
| `my_accounts` | Mes comptes | Mis cuentas |
| `my_profile` | Mon profil | Mi perfil |
| `amount` | Montant | Monto |
| `save` | Enregistrer | Guardar |
| `expense_added` | Dépense ajoutée | Gasto agregado |
| `undo` | Annuler | Deshacer |
| `hello` | Bonjour | Hola |

Montants : toujours via `fmtMoney()` en format `fr-CA` / CAD (`1 240,00 $`). Sur le gros montant héros, on peut arrondir au dollar (`1 240 $`).

---

## 11. Accessibilité (obligatoire)

- Contraste texte ≥ 4.5:1 (déjà respecté par la palette; ne pas pâlir `--text2` / `--text3`).
- Tous les éléments cliquables sont de vrais `<button>` ou `<a href>` — **plus de `<a onclick>` sans `href`** comme dans le `buildSidebar()` actuel (utiliser `<button>`).
- `aria-label` sur tous les boutons avec icône seulement (mois précédent/suivant, fermer, +, engrenage, effacer).
- `aria-current="page"` sur l'élément de navigation actif.
- Focus visible : `outline: 2px solid var(--accent); outline-offset: 2px`.
- Respecter `prefers-reduced-motion` pour l'animation de la feuille d'ajout.

---

## 12. Plan de travail (dans l'ordre)

1. **Tokens + polices** : `:root` et `body.dark` dans `css/style.css`, lien Google Fonts et `theme-color` dans `index.html`, `manifest.json`. Vérifier que toutes les pages restent lisibles.
2. **Navigation** : nouvelle barre latérale (ordi), rail (tablette), barre d'onglets (cell), menu profil / feuille « Plus ». Renommer les entrées. Sortir Catégories du menu.
3. **Accueil « Aujourd'hui »** : réécrire `renderDashboard()` (§7) avec les calculs et les états vides. Retirer les anciens blocs et fonctions devenues inutiles (`renderSerenePulseChartSvg`, `renderDashTopCategories`, etc.) seulement si plus utilisées ailleurs.
4. **Ajout rapide** (§8).
5. **Autres pages** (§9) et écran NIP.
6. **i18n** (§10) FR + ES.
7. **PWA** : incrémenter la version du cache dans `sw.js` (sinon les téléphones gardent l'ancien design) et ajouter les nouveaux fichiers au cache s'il y en a.
8. **Mettre à jour `CONTEXTE.md`** (section Design System) pour décrire le nouveau design; déplacer `design_handoff_serene_minimal/` dans un dossier `archive/` ou le supprimer.
9. **Tests manuels** (§13), puis commit + push sur `main` (Vercel déploie).

## 13. Vérifications avant de pousser

- [ ] Ordi 1440px, tablette 800px, cellulaire 390px : rien ne déborde, pas de défilement horizontal.
- [ ] Mode clair et sombre sur chaque page.
- [ ] FR et ES sur chaque page (aucune clé brute du genre `nav_today` affichée).
- [ ] Accueil avec **zéro donnée** (état actuel de l'app) : messages d'état vide propres, pas de « 0,00 $ » géant ni de NaN.
- [ ] Accueil avec données : calcul du « reste » et du « par jour » vérifié à la main sur un exemple.
- [ ] Ajout rapide : dépense et revenu enregistrés dans Firestore avec le bon `type`, `date`, `accountId`, `categoryId`; « Annuler » supprime bien la transaction.
- [ ] Navigation au clavier (Tab / Entrée) dans le menu et l'ajout rapide.
- [ ] PWA installée sur le téléphone : le nouveau design apparaît après rechargement (cache `sw.js` incrémenté).
- [ ] Analyses immobilières et Maisons : les calculs donnent les mêmes résultats qu'avant.
