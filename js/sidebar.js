// ── Sidebar & Navigation ──────────────────────────────

function buildSidebar() {
  const nav = document.getElementById("sidebar-nav"); if (!nav) return;
  const items = [
    { section: t("nav_section_main") },
    { icon: "bar-chart", label: t("nav_dashboard"),    page: "dashboard" },
    { icon: "clipboard", label: t("nav_transactions"), page: "transactions" },
    { icon: "wallet",    label: t("nav_accounts"),     page: "accounts" },
    { section: t("nav_section_settings") },
    { icon: "tag",       label: t("nav_categories"),   page: "categories" },
  ];

  nav.innerHTML = items.map(item => {
    if (item.section) return `<div class="nav-section">${item.section}</div>`;
    return `<div class="nav-item ${activePage === item.page ? "active" : ""}" onclick="navTo('${item.page}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();navTo('${item.page}')}">
      <span class="icon">${icon(item.icon, 18)}</span>
      <span>${item.label}</span>
    </div>`;
  }).join("");

  // Boutons dark + lang + logout
  const darkBtn = document.getElementById("dark-btn");
  if (darkBtn) {
    darkBtn.innerHTML = icon(darkMode ? "sun" : "moon", 14);
    darkBtn.setAttribute("aria-label", darkMode ? t("toggle_light") : t("toggle_dark"));
    darkBtn.setAttribute("title", darkMode ? t("toggle_light") : t("toggle_dark"));
  }
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.innerHTML = icon("log-out", 14) + ` <span>${t("logout")}</span>`;
    logoutBtn.setAttribute("aria-label", t("logout"));
  }
  const langBtn = document.getElementById("lang-btn");
  if (langBtn) {
    langBtn.innerHTML = `<strong>${getUILang().toUpperCase()}</strong>`;
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
  if (window.innerWidth <= 768) {
    document.getElementById("sidebar").classList.toggle("mobile-open");
  } else {
    sidebarOpen = !sidebarOpen;
    document.getElementById("sidebar").classList.toggle("hidden", !sidebarOpen);
    document.getElementById("main-area").classList.toggle("full", !sidebarOpen);
  }
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
    dashboard:    { label: t("nav_dashboard"),    icon: "bar-chart" },
    transactions: { label: t("nav_transactions"), icon: "clipboard" },
    accounts:     { label: t("nav_accounts"),     icon: "wallet" },
    categories:   { label: t("nav_categories"),   icon: "tag" }
  };
  const meta = pageMeta[activePage] || { label: activePage, icon: "file-text" };
  const titleEl = document.getElementById("topbar-title");
  if (titleEl) titleEl.innerHTML = `<span class="icon-inline" style="gap:10px">${icon(meta.icon, 22)} ${meta.label}</span>`;

  const pc = document.getElementById("page-content"); if (!pc) return;
  if (activePage === "dashboard") pc.innerHTML = renderDashboard();
  else if (activePage === "transactions") pc.innerHTML = renderTransactions();
  else if (activePage === "accounts") pc.innerHTML = renderAccounts();
  else if (activePage === "categories") pc.innerHTML = renderCategoriesPage();
  else pc.innerHTML = `<div class="page"><div class="empty">Page introuvable.</div></div>`;
}
