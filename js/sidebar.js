// ── Navigation (design « Aujourd'hui ») ───────────────
// Ordi ≥ 1024px : barre latérale 256px · Tablette 768–1023px : rail 72px
// Cellulaire < 768px : barre d'onglets en bas + feuille « Plus »

const NAV_MAIN = [
  { page: "dashboard",     key: "nav_today",         icon: "home" },
  { page: "transactions",  key: "nav_activity",      icon: "list" },
  { page: "budget",        key: "nav_budget",        icon: "pie-chart" },
  { page: "accounts",      key: "nav_accounts",      icon: "wallet" },
  { page: "subscriptions", key: "nav_subscriptions", icon: "refresh" },
];
const NAV_REALESTATE = [
  { page: "realestate", key: "nav_realestate", icon: "building-2" },
  { page: "house",      key: "nav_house",      icon: "key-round" },
];

let profileMenuOpen = false;

function navItemHtml(item) {
  const active = activePage === item.page;
  const label = t(item.key);
  return `<button type="button" class="sb-link ${active ? "is-active" : ""}" onclick="navTo('${item.page}')"
      ${active ? 'aria-current="page"' : ""} aria-label="${escAttr(label)}" title="${escAttr(label)}">
    ${icon(item.icon, 20)}<span class="sb-link__label">${label}</span>
  </button>`;
}

function isMacLike() { return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || ""); }

function buildSidebar() {
  const sb = document.getElementById("sidebar");
  if (sb) {
    const initial = currentUserName ? escAttr(currentUserName.charAt(0).toUpperCase()) : "?";
    sb.innerHTML = `
      <div class="sb-logo">
        <span class="sb-logo__mark" aria-hidden="true">${icon("trending-up", 18)}</span>
        <span class="sb-logo__text">Mes Finances</span>
      </div>
      <button type="button" class="sb-search" onclick="openSearch()" aria-label="${escAttr(t("search"))}" title="${escAttr(t("search"))}">
        ${icon("search", 18)}<span class="sb-search__label">${t("search")}</span>
        <kbd class="sb-kbd">${isMacLike() ? "⌘K" : "Ctrl K"}</kbd>
      </button>
      <button type="button" class="sb-add" onclick="openQuickAdd('expense')" aria-label="${escAttr(t("add_expense"))}" title="${escAttr(t("add_expense"))}">
        ${icon("plus", 20)}<span class="sb-add__label">${t("add_expense")}</span>
      </button>
      <nav class="sb-nav" aria-label="${escAttr(t("nav_section_main"))}">
        ${NAV_MAIN.map(navItemHtml).join("")}
        <div class="sb-group" role="presentation">${t("nav_realestate_group")}</div>
        ${NAV_REALESTATE.map(navItemHtml).join("")}
      </nav>
      <div class="sb-spacer"></div>
      <div class="sb-profile">
        <button type="button" class="sb-profile__btn" onclick="toggleProfileMenu()" aria-haspopup="menu"
          aria-expanded="${profileMenuOpen}" aria-label="${escAttr(t("my_profile"))} — ${escAttr(t("settings"))}" title="${escAttr(t("settings"))}">
          <span class="sb-avatar" aria-hidden="true">${initial}</span>
          <span class="sb-profile__name">${t("my_profile")}</span>
          <span class="sb-profile__gear" aria-hidden="true">${icon("settings", 18)}</span>
        </button>
        ${profileMenuOpen ? `<div class="sb-menu" role="menu">${settingsMenuItems()}</div>` : ""}
      </div>`;
  }

  // Barre d'onglets (cellulaire)
  const tb = document.getElementById("tabbar");
  if (tb) {
    const moreActive = !["dashboard", "transactions", "budget"].includes(activePage);
    const tab = (page, key, ic) => {
      const active = activePage === page;
      return `<button type="button" class="tab ${active ? "is-active" : ""}" onclick="navTo('${page}')" ${active ? 'aria-current="page"' : ""}>
        ${icon(ic, 22)}<span>${t(key)}</span></button>`;
    };
    tb.innerHTML = `
      ${tab("dashboard", "nav_home", "home")}
      ${tab("transactions", "nav_activity", "list")}
      <div class="tab tab--add-wrap"><button type="button" class="tab-add" onclick="openQuickAdd('expense')" aria-label="${escAttr(t("add_expense"))}">${icon("plus", 26)}</button></div>
      ${tab("budget", "nav_budget", "pie-chart")}
      <button type="button" class="tab ${moreActive ? "is-active" : ""}" onclick="openMoreSheet()" aria-haspopup="dialog" ${moreActive ? 'aria-current="page"' : ""}>
        ${icon("more-horizontal", 22)}<span>${t("nav_more")}</span></button>`;
  }
}

// Éléments du menu réglages (profil ordi + feuille « Plus »)
function settingsMenuItems() {
  return `
    <button type="button" role="menuitem" class="menu-item" onclick="closeProfileMenu();navTo('categories')">${icon("tag", 18)}<span>${t("nav_categories")}</span></button>
    <button type="button" role="menuitem" class="menu-item" onclick="toggleUILang()">${icon("globe", 18)}<span>${t("language")}</span><span class="menu-item__value">${getUILang() === "fr" ? "FR → ES" : "ES → FR"}</span></button>
    <button type="button" role="menuitem" class="menu-item" onclick="toggleDark();buildSidebar()">${icon(darkMode ? "sun" : "moon", 18)}<span>${darkMode ? t("toggle_light") : t("toggle_dark")}</span></button>
    <div class="menu-sep" role="separator"></div>
    <button type="button" role="menuitem" class="menu-item menu-item--danger" onclick="closeProfileMenu();closeModal();logout()">${icon("log-out", 18)}<span>${t("logout")}</span></button>`;
}

function toggleProfileMenu() {
  profileMenuOpen = !profileMenuOpen;
  buildSidebar();
  if (profileMenuOpen) setTimeout(() => document.querySelector(".sb-menu .menu-item")?.focus(), 0);
}
function closeProfileMenu() {
  if (!profileMenuOpen) return;
  profileMenuOpen = false;
  buildSidebar();
}
document.addEventListener("click", (e) => {
  if (profileMenuOpen && !e.target.closest(".sb-profile")) closeProfileMenu();
});

// Feuille « Plus » (cellulaire)
function openMoreSheet() {
  const link = (page, key, ic) => `<button type="button" class="menu-item ${activePage === page ? "is-active" : ""}" onclick="closeModal();navTo('${page}')" ${activePage === page ? 'aria-current="page"' : ""}>${icon(ic, 20)}<span>${t(key)}</span></button>`;
  showSheet(`
    <div class="sheet__handle" aria-hidden="true"></div>
    <div class="sheet__head">
      <h2 class="sheet__title" id="sheet-title">${t("nav_more")}</h2>
      <button type="button" class="icon-btn-round" onclick="closeModal()" aria-label="${escAttr(t("close_aria"))}">${icon("x", 20)}</button>
    </div>
    <div class="menu-list">
      ${link("accounts", "nav_accounts", "wallet")}
      ${link("subscriptions", "nav_subscriptions", "refresh")}
      <div class="menu-group">${t("nav_realestate_group")}</div>
      ${link("realestate", "nav_realestate", "building-2")}
      ${link("house", "nav_house", "key-round")}
      <div class="menu-sep" role="separator"></div>
      ${settingsMenuItems()}
    </div>`, "more");
}

// Feuille modale générique (glisse du bas au cellulaire, centrée à l'ordi)
function showSheet(inner, kind) {
  document.getElementById("modals").innerHTML = `
    <div class="sheet-overlay" onclick="if(event.target===this)closeModal()">
      <div class="sheet sheet--${kind || "default"}" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabindex="-1">${inner}</div>
    </div>`;
  setTimeout(() => document.querySelector(".sheet")?.focus(), 30);
}

function navTo(page) {
  activePage = page;
  profileMenuOpen = false;
  buildSidebar();
  renderPage();
  window.scrollTo(0, 0);
}

// Raccourcis clavier globaux : ⌘K / Ctrl+K (recherche), N (ajout rapide), Échap (fermer)
document.addEventListener("keydown", (e) => {
  if (!isLoggedIn) return;
  const tag = (e.target.tagName || "").toLowerCase();
  const typing = tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable;
  if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
    e.preventDefault();
    if (typeof openSearch === "function") openSearch();
    return;
  }
  if (e.key === "Escape") {
    if (profileMenuOpen) { closeProfileMenu(); return; }
    if (document.getElementById("modals").innerHTML) { closeModal(); return; }
  }
  const modalOpen = !!document.getElementById("modals").innerHTML;
  if (!typing && !modalOpen && !e.metaKey && !e.ctrlKey && !e.altKey && (e.key === "n" || e.key === "N")) {
    e.preventDefault();
    if (typeof openQuickAdd === "function") openQuickAdd("expense");
  }
});

// ── Rendu principal ───────────────────────────────────
function renderPage() {
  const pc = document.getElementById("page-content"); if (!pc) return;
  if (activePage === "dashboard") pc.innerHTML = renderDashboard();
  else if (activePage === "transactions") pc.innerHTML = renderTransactions();
  else if (activePage === "accounts") pc.innerHTML = renderAccounts();
  else if (activePage === "budget") pc.innerHTML = renderBudgetPage();
  else if (activePage === "subscriptions") pc.innerHTML = renderSubscriptionsPage();
  else if (activePage === "realestate") pc.innerHTML = renderRealEstatePage();
  else if (activePage === "house") pc.innerHTML = renderHousePage();
  else if (activePage === "categories") pc.innerHTML = renderCategoriesPage();
  else pc.innerHTML = `<div class="page"><div class="empty">Page introuvable.</div></div>`;

  // Graphiques « Tendances » (page Budget)
  if (activePage === "budget" && typeof budgetTab !== "undefined" && budgetTab === "trends" && typeof initDashCharts === "function") {
    setTimeout(initDashCharts, 30);
  }
  // Graphique de projection immobilier
  if (activePage === "realestate" && typeof reMode !== "undefined" && reMode === "edit"
      && typeof reDrawProjectionChart === "function" && typeof reCurrent !== "undefined" && reCurrent) {
    setTimeout(() => reDrawProjectionChart(reCurrent), 50);
  }
}
