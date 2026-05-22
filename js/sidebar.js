// ── Sidebar & Navigation ──────────────────────────────

function buildSidebar() {
  const nav = document.getElementById("sidebar-nav"); if (!nav) return;
  // Nav horizontale Crystalline : items à plat, pas de sous-sections
  const items = [
    { label: t("nav_dashboard"),     page: "dashboard" },
    { label: t("nav_transactions"),  page: "transactions" },
    { label: t("nav_accounts"),      page: "accounts" },
    { label: t("nav_budget"),        page: "budget" },
    { label: t("nav_subscriptions"), page: "subscriptions" },
    { label: t("nav_realestate"),    page: "realestate" },
    { label: t("nav_house"),         page: "house" },
    { label: t("nav_categories"),    page: "categories" },
  ];

  nav.innerHTML = items.map(item => `
    <a class="cr-nav__item ${activePage === item.page ? "is-active" : ""}"
       onclick="navTo('${item.page}')"
       role="button" tabindex="0"
       onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();navTo('${item.page}')}">
      ${item.label}
    </a>
  `).join("");

  // Boutons dark + lang + logout (en haut à droite)
  const darkBtn = document.getElementById("dark-btn");
  if (darkBtn) {
    darkBtn.innerHTML = icon(darkMode ? "sun" : "moon", 14);
    darkBtn.setAttribute("aria-label", darkMode ? t("toggle_light") : t("toggle_dark"));
    darkBtn.setAttribute("title", darkMode ? t("toggle_light") : t("toggle_dark"));
  }
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    // Avatar circulaire Crystalline avec initiale + label déconnexion en sous-titre
    const initial = currentUserName ? esc(currentUserName.charAt(0).toUpperCase()) : "?";
    logoutBtn.innerHTML = `<span class="cr-avatar">${initial}</span>`;
    logoutBtn.setAttribute("aria-label", t("logout"));
    logoutBtn.setAttribute("title", currentUserName ? `${currentUserName} — ${t("logout")}` : t("logout"));
  }
  const langBtn = document.getElementById("lang-btn");
  if (langBtn) {
    langBtn.innerHTML = `<strong style="font-size:11px;font-weight:600;letter-spacing:0.02em">${getUILang().toUpperCase()}</strong>`;
    langBtn.setAttribute("aria-label", t("language"));
    langBtn.setAttribute("title", getUILang() === "fr" ? "Français → Español" : "Español → Français");
  }
}

function navTo(page) {
  activePage = page;
  buildSidebar();
  renderPage();
  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.remove("mobile-open");
  }
}

function toggleSidebar() {
  // Mobile : ouvre/ferme le menu de navigation horizontal
  document.getElementById("sidebar").classList.toggle("cr-header--mobile-open");
}

function initMobileMenu() {
  document.querySelectorAll("#nav-links a, .nav-item").forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) {
        document.getElementById("sidebar").classList.remove("mobile-open");
      }
    });
  });
  document.addEventListener("click", e => {
    const sidebar = document.getElementById("sidebar");
    const btn = document.getElementById("sidebar-toggle-btn");
    if (sidebar && sidebar.classList.contains("mobile-open") && !sidebar.contains(e.target) && btn && !btn.contains(e.target)) {
      sidebar.classList.remove("mobile-open");
    }
  });
}
initMobileMenu();

// ── Rendu principal ───────────────────────────────────
function renderPage() {
  const pageMeta = {
    dashboard:     { label: t("nav_dashboard"),     icon: "bar-chart" },
    transactions:  { label: t("nav_transactions"),  icon: "clipboard" },
    accounts:      { label: t("nav_accounts"),      icon: "wallet" },
    budget:        { label: t("nav_budget"),        icon: "trending-up" },
    subscriptions: { label: t("nav_subscriptions"), icon: "refresh" },
    realestate:    { label: t("nav_realestate"),    icon: "home" },
    house:         { label: t("nav_house"),         icon: "home" },
    categories:    { label: t("nav_categories"),    icon: "tag" }
  };
  const meta = pageMeta[activePage] || { label: activePage, icon: "file-text" };
  const titleEl = document.getElementById("topbar-title");
  if (titleEl) titleEl.innerHTML = `<span class="icon-inline" style="gap:10px">${icon(meta.icon, 22)} ${meta.label}</span>`;

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

  // Initialise les graphiques après le rendu HTML
  if (activePage === "dashboard" && typeof initDashCharts === "function") {
    setTimeout(initDashCharts, 50);
  }
  // Initialise le graphique de projection immobilier
  if (activePage === "realestate" && typeof reMode !== "undefined" && reMode === "edit"
      && typeof reDrawProjectionChart === "function" && typeof reCurrent !== "undefined" && reCurrent) {
    setTimeout(() => reDrawProjectionChart(reCurrent), 50);
  }
}
