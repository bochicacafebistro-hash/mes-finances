/* ═══════════════════════════════════════════════════════════════
   i18n.js — Traduction FR/ES pour Mes Finances
   ═══════════════════════════════════════════════════════════════ */

const TRANSLATIONS = {
  // ── Navigation ───────────────────────────────────
  nav_dashboard:         { fr: "Tableau de bord",      es: "Panel" },
  nav_transactions:      { fr: "Transactions",         es: "Transacciones" },
  nav_accounts:          { fr: "Comptes",              es: "Cuentas" },
  nav_budget:            { fr: "Budget",               es: "Presupuesto" },
  nav_subscriptions:     { fr: "Abonnements",          es: "Suscripciones" },
  nav_categories:        { fr: "Catégories",           es: "Categorías" },
  nav_section_main:      { fr: "PRINCIPAL",            es: "PRINCIPAL" },
  nav_section_planning:  { fr: "PLANIFICATION",        es: "PLANIFICACIÓN" },
  nav_section_settings:  { fr: "PARAMÈTRES",           es: "AJUSTES" },

  // ── Boutons globaux ───────────────────────────────
  add:                   { fr: "Ajouter",              es: "Agregar" },
  edit:                  { fr: "Modifier",             es: "Editar" },
  delete:                { fr: "Supprimer",            es: "Eliminar" },
  cancel:                { fr: "Annuler",              es: "Cancelar" },
  save:                  { fr: "Enregistrer",          es: "Guardar" },
  confirm:               { fr: "Confirmer",            es: "Confirmar" },
  close:                 { fr: "Fermer",               es: "Cerrar" },
  search:                { fr: "Rechercher...",        es: "Buscar..." },
  actions:               { fr: "Actions",              es: "Acciones" },
  optional:              { fr: "(optionnel)",          es: "(opcional)" },
  none:                  { fr: "— Aucun —",            es: "— Ninguno —" },
  all:                   { fr: "Tous",                 es: "Todos" },
  toggle_dark:           { fr: "Mode sombre",          es: "Modo oscuro" },
  toggle_light:          { fr: "Mode clair",           es: "Modo claro" },
  logout:                { fr: "Déconnexion",          es: "Cerrar sesión" },
  language:              { fr: "Langue",               es: "Idioma" },

  // ── Login ─────────────────────────────────────────
  login_subtitle:        { fr: "Mes Finances",         es: "Mis Finanzas" },
  login_title:           { fr: "Connexion",            es: "Iniciar sesión" },
  login_pin_prompt:      { fr: "Entrez votre code PIN à 4 chiffres", es: "Ingresa tu código PIN de 4 dígitos" },
  login_clear:           { fr: "Effacer",              es: "Borrar" },
  login_keyboard_hint:   { fr: "💡 Vous pouvez aussi taper sur le clavier", es: "💡 También puedes usar el teclado" },
  login_wrong_pin:       { fr: "❌ Code PIN incorrect", es: "❌ Código PIN incorrecto" },
  digit:                 { fr: "Chiffre",              es: "Dígito" },

  // ── Dashboard ────────────────────────────────────
  dash_title:            { fr: "Tableau de bord",      es: "Panel" },
  dash_total_balance:    { fr: "Solde total",          es: "Saldo total" },
  dash_month_income:     { fr: "Revenus du mois",      es: "Ingresos del mes" },
  dash_month_expenses:   { fr: "Dépenses du mois",     es: "Gastos del mes" },
  dash_month_balance:    { fr: "Solde du mois",        es: "Saldo del mes" },
  dash_recent_tx:        { fr: "Transactions récentes", es: "Transacciones recientes" },
  dash_top_categories:   { fr: "Top dépenses du mois", es: "Principales gastos del mes" },
  dash_no_tx:            { fr: "Aucune transaction",   es: "Sin transacciones" },
  dash_no_accounts:      { fr: "Aucun compte. Commencez par ajouter votre premier compte.", es: "Sin cuentas. Comienza agregando tu primera cuenta." },
  dash_view_all:         { fr: "Voir tout",            es: "Ver todo" },
  dash_accounts_overview:{ fr: "Mes comptes",          es: "Mis cuentas" },

  // ── Comptes ──────────────────────────────────────
  acc_title:             { fr: "Comptes",              es: "Cuentas" },
  acc_subtitle:          { fr: "Vos comptes bancaires, cartes et autres", es: "Tus cuentas bancarias, tarjetas y otros" },
  acc_add:               { fr: "Compte",               es: "Cuenta" },
  acc_modal_add:         { fr: "Ajouter un compte",    es: "Agregar una cuenta" },
  acc_modal_edit:        { fr: "Modifier le compte",   es: "Editar la cuenta" },
  acc_field_name:        { fr: "Nom du compte",        es: "Nombre de la cuenta" },
  acc_field_type:        { fr: "Type",                 es: "Tipo" },
  acc_field_balance:     { fr: "Solde de départ ($)",  es: "Saldo inicial ($)" },
  acc_field_currency:    { fr: "Devise",               es: "Moneda" },
  acc_field_color:       { fr: "Couleur",              es: "Color" },
  acc_field_notes:       { fr: "Notes",                es: "Notas" },
  acc_no_accounts:       { fr: "Aucun compte pour l'instant. Cliquez sur \"Compte\" pour ajouter votre premier compte.", es: "Sin cuentas por ahora. Haz clic en \"Cuenta\" para agregar tu primera cuenta." },
  acc_balance:           { fr: "Solde",                es: "Saldo" },
  acc_initial_balance:   { fr: "Solde initial",        es: "Saldo inicial" },

  // ── Transactions ─────────────────────────────────
  tx_title:              { fr: "Transactions",         es: "Transacciones" },
  tx_add:                { fr: "Transaction",          es: "Transacción" },
  tx_modal_add:          { fr: "Ajouter une transaction", es: "Agregar una transacción" },
  tx_modal_edit:         { fr: "Modifier la transaction", es: "Editar la transacción" },
  tx_type:               { fr: "Type",                 es: "Tipo" },
  tx_type_expense:       { fr: "Dépense",              es: "Gasto" },
  tx_type_income:        { fr: "Revenu",               es: "Ingreso" },
  tx_type_transfer:      { fr: "Virement",             es: "Transferencia" },
  tx_field_amount:       { fr: "Montant ($)",          es: "Monto ($)" },
  tx_field_date:         { fr: "Date",                 es: "Fecha" },
  tx_field_account:      { fr: "Compte",               es: "Cuenta" },
  tx_field_to_account:   { fr: "Vers le compte",       es: "Hacia la cuenta" },
  tx_field_category:     { fr: "Catégorie",            es: "Categoría" },
  tx_field_desc:         { fr: "Description",          es: "Descripción" },
  tx_field_notes:        { fr: "Notes",                es: "Notas" },
  tx_no_tx:              { fr: "Aucune transaction pour cette période.", es: "Ninguna transacción para este período." },
  tx_no_tx_first:        { fr: "Aucune transaction. Cliquez sur \"Transaction\" pour ajouter votre première.", es: "Sin transacciones. Haz clic en \"Transacción\" para agregar la primera." },
  tx_filter_account:     { fr: "Tous les comptes",     es: "Todas las cuentas" },
  tx_filter_category:    { fr: "Toutes les catégories",es: "Todas las categorías" },
  tx_filter_type:        { fr: "Tous les types",       es: "Todos los tipos" },
  tx_total:              { fr: "Total",                es: "Total" },

  // ── Catégories ───────────────────────────────────
  cat_title:             { fr: "Catégories",           es: "Categorías" },
  cat_subtitle:          { fr: "Pour organiser vos transactions", es: "Para organizar tus transacciones" },
  cat_add:               { fr: "Catégorie",            es: "Categoría" },
  cat_modal_add:         { fr: "Ajouter une catégorie",es: "Agregar una categoría" },
  cat_modal_edit:        { fr: "Modifier la catégorie",es: "Editar la categoría" },
  cat_field_name:        { fr: "Nom",                  es: "Nombre" },
  cat_field_type:        { fr: "Type",                 es: "Tipo" },
  cat_field_icon:        { fr: "Icône",                es: "Icono" },
  cat_field_color:       { fr: "Couleur",              es: "Color" },
  cat_section_expenses:  { fr: "Catégories de dépenses", es: "Categorías de gastos" },
  cat_section_incomes:   { fr: "Catégories de revenus",  es: "Categorías de ingresos" },
  cat_init_defaults:     { fr: "Initialiser les catégories par défaut", es: "Inicializar categorías por defecto" },
  cat_init_done:         { fr: "✅ Catégories par défaut créées !", es: "✅ ¡Categorías por defecto creadas!" },

  // ── Mois ─────────────────────────────────────────
  prev_month:            { fr: "Mois précédent",       es: "Mes anterior" },
  next_month:            { fr: "Mois suivant",         es: "Mes siguiente" },

  // ── Erreurs ─────────────────────────────────────
  err_enter_name:        { fr: "Entrez un nom.",       es: "Ingresa un nombre." },
  err_enter_amount:      { fr: "Entrez un montant.",   es: "Ingresa un monto." },
  err_select_account:    { fr: "Sélectionnez un compte.", es: "Selecciona una cuenta." },
  err_select_category:   { fr: "Sélectionnez une catégorie.", es: "Selecciona una categoría." },
  err_select_to_account: { fr: "Sélectionnez le compte de destination.", es: "Selecciona la cuenta de destino." },
  err_same_account:      { fr: "Les comptes source et destination doivent être différents.", es: "Las cuentas origen y destino deben ser diferentes." },

  // ── Confirmations ────────────────────────────────
  confirm_delete_title:  { fr: "Supprimer ?",          es: "¿Eliminar?" },
  confirm_delete_msg:    { fr: 'Voulez-vous vraiment supprimer "{name}" ? Cette action est irréversible.', es: '¿Realmente deseas eliminar "{name}"? Esta acción es irreversible.' },
  confirm_delete_account_msg: { fr: 'Supprimer le compte "{name}" supprimera aussi toutes ses transactions ! Continuer ?', es: 'Eliminar la cuenta "{name}" también eliminará todas sus transacciones! ¿Continuar?' },
  confirm_delete_category_msg:{ fr: 'Supprimer "{name}" ? Les transactions liées resteront mais sans catégorie.', es: 'Eliminar "{name}"? Las transacciones vinculadas se mantendrán pero sin categoría.' },

  // ── Budget ───────────────────────────────────────
  budget_title:          { fr: "Budget mensuel",       es: "Presupuesto mensual" },
  budget_subtitle:       { fr: "Définissez vos limites mensuelles par catégorie", es: "Define tus límites mensuales por categoría" },
  budget_set_limit:      { fr: "Définir une limite",   es: "Definir un límite" },
  budget_monthly_limit:  { fr: "Limite mensuelle ($)", es: "Límite mensual ($)" },
  budget_spent:          { fr: "Dépensé",              es: "Gastado" },
  budget_remaining:      { fr: "Restant",              es: "Restante" },
  budget_exceeded:       { fr: "Dépassé de",           es: "Excedido en" },
  budget_none:           { fr: "Aucun budget défini. Ajoute une limite sur une catégorie pour commencer.", es: "Ningún presupuesto definido. Agrega un límite en una categoría para comenzar." },
  budget_summary:        { fr: "Budget du mois",       es: "Presupuesto del mes" },
  budget_warnings:       { fr: "catégorie(s) dépassée(s)", es: "categoría(s) excedida(s)" },
  budget_ok:             { fr: "Dans les clous",       es: "Dentro del límite" },
  budget_watch:          { fr: "À surveiller",         es: "Para vigilar" },
  budget_over:           { fr: "Dépassé",              es: "Excedido" },
  budget_edit:           { fr: "Modifier le budget",   es: "Editar presupuesto" },
  budget_remove:         { fr: "Retirer le budget",    es: "Quitar presupuesto" },
  budget_no_limit:       { fr: "Pas de limite",        es: "Sin límite" },
  budget_total_limit:    { fr: "Total des limites",    es: "Total de límites" },
  budget_total_spent:    { fr: "Total dépensé",        es: "Total gastado" },

  // ── Abonnements ──────────────────────────────────
  sub_title:             { fr: "Abonnements détectés", es: "Suscripciones detectadas" },
  sub_subtitle:          { fr: "Repère les paiements récurrents pour éviter les surprises", es: "Identifica los pagos recurrentes para evitar sorpresas" },
  sub_detected:          { fr: "Abonnements identifiés", es: "Suscripciones identificadas" },
  sub_confirmed:         { fr: "Confirmés",            es: "Confirmados" },
  sub_suggestions:       { fr: "Suggestions",          es: "Sugerencias" },
  sub_ignored:           { fr: "Ignorés",              es: "Ignorados" },
  sub_monthly:           { fr: "Mensuel",              es: "Mensual" },
  sub_yearly:            { fr: "Annuel",               es: "Anual" },
  sub_weekly:            { fr: "Hebdomadaire",         es: "Semanal" },
  sub_biweekly:          { fr: "Aux 2 semaines",       es: "Cada 2 semanas" },
  sub_estimated_total:   { fr: "Coût mensuel estimé",  es: "Costo mensual estimado" },
  sub_last_charge:       { fr: "Dernier prélèvement",  es: "Último cargo" },
  sub_occurrences:       { fr: "occurrences",          es: "ocurrencias" },
  sub_confirm:           { fr: "C'est un abonnement",  es: "Es una suscripción" },
  sub_ignore:            { fr: "Ignorer",              es: "Ignorar" },
  sub_unconfirm:         { fr: "Retirer de la liste",  es: "Quitar de la lista" },
  sub_none_detected:     { fr: "Aucun abonnement détecté pour l'instant. Il faut au moins 2 paiements du même marchand pour détecter un abonnement.", es: "Ninguna suscripción detectada por ahora. Se necesitan al menos 2 pagos del mismo comerciante para detectar una suscripción." },
  sub_auto_detected:     { fr: "Détectés automatiquement", es: "Detectados automáticamente" },
  sub_view_transactions: { fr: "Voir les transactions", es: "Ver las transacciones" },
  sub_bulk_recategorize: { fr: "Reclasser toutes",     es: "Reclasificar todas" },
  sub_bulk_title:        { fr: "Reclasser {n} transaction{s}", es: "Reclasificar {n} transaccion{s}" },
  sub_bulk_confirm:      { fr: "Mettre à jour les {n} transaction{s} de ce groupe vers la catégorie « {cat} » ?", es: "¿Actualizar las {n} transacciones de este grupo a la categoría « {cat} »?" },
  sub_bulk_done:         { fr: "✅ {n} transaction{s} reclassée{s}", es: "✅ {n} transacciones reclasificadas" },
  sub_detail_title:      { fr: "Détail du marchand",   es: "Detalle del comerciante" },
  tx_edit_note:          { fr: "Clique une transaction pour modifier sa catégorie, description ou ajouter une note", es: "Haz clic en una transacción para modificar su categoría, descripción o agregar una nota" },

  // ── Dashboard Serene ─────────────────────────────
  dash_greeting:         { fr: "Bonjour",                es: "Hola" },
  dash_hero_balanced:    { fr: "Tu es <em>à l'équilibre</em> ce mois-ci.", es: "Estás <em>en equilibrio</em> este mes." },
  dash_hero_ahead:       { fr: "Tu es <em>{n} au-dessus</em> cette période.", es: "Estás <em>{n} por encima</em> este período." },
  dash_hero_short:       { fr: "Tu es <em>à {n} près</em> d'équilibrer le mois.", es: "Estás <em>a {n}</em> de equilibrar el mes." },
  dash_savings:          { fr: "Épargne",                es: "Ahorro" },
  dash_net:              { fr: "Épargne nette",          es: "Ahorro neto" },
  dash_pulse_title:      { fr: "Flux sur 30 jours",      es: "Flujo de 30 días" },
  dash_pulse_legend:     { fr: "Revenus — Dépenses",     es: "Ingresos — Gastos" },
  dash_budget_month:     { fr: "Budgets du mois",        es: "Presupuestos del mes" },
  dash_last_tx:          { fr: "Dernières transactions", es: "Últimas transacciones" },
  dash_view_tx:          { fr: "Tout voir",              es: "Ver todo" },
  period_day:            { fr: "Jour",                   es: "Día" },
  period_week:           { fr: "Semaine",                es: "Semana" },
  period_month:          { fr: "Mois",                   es: "Mes" },
  period_year:           { fr: "Année",                  es: "Año" },
  sub_over_budget:       { fr: "à vérifier",             es: "por verificar" },
  cat_add_quick:         { fr: "Créer une nouvelle catégorie", es: "Crear una nueva categoría" },
  cat_add_quick_short:   { fr: "Nouvelle",                es: "Nueva" },
  sub_month_total:       { fr: "Total du mois",          es: "Total del mes" },
  sub_month_charge:      { fr: "Prélevé ce mois-ci",     es: "Cobrado este mes" },
  sub_not_this_month:    { fr: "Aucun prélèvement ce mois-ci", es: "Sin cargo este mes" },
  sub_charged_on:        { fr: "Prélevé le",             es: "Cobrado el" },

  // ── Outil reclassement paiements carte ───────────
  fix_card_pmt_title:    { fr: "{n} paiement{s} de carte mal classé{s}", es: "{n} pagos de tarjeta mal clasificados" },
  fix_card_pmt_desc:     { fr: "Ces transactions sont comptées comme revenus. Elles devraient être des transferts (paiement de la carte = remboursement de dette, pas un revenu).", es: "Estas transacciones cuentan como ingresos. Deberían ser transferencias." },
  fix_card_pmt_action:   { fr: "Convertir en transferts ({n})", es: "Convertir a transferencias ({n})" },
  fix_card_pmt_done:     { fr: "✅ {n} paiement{s} reclassé{s} en transferts. Tes revenus sont maintenant corrects.", es: "✅ {n} pagos reclasificados como transferencias." },

  // ── Filtres transactions ─────────────────────────
  tx_filters:            { fr: "Filtres",                es: "Filtros" },
  tx_filter_reset:       { fr: "Réinitialiser",          es: "Restablecer" },
  tx_filter_results:     { fr: "{n} transaction{s}",     es: "{n} transacciones" },

  // ── Catégorie détail (modal depuis top dépenses) ──
  cat_detail_title:      { fr: "Détail de la catégorie", es: "Detalle de la categoría" },
  cat_detail_tx_count:   { fr: "{n} transaction{s}",   es: "{n} transaccion{s}" },

  // ── Projets / Achats immobilier ────────────────────
  nav_section_projects:  { fr: "PROJETS",                       es: "PROYECTOS" },
  nav_realestate:        { fr: "Achats immobilier",             es: "Compras inmobiliarias" },
  re_title:              { fr: "Analyses immobilières",         es: "Análisis inmobiliarios" },
  re_subtitle:           { fr: "Évaluer la rentabilité d'un immeuble locatif", es: "Evaluar la rentabilidad de un inmueble" },
  re_add:                { fr: "Nouvelle analyse",              es: "Nuevo análisis" },
  re_empty:              { fr: "Aucune analyse pour l'instant. Crée ta première analyse pour évaluer un immeuble.", es: "Sin análisis aún. Crea tu primer análisis para evaluar un inmueble." },
  re_back_to_list:       { fr: "← Retour aux analyses",         es: "← Volver a los análisis" },
  re_section_property:   { fr: "Propriété",                     es: "Propiedad" },
  re_section_mortgage:   { fr: "Hypothèque",                    es: "Hipoteca" },
  re_section_charges:    { fr: "Charges récurrentes",           es: "Cargos recurrentes" },
  re_section_units:      { fr: "Unités locatives",              es: "Unidades de alquiler" },
  re_section_results:    { fr: "Résultats",                     es: "Resultados" },
  re_field_name:         { fr: "Nom de l'analyse",              es: "Nombre del análisis" },
  re_field_name_hint:    { fr: "ex: Triplex St-Jean-Baptiste",  es: "ej: Triplex St-Jean-Baptiste" },
  re_field_address:      { fr: "Adresse",                       es: "Dirección" },
  re_field_price:        { fr: "Prix d'achat ($)",              es: "Precio de compra ($)" },
  re_field_downpayment:  { fr: "Mise de fond ($)",              es: "Pago inicial ($)" },
  re_field_unit_type:    { fr: "Type d'immeuble",               es: "Tipo de inmueble" },
  re_unit_single:        { fr: "Maison unifamiliale",           es: "Casa unifamiliar" },
  re_unit_duplex:        { fr: "Duplex (2 logements)",          es: "Dúplex (2 viviendas)" },
  re_unit_triplex:       { fr: "Triplex (3 logements)",         es: "Triplex (3 viviendas)" },
  re_unit_quadruplex:    { fr: "Quadruplex (4 logements)",      es: "Cuadrúplex (4 viviendas)" },
  re_unit_5plex:         { fr: "5 logements",                   es: "5 viviendas" },
  re_unit_6plex:         { fr: "6 logements",                   es: "6 viviendas" },
  re_unit_custom:        { fr: "Personnalisé",                  es: "Personalizado" },
  re_field_mortgage:     { fr: "Montant hypothèque ($)",        es: "Monto hipoteca ($)" },
  re_field_amort:        { fr: "Amortissement (années)",        es: "Amortización (años)" },
  re_field_rate:         { fr: "Taux hypothécaire (%)",         es: "Tasa hipotecaria (%)" },
  re_field_payment_freq: { fr: "Fréquence de paiement",         es: "Frecuencia de pago" },
  re_freq_monthly:       { fr: "Mensuel",                       es: "Mensual" },
  re_freq_biweekly:      { fr: "Bi-mensuel accéléré (26/an)",   es: "Quincenal acelerado (26/año)" },
  re_freq_weekly:        { fr: "Hebdomadaire accéléré (52/an)", es: "Semanal acelerado (52/año)" },
  re_field_municipal_tax:{ fr: "Taxes municipales ($/an)",      es: "Impuestos municipales ($/año)" },
  re_field_school_tax:   { fr: "Taxes scolaires ($/an)",        es: "Impuestos escolares ($/año)" },
  re_field_insurance:    { fr: "Assurances ($/an)",             es: "Seguros ($/año)" },
  re_field_electricity:  { fr: "Électricité",                   es: "Electricidad" },
  re_field_electricity_hint:{ fr: "Part payée par le propriétaire ($/mois)", es: "Parte pagada por el propietario ($/mes)" },
  re_field_other_service_placeholder:{ fr: "Autre service (ex: Internet, déneigement) — optionnel", es: "Otro servicio (ej: Internet) — opcional" },
  re_field_other_service_hint:{ fr: "Tu peux laisser vide si pas applicable.", es: "Puedes dejarlo vacío si no aplica." },
  re_field_maintenance:  { fr: "Entretien & travaux (%)",       es: "Mantenimiento (%)" },
  re_field_maintenance_hint:{ fr: "% des loyers à mettre de côté chaque mois", es: "% de los alquileres a reservar cada mes" },
  re_field_vacancy:      { fr: "Taux d'inoccupation (%)",       es: "Tasa de desocupación (%)" },
  re_field_vacancy_hint: { fr: "Provision pour logements vacants. ~3% au Québec.", es: "Provisión por desocupación. ~3% típico." },
  re_field_management:   { fr: "Gestion immobilière (%)",       es: "Gestión inmobiliaria (%)" },
  re_field_management_hint:{ fr: "0% si tu gères toi-même, 4-8% pour un gestionnaire externe.", es: "0% si lo gestionas tú mismo, 4-8% para un gestor externo." },
  re_unit_label:         { fr: "Logement {n}",                  es: "Vivienda {n}" },
  re_unit_rent:          { fr: "Loyer mensuel",                 es: "Alquiler mensual" },
  re_unit_utilities:     { fr: "Tout inclus (chauffage/électricité)", es: "Todo incluido (calefacción/electricidad)" },
  re_unit_add:           { fr: "+ Logement",                    es: "+ Vivienda" },
  re_unit_remove:        { fr: "Retirer",                       es: "Quitar" },
  re_unit_owner_occupied:{ fr: "Logement pour habiter (tu vis ici)", es: "Vivienda para habitar (vives aquí)" },
  re_unit_owner_badge:   { fr: "Mon logement",                  es: "Mi vivienda" },
  re_unit_owner_hint:    { fr: "Aucun loyer perçu pour ce logement. Le coût pour l'habiter est calculé à droite.", es: "Sin alquiler para esta vivienda. El costo de habitarla se calcula a la derecha." },
  re_metric_cost_to_live:{ fr: "Coût pour habiter",             es: "Costo de habitar" },
  re_metric_cost_to_live_neg:{ fr: "Sort de ta poche chaque mois", es: "Sale de tu bolsillo cada mes" },
  re_metric_cost_to_live_pos:{ fr: "Tu encaisses en plus d'habiter ici", es: "Cobras además de habitar aquí" },
  re_notes:              { fr: "Notes",                         es: "Notas" },
  re_save:               { fr: "Sauvegarder l'analyse",         es: "Guardar el análisis" },
  re_update:             { fr: "Mettre à jour",                 es: "Actualizar" },
  re_delete:             { fr: "Supprimer l'analyse",           es: "Eliminar el análisis" },
  re_metric_gross_rent:  { fr: "Loyers bruts",                  es: "Alquileres brutos" },
  re_metric_per_month:   { fr: "/mois",                         es: "/mes" },
  re_metric_per_year:    { fr: "/an",                           es: "/año" },
  re_metric_mortgage_pmt:{ fr: "Paiement hypothécaire",         es: "Pago hipotecario" },
  re_metric_mortgage_monthly:{ fr: "Mensuel",                   es: "Mensual" },
  re_metric_mortgage_biw:{ fr: "Bi-mensuel accéléré",           es: "Quincenal acelerado" },
  re_metric_mortgage_wkl:{ fr: "Hebdo accéléré",                es: "Semanal acelerado" },
  re_metric_noi:         { fr: "Revenu net d'exploitation (NOI)", es: "Ingreso neto operativo (NOI)" },
  re_metric_cashflow:    { fr: "Cash flow net",                 es: "Flujo de caja neto" },
  re_metric_cap_rate:    { fr: "Taux de capitalisation",        es: "Tasa de capitalización" },
  re_metric_mrb:         { fr: "Multiplicateur revenu brut",    es: "Multiplicador ingreso bruto" },
  re_metric_stress:      { fr: "Stress test (taux +2%)",        es: "Prueba de estrés (tasa +2%)" },
  re_metric_total_exp:   { fr: "Charges totales",               es: "Gastos totales" },
  re_verdict_excellent:  { fr: "Excellent investissement",      es: "Excelente inversión" },
  re_verdict_good:       { fr: "Bon investissement",            es: "Buena inversión" },
  re_verdict_risky:      { fr: "Investissement risqué",         es: "Inversión arriesgada" },
  re_verdict_bad:        { fr: "Pas pertinent",                 es: "No conviene" },
  re_verdict_unknown:    { fr: "Données insuffisantes",         es: "Datos insuficientes" },
  re_hint_excellent:     { fr: "Cap rate ≥ 6% et MRB ≤ 8 — rentabilité forte.", es: "Cap rate ≥ 6% y MRB ≤ 8 — fuerte rentabilidad." },
  re_hint_good:          { fr: "Cash flow positif, métriques acceptables.", es: "Flujo positivo, métricas aceptables." },
  re_hint_risky:         { fr: "Cap rate bas, MRB élevé ou stress test serré. À analyser de près.", es: "Cap rate bajo o estrés ajustado. Analizar con cuidado." },
  re_hint_bad:           { fr: "Cash flow négatif. L'immeuble ne se paie pas tout seul.", es: "Flujo negativo. El inmueble no se paga solo." },

  // ── Projection long terme ─────────────────────────
  re_section_projection: { fr: "Projection à long terme",      es: "Proyección a largo plazo" },
  re_section_projection_results:{ fr: "Projection",            es: "Proyección" },
  re_field_appreciation: { fr: "Appréciation du prix",         es: "Apreciación del precio" },
  re_field_appreciation_hint:{ fr: "Hausse annuelle moyenne attendue de la valeur (3% historique au Qc).", es: "Aumento anual promedio esperado (3% histórico)." },
  re_field_rent_increase:{ fr: "Augmentation des loyers",      es: "Aumento de alquileres" },
  re_field_rent_increase_hint:{ fr: "Augmentation annuelle moyenne (Régie : 1 à 3%).", es: "Aumento anual promedio (1 a 3%)." },
  re_field_custom_years: { fr: "Nombre d'années personnalisé", es: "Número de años personalizado" },
  re_years:              { fr: "années",                       es: "años" },
  re_years_short:        { fr: "ans",                          es: "años" },
  re_proj_future_value:  { fr: "Valeur de l'immeuble",         es: "Valor del inmueble" },
  re_proj_mortgage_balance:{ fr: "Solde hypothécaire restant", es: "Saldo hipotecario restante" },
  re_proj_paid_down:     { fr: "{n} remboursé",                es: "{n} pagado" },
  re_proj_fully_paid:    { fr: "Hypothèque entièrement payée", es: "Hipoteca totalmente pagada" },
  re_proj_equity:        { fr: "Équité accumulée",             es: "Capital acumulado" },
  re_proj_equity_gain:   { fr: "+{n} vs mise de fond",         es: "+{n} vs aporte inicial" },
  re_proj_cum_rent:      { fr: "Loyers cumulés",               es: "Alquileres acumulados" },
  re_proj_cum_cashflow:  { fr: "Cash flow cumulé",             es: "Flujo acumulado" },
  re_proj_total_profit:  { fr: "Profit total (si vente)",      es: "Beneficio total (si venta)" },
  re_proj_annualized_return:{ fr: "Rendement annualisé",       es: "Rendimiento anualizado" },
  re_proj_annualized_hint:{ fr: "CAGR : équité finale + cash flow cumulé, comparés à ta mise de fond.", es: "CAGR: capital final + flujo acumulado vs aporte inicial." },
};

let uiLang = localStorage.getItem("finances-ui-lang") || "fr";

function t(key, params = {}) {
  const entry = TRANSLATIONS[key];
  if (!entry) {
    console.warn(`t('${key}') : clé manquante`);
    return key;
  }
  let str = entry[uiLang] || entry.fr || key;
  if (params.n !== undefined) str = str.replace(/\{s\}/g, params.n > 1 ? "s" : "");
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(new RegExp(`\\{${k}\\}`, "g"), v);
  }
  return str;
}

function setUILang(lang) {
  if (lang !== "fr" && lang !== "es") return;
  uiLang = lang;
  localStorage.setItem("finances-ui-lang", lang);
  document.documentElement.lang = lang === "es" ? "es" : "fr-CA";
  if (typeof buildSidebar === "function") buildSidebar();
  if (typeof renderPage === "function") renderPage();
  const loginScreen = document.getElementById("login-screen");
  if (loginScreen && loginScreen.style.display !== "none" && typeof showLogin === "function") showLogin();
}

function getUILang() { return uiLang; }

function tAccountType(type) {
  const at = ACCOUNT_TYPES.find(x => x.value === type);
  if (!at) return type;
  return uiLang === "es" ? (at.label_es || at.label_fr) : at.label_fr;
}

function tCategoryName(cat) {
  if (!cat) return "—";
  return uiLang === "es" ? (cat.name_es || cat.name_fr || cat.name) : (cat.name_fr || cat.name);
}

function tTxType(type) {
  if (type === "expense") return t("tx_type_expense");
  if (type === "income") return t("tx_type_income");
  if (type === "transfer") return t("tx_type_transfer");
  return type;
}
