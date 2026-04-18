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

// ── Budget helpers ────────────────────────────────────
function getBudgetForCategory(categoryId) {
  return budgets.find(b => b.categoryId === categoryId);
}

function getCategorySpendThisMonth(categoryId) {
  const start = monthStart(txFilterYear, txFilterMonth);
  const end = monthEnd(txFilterYear, txFilterMonth);
  return transactions
    .filter(tx => tx.type === "expense" && tx.categoryId === categoryId && tx.date >= start && tx.date <= end)
    .reduce((s, tx) => s + Number(tx.amount || 0), 0);
}

function getBudgetStatus(spent, limit) {
  if (!limit || limit <= 0) return { pct: 0, status: "none", color: "var(--text3)" };
  const pct = (spent / limit) * 100;
  if (pct >= 100) return { pct, status: "over", color: "var(--status-red)" };
  if (pct >= 80)  return { pct, status: "watch", color: "var(--status-orange, #f59e0b)" };
  return { pct, status: "ok", color: "var(--status-green)" };
}

// ── Normalisation de marchand (pour détection d'abonnements) ─────
function normalizeMerchantName(desc) {
  if (!desc) return "";
  let s = desc.toUpperCase();
  // Retire les accents
  s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // Retire les chiffres, codes de référence, suffixes de ville
  s = s.replace(/\b\d{3,}\b/g, " ");                   // codes numériques
  s = s.replace(/\b(QC|QUEBEC|MONTREAL|ONTARIO|ON|BC|AB|CA|CANADA)\b/g, " ");
  s = s.replace(/\s*#\s*\d+/g, " ");                    // #numéro de succursale
  s = s.replace(/[^A-Z\s&*]/g, " ");                    // garde lettres, espaces, &, *
  s = s.replace(/\s+/g, " ").trim();
  // Prend les 3 premiers mots significatifs
  const words = s.split(" ").filter(w => w.length >= 2);
  return words.slice(0, 3).join(" ");
}

// ── Détection automatique des abonnements (heuristique) ──────────
function detectRecurringTransactions() {
  const expenses = transactions.filter(tx => tx.type === "expense" && tx.date);
  const groups = {};
  expenses.forEach(tx => {
    const key = normalizeMerchantName(tx.description);
    if (!key || key.length < 3) return;
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  });

  const detected = [];
  for (const [key, txs] of Object.entries(groups)) {
    if (txs.length < 2) continue;
    // Trie par date
    txs.sort((a, b) => a.date.localeCompare(b.date));
    // Calcule les intervalles en jours
    const intervals = [];
    for (let i = 1; i < txs.length; i++) {
      const d1 = new Date(txs[i-1].date + "T12:00:00");
      const d2 = new Date(txs[i].date + "T12:00:00");
      intervals.push(Math.round((d2 - d1) / (1000 * 60 * 60 * 24)));
    }
    if (intervals.length === 0) continue;
    const avgInterval = intervals.reduce((s, i) => s + i, 0) / intervals.length;
    // On considère récurrent si l'intervalle moyen est entre 6 et 400 jours
    if (avgInterval < 6 || avgInterval > 400) continue;
    // Variance : les intervalles doivent être relativement stables
    const variance = intervals.reduce((s, i) => s + Math.pow(i - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    // Si la déviation dépasse 40% de la moyenne, c'est probablement pas un abonnement fixe
    if (stdDev / avgInterval > 0.5) continue;
    // Montant médian
    const amounts = txs.map(tx => Number(tx.amount || 0)).sort((a, b) => a - b);
    const medianAmount = amounts[Math.floor(amounts.length / 2)];
    // Fréquence présumée
    let frequency = "monthly";
    if (avgInterval <= 10) frequency = "weekly";
    else if (avgInterval <= 20) frequency = "biweekly";
    else if (avgInterval <= 45) frequency = "monthly";
    else if (avgInterval <= 200) frequency = "quarterly";
    else frequency = "yearly";

    // Estimation du coût mensuel
    const monthlyCost = medianAmount * (30 / avgInterval);

    detected.push({
      key,
      name: txs[txs.length - 1].description, // Dernière description complète
      amount: medianAmount,
      monthlyCost,
      frequency,
      avgIntervalDays: Math.round(avgInterval),
      occurrences: txs.length,
      lastDate: txs[txs.length - 1].date,
      firstDate: txs[0].date,
      accountId: txs[txs.length - 1].accountId,
      categoryId: txs[txs.length - 1].categoryId,
      transactionIds: txs.map(tx => tx.id)
    });
  }
  // Trie par coût mensuel décroissant
  detected.sort((a, b) => b.monthlyCost - a.monthlyCost);
  return detected;
}

function getSubscriptionState(key) {
  return subscriptions.find(s => s.key === key);
}

// ── Navigation de mois absolue (pour graphiques) ─────────────────
function offsetMonth(year, month, delta) {
  let m = month + delta;
  let y = year;
  while (m < 0) { m += 12; y -= 1; }
  while (m > 11) { m -= 12; y += 1; }
  return { year: y, month: m };
}

function monthKey(year, month) {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

// ── Filtre date : transactions dans un mois donné ────────────────
function getMonthlyExpenseByCategory(year, month) {
  const start = monthStart(year, month);
  const end = monthEnd(year, month);
  const result = {};
  transactions
    .filter(tx => tx.type === "expense" && tx.date >= start && tx.date <= end)
    .forEach(tx => {
      const catId = tx.categoryId || "_none";
      if (!result[catId]) result[catId] = 0;
      result[catId] += Number(tx.amount || 0);
    });
  return result;
}

// ── Détection : paiements de carte mal classés comme revenus ─────
function detectMisclassifiedCardPayments() {
  const creditAccountIds = new Set(
    accounts.filter(a => a.type === "credit").map(a => a.id)
  );
  return transactions.filter(tx => {
    if (tx.type !== "income") return false;
    if (!creditAccountIds.has(tx.accountId)) return false;
    const desc = (tx.description || "").toLowerCase();
    return desc.includes("paiement") || desc.includes("payment") || desc.includes("caisse");
  });
}

// ── Bulk : convertit tous les paiements de carte en transferts ───
async function fixCardPaymentsBulk() {
  const misclass = detectMisclassifiedCardPayments();
  if (misclass.length === 0) return 0;

  // Firestore limite à 500 ops par batch
  const chunks = [];
  for (let i = 0; i < misclass.length; i += 450) {
    chunks.push(misclass.slice(i, i + 450));
  }

  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach(tx => {
      batch.update(db.collection("transactions").doc(tx.id), {
        type: "transfer",
        toAccountId: tx.accountId,  // La carte devient la destination
        accountId: null,             // Source externe (paiement depuis un compte non suivi)
        categoryId: null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();
  }
  return misclass.length;
}

// ── Resize listener ───────────────────────────────────
window.addEventListener("resize", () => { if (isLoggedIn) renderPage(); });
