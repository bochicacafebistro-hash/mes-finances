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

  // Statut budget : compte les catégories en dépassement
  const budgetStatus = computeDashBudgetStatus(byCat);
  const monthsArr = uiLang === "es" ? MONTHS_ES : MONTHS_FR;

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

    <!-- Sélecteur de mois pour le dashboard -->
    <div class="dash-month-selector">
      <button class="btn-icon-only" onclick="changeMonth(-1)" aria-label="${t("prev_month")}">${icon("chevron-left", 14)}</button>
      <span class="dash-month-label">${monthsArr[txFilterMonth]} ${txFilterYear}</span>
      <button class="btn-icon-only" onclick="changeMonth(1)" aria-label="${t("next_month")}">${icon("chevron-right", 14)}</button>
    </div>

    <!-- Section Budget -->
    ${renderDashBudget(budgetStatus)}

    <!-- Graphiques -->
    <div class="dash-charts-grid">
      <div class="dash-card">
        <h3 class="dash-card__title">${icon("pie-chart", 16)} ${t("dash_top_categories")}</h3>
        <div style="position:relative;height:260px;margin-top:12px"><canvas id="chart-categories"></canvas></div>
      </div>
      <div class="dash-card">
        <h3 class="dash-card__title">${icon("bar-chart", 16)} Revenus vs Dépenses (6 derniers mois)</h3>
        <div style="position:relative;height:260px;margin-top:12px"><canvas id="chart-income-expense"></canvas></div>
      </div>
    </div>

    <div class="dash-card" style="margin-bottom:16px">
      <h3 class="dash-card__title">${icon("trending-up", 16)} Évolution du solde total (6 derniers mois)</h3>
      <div style="position:relative;height:240px;margin-top:12px"><canvas id="chart-balance-trend"></canvas></div>
    </div>

    <!-- Grille du bas -->
    <div class="dash-grid">
      ${renderDashRecentTx(recent)}
      ${renderDashTopCategories(topCats)}
    </div>
  </div>`;
  return h;
}

// ── Section Budget sur le dashboard ──────────────────
function computeDashBudgetStatus(byCat) {
  const items = [];
  let totalLimit = 0, totalSpent = 0;
  let over = 0, watch = 0;
  budgets.forEach(b => {
    const cat = categories.find(c => c.id === b.categoryId);
    if (!cat) return;
    const spent = byCat[b.categoryId]?.total || 0;
    const status = getBudgetStatus(spent, b.monthlyLimit);
    if (status.status === "over") over++;
    else if (status.status === "watch") watch++;
    totalLimit += Number(b.monthlyLimit || 0);
    totalSpent += spent;
    items.push({ cat, budget: b, spent, status });
  });
  // Tri : dépassements en premier, puis par % décroissant
  items.sort((a, b) => b.status.pct - a.status.pct);
  return { items, totalLimit, totalSpent, over, watch };
}

function renderDashBudget(bs) {
  if (bs.items.length === 0) {
    return `<div class="dash-card" style="margin-bottom:16px;border:1px dashed var(--border-strong)">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="color:var(--accent)">${icon("trending-up", 24)}</div>
        <div style="flex:1">
          <div style="font-weight:600;font-family:var(--font-heading)">${t("budget_summary")}</div>
          <div style="font-size:13px;color:var(--text3);margin-top:2px">${t("budget_none")}</div>
        </div>
        <button class="btn btn-primary" onclick="navTo('budget')">${icon("plus", 14)} ${t("budget_set_limit")}</button>
      </div>
    </div>`;
  }
  const remaining = bs.totalLimit - bs.totalSpent;
  const overallStatus = getBudgetStatus(bs.totalSpent, bs.totalLimit);
  return `<div class="dash-card" style="margin-bottom:16px">
    <div class="dash-card__head">
      <h3 class="dash-card__title">${icon("trending-up", 16)} ${t("budget_summary")}</h3>
      <button class="btn-icon-only" onclick="navTo('budget')" aria-label="${t("dash_view_all")}">${icon("arrow-right", 14)}</button>
    </div>
    <div class="budget-overview">
      <div class="budget-overview__stat">
        <div class="budget-overview__label">${t("budget_total_spent")}</div>
        <div class="budget-overview__value" style="color:${overallStatus.color}">${fmtMoney(bs.totalSpent)}</div>
        <div class="budget-overview__sublabel">/ ${fmtMoney(bs.totalLimit)}</div>
      </div>
      <div class="budget-overview__stat">
        <div class="budget-overview__label">${remaining >= 0 ? t("budget_remaining") : t("budget_exceeded")}</div>
        <div class="budget-overview__value" style="color:${remaining >= 0 ? 'var(--status-green)' : 'var(--status-red)'}">${fmtMoney(Math.abs(remaining))}</div>
        <div class="budget-overview__sublabel">${bs.over > 0 ? `${bs.over} ${t("budget_warnings")}` : bs.watch > 0 ? `${bs.watch} ${t("budget_watch")}` : t("budget_ok")}</div>
      </div>
    </div>
    <div class="budget-progress" style="margin-top:8px">
      <div class="budget-progress__bar">
        <div class="budget-progress__fill" style="width:${Math.min(overallStatus.pct, 100)}%;background:${overallStatus.color}"></div>
      </div>
    </div>
    <div class="budget-list-mini">
      ${bs.items.slice(0, 5).map(item => `
        <div class="budget-mini-row" onclick="openCategoryDetailModal('${item.cat.id}')" role="button" tabindex="0">
          <div class="budget-mini-row__head">
            <span class="budget-mini-row__name" style="color:${item.cat.color || 'var(--text3)'}">${tCategoryName(item.cat)}</span>
            <span class="budget-mini-row__amount">${fmtMoney(item.spent)} / ${fmtMoney(item.budget.monthlyLimit)}</span>
          </div>
          <div class="budget-progress__bar" style="height:6px">
            <div class="budget-progress__fill" style="width:${Math.min(item.status.pct, 100)}%;background:${item.status.color}"></div>
          </div>
        </div>
      `).join("")}
    </div>
  </div>`;
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
        return `<li class="dash-list__item dash-list__item--clickable" onclick="openTransactionModal('${tx.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTransactionModal('${tx.id}')}">
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
        const catId = c.cat?.id || "";
        return `<li class="dash-list__item dash-list__item--clickable" onclick="openCategoryDetailModal('${catId}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openCategoryDetailModal('${catId}')}">
          <span class="dash-list__name icon-inline">
            <span style="color:${color}">${icon(c.cat?.icon || "folder", 14)}</span>
            ${esc(name)}<br/>
            <small style="color:var(--text3);font-size:10px;margin-left:20px">${pct}% · ${t("cat_detail_tx_count", { n: c.count || transactions.filter(tx => tx.type==='expense' && tx.categoryId === catId && tx.date >= monthStart(txFilterYear, txFilterMonth) && tx.date <= monthEnd(txFilterYear, txFilterMonth)).length, s: '' }).replace('{s}', '')}</small>
          </span>
          <span class="dash-list__value" style="color:var(--status-red);font-weight:700">${fmtMoney(c.total)} ${icon("chevron-right", 12)}</span>
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
          <div class="account-card__actions">
            <button class="action-btn" onclick="openAccountModal('${a.id}')" title="${t("edit")}" aria-label="${t("edit")}">${icon("pencil", 14)}</button>
            <button class="action-btn action-btn--danger" onclick="askDelete('accounts','${a.id}','${esc(a.name)}')" title="${t("delete")}" aria-label="${t("delete")}">${icon("trash", 14)}</button>
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
    // Groupe les transactions par date
    const byDate = {};
    filtered.forEach(tx => {
      const d = tx.date || "0000-00-00";
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(tx);
    });
    const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

    h += `<div class="tx-list-v2">`;
    dates.forEach(date => {
      const dayTxs = byDate[date];
      const dayTotal = dayTxs.reduce((s, tx) => {
        if (tx.type === "income") return s + Number(tx.amount || 0);
        if (tx.type === "expense") return s - Number(tx.amount || 0);
        return s;
      }, 0);
      h += `<div class="tx-day-group">
        <div class="tx-day-header">
          <span class="tx-day-date">${fmtDateLong(date)}</span>
          <span class="tx-day-total" style="color:${dayTotal >= 0 ? 'var(--status-green)' : 'var(--status-red)'}">${dayTotal >= 0 ? "+" : ""}${fmtMoney(dayTotal)}</span>
        </div>
        <div class="tx-day-list">`;
      dayTxs.forEach(tx => {
        const cat = categories.find(c => c.id === tx.categoryId);
        const acc = accounts.find(a => a.id === tx.accountId);
        const toAcc = accounts.find(a => a.id === tx.toAccountId);
        const sign = tx.type === "income" ? "+" : tx.type === "expense" ? "−" : "";
        const color = tx.type === "income" ? "var(--status-green)" : tx.type === "expense" ? "var(--status-red)" : "var(--text2)";
        const catColor = cat?.color || "var(--text3)";
        const typeLabel = tx.type === "transfer" ? t("tx_type_transfer") : "";
        h += `<div class="tx-item" onclick="openTransactionModal('${tx.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openTransactionModal('${tx.id}')}">
          <div class="tx-item__body">
            <div class="tx-item__top">
              <span class="tx-item__desc">${esc(tx.description || tCategoryName(cat) || "—")}</span>
              <span class="tx-item__amount" style="color:${color}">${sign}${fmtMoney(tx.amount)}</span>
            </div>
            <div class="tx-item__bottom">
              ${cat ? `<span class="tx-pill" style="background:${catColor}15;color:${catColor};border-color:${catColor}40">${esc(tCategoryName(cat))}</span>` : typeLabel ? `<span class="tx-pill" style="background:var(--surface2);color:var(--text2)">${typeLabel}</span>` : ""}
              <span class="tx-account-name">${esc(acc?.name || "")}${tx.type === "transfer" && toAcc ? ` → ${esc(toAcc.name)}` : ""}</span>
            </div>
          </div>
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
      h += `</div></div>`;
    });
    h += `</div>`;
  }
  return h + `</div>`;
}

// Formateur de date long : "jeudi 5 mars"
function fmtDateLong(d) {
  if (!d) return "";
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString(uiLang === "es" ? "es-ES" : "fr-CA", {
    weekday: "long", day: "numeric", month: "long"
  });
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

  // Si on venait d'une modal de détail (abonnement, catégorie), on y retourne
  if (window._txEditReturn) {
    const ret = window._txEditReturn;
    window._txEditReturn = null;
    setTimeout(() => {
      if (ret.page === "sub") openSubscriptionDetailModal(ret.key);
      else if (ret.page === "cat") openCategoryDetailModal(ret.key);
    }, 100);
  }
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

// ═══════════════════════════════════════════════════════════════
// GRAPHIQUES DASHBOARD (Chart.js)
// ═══════════════════════════════════════════════════════════════

let _chartInstances = {};

function initDashCharts() {
  // Détruit les anciennes instances pour éviter les fuites mémoire
  Object.values(_chartInstances).forEach(c => { try { c.destroy(); } catch(e){} });
  _chartInstances = {};

  if (typeof Chart === "undefined") return;

  const isDark = document.body.classList.contains("dark");
  const textColor = isDark ? "#e8d5b8" : "#1a1a1a";
  const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  Chart.defaults.color = textColor;
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";

  // ── Doughnut : répartition des dépenses par catégorie (mois courant) ──
  const catCanvas = document.getElementById("chart-categories");
  if (catCanvas) {
    const start = monthStart(txFilterYear, txFilterMonth);
    const end = monthEnd(txFilterYear, txFilterMonth);
    const expTx = transactions.filter(tx => tx.type === "expense" && tx.date >= start && tx.date <= end);
    const byCat = {};
    expTx.forEach(tx => {
      const cat = categories.find(c => c.id === tx.categoryId);
      const key = cat ? cat.id : "_none";
      if (!byCat[key]) byCat[key] = { name: cat ? tCategoryName(cat) : "—", color: cat?.color || "#999", total: 0 };
      byCat[key].total += Number(tx.amount || 0);
    });
    const sorted = Object.values(byCat).sort((a, b) => b.total - a.total);
    if (sorted.length > 0) {
      _chartInstances.categories = new Chart(catCanvas, {
        type: "doughnut",
        data: {
          labels: sorted.map(c => c.name),
          datasets: [{
            data: sorted.map(c => c.total),
            backgroundColor: sorted.map(c => c.color),
            borderWidth: 2,
            borderColor: isDark ? "#13100f" : "#ffffff"
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "60%",
          plugins: {
            legend: { position: "right", labels: { boxWidth: 12, padding: 10, font: { size: 11 } } },
            tooltip: {
              callbacks: {
                label: (ctx) => ` ${ctx.label}: ${fmtMoney(ctx.parsed)}`
              }
            }
          }
        }
      });
    } else {
      catCanvas.parentElement.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text3);font-size:13px">Aucune dépense ce mois-ci</div>`;
    }
  }

  // ── Bar : revenus vs dépenses sur 6 mois ──
  const ieCanvas = document.getElementById("chart-income-expense");
  if (ieCanvas) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = offsetMonth(txFilterYear, txFilterMonth, -i);
      const s = monthStart(m.year, m.month);
      const e = monthEnd(m.year, m.month);
      const totals = getPeriodTotals(s, e);
      months.push({
        label: (uiLang === "es" ? MONTHS_ES : MONTHS_FR)[m.month].slice(0, 3) + " " + String(m.year).slice(-2),
        income: totals.income,
        expense: totals.expense
      });
    }
    _chartInstances.incomeExpense = new Chart(ieCanvas, {
      type: "bar",
      data: {
        labels: months.map(m => m.label),
        datasets: [
          { label: "Revenus", data: months.map(m => m.income), backgroundColor: "#27ae60", borderRadius: 4 },
          { label: "Dépenses", data: months.map(m => m.expense), backgroundColor: "#e74c3c", borderRadius: 4 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: (v) => v >= 1000 ? (v/1000).toFixed(0) + "k" : v } }
        }
      }
    });
  }

  // ── Line : évolution du solde total sur 6 mois ──
  const trendCanvas = document.getElementById("chart-balance-trend");
  if (trendCanvas) {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const m = offsetMonth(txFilterYear, txFilterMonth, -i);
      const endOfMonth = monthEnd(m.year, m.month);
      // Calcule le solde à la fin du mois en simulant
      const balance = accounts.reduce((s, a) => {
        const initial = Number(a.initialBalance || 0);
        const delta = transactions.reduce((ds, tx) => {
          if (tx.date > endOfMonth) return ds;
          const amt = Number(tx.amount || 0);
          if (tx.type === "income" && tx.accountId === a.id) return ds + amt;
          if (tx.type === "expense" && tx.accountId === a.id) return ds - amt;
          if (tx.type === "transfer") {
            if (tx.accountId === a.id) return ds - amt;
            if (tx.toAccountId === a.id) return ds + amt;
          }
          return ds;
        }, 0);
        return s + initial + delta;
      }, 0);
      months.push({
        label: (uiLang === "es" ? MONTHS_ES : MONTHS_FR)[m.month].slice(0, 3) + " " + String(m.year).slice(-2),
        balance
      });
    }
    _chartInstances.balanceTrend = new Chart(trendCanvas, {
      type: "line",
      data: {
        labels: months.map(m => m.label),
        datasets: [{
          label: "Solde total",
          data: months.map(m => m.balance),
          borderColor: "#6b1a1f",
          backgroundColor: "rgba(107, 26, 31, 0.1)",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: "#6b1a1f",
          borderWidth: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => " " + fmtMoney(ctx.parsed.y) } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: gridColor }, ticks: { font: { size: 10 }, callback: (v) => v >= 1000 ? (v/1000).toFixed(0) + "k" : v } }
        }
      }
    });
  }
}

// ═══════════════════════════════════════════════════════════════
// MODAL DÉTAIL D'UNE CATÉGORIE (depuis top dépenses)
// ═══════════════════════════════════════════════════════════════

function openCategoryDetailModal(categoryId) {
  if (!categoryId) return;
  const cat = categories.find(c => c.id === categoryId);
  if (!cat) return;
  const start = monthStart(txFilterYear, txFilterMonth);
  const end = monthEnd(txFilterYear, txFilterMonth);
  const txs = transactions
    .filter(tx => tx.type === "expense" && tx.categoryId === categoryId && tx.date >= start && tx.date <= end)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const total = txs.reduce((s, tx) => s + Number(tx.amount || 0), 0);
  const monthsArr = uiLang === "es" ? MONTHS_ES : MONTHS_FR;
  const budget = getBudgetForCategory(categoryId);
  const status = budget ? getBudgetStatus(total, budget.monthlyLimit) : null;

  showModal(`<div class="modal" style="max-width:620px">
    <div class="modal-header">
      <h3 class="icon-inline"><span style="color:${cat.color || 'var(--accent)'}">${icon(cat.icon || "folder", 18)}</span> ${tCategoryName(cat)}</h3>
      <button class="close-btn" onclick="closeModal()" aria-label="${t("close")}">${icon("x", 18)}</button>
    </div>
    <div style="padding:0 4px">
      <div style="display:flex;gap:16px;align-items:baseline;margin-bottom:8px">
        <div>
          <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">${monthsArr[txFilterMonth]} ${txFilterYear}</div>
          <div style="font-family:var(--font-heading);font-size:28px;font-weight:700;color:var(--status-red)">${fmtMoney(total)}</div>
          <div style="font-size:12px;color:var(--text3)">${txs.length} transaction${txs.length>1?"s":""}</div>
        </div>
        ${budget ? `
        <div style="flex:1">
          <div style="font-size:11px;color:var(--text3);margin-bottom:4px">${t("budget_monthly_limit")} : ${fmtMoney(budget.monthlyLimit)}</div>
          <div class="budget-progress__bar"><div class="budget-progress__fill" style="width:${Math.min(status.pct,100)}%;background:${status.color}"></div></div>
          <div style="font-size:11px;color:${status.color};margin-top:4px;font-weight:600">${status.pct.toFixed(0)}% ${status.status === 'over' ? '· ' + t('budget_over') : status.status === 'watch' ? '· ' + t('budget_watch') : '· ' + t('budget_ok')}</div>
        </div>
        ` : `
        <div style="flex:1;text-align:right">
          <button class="btn" style="font-size:12px" onclick="closeModal();openBudgetModal('${categoryId}')">${icon("plus", 12)} ${t("budget_set_limit")}</button>
        </div>
        `}
      </div>
      <div style="max-height:360px;overflow-y:auto;margin:0 -4px">
        ${txs.length === 0 ? `<div class="empty">Aucune transaction</div>` : txs.map(tx => {
          const acc = accounts.find(a => a.id === tx.accountId);
          return `<div class="tx-item" style="border-bottom:1px solid var(--border)" onclick="closeModal();openTransactionModalThenReturnTo('${tx.id}','cat','${categoryId}')" role="button" tabindex="0">
            <div class="tx-item__body">
              <div class="tx-item__top">
                <span class="tx-item__desc">${esc(tx.description || "—")}</span>
                <span class="tx-item__amount" style="color:var(--status-red)">−${fmtMoney(tx.amount)}</span>
              </div>
              <div class="tx-item__bottom">
                <span class="tx-account-name">${fmtDateLong(tx.date)} · ${esc(acc?.name || "")}</span>
                ${tx.notes ? `<span style="color:var(--text2);font-style:italic;font-size:11px">📝 ${esc(tx.notes)}</span>` : ""}
              </div>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  </div>`);
}

// ═══════════════════════════════════════════════════════════════
// PAGE BUDGET
// ═══════════════════════════════════════════════════════════════

function renderBudgetPage() {
  const expCats = categories.filter(c => c.type === "expense");
  const start = monthStart(txFilterYear, txFilterMonth);
  const end = monthEnd(txFilterYear, txFilterMonth);
  const monthsArr = uiLang === "es" ? MONTHS_ES : MONTHS_FR;

  // Calcul des dépenses par catégorie pour le mois courant
  const spendByCat = {};
  transactions.filter(tx => tx.type === "expense" && tx.date >= start && tx.date <= end).forEach(tx => {
    const k = tx.categoryId || "_none";
    spendByCat[k] = (spendByCat[k] || 0) + Number(tx.amount || 0);
  });

  const totalLimit = budgets.reduce((s, b) => s + Number(b.monthlyLimit || 0), 0);
  const totalSpent = budgets.reduce((s, b) => s + (spendByCat[b.categoryId] || 0), 0);
  const overall = getBudgetStatus(totalSpent, totalLimit);

  let h = `<div class="page">
    <div class="toolbar">
      <div>
        <h2 style="font-size:18px">${t("budget_title")}</h2>
        <p style="font-size:13px;color:var(--text3);margin-top:2px">${t("budget_subtitle")}</p>
      </div>
    </div>

    <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;flex-wrap:wrap">
      <button class="btn-icon-only" onclick="changeMonth(-1)" aria-label="${t("prev_month")}">${icon("chevron-left", 14)}</button>
      <div style="font-family:var(--font-heading);font-size:18px;font-weight:700;flex:1;text-align:center;letter-spacing:-.3px">${monthsArr[txFilterMonth]} ${txFilterYear}</div>
      <button class="btn-icon-only" onclick="changeMonth(1)" aria-label="${t("next_month")}">${icon("chevron-right", 14)}</button>
    </div>`;

  // Résumé global du budget
  if (budgets.length > 0) {
    h += `<div class="card" style="padding:20px;margin-bottom:20px;background:var(--surface);border:1px solid var(--border);border-radius:12px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;gap:16px;flex-wrap:wrap;margin-bottom:12px">
        <div>
          <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">${t("budget_total_spent")}</div>
          <div style="font-family:var(--font-heading);font-size:32px;font-weight:700;color:${overall.color}">${fmtMoney(totalSpent)}</div>
          <div style="font-size:13px;color:var(--text3)">/ ${fmtMoney(totalLimit)} ${t("budget_total_limit").toLowerCase()}</div>
        </div>
        <div style="text-align:right">
          <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">${totalSpent <= totalLimit ? t("budget_remaining") : t("budget_exceeded")}</div>
          <div style="font-family:var(--font-heading);font-size:24px;font-weight:700;color:${totalSpent <= totalLimit ? 'var(--status-green)' : 'var(--status-red)'}">${fmtMoney(Math.abs(totalLimit - totalSpent))}</div>
        </div>
      </div>
      <div class="budget-progress__bar"><div class="budget-progress__fill" style="width:${Math.min(overall.pct, 100)}%;background:${overall.color}"></div></div>
    </div>`;
  }

  // Liste de toutes les catégories de dépenses
  h += `<div class="budget-list">`;
  expCats.forEach(cat => {
    const budget = budgets.find(b => b.categoryId === cat.id);
    const spent = spendByCat[cat.id] || 0;
    const limit = budget?.monthlyLimit || 0;
    const status = getBudgetStatus(spent, limit);
    const hasbudget = !!budget;

    h += `<div class="budget-row" style="border-left:4px solid ${cat.color || 'var(--text3)'}">
      <div class="budget-row__head">
        <div class="budget-row__name-block">
          <div class="budget-row__icon" style="color:${cat.color};background:${cat.color}15">${icon(cat.icon || "folder", 16)}</div>
          <div style="min-width:0">
            <div class="budget-row__name">${tCategoryName(cat)}</div>
            <div class="budget-row__sub">
              ${hasbudget ? `${fmtMoney(spent)} / ${fmtMoney(limit)}` : `${fmtMoney(spent)} · ${t("budget_no_limit")}`}
            </div>
          </div>
        </div>
        <div class="budget-row__actions">
          ${hasbudget ? `
            <span class="budget-row__status" style="color:${status.color}">${status.pct.toFixed(0)}%</span>
            <button class="action-btn" onclick="openBudgetModal('${cat.id}')" title="${t("budget_edit")}">${icon("pencil", 14)}</button>
            <button class="action-btn action-btn--danger" onclick="removeBudget('${budget.id}', '${esc(tCategoryName(cat))}')" title="${t("budget_remove")}">${icon("trash", 14)}</button>
          ` : `
            <button class="btn btn-primary" style="padding:6px 12px;font-size:12px" onclick="openBudgetModal('${cat.id}')">${icon("plus", 12)} ${t("budget_set_limit")}</button>
          `}
        </div>
      </div>
      ${hasbudget ? `<div class="budget-progress__bar" style="margin-top:10px"><div class="budget-progress__fill" style="width:${Math.min(status.pct, 100)}%;background:${status.color}"></div></div>` : ""}
    </div>`;
  });
  h += `</div>`;

  return h + `</div>`;
}

function openBudgetModal(categoryId) {
  const cat = categories.find(c => c.id === categoryId);
  if (!cat) return;
  const existing = budgets.find(b => b.categoryId === categoryId);

  showModal(`<div class="modal">
    <div class="modal-header">
      <h3>${existing ? t("budget_edit") : t("budget_set_limit")}</h3>
      <button class="close-btn" onclick="closeModal()" aria-label="${t("close")}">${icon("x", 18)}</button>
    </div>
    <div style="padding:0 4px;margin-bottom:16px">
      <div style="font-size:14px;color:var(--text2)">${t("tx_field_category")} :</div>
      <div class="icon-inline" style="font-weight:600;margin-top:4px">
        <span style="color:${cat.color || 'var(--accent)'}">${icon(cat.icon || "folder", 16)}</span>
        ${tCategoryName(cat)}
      </div>
    </div>
    <label>${t("budget_monthly_limit")}
      <input id="b-limit" type="number" step="0.01" min="0" value="${existing?.monthlyLimit || ""}" placeholder="ex: 500" autofocus/>
    </label>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">${t("cancel")}</button>
      <button class="btn btn-primary" onclick="saveBudget('${categoryId}','${existing?.id || ""}')">${t("save")}</button>
    </div>
  </div>`);
}

async function saveBudget(categoryId, existingId) {
  const limit = Number(document.getElementById("b-limit").value) || 0;
  if (limit <= 0) return alert(t("err_enter_amount"));
  const data = {
    categoryId,
    monthlyLimit: limit,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  if (existingId) {
    await db.collection("budgets").doc(existingId).update(data);
  } else {
    const nid = genId();
    await db.collection("budgets").doc(nid).set({ ...data, id: nid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  }
  closeModal();
}

async function removeBudget(budgetId, catName) {
  openConfirm(t("budget_remove"), `Retirer le budget de "${catName}" ?`, async () => {
    await db.collection("budgets").doc(budgetId).delete();
  }, true);
}

// ═══════════════════════════════════════════════════════════════
// PAGE ABONNEMENTS
// ═══════════════════════════════════════════════════════════════

function renderSubscriptionsPage() {
  const detected = detectRecurringTransactions();

  // Sépare : confirmés, ignorés, suggestions
  const confirmed = [];
  const ignored = [];
  const suggestions = [];
  detected.forEach(sub => {
    const state = getSubscriptionState(sub.key);
    if (state?.status === "confirmed") confirmed.push({ ...sub, _state: state });
    else if (state?.status === "ignored") ignored.push({ ...sub, _state: state });
    else suggestions.push(sub);
  });

  const totalMonthly = confirmed.reduce((s, sub) => s + sub.monthlyCost, 0);

  let h = `<div class="page">
    <div class="toolbar">
      <div>
        <h2 style="font-size:18px">${t("sub_title")}</h2>
        <p style="font-size:13px;color:var(--text3);margin-top:2px">${t("sub_subtitle")}</p>
      </div>
    </div>`;

  // Résumé
  if (confirmed.length > 0) {
    h += `<div class="card" style="padding:20px;margin-bottom:20px;background:linear-gradient(135deg, var(--surface), var(--surface2));border:1px solid var(--border);border-radius:12px">
      <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:baseline">
        <div>
          <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">${t("sub_estimated_total")}</div>
          <div style="font-family:var(--font-heading);font-size:32px;font-weight:700;color:var(--accent)">${fmtMoney(totalMonthly)}</div>
          <div style="font-size:13px;color:var(--text3)">/mois · ${fmtMoney(totalMonthly * 12)} / an</div>
        </div>
        <div>
          <div style="font-size:12px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">${t("sub_confirmed")}</div>
          <div style="font-family:var(--font-heading);font-size:32px;font-weight:700">${confirmed.length}</div>
        </div>
      </div>
    </div>`;
  }

  if (detected.length === 0) {
    h += `<div class="empty">
      <div style="margin-bottom:12px;color:var(--text3);display:flex;justify-content:center">${icon("refresh", 48)}</div>
      ${t("sub_none_detected")}
    </div>`;
  } else {
    // Section confirmés
    if (confirmed.length > 0) {
      h += renderSubSection(t("sub_confirmed"), confirmed, "confirmed");
    }
    // Section suggestions
    if (suggestions.length > 0) {
      h += renderSubSection(t("sub_suggestions") + " · " + t("sub_auto_detected"), suggestions, "suggestion");
    }
    // Section ignorés
    if (ignored.length > 0) {
      h += `<details style="margin-top:16px"><summary style="cursor:pointer;font-weight:600;color:var(--text3);padding:8px 0">${t("sub_ignored")} (${ignored.length})</summary>` +
           renderSubSection("", ignored, "ignored") + `</details>`;
    }
  }

  return h + `</div>`;
}

function renderSubSection(title, subs, kind) {
  let h = title ? `<h3 class="cat-section__title" style="border-color:var(--accent);margin-top:20px">
    <span style="color:var(--accent)">${icon("refresh", 14)}</span>
    ${title}
    <span class="cat-section__count">${subs.length}</span>
  </h3>` : "";

  h += `<div class="sub-list">`;
  subs.forEach(sub => {
    const cat = categories.find(c => c.id === sub.categoryId);
    const acc = accounts.find(a => a.id === sub.accountId);
    const freqLabel = t("sub_" + sub.frequency) || sub.frequency;

    h += `<div class="sub-row sub-row--clickable" style="border-left:4px solid ${cat?.color || 'var(--text3)'}" onclick="openSubscriptionDetailModal('${sub.key}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openSubscriptionDetailModal('${sub.key}')}">
      <div class="sub-row__main">
        <div class="sub-row__name">${esc(sub.name)}</div>
        <div class="sub-row__meta">
          ${cat ? `<span class="tx-pill" style="background:${cat.color}15;color:${cat.color};border-color:${cat.color}40">${esc(tCategoryName(cat))}</span>` : ""}
          <span>${freqLabel}</span>
          <span>·</span>
          <span>${sub.occurrences} ${t("sub_occurrences")}</span>
          <span>·</span>
          <span>${t("sub_last_charge")} ${fmtDateShort(sub.lastDate)}</span>
        </div>
      </div>
      <div class="sub-row__amount-block">
        <div class="sub-row__amount">${fmtMoney(sub.amount)}</div>
        <div class="sub-row__monthly">≈ ${fmtMoney(sub.monthlyCost)}/mois</div>
      </div>
      <div class="sub-row__actions" onclick="event.stopPropagation()">
        ${kind === "suggestion" ? `
          <button class="action-btn action-btn--primary" onclick="confirmSubscription('${sub.key}','${esc(sub.name).replace(/'/g,"\\'")}','${sub.amount}','${sub.frequency}','${sub.accountId||""}','${sub.categoryId||""}')" title="${t("sub_confirm")}">${icon("check", 14)}</button>
          <button class="action-btn" onclick="ignoreSubscription('${sub.key}','${esc(sub.name).replace(/'/g,"\\'")}')" title="${t("sub_ignore")}">${icon("x", 14)}</button>
        ` : `
          <button class="action-btn action-btn--danger" onclick="unconfirmSubscription('${sub._state?.id || ""}')" title="${t("sub_unconfirm")}">${icon("trash", 14)}</button>
        `}
      </div>
    </div>`;
  });
  h += `</div>`;
  return h;
}

// ═══════════════════════════════════════════════════════════════
// MODAL DÉTAIL D'UN ABONNEMENT (toutes les transactions liées)
// ═══════════════════════════════════════════════════════════════

function openSubscriptionDetailModal(subKey) {
  if (!subKey) return;
  // Re-détecte pour récupérer les IDs frais
  const detected = detectRecurringTransactions();
  const sub = detected.find(s => s.key === subKey);
  if (!sub) return alert("Groupe introuvable.");

  // Récupère les transactions complètes
  const txs = sub.transactionIds
    .map(id => transactions.find(tx => tx.id === id))
    .filter(Boolean)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  const cat = categories.find(c => c.id === sub.categoryId);
  const total = txs.reduce((s, tx) => s + Number(tx.amount || 0), 0);
  const freqLabel = t("sub_" + sub.frequency) || sub.frequency;

  showModal(`<div class="modal" style="max-width:680px">
    <div class="modal-header">
      <h3 class="icon-inline">${icon("refresh", 18)} ${esc(sub.name)}</h3>
      <button class="close-btn" onclick="closeModal()" aria-label="${t("close")}">${icon("x", 18)}</button>
    </div>
    <div style="padding:0 4px">
      <!-- Résumé -->
      <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:baseline;margin-bottom:12px;padding:12px;background:var(--surface2);border-radius:10px">
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Total payé</div>
          <div style="font-family:var(--font-heading);font-size:22px;font-weight:700;color:var(--accent)">${fmtMoney(total)}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Coût mensuel</div>
          <div style="font-family:var(--font-heading);font-size:18px;font-weight:600">≈ ${fmtMoney(sub.monthlyCost)}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Fréquence</div>
          <div style="font-size:14px;font-weight:600">${freqLabel} · ${sub.occurrences} ${t("sub_occurrences")}</div>
        </div>
        ${cat ? `<div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.5px">Catégorie actuelle</div>
          <span class="tx-pill" style="background:${cat.color}15;color:${cat.color};border-color:${cat.color}40;display:inline-block;margin-top:4px">${esc(tCategoryName(cat))}</span>
        </div>` : ""}
      </div>

      <!-- Bouton bulk recategorize -->
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
        <select id="bulk-cat-select" style="padding:8px 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:13px;flex:1;min-width:200px">
          <option value="">— ${t("tx_field_category")} —</option>
          ${categories.filter(c => c.type === "expense").map(c => `
            <option value="${c.id}" ${sub.categoryId === c.id ? "selected" : ""}>${tCategoryName(c)}</option>
          `).join("")}
        </select>
        <button class="btn btn-primary" onclick="bulkRecategorizeSubscription('${subKey}')">${icon("refresh", 14)} ${t("sub_bulk_recategorize")}</button>
      </div>

      <div style="font-size:12px;color:var(--text3);margin-bottom:8px">${t("tx_edit_note")}</div>

      <!-- Liste des transactions -->
      <div style="max-height:380px;overflow-y:auto;margin:0 -4px">
        ${txs.map(tx => {
          const acc = accounts.find(a => a.id === tx.accountId);
          const txCat = categories.find(c => c.id === tx.categoryId);
          return `<div class="tx-item" style="border-bottom:1px solid var(--border)" onclick="closeModal();openTransactionModalThenReturnTo('${tx.id}','sub','${subKey}')" role="button" tabindex="0">
            <div class="tx-item__body">
              <div class="tx-item__top">
                <span class="tx-item__desc">${esc(tx.description || "—")}</span>
                <span class="tx-item__amount" style="color:var(--status-red)">−${fmtMoney(tx.amount)}</span>
              </div>
              <div class="tx-item__bottom">
                ${txCat ? `<span class="tx-pill" style="background:${txCat.color}15;color:${txCat.color};border-color:${txCat.color}40">${esc(tCategoryName(txCat))}</span>` : ""}
                <span class="tx-account-name">${fmtDateLong(tx.date)} · ${esc(acc?.name || "")}</span>
                ${tx.notes ? `<span style="color:var(--text2);font-style:italic">📝 ${esc(tx.notes)}</span>` : ""}
              </div>
            </div>
          </div>`;
        }).join("")}
      </div>
    </div>
  </div>`);
}

// Bulk re-categorize : met à jour toutes les transactions d'un groupe
async function bulkRecategorizeSubscription(subKey) {
  const newCatId = document.getElementById("bulk-cat-select").value;
  if (!newCatId) return alert(t("err_select_category"));
  const newCat = categories.find(c => c.id === newCatId);
  if (!newCat) return;

  const detected = detectRecurringTransactions();
  const sub = detected.find(s => s.key === subKey);
  if (!sub) return;

  const txIds = sub.transactionIds;
  const msg = t("sub_bulk_confirm", { n: txIds.length, s: txIds.length > 1 ? "s" : "", cat: tCategoryName(newCat) });

  openConfirm(t("sub_bulk_title", { n: txIds.length, s: txIds.length > 1 ? "s" : "" }), msg, async () => {
    // Update en batch (Firestore limite à 500 par batch)
    const batch = db.batch();
    txIds.forEach(id => {
      batch.update(db.collection("transactions").doc(id), {
        categoryId: newCatId,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
    await batch.commit();

    // Si l'abonnement est confirmé, mettre à jour aussi sa catégorie
    const subState = subscriptions.find(s => s.key === subKey);
    if (subState) {
      await db.collection("subscriptions").doc(subState.id).update({ categoryId: newCatId });
    }

    alert(t("sub_bulk_done", { n: txIds.length, s: txIds.length > 1 ? "s" : "" }));
  });
}

// Wrapper pour ouvrir la modal de transaction et revenir après save
// (pour le moment on ferme juste la modal de détail et on ouvre la modal de transaction normalement)
function openTransactionModalThenReturnTo(txId, returnPage, returnKey) {
  // On stocke le retour souhaité
  window._txEditReturn = { page: returnPage, key: returnKey };
  openTransactionModal(txId);
}

async function confirmSubscription(key, name, amount, frequency, accountId, categoryId) {
  const existing = subscriptions.find(s => s.key === key);
  const data = {
    key, name, amount: Number(amount), frequency,
    accountId: accountId || null, categoryId: categoryId || null,
    status: "confirmed",
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  if (existing) {
    await db.collection("subscriptions").doc(existing.id).update(data);
  } else {
    const nid = genId();
    await db.collection("subscriptions").doc(nid).set({ ...data, id: nid, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  }
}

async function ignoreSubscription(key, name) {
  const existing = subscriptions.find(s => s.key === key);
  if (existing) {
    await db.collection("subscriptions").doc(existing.id).update({ status: "ignored" });
  } else {
    const nid = genId();
    await db.collection("subscriptions").doc(nid).set({
      id: nid, key, name, status: "ignored",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
}

async function unconfirmSubscription(subId) {
  if (!subId) return;
  await db.collection("subscriptions").doc(subId).delete();
}
