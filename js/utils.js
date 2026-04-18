// ── Utilitaires ───────────────────────────────────────

function genId() { return Math.random().toString(36).slice(2, 10); }

function fmtMoney(n) {
  const num = Number(n || 0);
  return `${num.toFixed(2)} ${CURRENCY_SYMBOL}`;
}

function fmtDate(d) {
  if (!d) return "";
  const date = (typeof d === "string") ? new Date(d + "T12:00:00") : new Date(d);
  return date.toLocaleDateString(uiLang === "es" ? "es-ES" : "fr-CA", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function fmtDateShort(d) {
  if (!d) return "";
  const date = (typeof d === "string") ? new Date(d + "T12:00:00") : new Date(d);
  return date.toLocaleDateString(uiLang === "es" ? "es-ES" : "fr-CA", {
    day: "numeric", month: "short"
  });
}

function todayStr() { return new Date().toISOString().slice(0, 10); }

function esc(s) {
  return String(s || "").replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function monthStart(year, month) {
  return new Date(year, month, 1).toISOString().slice(0, 10);
}
function monthEnd(year, month) {
  return new Date(year, month + 1, 0).toISOString().slice(0, 10);
}

// Calcul du solde courant d'un compte (solde initial + delta des transactions)
function getAccountBalance(account) {
  if (!account) return 0;
  const initial = Number(account.initialBalance || 0);
  const delta = transactions.reduce((s, tx) => {
    if (tx.accountId !== account.id && tx.toAccountId !== account.id) return s;
    const amt = Number(tx.amount || 0);
    if (tx.type === "income" && tx.accountId === account.id) return s + amt;
    if (tx.type === "expense" && tx.accountId === account.id) return s - amt;
    if (tx.type === "transfer") {
      if (tx.accountId === account.id) return s - amt;       // sortie
      if (tx.toAccountId === account.id) return s + amt;     // entrée
    }
    return s;
  }, 0);
  return initial + delta;
}

// Totaux : revenus / dépenses pour une période donnée (YYYY-MM-DD start/end inclus)
function getPeriodTotals(startDate, endDate) {
  const filtered = transactions.filter(tx => tx.date && tx.date >= startDate && tx.date <= endDate);
  const income = filtered.filter(tx => tx.type === "income").reduce((s, tx) => s + Number(tx.amount || 0), 0);
  const expense = filtered.filter(tx => tx.type === "expense").reduce((s, tx) => s + Number(tx.amount || 0), 0);
  return { income, expense, balance: income - expense, count: filtered.length };
}

// ── Dark mode ─────────────────────────────────────────
function initDark() {
  darkMode = localStorage.getItem("finances-dark") === "1";
  applyDark();
}
function toggleDark() {
  darkMode = !darkMode;
  localStorage.setItem("finances-dark", darkMode ? "1" : "0");
  applyDark();
  renderPage();
}
function applyDark() {
  document.body.classList.toggle("dark", darkMode);
  const b = document.getElementById("dark-btn");
  if (b) {
    b.innerHTML = icon(darkMode ? "sun" : "moon", 14);
    b.setAttribute("aria-label", darkMode ? t("toggle_light") : t("toggle_dark"));
    b.setAttribute("title", darkMode ? t("toggle_light") : t("toggle_dark"));
  }
}

// ── Dropdown ──────────────────────────────────────────
function toggleDrop(id) {
  closeAllDrops();
  if (openDropId === id) { openDropId = null; return; }
  const el = document.getElementById("drop-" + id);
  if (el) { el.classList.add("open"); openDropId = id; }
}
function closeAllDrops() {
  document.querySelectorAll(".dropdown.open").forEach(el => el.classList.remove("open"));
  openDropId = null;
}

// ── Modal ─────────────────────────────────────────────
function showModal(html) {
  document.getElementById("modals").innerHTML = `<div class="modal-overlay" onclick="if(event.target===this)closeModal()">${html}</div>`;
}
function closeModal() { document.getElementById("modals").innerHTML = ""; }

function openConfirm(title, msg, action, isDanger = false) {
  pendingConfirm = action;
  showModal(`<div class="modal" style="max-width:380px">
    <div class="modal-header"><h3>${title}</h3><button class="close-btn" onclick="closeModal()" aria-label="${t("close")}">${icon("x", 18)}</button></div>
    <p style="color:var(--text2);font-size:14px;margin-bottom:20px;line-height:1.6">${msg}</p>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">${t("cancel")}</button>
      <button style="background:${isDanger ? "var(--status-red)" : "var(--status-green)"};color:#fff;border:none;border-radius:8px;padding:8px 18px;font-weight:600;cursor:pointer;font-size:14px;display:inline-flex;align-items:center;gap:6px" onclick="confirmAction()">
        ${icon(isDanger ? "trash" : "check", 14)} ${isDanger ? t("delete") : t("confirm")}
      </button>
    </div>
  </div>`);
}
function confirmAction() { if (pendingConfirm) pendingConfirm(); closeModal(); }

function askDelete(collection, id, name) {
  let msg = t("confirm_delete_msg", { name });
  if (collection === "accounts") msg = t("confirm_delete_account_msg", { name });
  else if (collection === "categories") msg = t("confirm_delete_category_msg", { name });
  openConfirm(t("confirm_delete_title"), msg, async () => {
    await db.collection(collection).doc(id).delete();
  }, true);
}

// ── Helpers divers ────────────────────────────────────
function setMonth(year, month) {
  txFilterYear = year;
  txFilterMonth = month;
  renderPage();
}
function changeMonth(delta) {
  let m = txFilterMonth + delta;
  let y = txFilterYear;
  if (m < 0) { m = 11; y -= 1; }
  if (m > 11) { m = 0; y += 1; }
  setMonth(y, m);
}

// ── Resize listener ───────────────────────────────────
window.addEventListener("resize", () => { if (isLoggedIn) renderPage(); });
