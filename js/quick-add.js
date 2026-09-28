// ═══════════════════════════════════════════════════════════════
// RECHERCHE (⌘K) + AJOUT RAPIDE — design « Aujourd'hui »
// ═══════════════════════════════════════════════════════════════

// ── Palette de recherche ──────────────────────────────
let searchQuery = "";

function openSearch() {
  searchQuery = "";
  closeProfileMenu && closeProfileMenu();
  document.getElementById("modals").innerHTML = `
    <div class="sheet-overlay sheet-overlay--top" onclick="if(event.target===this)closeModal()">
      <div class="search-palette" role="dialog" aria-modal="true" aria-label="${escAttr(t("search"))}">
        <div class="search-palette__field">
          ${icon("search", 20)}
          <input id="search-input" type="text" enterkeyhint="search" autocomplete="off" placeholder="${escAttr(t("search_placeholder"))}"
            aria-label="${escAttr(t("search"))}" oninput="searchQuery=this.value;renderSearchResults()"
            onkeydown="searchKeydown(event)"/>
          <button type="button" class="icon-btn-round icon-btn-round--sm" onclick="closeModal()" aria-label="${escAttr(t("close_aria"))}">${icon("x", 18)}</button>
        </div>
        <div id="search-results" class="search-palette__results"></div>
      </div>
    </div>`;
  renderSearchResults();
  setTimeout(() => document.getElementById("search-input")?.focus(), 20);
}

function searchKeydown(e) {
  if (e.key === "Escape") { e.preventDefault(); closeModal(); return; }
  if (e.key === "ArrowDown" || e.key === "Enter") {
    const first = document.querySelector("#search-results .search-item");
    if (first) { e.preventDefault(); if (e.key === "Enter") first.click(); else first.focus(); }
  }
}

function renderSearchResults() {
  const box = document.getElementById("search-results"); if (!box) return;
  const q = searchQuery.trim().toLowerCase();
  const norm = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const nq = norm(q);
  const pages = [...NAV_MAIN, ...NAV_REALESTATE, { page: "categories", key: "nav_categories", icon: "tag" }]
    .filter(p => !nq || norm(t(p.key)).includes(nq));
  const accs = nq ? accounts.filter(a => norm(a.name).includes(nq)).slice(0, 4) : [];
  const txs = nq ? transactions.filter(tx => {
    const cat = categories.find(c => c.id === tx.categoryId);
    return norm(tx.description).includes(nq) || norm(tx.notes).includes(nq) || (cat && norm(tCategoryName(cat)).includes(nq)) || String(tx.amount).includes(q);
  }).sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 8) : [];

  let h = "";
  if (pages.length) {
    h += `<div class="search-group">${t("search_pages")}</div>` + pages.map(p =>
      `<button type="button" class="search-item" onclick="closeModal();navTo('${p.page}')" onkeydown="searchItemKey(event)">${icon(p.icon, 18)}<span>${t(p.key)}</span></button>`).join("");
  }
  if (accs.length) {
    h += `<div class="search-group">${t("search_accounts")}</div>` + accs.map(a => {
      const bal = getAccountBalance(a);
      return `<button type="button" class="search-item" onclick="closeModal();navTo('accounts')" onkeydown="searchItemKey(event)">${icon("wallet", 18)}<span>${esc(a.name)}</span><span class="search-item__meta">${bal < 0 ? "−" : ""}${fmtMoney(Math.abs(bal))}</span></button>`;
    }).join("");
  }
  if (txs.length) {
    h += `<div class="search-group">${t("search_tx")}</div>` + txs.map(tx => {
      const cat = categories.find(c => c.id === tx.categoryId);
      return `<button type="button" class="search-item" onclick="closeModal();setTimeout(()=>openTransactionModal('${tx.id}'),30)" onkeydown="searchItemKey(event)">${icon(cat?.icon || "receipt", 18)}<span>${esc(tx.description || tCategoryName(cat))}<small>${fmtDateShort(tx.date)}${cat ? " · " + esc(tCategoryName(cat)) : ""}</small></span><span class="search-item__meta">${fmtSignedAmount(tx)}</span></button>`;
    }).join("");
  }
  if (!h) h = `<div class="search-empty">${t("search_no_result")}</div>`;
  box.innerHTML = h;
}

function searchItemKey(e) {
  const items = [...document.querySelectorAll("#search-results .search-item")];
  const i = items.indexOf(e.target.closest(".search-item"));
  if (e.key === "ArrowDown") { e.preventDefault(); items[Math.min(i + 1, items.length - 1)]?.focus(); }
  if (e.key === "ArrowUp") { e.preventDefault(); if (i <= 0) document.getElementById("search-input")?.focus(); else items[i - 1].focus(); }
}

// Montant signé pour affichage : « − 24,50 $ » (dépense), « + 140,00 $ » (revenu), « 500,00 $ » (virement)
function fmtSignedAmount(tx) {
  const amt = fmtMoney(tx.amount);
  if (tx.type === "income") return `+ ${amt}`;
  if (tx.type === "expense") return `− ${amt}`;
  return amt;
}

// ═══════════════════════════════════════════════════════════════
// AJOUT RAPIDE (§8) — création seulement; la modification et les
// virements gardent le formulaire complet (openTransactionModal)
// ═══════════════════════════════════════════════════════════════
let qa = null;

function qaStoreGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function qaStoreSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function openQuickAdd(type) {
  if (typeof closeProfileMenu === "function") closeProfileMenu();
  const lastAcc = qaStoreGet("finances-last-account");
  qa = {
    type: type === "income" ? "income" : "expense",
    amount: "",            // chaîne saisie : "24,5"
    categoryId: null,
    accountId: accounts.some(a => a.id === lastAcc) ? lastAcc : (accounts[0]?.id || null),
    date: localDateStr(new Date()),
    desc: "",
    panel: null,           // null | "account" | "date" | "cats"
    showNote: false
  };
  document.getElementById("modals").innerHTML = `
    <div class="sheet-overlay sheet-overlay--qa" onclick="if(event.target===this)closeModal()">
      <div class="sheet sheet--qa" role="dialog" aria-modal="true" aria-labelledby="qa-title" tabindex="-1" id="qa-sheet"></div>
    </div>`;
  qaRender();
  setTimeout(() => document.getElementById("qa-sheet")?.focus(), 30);
}

function qaValue() {
  const v = parseFloat((qa?.amount || "").replace(",", "."));
  return isFinite(v) ? Math.round(v * 100) / 100 : 0;
}

// « 1 234,5 » → affiché avec espaces de milliers, virgule décimale
function qaAmountDisplay() {
  if (!qa.amount) return `0 $`;
  const [int, dec] = qa.amount.split(",");
  const intFmt = Number(int || 0).toLocaleString("fr-CA");
  return `${intFmt}${dec !== undefined ? "," + dec : ""} $`;
}

function qaCategoriesSorted() {
  const list = categories.filter(c => c.type === qa.type);
  const counts = {};
  transactions.forEach(tx => { if (tx.categoryId) counts[tx.categoryId] = (counts[tx.categoryId] || 0) + 1; });
  return list.sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0) || tCategoryName(a).localeCompare(tCategoryName(b)));
}

function qaDateLabel() {
  const today = localDateStr(new Date());
  const diff = daysBetween(qa.date, today);
  if (diff === 0) return t("today");
  if (diff === 1) return t("yesterday");
  return fmtDateShort(qa.date);
}

function qaRender() {
  const sheet = document.getElementById("qa-sheet"); if (!sheet) return;
  const focusedId = document.activeElement?.id;
  const isExp = qa.type === "expense";
  const cats = qaCategoriesSorted();
  const showAll = qa.panel === "cats";
  const top = showAll ? cats : cats.slice(0, 6);
  if (!showAll && qa.categoryId && !top.some(c => c.id === qa.categoryId)) {
    const sel = cats.find(c => c.id === qa.categoryId); if (sel) top[top.length - 1] = sel;
  }
  const acc = accounts.find(a => a.id === qa.accountId);
  const valid = qaValue() > 0 && !!qa.categoryId && !!acc;
  const keys = ["1","2","3","4","5","6","7","8","9",",","0","back"];

  sheet.innerHTML = `
    <div class="sheet__handle" aria-hidden="true"></div>
    <h2 id="qa-title" class="sr-only">${t("quick_add_title")}</h2>
    <div class="qa-top">
      <button type="button" id="qa-close" class="icon-btn-round" onclick="closeModal()" aria-label="${escAttr(t("close_aria"))}">${icon("x", 20)}</button>
      <div class="qa-seg" role="radiogroup" aria-label="${escAttr(t("tx_kind"))}">
        <button type="button" id="qa-t-exp" role="radio" aria-checked="${isExp}" class="qa-seg__btn ${isExp ? "is-on is-exp" : ""}" onclick="qaSetType('expense')">${t("tx_type_expense")}</button>
        <button type="button" id="qa-t-inc" role="radio" aria-checked="${!isExp}" class="qa-seg__btn ${!isExp ? "is-on is-inc" : ""}" onclick="qaSetType('income')">${t("tx_type_income")}</button>
      </div>
      <button type="button" id="qa-transfer" class="qa-transfer" onclick="qaOpenTransfer()">${t("transfer_link")}</button>
    </div>

    <div class="qa-amount ${qa.amount ? "" : "is-empty"}" id="qa-amount" aria-live="polite" aria-label="${escAttr(t("amount"))} : ${escAttr(qaAmountDisplay())}">${qaAmountDisplay()}</div>

    <div class="qa-cats" role="radiogroup" aria-label="${escAttr(t("tx_field_category"))}">
      ${cats.length === 0 ? `<button type="button" class="qa-chip" onclick="closeModal();navTo('categories')">${t("no_category_yet")}</button>` : ""}
      ${top.map(c => `<button type="button" id="qa-c-${c.id}" role="radio" aria-checked="${qa.categoryId === c.id}" class="qa-chip ${qa.categoryId === c.id ? "is-on" : ""}" onclick="qaSetCat('${c.id}')">${icon(c.icon || "folder", 16)}<span>${esc(tCategoryName(c))}</span></button>`).join("")}
      ${cats.length > 6 && !showAll ? `<button type="button" id="qa-c-more" class="qa-chip qa-chip--ghost" onclick="qaPanel('cats')">${t("other_cat")}</button>` : ""}
    </div>

    <div class="qa-meta">
      <button type="button" id="qa-acc" class="qa-meta__btn ${qa.panel === "account" ? "is-open" : ""}" onclick="qaPanel('account')" aria-expanded="${qa.panel === "account"}">
        <span class="qa-meta__k">${t("account")}</span><span class="qa-meta__v">${acc ? esc(acc.name) : t("no_account_yet")}</span>
      </button>
      <button type="button" id="qa-date" class="qa-meta__btn ${qa.panel === "date" ? "is-open" : ""}" onclick="qaPanel('date')" aria-expanded="${qa.panel === "date"}">
        <span class="qa-meta__k">${t("date")}</span><span class="qa-meta__v">${qaDateLabel()}</span>
      </button>
    </div>
    ${qa.panel === "account" ? `<div class="qa-panel" role="listbox" aria-label="${escAttr(t("account"))}">
      ${accounts.length === 0 ? `<button type="button" class="qa-opt" onclick="closeModal();openAccountModal()">${t("acc_modal_add")}</button>` : ""}
      ${accounts.map(a => `<button type="button" id="qa-a-${a.id}" role="option" aria-selected="${a.id === qa.accountId}" class="qa-opt ${a.id === qa.accountId ? "is-on" : ""}" onclick="qaSetAccount('${a.id}')"><span class="kv__dot" style="background:${escAttr(a.color || "var(--accent)")}"></span>${esc(a.name)}</button>`).join("")}
    </div>` : ""}
    ${qa.panel === "date" ? `<div class="qa-panel qa-panel--row">
      <button type="button" id="qa-d-today" class="qa-opt ${daysBetween(qa.date, localDateStr(new Date())) === 0 ? "is-on" : ""}" onclick="qaSetDate(0)">${t("today")}</button>
      <button type="button" id="qa-d-yday" class="qa-opt ${daysBetween(qa.date, localDateStr(new Date())) === 1 ? "is-on" : ""}" onclick="qaSetDate(1)">${t("yesterday")}</button>
      <label class="qa-opt qa-opt--date"><span class="sr-only">${t("choose_date")}</span><input id="qa-d-pick" type="date" value="${qa.date}" max="${localDateStr(new Date(Date.now() + 366 * 86400000))}" onchange="qaPickDate(this.value)"/></label>
    </div>` : ""}

    ${qa.showNote
      ? `<label class="qa-note"><span class="sr-only">${t("description")}</span><input id="qa-desc" type="text" maxlength="120" placeholder="${escAttr(t("description"))}" value="${escAttr(qa.desc)}" oninput="qa.desc=this.value"/></label>`
      : `<button type="button" id="qa-note-btn" class="qa-note-btn" onclick="qa.showNote=true;qaRender();document.getElementById('qa-desc')?.focus()">${t("add_note")}</button>`}

    <div class="qa-pad">
      ${keys.map(k => k === "back"
        ? `<button type="button" id="qa-k-back" class="qa-key" onclick="qaKey('back')" aria-label="${escAttr(t("erase"))}">${icon("delete", 24)}</button>`
        : `<button type="button" id="qa-k-${k === "," ? "comma" : k}" class="qa-key" onclick="qaKey('${k}')">${k}</button>`).join("")}
    </div>

    <button type="button" id="qa-save" class="btn-ink qa-save" onclick="qaSave()" ${valid ? "" : "disabled"}>${t("save")}</button>`;
  if (focusedId && focusedId !== "qa-desc") document.getElementById(focusedId)?.focus();
}

function qaSetType(type) {
  if (qa.type === type) return;
  qa.type = type; qa.categoryId = null; qa.panel = null;
  qaRender();
}
function qaSetCat(id) { qa.categoryId = qa.categoryId === id ? null : id; if (qa.panel === "cats") qa.panel = null; qaRender(); }
function qaPanel(p) { qa.panel = qa.panel === p ? null : p; qaRender(); }
function qaSetAccount(id) { qa.accountId = id; qa.panel = null; qaRender(); document.getElementById("qa-acc")?.focus(); }
function qaSetDate(daysAgo) { qa.date = localDateStr(new Date(Date.now() - daysAgo * 86400000)); qa.panel = null; qaRender(); document.getElementById("qa-date")?.focus(); }
function qaPickDate(v) { if (/^\d{4}-\d{2}-\d{2}$/.test(v)) { qa.date = v; qa.panel = null; qaRender(); document.getElementById("qa-date")?.focus(); } }

function qaKey(k) {
  let a = qa.amount;
  if (k === "back") a = a.slice(0, -1);
  else if (k === ",") { if (!a.includes(",")) a = (a || "0") + ","; }
  else {
    const [int, dec] = a.split(",");
    if (dec !== undefined) { if (dec.length < 2) a += k; }
    else if ((int || "").replace(/^0+/, "").length < 7) a = (int === "0" ? "" : a) + k;
  }
  qa.amount = a;
  // Mise à jour partielle (évite de reconstruire tout le pavé)
  const el = document.getElementById("qa-amount");
  if (el) {
    el.textContent = qaAmountDisplay();
    el.classList.toggle("is-empty", !qa.amount);
    el.setAttribute("aria-label", `${t("amount")} : ${qaAmountDisplay()}`);
  }
  const save = document.getElementById("qa-save");
  if (save) save.disabled = !(qaValue() > 0 && qa.categoryId && accounts.some(x => x.id === qa.accountId));
}

function qaOpenTransfer() {
  const amt = qaValue();
  closeModal();
  openTransactionModal();
  setTimeout(() => {
    setTxType("transfer");
    if (amt > 0) { const el = document.getElementById("tx-amount"); if (el) el.value = amt; }
  }, 0);
}

async function qaSave() {
  const amount = qaValue();
  if (!(amount > 0) || !qa.categoryId || !qa.accountId) return;
  const btn = document.getElementById("qa-save"); if (btn) btn.disabled = true;
  const id = genId();
  const type = qa.type;
  const data = {
    id, type, amount,
    date: qa.date,
    accountId: qa.accountId,
    categoryId: qa.categoryId,
    toAccountId: null,
    description: (qa.desc || "").trim(),
    notes: "",
    userId: currentUserId,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  qaStoreSet("finances-last-account", qa.accountId);
  try {
    await db.collection("transactions").doc(id).set(data);
  } catch (e) {
    console.error(e);
    if (btn) btn.disabled = false;
    alert(e.message || "Erreur");
    return;
  }
  closeModal();
  qa = null;
  showToast(type === "income" ? t("income_added") : t("expense_added"), t("undo"), async () => {
    await db.collection("transactions").doc(id).delete();
  });
}

// Clavier physique : chiffres, virgule/point, Retour arrière, Entrée
document.addEventListener("keydown", (e) => {
  if (!qa || !document.getElementById("qa-sheet")) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (/^[0-9]$/.test(e.key)) { e.preventDefault(); qaKey(e.key); }
  else if (e.key === "," || e.key === "." || e.key === "Decimal") { e.preventDefault(); qaKey(","); }
  else if (e.key === "Backspace") { e.preventDefault(); qaKey("back"); }
  else if (e.key === "Enter" && tag !== "button") { e.preventDefault(); qaSave(); }
});

// ── Toast avec action (5 s) ───────────────────────────
function showToast(message, actionLabel, action, ms = 5000) {
  const root = document.getElementById("toast-root"); if (!root) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.innerHTML = `<span>${esc(message)}</span>${actionLabel ? `<button type="button" class="toast__action">${icon("undo", 16)} ${esc(actionLabel)}</button>` : ""}`;
  let done = false;
  const remove = () => { if (!done) { done = true; el.remove(); } };
  if (actionLabel) el.querySelector(".toast__action").onclick = async () => { remove(); try { await action(); } catch (e) { console.error(e); } };
  root.appendChild(el);
  setTimeout(remove, ms);
}
