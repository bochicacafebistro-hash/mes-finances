// ═══════════════════════════════════════════════════════════════
// PAGE DASHBOARD
// ═══════════════════════════════════════════════════════════════

function renderDashboard() {
  const totalBalance = accounts.reduce((s, a) => s + getAccountBalance(a), 0);
  const startMonth = monthStart(txFilterYear, txFilterMonth);
  const endMonth = monthEnd(txFilterYear, txFilterMonth);
  const monthly = getPeriodTotals(startMonth, endMonth);

  // 5 transactions récentes
  const recent = [...transactions].sort((a, b) => (b.date || "").localeCompare(a.date || "")).slice(0, 5);

  // Top dépenses par catégorie ce mois-ci
  const monthExpTx = transactions.filter(tx => tx.type === "expense" && tx.date && tx.date >= startMonth && tx.date <= endMonth);
  const byCat = {};
  monthExpTx.forEach(tx => {
    const cat = categories.find(c => c.id === tx.categoryId);
    const key = cat ? cat.id : "_none";
    if (!byCat[key]) byCat[key] = { cat, total: 0 };
    byCat[key].total += Number(tx.amount || 0);
  });
  const topCats = Object.values(byCat).sort((a, b) => b.total - a.total).slice(0, 5);

  let h = `<div class="page">
    <div class="dash-greeting">
      <h2 class="dash-greeting__title">${icon("bar-chart", 22)} ${t("dash_title")}</h2>
    </div>

    <!-- Stats principales -->
    <div class="dash-stats-grid">
      <div class="dash-stat-card" style="border-left-color:var(--accent)">
        <div class="dash-stat__head">
          <span style="color:var(--accent)">${icon("wallet", 16)}</span>
          <span class="dash-stat__label">${t("dash_total_balance")}</span>
        </div>
        <div class="dash-stat__value" style="color:${totalBalance >= 0 ? 'var(--status-green)' : 'var(--status-red)'}">${fmtMoney(totalBalance)}</div>
        <div class="dash-stat__delta" style="color:var(--text3)">${accounts.length} ${accounts.length > 1 ? "comptes" : "compte"}</div>
      </div>
      <div class="dash-stat-card" style="border-left-color:var(--status-green)">
        <div class="dash-stat__head">
          <span style="color:var(--status-green)">${icon("trending-up", 16)}</span>
          <span class="dash-stat__label">${t("dash_month_income")}</span>
        </div>
        <div class="dash-stat__value" style="color:var(--status-green)">${fmtMoney(monthly.income)}</div>
        <div class="dash-stat__delta" style="color:var(--text3)">${MONTHS_FR[txFilterMonth]} ${txFilterYear}</div>
      </div>
      <div class="dash-stat-card" style="border-left-color:var(--status-red)">
        <div class="dash-stat__head">
          <span style="color:var(--status-red)">${icon("trending-down", 16)}</span>
          <span class="dash-stat__label">${t("dash_month_expenses")}</span>
        </div>
        <div class="dash-stat__value" style="color:var(--status-red)">${fmtMoney(monthly.expense)}</div>
        <div class="dash-stat__delta" style="color:var(--text3)">${monthly.count} transactions</div>
      </div>
      <div class="dash-stat-card" style="border-left-color:${monthly.balance >= 0 ? 'var(--status-green)' : 'var(--status-red)'}">
        <div class="dash-stat__head">
          <span style="color:${monthly.balance >= 0 ? 'var(--status-green)' : 'var(--status-red)'}">${icon(monthly.balance >= 0 ? "trending-up" : "trending-down", 16)}</span>
          <span class="dash-stat__label">${t("dash_month_balance")}</span>
        </div>
        <div class="dash-stat__value" style="color:${monthly.balance >= 0 ? 'var(--status-green)' : 'var(--status-red)'}">${monthly.balance >= 0 ? "+" : ""}${fmtMoney(monthly.balance)}</div>
        <div class="dash-stat__delta" style="color:var(--text3)">${MONTHS_FR[txFilterMonth]} ${txFilterYear}</div>
      </div>
    </div>

    <!-- Mes comptes -->
    ${accounts.length > 0 ? `
      <div class="dash-card" style="margin-bottom:16px">
        <div class="dash-card__head">
          <h3 class="dash-card__title">${icon("wallet", 16)} ${t("dash_accounts_overview")}</h3>
          <button class="btn-icon-only" onclick="navTo('accounts')" aria-label="${t("dash_view_all")}">${icon("arrow-right", 14)}</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">
          ${accounts.map(a => {
            const bal = getAccountBalance(a);
            return `<div class="account-mini" style="border-left:4px solid ${a.color || 'var(--accent)'}">
              <div class="account-mini__name">${esc(a.name || "?")}</div>
              <div class="account-mini__type">${tAccountType(a.type)}</div>
              <div class="account-mini__balance" style="color:${bal >= 0 ? 'var(--text)' : 'var(--status-red)'}">${fmtMoney(bal)}</div>
            </div>`;
          }).join("")}
        </div>
      </div>
    ` : `
      <div class="empty">
        <div style="margin-bottom:12px;color:var(--text3);display:flex;justify-content:center">${icon("wallet", 48)}</div>
        ${t("dash_no_accounts")}
        <br/><br/>
        <button class="btn btn-primary" onclick="navTo('accounts')">${icon("plus", 16)} ${t("acc_add")}</button>
      </div>
    `}

    <!-- Grille du bas -->
    <div class="dash-grid">
      ${renderDashRecentTx(recent)}
      ${renderDashTopCategories(topCats)}
    </div>
  </div>`;
  return h;
}

function renderDashRecentTx(recent) {
  if (recent.length === 0) {
    return `<div class="dash-card">
      <div class="dash-card__head"><h3 class="dash-card__title">${icon("clipboard", 16)} ${t("dash_recent_tx")}</h3></div>
      <div class="dash-empty">${t("dash_no_tx")}</div>
    </div>`;
  }
  return `<div class="dash-card">
    <div class="dash-card__head">
      <h3 class="dash-card__title">${icon("clipboard", 16)} ${t("dash_recent_tx")}</h3>
      <button class="btn-icon-only" onclick="navTo('transactions')" aria-label="${t("dash_view_all")}">${icon("arrow-right", 14)}</button>
    </div>
    <ul class="dash-list">
      ${recent.map(tx => {
        const cat = categories.find(c => c.id === tx.categoryId);
        const acc = accounts.find(a => a.id === tx.accountId);
        const sign = tx.type === "income" ? "+" : tx.type === "expense" ? "-" : "";
        const color = tx.type === "income" ? "var(--status-green)" : tx.type === "expense" ? "var(--status-red)" : "var(--text2)";
        return `<li class="dash-list__item">
          <span class="dash-list__name">
            ${esc(tx.description || tCategoryName(cat) || "?")}<br/>
            <small style="color:var(--text3);font-size:10px">${fmtDateShort(tx.date)} · ${esc(acc?.name || "")}</small>
          </span>
          <span class="dash-list__value" style="color:${color};font-weight:700">${sign}${fmtMoney(tx.amount)}</span>
        </li>`;
      }).join("")}
    </ul>
  </div>`;
}

function renderDashTopCategories(topCats) {
  if (topCats.length === 0) {
    return `<div class="dash-card">
      <div class="dash-card__head"><h3 class="dash-card__title">${icon("pie-chart", 16)} ${t("dash_top_categories")}</h3></div>
      <div class="dash-empty">${t("dash_no_tx")}</div>
    </div>`;
  }
  const total = topCats.reduce((s, c) => s + c.total, 0);
  return `<div class="dash-card">
    <div class="dash-card__head"><h3 class="dash-card__title">${icon("pie-chart", 16)} ${t("dash_top_categories")}</h3></div>
    <ul class="dash-list">
      ${topCats.map(c => {
        const pct = total > 0 ? (c.total / total * 100).toFixed(0) : 0;
        const color = c.cat?.color || "var(--text3)";
        const name = c.cat ? tCategoryName(c.cat) : "—";
        return `<li class="dash-list__item">
          <span class="dash-list__name icon-inline">
            <span style="color:${color}">${icon(c.cat?.icon || "folder", 14)}</span>
            ${esc(name)}<br/>
            <small style="color:var(--text3);font-size:10px;margin-left:20px">${pct}%</small>
          </span>
          <span class="dash-list__value" style="color:var(--status-red);font-weight:700">${fmtMoney(c.total)}</span>
        </li>`;
      }).join("")}
    </ul>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// PAGE COMPTES
// ═══════════════════════════════════════════════════════════════

function renderAccounts() {
  let h = `<div class="page">
    <div class="toolbar">
      <div>
        <h2 style="font-size:18px">${t("acc_title")}</h2>
        <p style="font-size:13px;color:var(--text3);margin-top:2px">${t("acc_subtitle")}</p>
      </div>
      <button class="btn btn-primary" onclick="openAccountModal()">${icon("plus", 16)} ${t("acc_add")}</button>
    </div>`;

  if (accounts.length === 0) {
    h += `<div class="empty">
      <div style="margin-bottom:12px;color:var(--text3);display:flex;justify-content:center">${icon("wallet", 48)}</div>
      ${t("acc_no_accounts")}
    </div>`;
  } else {
    const total = accounts.reduce((s, a) => s + getAccountBalance(a), 0);
    h += `<div class="stat-grid" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr));margin-bottom:16px">
      <div class="stat-card">
        <div class="stat-num" style="color:${total >= 0 ? 'var(--accent)' : 'var(--status-red)'}">${fmtMoney(total)}</div>
        <div class="stat-label">${icon("wallet", 14)} ${t("dash_total_balance")}</div>
      </div>
    </div>`;

    h += `<div class="card-grid">`;
    accounts.forEach(a => {
      const bal = getAccountBalance(a);
      const txCount = transactions.filter(tx => tx.accountId === a.id || tx.toAccountId === a.id).length;
      h += `<div class="account-card" style="border-left:5px solid ${a.color || 'var(--accent)'}">
        <div class="account-card__head">
          <div style="flex:1;min-width:0">
            <h3 class="account-card__name">${esc(a.name || "?")}</h3>
            <div class="account-card__type icon-inline">${icon(ACCOUNT_TYPES.find(at => at.value === a.type)?.icon || "folder", 12)} ${tAccountType(a.type)}</div>
          </div>
          <div class="menu-wrap">
            <button class="dots-btn" onclick="toggleDrop('acc${a.id}')" aria-label="${t("actions")}">${icon("more-vertical", 16)}</button>
            <div class="dropdown" id="drop-acc${a.id}">
              <button onclick="openAccountModal('${a.id}');closeAllDrops()">${icon("pencil", 14)} ${t("edit")}</button>
              <div class="sep"></div>
              <button style="color:var(--status-red)" onclick="askDelete('accounts','${a.id}','${esc(a.name)}');closeAllDrops()">${icon("trash", 14)} ${t("delete")}</button>
            </div>
          </div>
        </div>
        <div class="account-card__balance" style="color:${bal >= 0 ? 'var(--text)' : 'var(--status-red)'}">${fmtMoney(bal)}</div>
        <div class="account-card__meta">
          <span>${t("acc_initial_balance")} : ${fmtMoney(a.initialBalance || 0)}</span>
          <span>${txCount} tx</span>
        </div>
        ${a.notes ? `<div class="account-card__notes">${esc(a.notes)}</div>` : ""}
      </div>`;
    });
    h += `</div>`;
  }
  return h + `</div>`;
}

// Modal Compte
function openAccountModal(id) {
  const a = id ? accounts.find(x => x.id === id) : null;
  const colors = ["#6b1a1f", "#27ae60", "#4a90e2", "#f5a623", "#e74c3c", "#8b5cf6", "#ec4899", "#14b8a6"];
  showModal(`<div class="modal">
    <div class="modal-header">
      <h3>${a ? t("acc_modal_edit") : t("acc_modal_add")}</h3>
      <button class="close-btn" onclick="closeModal()" aria-label="${t("close")}">${icon("x", 18)}</button>
    </div>
    <label>${t("acc_field_name")}<input id="a-name" value="${esc(a?.name || "")}" placeholder="ex: Chèques Desjardins"/></label>
    <div class="form-row">
      <label>${t("acc_field_type")}
        <select id="a-type">${ACCOUNT_TYPES.map(at => `<option value="${at.value}" ${(a?.type || "checking") === at.value ? "selected" : ""}>${tAccountType(at.value)}</option>`).join("")}</select>
      </label>
      <label>${t("acc_field_balance")}
        <input id="a-balance" type="number" step="0.01" value="${a?.initialBalance ?? 0}"/>
      </label>
    </div>
    <label>${t("acc_field_color")}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
        ${colors.map(c => `<button type="button" onclick="document.getElementById('a-color').value='${c}';document.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('active'));this.classList.add('active')" class="color-swatch ${(a?.color || colors[0]) === c ? "active" : ""}" style="background:${c}" aria-label="Color ${c}"></button>`).join("")}
      </div>
      <input type="hidden" id="a-color" value="${a?.color || colors[0]}"/>
    </label>
    <label>${t("acc_field_notes")}<textarea id="a-notes" style="height:60px">${esc(a?.notes || "")}</textarea></label>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">${t("cancel")}</button>
      <button class="btn btn-primary" onclick="saveAccount('${id || ""}')">${t("save")}</button>
    </div>
  </div>`);
}

async function saveAccount(id) {
  const name = document.getElementById("a-name").value.trim();
  if (!name) return alert(t("err_enter_name"));
  const data = {
    name,
    type: document.getElementById("a-type").value,
    initialBalance: Number(document.getElementById("a-balance").value) || 0,
    color: document.getElementById("a-color").value,
    notes: document.getElementById("a-notes").value.trim(),
    currency: DEFAULT_CURRENCY
  };
  if (id) await db.collection("accounts").doc(id).update(data);
  else { const nid = genId(); await db.collection("accounts").doc(nid).set({ ...data, id: nid, sortOrder: accounts.length }); }
  closeModal();
}

// ═══════════════════════════════════════════════════════════════
// PAGE TRANSACTIONS
// ═══════════════════════════════════════════════════════════════

function renderTransactions() {
  const startMonth = monthStart(txFilterYear, txFilterMonth);
  const endMonth = monthEnd(txFilterYear, txFilterMonth);

  let filtered = transactions.filter(tx => tx.date && tx.date >= startMonth && tx.date <= endMonth);
  if (txFilterAccount !== "all") filtered = filtered.filter(tx => tx.accountId === txFilterAccount || tx.toAccountId === txFilterAccount);
  if (txFilterCategory !== "all") filtered = filtered.filter(tx => tx.categoryId === txFilterCategory);
  if (txFilterType !== "all") filtered = filtered.filter(tx => tx.type === txFilterType);
  if (txSearchQuery) {
    const q = txSearchQuery.toLowerCase();
    filtered = filtered.filter(tx =>
      (tx.description || "").toLowerCase().includes(q) ||
      (tx.notes || "").toLowerCase().includes(q)
    );
  }
  filtered.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const totals = getPeriodTotals(startMonth, endMonth);
  const monthsArr = uiLang === "es" ? MONTHS_ES : MONTHS_FR;

  let h = `<div class="page">
    <div class="toolbar">
      <div>
        <h2 style="font-size:18px">${t("tx_title")}</h2>
      </div>
      <button class="btn btn-primary" onclick="openTransactionModal()">${icon("plus", 16)} ${t("tx_add")}</button>
    </div>

    <!-- Sélecteur de mois -->
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <button class="btn-icon-only" onclick="changeMonth(-1)" aria-label="${t("prev_month")}">${icon("chevron-left", 14)}</button>
      <div style="font-family:var(--font-heading);font-size:18px;font-weight:700;flex:1;text-align:center;letter-spacing:-.3px">${monthsArr[txFilterMonth]} ${txFilterYear}</div>
      <button class="btn-icon-only" onclick="changeMonth(1)" aria-label="${t("next_month")}">${icon("chevron-right", 14)}</button>
    </div>

    <!-- Stats du mois -->
    <div class="stat-grid" style="grid-template-columns:repeat(auto-fill,minmax(160px,1fr));margin-bottom:16px">
      <div class="stat-card" style="border-left:4px solid var(--status-green)">
        <div class="stat-num" style="color:var(--status-green);font-size:20px">${fmtMoney(totals.income)}</div>
        <div class="stat-label">${icon("trending-up", 14)} ${t("dash_month_income")}</div>
      </div>
      <div class="stat-card" style="border-left:4px solid var(--status-red)">
        <div class="stat-num" style="color:var(--status-red);font-size:20px">${fmtMoney(totals.expense)}</div>
        <div class="stat-label">${icon("trending-down", 14)} ${t("dash_month_expenses")}</div>
      </div>
      <div class="stat-card" style="border-left:4px solid ${totals.balance >= 0 ? 'var(--status-green)' : 'var(--status-red)'}">
        <div class="stat-num" style="color:${totals.balance >= 0 ? 'var(--status-green)' : 'var(--status-red)'};font-size:20px">${totals.balance >= 0 ? "+" : ""}${fmtMoney(totals.balance)}</div>
        <div class="stat-label">${icon("dollar-sign", 14)} ${t("dash_month_balance")}</div>
      </div>
    </div>

    <!-- Filtres -->
    <div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center">
      <div class="search-box" style="flex:1;min-width:160px">
        <span style="color:var(--text3);display:flex">${icon("search", 16)}</span>
        <input type="text" placeholder="${t("search")}" value="${esc(txSearchQuery)}" oninput="setTxSearch(this.value)"/>
      </div>
      <select onchange="setTxFilterType(this.value)" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:13px;width:auto">
        <option value="all" ${txFilterType==="all"?"selected":""}>${t("tx_filter_type")}</option>
        <option value="expense" ${txFilterType==="expense"?"selected":""}>${t("tx_type_expense")}</option>
        <option value="income" ${txFilterType==="income"?"selected":""}>${t("tx_type_income")}</option>
        <option value="transfer" ${txFilterType==="transfer"?"selected":""}>${t("tx_type_transfer")}</option>
      </select>
      <select onchange="setTxFilterAccount(this.value)" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:13px;width:auto">
        <option value="all">${t("tx_filter_account")}</option>
        ${accounts.map(a => `<option value="${a.id}" ${txFilterAccount===a.id?"selected":""}>${esc(a.name)}</option>`).join("")}
      </select>
      <select onchange="setTxFilterCategory(this.value)" style="padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:13px;width:auto">
        <option value="all">${t("tx_filter_category")}</option>
        ${categories.map(c => `<option value="${c.id}" ${txFilterCategory===c.id?"selected":""}>${tCategoryName(c)}</option>`).join("")}
      </select>
    </div>`;

  if (filtered.length === 0) {
    h += `<div class="empty">
      <div style="margin-bottom:12px;color:var(--text3);display:flex;justify-content:center">${icon("clipboard", 48)}</div>
      ${transactions.length === 0 ? t("tx_no_tx_first") : t("tx_no_tx")}
    </div>`;
  } else {
    h += `<div class="tx-list">`;
    filtered.forEach(tx => {
      const cat = categories.find(c => c.id === tx.categoryId);
      const acc = accounts.find(a => a.id === tx.accountId);
      const toAcc = accounts.find(a => a.id === tx.toAccountId);
      const sign = tx.type === "income" ? "+" : tx.type === "expense" ? "-" : "→";
      const color = tx.type === "income" ? "var(--status-green)" : tx.type === "expense" ? "var(--status-red)" : "var(--blue)";
      const catColor = cat?.color || "var(--text3)";
      h += `<div class="tx-row" onclick="openTransactionModal('${tx.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTransactionModal('${tx.id}')}">
        <div class="tx-row__icon" style="background:${catColor}20;color:${catColor}">${icon(cat?.icon || "folder", 16)}</div>
        <div class="tx-row__main">
          <div class="tx-row__desc">${esc(tx.description || tCategoryName(cat) || "?")}</div>
          <div class="tx-row__meta">
            ${esc(acc?.name || "")}
            ${tx.type === "transfer" && toAcc ? ` → ${esc(toAcc.name)}` : ""}
            ${cat ? ` · ${esc(tCategoryName(cat))}` : ""}
            · ${fmtDateShort(tx.date)}
          </div>
        </div>
        <div class="tx-row__amount" style="color:${color}">${sign}${fmtMoney(tx.amount)}</div>
        <div class="menu-wrap" onclick="event.stopPropagation()">
          <button class="dots-btn" onclick="toggleDrop('tx${tx.id}')" aria-label="${t("actions")}">${icon("more-vertical", 16)}</button>
          <div class="dropdown" id="drop-tx${tx.id}">
            <button onclick="openTransactionModal('${tx.id}');closeAllDrops()">${icon("pencil", 14)} ${t("edit")}</button>
            <div class="sep"></div>
            <button style="color:var(--status-red)" onclick="askDelete('transactions','${tx.id}','${esc(tx.description || "?")}');closeAllDrops()">${icon("trash", 14)} ${t("delete")}</button>
          </div>
        </div>
      </div>`;
    });
    h += `</div>`;
  }
  return h + `</div>`;
}

function setTxSearch(v) { txSearchQuery = v; renderPage(); }
function setTxFilterType(v) { txFilterType = v; renderPage(); }
function setTxFilterAccount(v) { txFilterAccount = v; renderPage(); }
function setTxFilterCategory(v) { txFilterCategory = v; renderPage(); }

// Modal Transaction
let txCurrentType = "expense";

function openTransactionModal(id) {
  const tx = id ? transactions.find(x => x.id === id) : null;
  txCurrentType = tx?.type || "expense";

  showModal(`<div class="modal" style="max-width:520px">
    <div class="modal-header">
      <h3>${tx ? t("tx_modal_edit") : t("tx_modal_add")}</h3>
      <button class="close-btn" onclick="closeModal()" aria-label="${t("close")}">${icon("x", 18)}</button>
    </div>

    <!-- Type tabs -->
    <div class="tx-type-tabs">
      <button type="button" class="tx-type-tab ${txCurrentType==="expense"?"active expense":""}" onclick="setTxType('expense')">${icon("trending-down", 14)} ${t("tx_type_expense")}</button>
      <button type="button" class="tx-type-tab ${txCurrentType==="income"?"active income":""}" onclick="setTxType('income')">${icon("trending-up", 14)} ${t("tx_type_income")}</button>
      <button type="button" class="tx-type-tab ${txCurrentType==="transfer"?"active transfer":""}" onclick="setTxType('transfer')">${icon("refresh", 14)} ${t("tx_type_transfer")}</button>
    </div>

    <div id="tx-form-content"></div>

    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">${t("cancel")}</button>
      <button class="btn btn-primary" onclick="saveTransaction('${id || ""}')">${t("save")}</button>
    </div>
  </div>`);
  renderTxFormContent(tx);
}

function setTxType(type) {
  txCurrentType = type;
  // Récupère les valeurs actuelles avant re-render
  const current = {
    amount: document.getElementById("tx-amount")?.value,
    date: document.getElementById("tx-date")?.value,
    accountId: document.getElementById("tx-account")?.value,
    toAccountId: document.getElementById("tx-to-account")?.value,
    categoryId: document.getElementById("tx-category")?.value,
    description: document.getElementById("tx-desc")?.value,
    notes: document.getElementById("tx-notes")?.value,
  };
  // Re-render seulement les tabs
  document.querySelectorAll(".tx-type-tab").forEach(btn => {
    const isActive = btn.textContent.trim().includes(t(`tx_type_${type}`));
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("expense", isActive && type === "expense");
    btn.classList.toggle("income", isActive && type === "income");
    btn.classList.toggle("transfer", isActive && type === "transfer");
    if (!isActive) btn.classList.remove("expense", "income", "transfer");
  });
  renderTxFormContent({ ...current, type });
}

function renderTxFormContent(tx) {
  const today = todayStr();
  const filteredCats = categories.filter(c => c.type === txCurrentType || (txCurrentType === "transfer" && false));
  const isTransfer = txCurrentType === "transfer";

  document.getElementById("tx-form-content").innerHTML = `
    <div class="form-row">
      <label>${t("tx_field_amount")}<input id="tx-amount" type="number" step="0.01" min="0" value="${tx?.amount ?? ""}" autofocus/></label>
      <label>${t("tx_field_date")}<input id="tx-date" type="date" value="${tx?.date || today}"/></label>
    </div>
    <label>${isTransfer ? "Du compte" : t("tx_field_account")}
      <select id="tx-account">
        <option value="">— ${t("tx_field_account")} —</option>
        ${accounts.map(a => `<option value="${a.id}" ${tx?.accountId === a.id ? "selected" : ""}>${esc(a.name)} (${fmtMoney(getAccountBalance(a))})</option>`).join("")}
      </select>
    </label>
    ${isTransfer ? `
      <label>${t("tx_field_to_account")}
        <select id="tx-to-account">
          <option value="">— ${t("tx_field_to_account")} —</option>
          ${accounts.map(a => `<option value="${a.id}" ${tx?.toAccountId === a.id ? "selected" : ""}>${esc(a.name)} (${fmtMoney(getAccountBalance(a))})</option>`).join("")}
        </select>
      </label>
    ` : `
      <label>${t("tx_field_category")}
        <select id="tx-category">
          <option value="">— ${t("tx_field_category")} —</option>
          ${filteredCats.map(c => `<option value="${c.id}" ${tx?.categoryId === c.id ? "selected" : ""}>${tCategoryName(c)}</option>`).join("")}
        </select>
      </label>
    `}
    <label>${t("tx_field_desc")}<input id="tx-desc" value="${esc(tx?.description || "")}" placeholder="ex: Épicerie Loblaws"/></label>
    <label>${t("tx_field_notes")}<textarea id="tx-notes" style="height:50px">${esc(tx?.notes || "")}</textarea></label>
  `;
}

async function saveTransaction(id) {
  const amount = Number(document.getElementById("tx-amount").value) || 0;
  if (!amount) return alert(t("err_enter_amount"));
  const accountId = document.getElementById("tx-account").value;
  if (!accountId) return alert(t("err_select_account"));

  const data = {
    type: txCurrentType,
    amount,
    date: document.getElementById("tx-date").value,
    accountId,
    description: document.getElementById("tx-desc").value.trim(),
    notes: document.getElementById("tx-notes").value.trim(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  if (txCurrentType === "transfer") {
    const toAccountId = document.getElementById("tx-to-account").value;
    if (!toAccountId) return alert(t("err_select_to_account"));
    if (toAccountId === accountId) return alert(t("err_same_account"));
    data.toAccountId = toAccountId;
    data.categoryId = null;
  } else {
    const categoryId = document.getElementById("tx-category").value;
    if (!categoryId) return alert(t("err_select_category"));
    data.categoryId = categoryId;
    data.toAccountId = null;
  }

  if (id) await db.collection("transactions").doc(id).update(data);
  else {
    const nid = genId();
    await db.collection("transactions").doc(nid).set({ ...data, id: nid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  }
  closeModal();
}

// ═══════════════════════════════════════════════════════════════
// PAGE CATÉGORIES
// ═══════════════════════════════════════════════════════════════

function renderCategoriesPage() {
  const expCats = categories.filter(c => c.type === "expense");
  const incCats = categories.filter(c => c.type === "income");

  let h = `<div class="page">
    <div class="toolbar">
      <div>
        <h2 style="font-size:18px">${t("cat_title")}</h2>
        <p style="font-size:13px;color:var(--text3);margin-top:2px">${t("cat_subtitle")}</p>
      </div>
      <button class="btn btn-primary" onclick="openCategoryModal()">${icon("plus", 16)} ${t("cat_add")}</button>
    </div>`;

  if (categories.length === 0) {
    h += `<div class="empty">
      <div style="margin-bottom:12px;color:var(--text3);display:flex;justify-content:center">${icon("tag", 48)}</div>
      <p style="margin-bottom:16px">Pas de catégories pour l'instant.</p>
      <button class="btn btn-primary" onclick="initDefaultCategories()">${icon("download", 14)} ${t("cat_init_defaults")}</button>
    </div>`;
  } else {
    // Section dépenses
    h += `<section class="cat-section">
      <h3 class="cat-section__title" style="border-color:var(--status-red)">
        <span style="color:var(--status-red)">${icon("trending-down", 14)}</span>
        ${t("cat_section_expenses")}
        <span class="cat-section__count">${expCats.length}</span>
      </h3>
      <div class="cat-grid">
        ${expCats.map(c => renderCategoryCard(c)).join("")}
      </div>
    </section>`;

    // Section revenus
    h += `<section class="cat-section">
      <h3 class="cat-section__title" style="border-color:var(--status-green)">
        <span style="color:var(--status-green)">${icon("trending-up", 14)}</span>
        ${t("cat_section_incomes")}
        <span class="cat-section__count">${incCats.length}</span>
      </h3>
      <div class="cat-grid">
        ${incCats.map(c => renderCategoryCard(c)).join("")}
      </div>
    </section>`;
  }
  return h + `</div>`;
}

function renderCategoryCard(c) {
  const txCount = transactions.filter(tx => tx.categoryId === c.id).length;
  return `<div class="cat-card" style="border-left:4px solid ${c.color || 'var(--text3)'}">
    <div class="cat-card__head">
      <div class="cat-card__icon" style="color:${c.color || 'var(--text3)'};background:${c.color ? c.color + '15' : 'var(--surface2)'}">${icon(c.icon || "folder", 18)}</div>
      <div style="flex:1;min-width:0">
        <div class="cat-card__name">${tCategoryName(c)}</div>
        <div class="cat-card__count">${txCount} tx</div>
      </div>
      <div class="menu-wrap">
        <button class="dots-btn" onclick="toggleDrop('cat${c.id}')" aria-label="${t("actions")}">${icon("more-vertical", 16)}</button>
        <div class="dropdown" id="drop-cat${c.id}">
          <button onclick="openCategoryModal('${c.id}');closeAllDrops()">${icon("pencil", 14)} ${t("edit")}</button>
          <div class="sep"></div>
          <button style="color:var(--status-red)" onclick="askDelete('categories','${c.id}','${esc(tCategoryName(c))}');closeAllDrops()">${icon("trash", 14)} ${t("delete")}</button>
        </div>
      </div>
    </div>
  </div>`;
}

async function initDefaultCategories() {
  for (const c of [...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES]) {
    const id = genId();
    await db.collection("categories").doc(id).set({ ...c, id });
  }
  alert(t("cat_init_done"));
}

// Modal Catégorie
function openCategoryModal(id) {
  const c = id ? categories.find(x => x.id === id) : null;
  const colors = ["#27ae60", "#e74c3c", "#4a90e2", "#f5a623", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6b1a1f", "#64748b"];
  const iconChoices = ["folder", "tag", "wallet", "utensils", "store", "package", "receipt", "shield-check", "dollar-sign", "trending-up", "trending-down", "star", "calendar"];

  showModal(`<div class="modal">
    <div class="modal-header">
      <h3>${c ? t("cat_modal_edit") : t("cat_modal_add")}</h3>
      <button class="close-btn" onclick="closeModal()" aria-label="${t("close")}">${icon("x", 18)}</button>
    </div>
    <label>${t("cat_field_name")} (FR)<input id="c-name-fr" value="${esc(c?.name_fr || c?.name || "")}"/></label>
    <label>${t("cat_field_name")} (ES)<input id="c-name-es" value="${esc(c?.name_es || "")}" placeholder="${t("optional")}"/></label>
    <label>${t("cat_field_type")}
      <select id="c-type">
        <option value="expense" ${(c?.type || "expense") === "expense" ? "selected" : ""}>${t("tx_type_expense")}</option>
        <option value="income" ${c?.type === "income" ? "selected" : ""}>${t("tx_type_income")}</option>
      </select>
    </label>
    <label>${t("cat_field_icon")}
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(40px,1fr));gap:6px;margin-top:6px">
        ${iconChoices.map(i => `<button type="button" onclick="document.getElementById('c-icon').value='${i}';document.querySelectorAll('.icon-swatch').forEach(s=>s.classList.remove('active'));this.classList.add('active')" class="icon-swatch ${(c?.icon || iconChoices[0]) === i ? "active" : ""}" aria-label="${i}">${icon(i, 18)}</button>`).join("")}
      </div>
      <input type="hidden" id="c-icon" value="${c?.icon || iconChoices[0]}"/>
    </label>
    <label>${t("cat_field_color")}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
        ${colors.map(col => `<button type="button" onclick="document.getElementById('c-color').value='${col}';document.querySelectorAll('.color-swatch').forEach(s=>s.classList.remove('active'));this.classList.add('active')" class="color-swatch ${(c?.color || colors[0]) === col ? "active" : ""}" style="background:${col}" aria-label="Color ${col}"></button>`).join("")}
      </div>
      <input type="hidden" id="c-color" value="${c?.color || colors[0]}"/>
    </label>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">${t("cancel")}</button>
      <button class="btn btn-primary" onclick="saveCategory('${id || ""}')">${t("save")}</button>
    </div>
  </div>`);
}

async function saveCategory(id) {
  const name_fr = document.getElementById("c-name-fr").value.trim();
  if (!name_fr) return alert(t("err_enter_name"));
  const data = {
    name_fr,
    name_es: document.getElementById("c-name-es").value.trim() || name_fr,
    type: document.getElementById("c-type").value,
    icon: document.getElementById("c-icon").value,
    color: document.getElementById("c-color").value
  };
  if (id) await db.collection("categories").doc(id).update(data);
  else { const nid = genId(); await db.collection("categories").doc(nid).set({ ...data, id: nid }); }
  closeModal();
}
