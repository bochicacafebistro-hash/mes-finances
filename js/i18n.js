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

  // ── Catégorie détail (modal depuis top dépenses) ──
  cat_detail_title:      { fr: "Détail de la catégorie", es: "Detalle de la categoría" },
  cat_detail_tx_count:   { fr: "{n} transaction{s}",   es: "{n} transaccion{s}" },
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
