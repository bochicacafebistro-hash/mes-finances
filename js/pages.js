// ═══════════════════════════════════════════════════════════════
// PAGE DASHBOARD
// ═══════════════════════════════════════════════════════════════

function renderDashboard() {
  const totalBalance = accounts.reduce((s, a) => s + getAccountBalance(a), 0);
  const startMonth = monthStart(txFilterYear, txFilterMonth);
  const endMonth = monthEnd(txFilterYear, txFilterMonth);
  const monthly = getPeriodTotals(startMonth, endMonth);
  const monthsArr = uiLang === "es" ? MONTHS_ES : MONTHS_FR;

  // Transactions récentes (6 dernières), groupées par jour
  const recent = [...transactions]
    .filter(tx => tx.date)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 8);

  // Dépenses par catégorie ce mois
  const monthExpTx = transactions.filter(tx => tx.type === "expense" && tx.date && tx.date >= startMonth && tx.date <= endMonth);
  const byCat = {};
  monthExpTx.forEach(tx => {
    const cat = categories.find(c => c.id === tx.categoryId);
    const key = cat ? cat.id : "_none";
    if (!byCat[key]) byCat[key] = { cat, total: 0 };
    byCat[key].total += Number(tx.amount || 0);
  });

  // Statut budget
  const budgetStatus = computeDashBudgetStatus(byCat);

  // H1 éditorial : message dynamique selon l'équilibre du mois
  const net = monthly.income - monthly.expense;
  const heroH1 = computeHeroH1(net);

  // Taux d'épargne (income > 0 ? net/income : 0)
  const savingsRate = monthly.income > 0 ? net / monthly.income : 0;
  const monthName = monthsArr[txFilterMonth].toLowerCase();

  let h = `<div class="serene-page">

    <!-- Hero header : greeting + h1 éditorial + segment control -->
    <div class="serene-hero-header">
      <div>
        <div class="kicker" style="margin-bottom:10px">${t("dash_greeting").toUpperCase()} — ${monthsArr[txFilterMonth].toUpperCase()} ${txFilterYear}</div>
        <h1 class="serene-hero-h1">${heroH1}</h1>
      </div>
      <div class="segment-control">
        <button class="segment-btn" onclick="changeMonth(-1)" aria-label="${t("prev_month")}">←</button>
        <button class="segment-btn segment-btn--active">${monthsArr[txFilterMonth]} ${txFilterYear}</button>
        <button class="segment-btn" onclick="changeMonth(1)" aria-label="${t("next_month")}">→</button>
      </div>
    </div>

    <!-- KPI grid 4 cols -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-card__label">${t("dash_total_balance")}</div>
        <div class="kpi-card__value ${totalBalance < 0 ? 'kpi-card__value--warn' : ''}">${fmtMoney(totalBalance)}</div>
        <div class="kpi-card__hint">${accounts.length} ${accounts.length > 1 ? "comptes" : "compte"}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">${t("dash_month_income")}</div>
        <div class="kpi-card__value">${fmtMoney(monthly.income)}</div>
        <div class="kpi-card__hint">${monthly.count > 0 ? monthly.count + " transactions" : "—"}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">${t("dash_month_expenses")}</div>
        <div class="kpi-card__value">${fmtMoney(monthly.expense)}</div>
        <div class="kpi-card__hint">${monthExpTx.length} ${monthExpTx.length > 1 ? "lignes" : "ligne"}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">${t("dash_savings")}</div>
        <div class="kpi-card__value ${net >= 0 ? 'kpi-card__value--accent' : 'kpi-card__value--warn'}">${(savingsRate * 100).toFixed(0)}%</div>
        <div class="kpi-card__hint">${net >= 0 ? "+" : ""}${fmtMoney(net)} ${t("dash_net").toLowerCase()}</div>
      </div>
    </div>

    <!-- Grille principale : doughnut catégories + budgets du mois -->
    <div class="dash-main-grid">
      <!-- Doughnut : répartition catégories -->
      <div class="serene-card">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px">
          <div class="serene-section-title" style="margin-bottom:0">${t("dash_top_categories")}</div>
          <div class="kicker kicker--small">${monthsArr[txFilterMonth]} ${txFilterYear}</div>
        </div>
        <div style="position:relative;height:260px"><canvas id="chart-categories"></canvas></div>
      </div>

      <!-- Carte budgets du mois -->
      <div class="serene-card">
        <div class="serene-section-title">${t("dash_budget_month")}</div>
        ${renderDashBudgetMini(budgetStatus)}
      </div>
    </div>

    <!-- Section abonnements du mois -->
    ${renderDashSubscriptions()}

    <!-- Bar chart : revenus vs dépenses sur 6 mois -->
    <div class="serene-card" style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px">
        <div class="serene-section-title" style="margin-bottom:0">${t("dash_pulse_title")}</div>
        <div class="kicker kicker--small">6 DERNIERS MOIS</div>
      </div>
      <div style="position:relative;height:240px"><canvas id="chart-income-expense"></canvas></div>
    </div>

    <!-- Line chart : évolution du solde sur 6 mois -->
    <div class="serene-card" style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px">
        <div class="serene-section-title" style="margin-bottom:0">Évolution du solde total</div>
        <div class="kicker kicker--small">6 DERNIERS MOIS</div>
      </div>
      <div style="position:relative;height:240px"><canvas id="chart-balance-trend"></canvas></div>
    </div>

    <!-- Section dernières transactions -->
    <div class="serene-card" style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px">
        <div class="serene-section-title" style="margin-bottom:0">${t("dash_last_tx")}</div>
        <button class="btn-link" onclick="navTo('transactions')">${t("dash_view_tx")} →</button>
      </div>
      ${renderSereneRecentTx(recent)}
    </div>

    <!-- Mes comptes (compact) -->
    ${accounts.length > 0 ? `
      <div class="serene-card">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:20px">
          <div class="serene-section-title" style="margin-bottom:0">${t("dash_accounts_overview")}</div>
          <button class="btn-link" onclick="navTo('accounts')">${t("dash_view_all")} →</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:20px">
          ${accounts.map(a => {
            const bal = getAccountBalance(a);
            return `<div onclick="navTo('accounts')" role="button" tabindex="0" style="cursor:pointer;padding:14px 0;border-top:1px solid var(--border)">
              <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.05em;color:var(--text3);text-transform:uppercase;margin-bottom:6px">${esc(tAccountType(a.type))}</div>
              <div style="font-family:var(--font-heading);font-size:17px;letter-spacing:-0.01em;margin-bottom:6px">${esc(a.name || "?")}</div>
              <div style="font-family:var(--font-heading);font-size:24px;letter-spacing:-0.02em;color:${bal >= 0 ? 'var(--text)' : 'var(--status-red)'}">${fmtMoney(bal)}</div>
            </div>`;
          }).join("")}
        </div>
      </div>
    ` : `
      <div class="serene-card" style="text-align:center">
        <div style="margin-bottom:16px;color:var(--text3);display:flex;justify-content:center">${icon("wallet", 48)}</div>
        <p style="margin-bottom:20px;color:var(--text2)">${t("dash_no_accounts")}</p>
        <button class="btn-pill" onclick="navTo('accounts')">${icon("plus", 14)} ${t("acc_add")}</button>
      </div>
    `}
  </div>`;
  return h;
}

// ── H1 éditorial : "Tu es à l'équilibre", "à 62$ près", etc. ─────
function computeHeroH1(net) {
  const abs = Math.abs(net);
  if (abs < 5) return t("dash_hero_balanced");
  if (net > 0) return t("dash_hero_ahead", { n: fmtMoney(abs) });
  return t("dash_hero_short", { n: fmtMoney(abs) });
}

// ── Mini liste de budgets (pour la carte du dashboard) ──────────
function renderDashBudgetMini(bs) {
  if (bs.items.length === 0) {
    return `<div style="padding:16px 0;color:var(--text3);font-size:14px">
      <p style="margin-bottom:14px">${t("budget_none")}</p>
      <button class="btn-pill" onclick="navTo('budget')">${icon("plus", 14)} ${t("budget_set_limit")}</button>
    </div>`;
  }
  return `<ul class="bud-list">
    ${bs.items.slice(0, 6).map(item => {
      const overClass = item.status.status === "over" ? "bud-list__amount--over" : "";
      const fillColor = item.status.status === "over" ? "var(--status-red)" : "var(--accent)";
      return `<li class="bud-list__item" onclick="openCategoryDetailModal('${item.cat.id}')" role="button" tabindex="0">
        <div class="bud-list__head">
          <div class="bud-list__name">${esc(tCategoryName(item.cat))}</div>
          <span class="bud-list__amount ${overClass}">${fmtMoney(item.spent)} <span class="bud-list__amount-dim">/ ${fmtMoney(item.budget.monthlyLimit)}</span></span>
        </div>
        <div class="bud-progress">
          <div class="bud-progress__fill" style="width:${Math.min(item.status.pct, 100)}%;background:${fillColor}"></div>
        </div>
      </li>`;
    }).join("")}
  </ul>
  ${bs.items.length > 6 ? `<div style="margin-top:12px;text-align:center"><button class="btn-link" onclick="navTo('budget')">${t("dash_view_all")} →</button></div>` : ""}`;
}

// ── Section abonnements du mois (dashboard) ─────────────────────
function renderDashSubscriptions() {
  const start = monthStart(txFilterYear, txFilterMonth);
  const end = monthEnd(txFilterYear, txFilterMonth);
  const monthsArr = uiLang === "es" ? MONTHS_ES : MONTHS_FR;

  const detected = detectRecurringTransactions();
  // Filtre par mois courant + exclut les "ignored"
  const monthSubs = [];
  detected.forEach(sub => {
    const monthTxs = sub.transactionIds
      .map(id => transactions.find(tx => tx.id === id))
      .filter(tx => tx && tx.date >= start && tx.date <= end);
    if (monthTxs.length === 0) return;
    const state = getSubscriptionState(sub.key);
    if (state?.status === "ignored") return;
    const monthAmount = monthTxs.reduce((s, tx) => s + Number(tx.amount || 0), 0);
    const lastDate = monthTxs.sort((a,b) => (b.date || "").localeCompare(a.date || ""))[0].date;
    monthSubs.push({ ...sub, monthAmount, lastDate, isConfirmed: state?.status === "confirmed" });
  });
  monthSubs.sort((a, b) => b.monthAmount - a.monthAmount);

  const total = monthSubs.reduce((s, sub) => s + sub.monthAmount, 0);

  if (monthSubs.length === 0) {
    return `<div class="serene-card" style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px">
        <div class="serene-section-title" style="margin-bottom:0">${t("nav_subscriptions")}</div>
        <button class="btn-link" onclick="navTo('subscriptions')">${t("dash_view_all")} →</button>
      </div>
      <div style="padding:8px 0;color:var(--text3);font-size:14px;text-align:center">${t("sub_not_this_month")}</div>
    </div>`;
  }

  return `<div class="serene-card" style="margin-bottom:24px">
    <div style="display:flex;justify-content:space-between;align-items:end;flex-wrap:wrap;gap:12px;margin-bottom:18px">
      <div>
        <div class="kicker kicker--small" style="margin-bottom:6px">${t("sub_month_total")} · ${monthsArr[txFilterMonth]} ${txFilterYear}</div>
        <div class="display-num display-num--md" style="color:var(--accent)">${fmtMoney(total)}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:6px">${monthSubs.length} prélèvement${monthSubs.length > 1 ? "s" : ""}</div>
      </div>
      <button class="btn-link" onclick="navTo('subscriptions')">${t("dash_view_all")} →</button>
    </div>
    <ul style="list-style:none;margin:0;padding:0;border-top:1px solid var(--border)">
      ${monthSubs.slice(0, 8).map(sub => {
        const cat = categories.find(c => c.id === sub.categoryId);
        const catColor = cat?.color || "var(--accent)";
        const freqLabel = t("sub_" + sub.frequency) || sub.frequency;
        return `<li onclick="openSubscriptionDetailModal('${sub.key}')" role="button" tabindex="0" style="display:grid;grid-template-columns:auto 1fr auto;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);align-items:center;cursor:pointer" onmouseover="this.style.background='var(--surface2)'" onmouseout="this.style.background='transparent'">
          <div style="width:32px;height:32px;border-radius:100px;background:${catColor}20;color:${catColor};display:flex;align-items:center;justify-content:center;flex-shrink:0">${icon("refresh", 14)}</div>
          <div style="min-width:0">
            <div style="font-family:var(--font-heading);font-size:16px;letter-spacing:-0.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(sub.name)}${sub.isConfirmed ? ' <span style="color:var(--accent);font-family:var(--font-mono);font-size:10px;letter-spacing:0.1em">✓</span>' : ""}</div>
            <div style="font-size:11.5px;color:var(--text3);font-family:var(--font-body)">${cat ? esc(tCategoryName(cat)) : freqLabel} · ${fmtDateShort(sub.lastDate)}</div>
          </div>
          <div style="font-family:var(--font-heading);font-size:18px;text-align:right;letter-spacing:-0.01em;flex-shrink:0">${fmtMoney(sub.monthAmount)}</div>
        </li>`;
      }).join("")}
    </ul>
    ${monthSubs.length > 8 ? `<div style="margin-top:12px;text-align:center"><button class="btn-link" onclick="navTo('subscriptions')">+ ${monthSubs.length - 8} autres →</button></div>` : ""}
  </div>`;
}

// ── Liste des transactions récentes : utilise le même rendu que la page Transactions
function renderSereneRecentTx(recent) {
  if (recent.length === 0) {
    return `<div style="padding:16px 0;color:var(--text3);font-size:14px;text-align:center">${t("dash_no_tx")}</div>`;
  }
  // Groupe par date
  const byDate = {};
  recent.forEach(tx => {
    const d = tx.date || "0000-00-00";
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(tx);
  });
  const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));

  let h = `<div class="tx-list-v2">`;
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
        <span class="tx-day-total" style="color:${dayTotal >= 0 ? 'var(--accent)' : 'var(--status-red)'}">${dayTotal >= 0 ? "+" : ""}${fmtMoney(dayTotal)}</span>
      </div>
      <div class="tx-day-list">`;
    dayTxs.forEach(tx => {
      const cat = categories.find(c => c.id === tx.categoryId);
      const acc = accounts.find(a => a.id === tx.accountId);
      const toAcc = accounts.find(a => a.id === tx.toAccountId);
      const sign = tx.type === "income" ? "+" : tx.type === "expense" ? "−" : "";
      const color = tx.type === "income" ? "var(--accent)" : tx.type === "expense" ? "var(--text)" : "var(--text2)";
      const catColor = cat?.color || "var(--text3)";
      const typeLabel = tx.type === "transfer" ? t("tx_type_transfer") : "";
      h += `<div class="tx-item" onclick="openTransactionModal('${tx.id}')" role="button" tabindex="0">
        <div class="tx-item__body">
          <div class="tx-item__top">
            <span class="tx-item__desc">${esc(tx.description || tCategoryName(cat) || "—")}</span>
            <span class="tx-item__amount" style="color:${color}">${sign}${fmtMoney(tx.amount)}</span>
          </div>
          <div class="tx-item__bottom">
            ${cat ? `<span class="tx-pill" style="background:${catColor}15;color:${catColor};border-color:${catColor}40">${esc(tCategoryName(cat))}</span>` : typeLabel ? `<span class="tx-pill" style="background:var(--surface2);color:var(--text2)">${typeLabel}</span>` : ""}
            <span class="tx-account-name">${tx.type === "transfer" ? `${acc ? esc(acc.name) : "Externe"}${toAcc ? ` → ${esc(toAcc.name)}` : ""}` : esc(acc?.name || "")}</span>
          </div>
        </div>
      </div>`;
    });
    h += `</div></div>`;
  });
  h += `</div>`;
  return h;
}

// ── Pulse chart SVG : aires + lignes pour revenus/dépenses du mois ─
function renderSerenePulseChartSvg(monthlyTotals, year, month) {
  // Calcule les totaux jour par jour pour le mois
  const start = monthStart(year, month);
  const end = monthEnd(year, month);
  const startD = new Date(start + "T12:00:00");
  const endD = new Date(end + "T12:00:00");
  const days = Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1;

  const incByDay = new Array(days).fill(0);
  const expByDay = new Array(days).fill(0);

  transactions
    .filter(tx => tx.date && tx.date >= start && tx.date <= end)
    .forEach(tx => {
      const dayIdx = Math.round((new Date(tx.date + "T12:00:00") - startD) / (1000 * 60 * 60 * 24));
      if (dayIdx < 0 || dayIdx >= days) return;
      const amt = Number(tx.amount || 0);
      if (tx.type === "income") incByDay[dayIdx] += amt;
      else if (tx.type === "expense") expByDay[dayIdx] += amt;
    });

  const w = 720, h = 200, pad = 12;
  const max = Math.max(1, ...incByDay, ...expByDay);

  const toLine = (pts) => pts.map((v, i) => {
    const x = pad + (i / Math.max(1, days - 1)) * (w - pad * 2);
    const y = h - pad - (v / max) * (h - pad * 2);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const toArea = (pts) => {
    const base = h - pad;
    const line = toLine(pts);
    return `${line} L${w - pad},${base} L${pad},${base} Z`;
  };

  return `<svg viewBox="0 0 ${w} ${h}" class="pulse-chart" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="incgrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--accent)" stop-opacity="0.18"/>
        <stop offset="1" stop-color="var(--accent)" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="expgrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="var(--status-red)" stop-opacity="0.14"/>
        <stop offset="1" stop-color="var(--status-red)" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path d="${toArea(incByDay)}" fill="url(#incgrad)"/>
    <path d="${toArea(expByDay)}" fill="url(#expgrad)"/>
    <path d="${toLine(incByDay)}" fill="none" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${toLine(expByDay)}" fill="none" stroke="var(--status-red)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
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
  let h = `<div class="serene-page">
    <div class="serene-hero-header">
      <div>
        <div class="kicker" style="margin-bottom:10px">${t("acc_subtitle").toUpperCase()}</div>
        <h1 class="serene-hero-h1" style="margin:0">${t("acc_title")}</h1>
      </div>
      <button class="btn-pill" onclick="openAccountModal()">${icon("plus", 14)} ${t("acc_add")}</button>
    </div>`;

  if (accounts.length === 0) {
    h += `<div class="serene-card" style="text-align:center">
      <div style="margin-bottom:16px;color:var(--text3);display:flex;justify-content:center">${icon("wallet", 48)}</div>
      <p style="color:var(--text2)">${t("acc_no_accounts")}</p>
    </div>`;
  } else {
    const total = accounts.reduce((s, a) => s + getAccountBalance(a), 0);
    h += `<div class="serene-card serene-card--lg" style="margin-bottom:24px">
      <div class="kicker kicker--small" style="margin-bottom:6px">${t("dash_total_balance")}</div>
      <div class="display-num display-num--lg" style="color:${total >= 0 ? 'var(--text)' : 'var(--status-red)'}">${fmtMoney(total)}</div>
      <div style="font-size:12px;color:var(--text3);margin-top:6px">${accounts.length} ${accounts.length > 1 ? "comptes" : "compte"}</div>
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
  const colors = ["#10b981", "#f97316", "#2563eb", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"];
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

  let h = `<div class="serene-page">
    <div class="serene-hero-header">
      <div>
        <div class="kicker" style="margin-bottom:10px">${monthsArr[txFilterMonth].toUpperCase()} ${txFilterYear}</div>
        <h1 class="serene-hero-h1" style="margin:0">${t("tx_title")}</h1>
      </div>
      <button class="btn-pill" onclick="openTransactionModal()">${icon("plus", 14)} ${t("tx_add")}</button>
    </div>

    <!-- Sélecteur de mois (segment control) -->
    <div class="segment-control" style="margin-bottom:24px">
      <button class="segment-btn" onclick="changeMonth(-1)" aria-label="${t("prev_month")}">←</button>
      <button class="segment-btn segment-btn--active">${monthsArr[txFilterMonth]} ${txFilterYear}</button>
      <button class="segment-btn" onclick="changeMonth(1)" aria-label="${t("next_month")}">→</button>
    </div>

    <!-- KPI mini-grid -->
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px">
      <div class="kpi-card">
        <div class="kpi-card__label">${t("dash_month_income")}</div>
        <div class="kpi-card__value kpi-card__value--accent" style="font-size:clamp(28px,2.5vw,36px)">${fmtMoney(totals.income)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">${t("dash_month_expenses")}</div>
        <div class="kpi-card__value" style="font-size:clamp(28px,2.5vw,36px)">${fmtMoney(totals.expense)}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-card__label">${t("dash_month_balance")}</div>
        <div class="kpi-card__value ${totals.balance >= 0 ? 'kpi-card__value--accent' : 'kpi-card__value--warn'}" style="font-size:clamp(28px,2.5vw,36px)">${totals.balance >= 0 ? "+" : ""}${fmtMoney(totals.balance)}</div>
      </div>
    </div>

    <!-- Bannière si paiements de carte mal classés -->
    ${(() => {
      const misclass = detectMisclassifiedCardPayments();
      if (misclass.length === 0) return "";
      return `<div class="serene-card" style="margin-bottom:20px;border-left:4px solid var(--status-red);padding:16px 20px">
        <div style="display:flex;gap:16px;align-items:center;flex-wrap:wrap">
          <div style="flex:1;min-width:220px">
            <div class="kicker kicker--small" style="color:var(--status-red);margin-bottom:4px">ATTENTION</div>
            <div style="font-family:var(--font-heading);font-size:18px;letter-spacing:-0.01em;margin-bottom:4px">${t("fix_card_pmt_title", { n: misclass.length, s: misclass.length > 1 ? "s" : "" })}</div>
            <div style="font-size:13px;color:var(--text2)">${t("fix_card_pmt_desc")}</div>
          </div>
          <button class="btn-pill" onclick="runFixCardPayments()">${icon("refresh", 14)} ${t("fix_card_pmt_action", { n: misclass.length })}</button>
        </div>
      </div>`;
    })()}

    <!-- Filtres Serene -->
    <div class="tx-filters">
      <div class="search-box" style="flex:1;min-width:180px">
        <span style="color:var(--text3);display:flex">${icon("search", 16)}</span>
        <input type="text" placeholder="${t("search")}" value="${esc(txSearchQuery)}" oninput="setTxSearch(this.value)"/>
      </div>
      <select class="tx-filter-select" onchange="setTxFilterType(this.value)">
        <option value="all" ${txFilterType==="all"?"selected":""}>— ${t("tx_filter_type")} —</option>
        <option value="expense" ${txFilterType==="expense"?"selected":""}>${t("tx_type_expense")}</option>
        <option value="income" ${txFilterType==="income"?"selected":""}>${t("tx_type_income")}</option>
        <option value="transfer" ${txFilterType==="transfer"?"selected":""}>${t("tx_type_transfer")}</option>
      </select>
      <select class="tx-filter-select" onchange="setTxFilterAccount(this.value)">
        <option value="all" ${txFilterAccount==="all"?"selected":""}>— ${t("tx_filter_account")} —</option>
        ${accounts.map(a => `<option value="${a.id}" ${txFilterAccount===a.id?"selected":""}>${esc(a.name)}</option>`).join("")}
      </select>
      <select class="tx-filter-select" onchange="setTxFilterCategory(this.value)">
        <option value="all" ${txFilterCategory==="all"?"selected":""}>— ${t("tx_filter_category")} —</option>
        ${categories.map(c => `<option value="${c.id}" ${txFilterCategory===c.id?"selected":""}>${tCategoryName(c)}</option>`).join("")}
      </select>
      ${(txFilterType !== "all" || txFilterAccount !== "all" || txFilterCategory !== "all" || txSearchQuery) ? `
        <button class="action-btn" onclick="resetTxFilters()" title="${t("tx_filter_reset")}" style="flex-shrink:0">${icon("x", 14)}</button>
      ` : ""}
    </div>

    <!-- Compteur résultats -->
    <div style="font-family:var(--font-mono);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text3);margin-bottom:14px">${t("tx_filter_results", { n: filtered.length, s: filtered.length > 1 ? "s" : "" })}</div>`;

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
              <span class="tx-account-name">${tx.type === "transfer" ? `${acc ? esc(acc.name) : "Externe"}${toAcc ? ` → ${esc(toAcc.name)}` : ""}` : esc(acc?.name || "")}</span>
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

function resetTxFilters() {
  txFilterType = "all";
  txFilterAccount = "all";
  txFilterCategory = "all";
  txSearchQuery = "";
  renderPage();
}

async function runFixCardPayments() {
  const misclass = detectMisclassifiedCardPayments();
  if (misclass.length === 0) return;
  const msg = `${t("fix_card_pmt_desc")}\n\nConvertir ${misclass.length} transaction${misclass.length > 1 ? "s" : ""} en transferts ?`;
  openConfirm(t("fix_card_pmt_title", { n: misclass.length, s: misclass.length > 1 ? "s" : "" }), msg, async () => {
    const n = await fixCardPaymentsBulk();
    alert(t("fix_card_pmt_done", { n, s: n > 1 ? "s" : "" }));
  });
}

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
        <div style="display:flex;gap:8px;align-items:stretch">
          <select id="tx-category" style="flex:1">
            <option value="">— ${t("tx_field_category")} —</option>
            ${filteredCats.map(c => `<option value="${c.id}" ${tx?.categoryId === c.id ? "selected" : ""}>${tCategoryName(c)}</option>`).join("")}
          </select>
          <button type="button" class="action-btn" onclick="openQuickCategoryModal()" title="${t("cat_add_quick")}" style="flex-shrink:0;width:auto;padding:0 12px">
            ${icon("plus", 14)} ${t("cat_add_quick_short")}
          </button>
        </div>
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

  let h = `<div class="serene-page">
    <div class="serene-hero-header">
      <div>
        <div class="kicker" style="margin-bottom:10px">${t("cat_subtitle").toUpperCase()}</div>
        <h1 class="serene-hero-h1" style="margin:0">${t("cat_title")}</h1>
      </div>
      <button class="btn-pill" onclick="openCategoryModal()">${icon("plus", 14)} ${t("cat_add")}</button>
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
  const colors = ["#10b981", "#ef4444", "#2563eb", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#0ea5e9", "#64748b"];
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
  let newId = id;
  if (id) {
    await db.collection("categories").doc(id).update(data);
  } else {
    newId = genId();
    await db.collection("categories").doc(newId).set({ ...data, id: newId });
  }
  closeModal();

  // Si on venait d'une transaction, on y retourne et on pré-sélectionne la nouvelle catégorie
  if (window._txQuickCat) {
    const savedTx = window._txQuickCat;
    window._txQuickCat = null;
    // Réouvre le modal avec l'état sauvegardé
    setTimeout(() => {
      if (savedTx.id) {
        openTransactionModal(savedTx.id);
      } else {
        openTransactionModal();
      }
      // Restaure les valeurs
      setTimeout(() => {
        if (savedTx.amount) document.getElementById("tx-amount").value = savedTx.amount;
        if (savedTx.date) document.getElementById("tx-date").value = savedTx.date;
        if (savedTx.accountId) document.getElementById("tx-account").value = savedTx.accountId;
        if (savedTx.toAccountId) document.getElementById("tx-to-account").value = savedTx.toAccountId;
        if (savedTx.description) document.getElementById("tx-desc").value = savedTx.description;
        if (savedTx.notes) document.getElementById("tx-notes").value = savedTx.notes;
        // Auto-sélectionne la nouvelle catégorie si elle correspond au type de tx
        const catSelect = document.getElementById("tx-category");
        if (catSelect && newId) catSelect.value = newId;
      }, 50);
    }, 100);
  }
}

// ── Modal de création rapide de catégorie depuis une tx ──────────
function openQuickCategoryModal() {
  // Sauvegarde l'état actuel du form tx
  window._txQuickCat = {
    id: document.querySelector("[onclick*=saveTransaction]")?.getAttribute("onclick")?.match(/saveTransaction\('([^']*)'\)/)?.[1] || "",
    amount: document.getElementById("tx-amount")?.value,
    date: document.getElementById("tx-date")?.value,
    accountId: document.getElementById("tx-account")?.value,
    toAccountId: document.getElementById("tx-to-account")?.value,
    description: document.getElementById("tx-desc")?.value,
    notes: document.getElementById("tx-notes")?.value,
    type: txCurrentType
  };
  // Ouvre le modal de catégorie — le type sera présélectionné selon txCurrentType
  openCategoryModal();
  // Pré-sélectionne le bon type
  setTimeout(() => {
    const typeSelect = document.getElementById("c-type");
    if (typeSelect) {
      typeSelect.value = txCurrentType === "income" ? "income" : "expense";
    }
  }, 30);
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
  // Palette Bright & Clear (Emeraude + Orange)
  const inkColor    = isDark ? "#f8fafc" : "#0f172a";
  const mutedColor  = isDark ? "#94a3b8" : "#64748b";
  const sageColor   = isDark ? "#34d399" : "#10b981";
  const warnColor   = isDark ? "#fb923c" : "#f97316";
  const cardBg      = isDark ? "#111827" : "#ffffff";
  const gridColor   = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)";

  Chart.defaults.color = mutedColor;
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.font.size = 11;

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
            borderWidth: 3,
            borderColor: cardBg
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "65%",
          plugins: {
            legend: {
              position: "right",
              labels: {
                boxWidth: 10, boxHeight: 10, padding: 12, font: { size: 11 },
                usePointStyle: true, pointStyle: "circle"
              }
            },
            tooltip: {
              backgroundColor: inkColor, titleColor: cardBg, bodyColor: cardBg,
              padding: 10, cornerRadius: 6,
              callbacks: { label: (ctx) => ` ${ctx.label}: ${fmtMoney(ctx.parsed)}` }
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
          { label: "Revenus", data: months.map(m => m.income), backgroundColor: sageColor, borderRadius: 3, barThickness: 18 },
          { label: "Dépenses", data: months.map(m => m.expense), backgroundColor: warnColor, borderRadius: 3, barThickness: 18 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: { boxWidth: 10, boxHeight: 10, padding: 14, font: { size: 11 }, usePointStyle: true, pointStyle: "circle" }
          },
          tooltip: {
            backgroundColor: inkColor, titleColor: cardBg, bodyColor: cardBg,
            padding: 10, cornerRadius: 6,
            callbacks: { label: (ctx) => ` ${ctx.dataset.label}: ${fmtMoney(ctx.parsed.y)}` }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: gridColor, drawBorder: false }, border: { display: false }, ticks: { font: { size: 10 }, callback: (v) => v >= 1000 ? (v/1000).toFixed(0) + "k" : v } }
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
          borderColor: inkColor,
          backgroundColor: isDark ? "rgba(159,176,116,0.12)" : "rgba(107,122,74,0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
          pointBackgroundColor: inkColor,
          pointBorderColor: cardBg,
          pointBorderWidth: 2,
          borderWidth: 1.6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: inkColor, titleColor: cardBg, bodyColor: cardBg,
            padding: 10, cornerRadius: 6,
            callbacks: { label: (ctx) => " " + fmtMoney(ctx.parsed.y) }
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: gridColor, drawBorder: false }, border: { display: false }, ticks: { font: { size: 10 }, callback: (v) => v >= 1000 ? (v/1000).toFixed(0) + "k" : v } }
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
          return `<div class="tx-item tx-item--editable" style="border-bottom:1px solid var(--border)" onclick="editTxFromModal('${tx.id}','cat','${categoryId}')" role="button" tabindex="0" title="${t("edit")}">
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
            <button class="action-btn action-btn--primary" onclick="event.stopPropagation();editTxFromModal('${tx.id}','cat','${categoryId}')" title="${t("edit")}" aria-label="${t("edit")}">${icon("pencil", 14)}</button>
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

  let h = `<div class="serene-page">
    <div class="serene-hero-header">
      <div>
        <div class="kicker" style="margin-bottom:10px">${monthsArr[txFilterMonth].toUpperCase()} ${txFilterYear}</div>
        <h1 class="serene-hero-h1" style="margin:0">${t("budget_title")}</h1>
        <p style="margin:8px 0 0;color:var(--text2);font-size:15px;max-width:480px">${t("budget_subtitle")}</p>
      </div>
      <div class="segment-control">
        <button class="segment-btn" onclick="changeMonth(-1)">←</button>
        <button class="segment-btn segment-btn--active">${monthsArr[txFilterMonth]} ${txFilterYear}</button>
        <button class="segment-btn" onclick="changeMonth(1)">→</button>
      </div>
    </div>`;

  // Résumé global du budget
  if (budgets.length > 0) {
    h += `<div class="serene-card serene-card--lg" style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:end;gap:24px;flex-wrap:wrap;margin-bottom:18px">
        <div>
          <div class="kicker kicker--small" style="margin-bottom:6px">${t("budget_total_spent")}</div>
          <div class="display-num display-num--lg" style="color:${overall.color}">${fmtMoney(totalSpent)}</div>
          <div style="font-size:12px;color:var(--text3);margin-top:6px">/ ${fmtMoney(totalLimit)} ${t("budget_total_limit").toLowerCase()}</div>
        </div>
        <div style="text-align:right">
          <div class="kicker kicker--small" style="margin-bottom:6px">${totalSpent <= totalLimit ? t("budget_remaining") : t("budget_exceeded")}</div>
          <div class="display-num display-num--md" style="color:${totalSpent <= totalLimit ? 'var(--accent)' : 'var(--status-red)'}">${fmtMoney(Math.abs(totalLimit - totalSpent))}</div>
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

    h += `<div class="budget-row budget-row--clickable" style="border-left:4px solid ${cat.color || 'var(--text3)'}" onclick="openCategoryDetailModal('${cat.id}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openCategoryDetailModal('${cat.id}')}" title="Voir les transactions">
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
        <div class="budget-row__actions" onclick="event.stopPropagation()">
          ${hasbudget ? `
            <span class="budget-row__status" style="color:${status.color}">${status.pct.toFixed(0)}%</span>
            <button class="action-btn" onclick="openBudgetModal('${cat.id}')" title="${t("budget_edit")}">${icon("pencil", 14)}</button>
            <button class="action-btn action-btn--danger" onclick="removeBudget('${budget.id}', '${esc(tCategoryName(cat))}')" title="${t("budget_remove")}">${icon("trash", 14)}</button>
          ` : `
            <button class="btn-pill" style="padding:6px 14px;font-size:12px" onclick="openBudgetModal('${cat.id}')">${icon("plus", 12)} ${t("budget_set_limit")}</button>
          `}
        </div>
        <span class="budget-row__chevron" aria-hidden="true">${icon("chevron-right", 16)}</span>
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
  const monthsArr = uiLang === "es" ? MONTHS_ES : MONTHS_FR;
  const start = monthStart(txFilterYear, txFilterMonth);
  const end = monthEnd(txFilterYear, txFilterMonth);

  const detected = detectRecurringTransactions();

  // Pour chaque abonnement détecté : trouve les transactions qui tombent dans le mois courant
  const withMonthData = detected.map(sub => {
    const monthTxs = sub.transactionIds
      .map(id => transactions.find(tx => tx.id === id))
      .filter(tx => tx && tx.date >= start && tx.date <= end);
    const monthAmount = monthTxs.reduce((s, tx) => s + Number(tx.amount || 0), 0);
    return {
      ...sub,
      monthTxs,
      monthAmount,
      hasMonthCharge: monthTxs.length > 0
    };
  });

  // Sépare : confirmés, ignorés, suggestions — en ne gardant que ceux ayant un prélèvement ce mois-ci
  const confirmed = [];
  const ignored = [];
  const suggestions = [];
  withMonthData.forEach(sub => {
    if (!sub.hasMonthCharge) return; // Hide subs that have no charge this month
    const state = getSubscriptionState(sub.key);
    if (state?.status === "confirmed") confirmed.push({ ...sub, _state: state });
    else if (state?.status === "ignored") ignored.push({ ...sub, _state: state });
    else suggestions.push(sub);
  });

  // Total = somme réelle des montants prélevés ce mois-ci (confirmés + suggestions)
  const monthTotal = [...confirmed, ...suggestions].reduce((s, sub) => s + sub.monthAmount, 0);
  const confirmedTotal = confirmed.reduce((s, sub) => s + sub.monthAmount, 0);

  let h = `<div class="serene-page">
    <!-- Hero -->
    <div class="serene-hero-header">
      <div>
        <div class="kicker" style="margin-bottom:10px">${monthsArr[txFilterMonth].toUpperCase()} ${txFilterYear}</div>
        <h1 class="serene-hero-h1" style="margin:0">${t("sub_title")}</h1>
        <p style="max-width:560px;font-size:15px;color:var(--text2);margin:8px 0 0">${t("sub_subtitle")}</p>
      </div>
      <div class="segment-control">
        <button class="segment-btn" onclick="changeMonth(-1)">←</button>
        <button class="segment-btn segment-btn--active">${monthsArr[txFilterMonth]} ${txFilterYear}</button>
        <button class="segment-btn" onclick="changeMonth(1)">→</button>
      </div>
    </div>

    <!-- Summary 3 colonnes : total DU MOIS -->
    <div class="sub-summary">
      <div>
        <div class="kicker kicker--small" style="margin-bottom:6px">${t("sub_month_total")}</div>
        <div class="display-num" style="font-size:clamp(40px,5vw,72px)">${fmtMoney(monthTotal)}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:6px">${monthsArr[txFilterMonth]} ${txFilterYear} · ${confirmed.length + suggestions.length} prélèvement${(confirmed.length + suggestions.length) > 1 ? "s" : ""}</div>
      </div>
      <div>
        <div class="kicker kicker--small" style="margin-bottom:6px">${t("sub_confirmed")}</div>
        <div class="display-num display-num--md">${confirmed.length}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">${fmtMoney(confirmedTotal)}</div>
      </div>
      <div>
        <div class="kicker kicker--small" style="margin-bottom:6px">${t("sub_suggestions")}</div>
        <div class="display-num display-num--md" style="color:var(--accent)">${suggestions.length}</div>
        <div style="font-size:12px;color:var(--text3);margin-top:4px">${fmtMoney(monthTotal - confirmedTotal)}</div>
      </div>
    </div>`;

  if (confirmed.length === 0 && suggestions.length === 0) {
    h += `<div class="serene-card" style="text-align:center">
      <div style="margin-bottom:16px;color:var(--text3);display:flex;justify-content:center">${icon("refresh", 48)}</div>
      <p style="color:var(--text2)">${detected.length === 0 ? t("sub_none_detected") : t("sub_not_this_month")}</p>
    </div>`;
  } else {
    if (confirmed.length > 0) {
      h += renderSereneSubSection(t("sub_confirmed"), confirmed, "confirmed");
    }
    if (suggestions.length > 0) {
      h += renderSereneSubSection(t("sub_suggestions"), suggestions, "suggestion");
    }
    if (ignored.length > 0) {
      h += `<details style="margin-top:24px">
        <summary style="cursor:pointer;font-family:var(--font-mono);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:var(--text3);padding:12px 0">${t("sub_ignored")} (${ignored.length})</summary>` +
        renderSereneSubSection("", ignored, "ignored") + `</details>`;
    }
  }

  return h + `</div>`;
}

// Section Serene : titre kicker + liste de rows en grille
function renderSereneSubSection(title, subs, kind) {
  let h = title ? `<div class="kicker" style="margin:32px 0 16px">${title.toUpperCase()}</div>` : "";
  h += `<ul style="list-style:none;margin:0;padding:0;border-top:1px solid var(--border)">`;
  subs.forEach(sub => {
    const cat = categories.find(c => c.id === sub.categoryId);
    const freqLabel = t("sub_" + sub.frequency) || sub.frequency;
    // Date du prélèvement de ce mois (le plus récent si plusieurs)
    const monthChargeDate = sub.monthTxs && sub.monthTxs.length > 0
      ? sub.monthTxs.sort((a,b) => (b.date || "").localeCompare(a.date || ""))[0].date
      : sub.lastDate;
    const chargeCount = sub.monthTxs ? sub.monthTxs.length : 1;
    const displayAmount = sub.monthAmount !== undefined ? sub.monthAmount : sub.amount;

    h += `<li class="sub-row sub-row--clickable" onclick="openSubscriptionDetailModal('${sub.key}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openSubscriptionDetailModal('${sub.key}')}" title="${t("sub_view_transactions")}">
      <div class="sub-row__badge">${icon("refresh", 16)}</div>
      <div>
        <div class="sub-row__name">${esc(sub.name)}</div>
        <div class="sub-row__meta">${freqLabel} · ${t("sub_charged_on").toLowerCase()} ${fmtDateShort(monthChargeDate)}${chargeCount > 1 ? ` · ${chargeCount} prélèvements` : ""}</div>
      </div>
      <div class="sub-row__cat-col">${cat ? esc(tCategoryName(cat)) : "—"}</div>
      <div>
        <div class="sub-row__amount-col">${fmtMoney(displayAmount)}</div>
      </div>
      <div class="sub-row__actions" onclick="event.stopPropagation()">
        ${kind === "suggestion" ? `
          <button class="action-btn action-btn--primary" onclick="confirmSubscription('${sub.key}','${esc(sub.name).replace(/'/g,"\\'")}','${sub.amount}','${sub.frequency}','${sub.accountId||""}','${sub.categoryId||""}')" title="${t("sub_confirm")}">${icon("check", 14)}</button>
          <button class="action-btn" onclick="ignoreSubscription('${sub.key}','${esc(sub.name).replace(/'/g,"\\'")}')" title="${t("sub_ignore")}">${icon("x", 14)}</button>
        ` : `
          <button class="action-btn action-btn--danger" onclick="unconfirmSubscription('${sub._state?.id || ""}')" title="${t("sub_unconfirm")}">${icon("trash", 14)}</button>
        `}
      </div>
    </li>`;
  });
  h += `</ul>`;
  return h;
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

    h += `<div class="sub-row sub-row--clickable" style="border-left:4px solid ${cat?.color || 'var(--text3)'}" onclick="openSubscriptionDetailModal('${sub.key}')" role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();openSubscriptionDetailModal('${sub.key}')}" title="${t("sub_view_transactions")}">
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
        <button class="action-btn action-btn--primary" onclick="openSubscriptionDetailModal('${sub.key}')" title="${t("sub_view_transactions")}" aria-label="${t("sub_view_transactions")}">${icon("clipboard", 14)}</button>
        ${kind === "suggestion" ? `
          <button class="action-btn" onclick="confirmSubscription('${sub.key}','${esc(sub.name).replace(/'/g,"\\'")}','${sub.amount}','${sub.frequency}','${sub.accountId||""}','${sub.categoryId||""}')" title="${t("sub_confirm")}">${icon("check", 14)}</button>
          <button class="action-btn" onclick="ignoreSubscription('${sub.key}','${esc(sub.name).replace(/'/g,"\\'")}')" title="${t("sub_ignore")}">${icon("x", 14)}</button>
        ` : `
          <button class="action-btn action-btn--danger" onclick="unconfirmSubscription('${sub._state?.id || ""}')" title="${t("sub_unconfirm")}">${icon("trash", 14)}</button>
        `}
      </div>
      <span class="sub-row__chevron" aria-hidden="true">${icon("chevron-right", 16)}</span>
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
          return `<div class="tx-item tx-item--editable" style="border-bottom:1px solid var(--border)" onclick="editTxFromModal('${tx.id}','sub','${subKey}')" role="button" tabindex="0" title="${t("edit")}">
            <div class="tx-item__body">
              <div class="tx-item__top">
                <span class="tx-item__desc">${esc(tx.description || "—")}</span>
                <span class="tx-item__amount" style="color:var(--status-red)">−${fmtMoney(tx.amount)}</span>
              </div>
              <div class="tx-item__bottom">
                ${txCat ? `<span class="tx-pill" style="background:${txCat.color}15;color:${txCat.color};border-color:${txCat.color}40">${esc(tCategoryName(txCat))}</span>` : `<span class="tx-pill" style="background:var(--surface2);color:var(--text3)">— sans catégorie —</span>`}
                <span class="tx-account-name">${fmtDateLong(tx.date)} · ${esc(acc?.name || "")}</span>
                ${tx.notes ? `<span style="color:var(--text2);font-style:italic">📝 ${esc(tx.notes)}</span>` : ""}
              </div>
            </div>
            <button class="action-btn action-btn--primary" onclick="event.stopPropagation();editTxFromModal('${tx.id}','sub','${subKey}')" title="${t("edit")}" aria-label="${t("edit")}">${icon("pencil", 14)}</button>
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

// Ouvre la modal de transaction depuis une autre modal (détail abonnement, détail catégorie)
// showModal() remplace le contenu de #modals, donc pas besoin de closeModal au préalable.
function editTxFromModal(txId, returnPage, returnKey) {
  try {
    window._txEditReturn = { page: returnPage, key: returnKey };
    openTransactionModal(txId);
  } catch (e) {
    console.error("editTxFromModal:", e);
    alert("Erreur : impossible d'ouvrir la transaction. Regarde la console pour plus de détails.");
  }
}
// Alias pour compat avec ancien nom
function openTransactionModalThenReturnTo(txId, returnPage, returnKey) {
  return editTxFromModal(txId, returnPage, returnKey);
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

// ═══════════════════════════════════════════════════════════════════
// ACHATS IMMOBILIER — Analyse de rentabilité
// ═══════════════════════════════════════════════════════════════════

const RE_UNIT_TYPES = [
  { value: "single",     count: 1, label: "re_unit_single" },
  { value: "duplex",     count: 2, label: "re_unit_duplex" },
  { value: "triplex",    count: 3, label: "re_unit_triplex" },
  { value: "quadruplex", count: 4, label: "re_unit_quadruplex" },
  { value: "5plex",      count: 5, label: "re_unit_5plex" },
  { value: "6plex",      count: 6, label: "re_unit_6plex" },
  { value: "custom",     count: 1, label: "re_unit_custom" }
];

function reNewAnalysis() {
  return {
    id: null,
    name: "",
    address: "",
    purchasePrice: 0,
    // Mise de fond : peut être saisie en montant ou en pourcentage
    downPaymentMode: "amount",   // "amount" | "percent"
    downPayment: 0,
    downPaymentPercent: 20,
    amortYears: 25,
    interestRate: 5.5,
    paymentFrequency: "monthly",
    municipalTax: 0,
    schoolTax: 0,
    insurance: 0,
    // Services décomposés
    electricity: 0,             // $/mois (électricité payée par le proprio)
    otherServiceName: "",       // nom libre (ex: "Internet immeuble", "Déneigement")
    otherServiceAmount: 0,      // $/mois
    maintenancePercent: 5,
    vacancyPercent: 3,
    managementPercent: 0,
    // Projection à long terme
    appreciationPercent: 5,    // appréciation annuelle du prix (% / an) — médiane historique Qc long terme
    rentIncreasePercent: 3.1,  // augmentation annuelle du loyer (% / an) — TAL Qc 2026 officiel
    unitType: "triplex",
    units: [
      { name: "Logement 1", rent: 0, utilitiesIncluded: true, ownerOccupied: false },
      { name: "Logement 2", rent: 0, utilitiesIncluded: true, ownerOccupied: false },
      { name: "Logement 3", rent: 0, utilitiesIncluded: true, ownerOccupied: false }
    ],
    notes: ""
  };
}

// Renvoie la mise de fond effective en $, peu importe le mode de saisie.
function reEffectiveDownPayment(a) {
  if (a.downPaymentMode === "percent") {
    return ((Number(a.purchasePrice) || 0) * (Number(a.downPaymentPercent) || 0)) / 100;
  }
  return Number(a.downPayment) || 0;
}
function reEffectiveDownPaymentPercent(a) {
  const price = Number(a.purchasePrice) || 0;
  if (a.downPaymentMode === "percent") return Number(a.downPaymentPercent) || 0;
  if (price <= 0) return 0;
  return ((Number(a.downPayment) || 0) / price) * 100;
}

// Calcul de paiement hypothécaire — méthode canadienne (composition semi-annuelle)
function canadianMortgagePayment(principal, annualRatePct, years, freq) {
  if (!principal || principal <= 0 || annualRatePct < 0 || !years || years <= 0) return 0;
  const r = annualRatePct / 100;
  // Au Canada, l'intérêt est composé semi-annuellement
  // Taux effectif par période = (1 + r/2)^(2/n) - 1, où n = nombre de paiements/an
  const periodsPerYear = (freq === "biweekly_accel") ? 26 : (freq === "weekly_accel") ? 52 : 12;
  // On calcule TOUJOURS la mensualité standard d'abord
  const iMonthly = Math.pow(1 + r / 2, 2 / 12) - 1;
  const nMonthly = years * 12;
  const monthlyPmt = (iMonthly === 0) ? principal / nMonthly
                    : principal * iMonthly / (1 - Math.pow(1 + iMonthly, -nMonthly));
  if (freq === "monthly") return monthlyPmt;
  if (freq === "biweekly_accel") return monthlyPmt / 2;   // payé 26x/an
  if (freq === "weekly_accel")   return monthlyPmt / 4;   // payé 52x/an
  return monthlyPmt;
}

function calculateRealEstateMetrics(a) {
  // Loyers — on exclut les logements occupés par le propriétaire
  const rentingUnits = (a.units || []).filter(u => !u.ownerOccupied);
  const ownerOccupiedUnits = (a.units || []).filter(u => u.ownerOccupied);
  const hasOwnerOccupied = ownerOccupiedUnits.length > 0;
  const grossMonthlyRent = rentingUnits.reduce((s, u) => s + (Number(u.rent) || 0), 0);
  const grossAnnualRent = grossMonthlyRent * 12;
  // Vacance
  const vacancyLoss = grossAnnualRent * ((Number(a.vacancyPercent) || 0) / 100);
  const effectiveGrossIncome = grossAnnualRent - vacancyLoss;
  // Charges opérationnelles annuelles (sans hypothèque)
  const municipalTax = Number(a.municipalTax) || 0;
  const schoolTax    = Number(a.schoolTax) || 0;
  const insurance    = Number(a.insurance) || 0;
  // Services décomposés + compat descendante (anciens docs avec field "services")
  const electricityMo = Number(a.electricity) || 0;
  const otherServiceMo = Number(a.otherServiceAmount) || 0;
  const legacyServicesMo = (a.electricity === undefined && a.otherServiceAmount === undefined)
    ? (Number(a.services) || 0) : 0;
  const servicesMonthly = electricityMo + otherServiceMo + legacyServicesMo;
  const servicesY    = servicesMonthly * 12;
  // Maintenance : si aucun logement loué, on utilise une réserve basée sur la valeur de l'immeuble
  // (règle 1%/an du prix d'achat) au lieu d'un % des loyers — sinon la réserve tomberait à zéro
  // pour un SFH proprio-occupant, ce qui serait irréaliste.
  const maintenanceFromRent = grossAnnualRent * ((Number(a.maintenancePercent) || 0) / 100);
  const maintenanceFromValue = (Number(a.purchasePrice) || 0) * 0.01;
  const maintenance  = (rentingUnits.length === 0)
    ? maintenanceFromValue
    : Math.max(maintenanceFromRent, maintenanceFromValue * 0.5); // au minimum 0.5% de la valeur même en location complète
  const management   = effectiveGrossIncome * ((Number(a.managementPercent) || 0) / 100);
  const totalOpex = municipalTax + schoolTax + insurance + servicesY + maintenance + management;
  // NOI (Net Operating Income) — exclut le service de la dette
  const noi = effectiveGrossIncome - totalOpex;
  // Hypothèque — basée sur la mise de fond effective (peu importe le mode de saisie)
  const downPayment = reEffectiveDownPayment(a);
  const downPaymentPct = reEffectiveDownPaymentPercent(a);
  const principal = Math.max(0, (Number(a.purchasePrice) || 0) - downPayment);
  const monthlyPmt  = canadianMortgagePayment(principal, a.interestRate, a.amortYears, "monthly");
  const biweeklyPmt = canadianMortgagePayment(principal, a.interestRate, a.amortYears, "biweekly_accel");
  const weeklyPmt   = canadianMortgagePayment(principal, a.interestRate, a.amortYears, "weekly_accel");
  // On utilise la mensualité standard pour les ratios (équitable même si on choisit accéléré)
  const annualMortgageStd = monthlyPmt * 12;
  const annualCashFlow = noi - annualMortgageStd;
  const monthlyCashFlow = annualCashFlow / 12;
  // Coût mensuel pour habiter (si proprio-occupant) — c'est ce qui sort de la poche
  // = -cashflow : si négatif, on paie; si positif, on encaisse en habitant
  const costToLiveMonthly = -monthlyCashFlow;
  // Cap rate (sur NOI / prix d'achat)
  const capRate = (a.purchasePrice > 0) ? (noi / a.purchasePrice) * 100 : 0;
  // MRB (prix / revenu brut annuel)
  const mrb = (grossAnnualRent > 0) ? (a.purchasePrice / grossAnnualRent) : 0;
  // Stress test +2%
  const stressMonthlyPmt = canadianMortgagePayment(principal, (Number(a.interestRate) || 0) + 2, a.amortYears, "monthly");
  const stressAnnualMortgage = stressMonthlyPmt * 12;
  const stressAnnualCashFlow = noi - stressAnnualMortgage;
  const stressMonthlyCashFlow = stressAnnualCashFlow / 12;
  // DSCR : NOI / service de la dette annuel (≥ 1.20 = solide pour les prêteurs)
  const dscr = (annualMortgageStd > 0) ? noi / annualMortgageStd : null;
  // Cash-on-Cash : retour annuel sur la mise de fond effective
  const cashOnCash = (downPayment > 0) ? (annualCashFlow / downPayment) * 100 : null;
  // Break-even occupancy : à quel taux d'occupation l'immeuble couvre tout juste ses coûts
  // ((charges + hypothèque) - frais variables liés aux loyers) / loyers bruts annuels
  // Simplification : on inclut tout dans le seuil. Sous 85% = confortable, au-dessus = fragile.
  const breakEvenOccupancy = (grossAnnualRent > 0)
    ? ((totalOpex + annualMortgageStd) / grossAnnualRent) * 100
    : null;
  // Verdict — si propriétaire-occupant, l'évaluation est différente (on ne juge pas sur cash flow seul)
  let verdict = "unknown";
  if (hasOwnerOccupied) {
    // Logique ajustée : verdict basé sur capacité de payer + métriques pures de l'immeuble
    if (a.purchasePrice > 0 && (grossAnnualRent > 0 || hasOwnerOccupied)) {
      if (stressMonthlyCashFlow < -1500) verdict = "bad";        // gros débours mensuel même sans stress
      else if (stressMonthlyCashFlow < -500) verdict = "risky";  // débours notable
      else if (monthlyCashFlow >= 0) verdict = "excellent";      // on encaisse en plus d'habiter !
      else verdict = "good";                                     // débours raisonnable
    }
  } else if (grossAnnualRent > 0 && a.purchasePrice > 0) {
    // Seuils ajustés pour le marché québécois urbain (Montréal/Québec) où cap rate 6%+ est rare en 2026
    if (monthlyCashFlow < -300) verdict = "bad";                            // Tolère un petit déficit si les fondamentaux sont bons
    else if (capRate < 4 || mrb > 12 || stressMonthlyCashFlow < -300) verdict = "risky";
    else if (capRate >= 5 && mrb <= 10 && stressMonthlyCashFlow >= 0) verdict = "excellent";  // 5%/10 réaliste Qc
    else verdict = "good";
  }
  return {
    grossMonthlyRent, grossAnnualRent, vacancyLoss, effectiveGrossIncome,
    municipalTax, schoolTax, insurance,
    electricityMo, otherServiceMo, servicesMonthly, servicesY,
    maintenance, management, totalOpex,
    noi, principal, downPayment, downPaymentPct,
    monthlyPmt, biweeklyPmt, weeklyPmt,
    annualMortgageStd, annualCashFlow, monthlyCashFlow,
    costToLiveMonthly,
    capRate, mrb,
    dscr, cashOnCash, breakEvenOccupancy,
    stressMonthlyPmt, stressMonthlyCashFlow,
    hasOwnerOccupied, ownerOccupiedCount: ownerOccupiedUnits.length, rentingUnitsCount: rentingUnits.length,
    verdict
  };
}

// Helper : génère un mini-bouton "ⓘ" cliquable/survolable avec tooltip
function reTip(key) {
  const text = t(key);
  if (!text || text === key) return "";
  // tabindex pour accessibilité + onclick pour mobile (toggle .is-open)
  return `<span class="re-tip" tabindex="0" data-tip="${esc(text)}" role="button" aria-label="Définition" onclick="this.classList.toggle('is-open');event.stopPropagation()">i</span>`;
}

// Décompose le verdict en raisons explicites compréhensibles
function getVerdictReasons(a, m) {
  if (m.verdict === "unknown") {
    return [{
      status: "warn",
      title: "Données insuffisantes",
      detail: "Entre au moins le prix d'achat et au moins un loyer (ou marque ton logement comme occupé par le propriétaire) pour voir l'évaluation détaillée."
    }];
  }
  const reasons = [];
  const ownerOccupied = m.hasOwnerOccupied;

  // --- Cash flow ou coût pour habiter ---
  if (ownerOccupied) {
    const cost = m.costToLiveMonthly;
    if (cost <= 0) {
      reasons.push({
        status: "pass",
        title: `Tu encaisses ${fmtMoney(Math.abs(cost))} /mois en habitant`,
        detail: `Les loyers des autres locataires couvrent toutes les dépenses + l'hypothèque, et il te reste ${fmtMoney(Math.abs(cost))} dans tes poches chaque mois — en plus de te loger gratuitement. C'est la situation idéale.`
      });
    } else if (cost <= 500) {
      reasons.push({
        status: "pass",
        title: `Coût raisonnable pour habiter (${fmtMoney(cost)} /mois)`,
        detail: `Tu paies ${fmtMoney(cost)} par mois pour habiter ton logement, mais tu construis de l'équité sur l'immeuble entier. Probablement bien moins qu'un loyer pour un logement comparable dans le marché.`
      });
    } else if (cost <= 1500) {
      reasons.push({
        status: "warn",
        title: `Coût notable pour habiter (${fmtMoney(cost)} /mois)`,
        detail: `${fmtMoney(cost)} sortent de ta poche chaque mois pour t'habiter. Compare avec ce qu'un loyer équivalent te coûterait — selon le quartier, ça peut être plus économique de louer.`
      });
    } else {
      reasons.push({
        status: "fail",
        title: `Coût élevé pour habiter (${fmtMoney(cost)} /mois)`,
        detail: `${fmtMoney(cost)} /mois sortent de ta poche juste pour t'habiter. Tu finances l'immeuble plus que les locataires. Risqué si tu perds ton emploi ou si les taux montent.`
      });
    }
  } else {
    if (m.monthlyCashFlow >= 0) {
      reasons.push({
        status: "pass",
        title: `Cash flow positif (+${fmtMoney(m.monthlyCashFlow)} /mois)`,
        detail: `Après avoir payé taxes, assurances, services, entretien et l'hypothèque, il te reste ${fmtMoney(m.monthlyCashFlow)} chaque mois. L'immeuble se finance tout seul et te génère un revenu passif.`
      });
    } else {
      reasons.push({
        status: "fail",
        title: `Cash flow négatif (${fmtMoney(m.monthlyCashFlow)} /mois)`,
        detail: `Les loyers ne couvrent pas les dépenses totales — il te manque ${fmtMoney(Math.abs(m.monthlyCashFlow))} par mois que tu dois sortir de tes poches. Tu peux quand même gagner long terme grâce à l'appréciation et au remboursement de capital, mais c'est un investissement qui coûte de l'argent à court terme.`
      });
    }
  }

  // --- Cap rate (taux de capitalisation) ---
  if (m.grossAnnualRent > 0) {
    if (m.capRate >= 6) {
      reasons.push({
        status: "pass",
        title: `Excellent rendement (cap rate ${m.capRate.toFixed(2)}%)`,
        detail: `Pour chaque 100 $ que tu paies pour l'immeuble, il génère ${m.capRate.toFixed(2)} $ de revenu net annuel avant l'hypothèque. C'est au-dessus de la norme québécoise de 4-6 % — bonne affaire.`
      });
    } else if (m.capRate >= 4) {
      reasons.push({
        status: "pass",
        title: `Rendement acceptable (cap rate ${m.capRate.toFixed(2)}%)`,
        detail: `Pour chaque 100 $ payés, l'immeuble génère ${m.capRate.toFixed(2)} $ de revenu net annuel. C'est dans la norme québécoise (4-6 %) — correct sans être exceptionnel.`
      });
    } else if (m.capRate > 0) {
      reasons.push({
        status: "warn",
        title: `Rendement faible (cap rate ${m.capRate.toFixed(2)}%)`,
        detail: `Pour chaque 100 $ payés, l'immeuble génère seulement ${m.capRate.toFixed(2)} $ par année — sous le seuil de 4 % considéré comme minimum. Soit le prix est trop élevé, soit les loyers sont sous-évalués.`
      });
    } else {
      reasons.push({
        status: "fail",
        title: `Rendement opérationnel négatif`,
        detail: `Les charges opérationnelles (hors hypothèque) dépassent les loyers — l'immeuble perd de l'argent avant même de payer l'hypothèque. Vérifie tes chiffres.`
      });
    }
  }

  // --- MRB (multiplicateur de revenu brut) ---
  if (m.grossAnnualRent > 0) {
    if (m.mrb <= 8) {
      reasons.push({
        status: "pass",
        title: `Prix raisonnable par rapport aux loyers (MRB ${m.mrb.toFixed(1)})`,
        detail: `L'immeuble coûte ${m.mrb.toFixed(1)} × les revenus locatifs annuels. Plus le chiffre est bas, mieux c'est — sous 8, c'est généralement une bonne affaire au Québec.`
      });
    } else if (m.mrb <= 12) {
      reasons.push({
        status: "warn",
        title: `Prix moyen par rapport aux loyers (MRB ${m.mrb.toFixed(1)})`,
        detail: `L'immeuble coûte ${m.mrb.toFixed(1)} × les revenus locatifs annuels. Acceptable dans des marchés urbains tendus comme Montréal ou Québec, mais sans aubaine. Le retour par les loyers seuls est lent.`
      });
    } else {
      reasons.push({
        status: "fail",
        title: `Prix élevé par rapport aux loyers (MRB ${m.mrb.toFixed(1)})`,
        detail: `L'immeuble coûte ${m.mrb.toFixed(1)} × les revenus locatifs annuels — c'est plus de 12 ×, donc cher. Tu paries fortement sur l'appréciation future plutôt que sur les revenus locatifs.`
      });
    }
  }

  // --- DSCR (capacité de l'immeuble à payer son hypothèque) ---
  if (m.dscr !== null && m.principal > 0 && m.grossAnnualRent > 0) {
    if (m.dscr >= 1.20) {
      reasons.push({
        status: "pass",
        title: `L'immeuble se finance bien (DSCR ${m.dscr.toFixed(2)})`,
        detail: `Le revenu net d'opération couvre ${m.dscr.toFixed(2)}× le paiement de l'hypothèque. C'est confortable — les prêteurs commerciaux exigent généralement au moins 1.20.`
      });
    } else if (m.dscr >= 1.0) {
      reasons.push({
        status: "warn",
        title: `L'immeuble paie tout juste sa dette (DSCR ${m.dscr.toFixed(2)})`,
        detail: `Le revenu net d'opération couvre seulement ${m.dscr.toFixed(2)}× le paiement de l'hypothèque. Marge mince — peu de coussin pour les imprévus.`
      });
    } else {
      reasons.push({
        status: "fail",
        title: `L'immeuble ne se finance pas (DSCR ${m.dscr.toFixed(2)})`,
        detail: `Les loyers nets des charges ne suffisent même pas à payer l'hypothèque. Il manque ${fmtMoney((m.annualMortgageStd - m.noi) / 12)} par mois que tu dois compenser de ta poche.`
      });
    }
  }

  // --- Cash-on-Cash (rendement immédiat sur la mise de fond) ---
  if (m.cashOnCash !== null && m.grossAnnualRent > 0 && !ownerOccupied) {
    if (m.cashOnCash >= 8) {
      reasons.push({
        status: "pass",
        title: `Excellent retour sur ta mise de fond (Cash-on-Cash ${m.cashOnCash.toFixed(1)}%)`,
        detail: `Chaque année, l'immeuble te retourne ${m.cashOnCash.toFixed(1)}% de ta mise de fond en cash flow. C'est au-dessus de 8%, ce qui est très bon (mieux qu'un placement en bourse moyen).`
      });
    } else if (m.cashOnCash >= 4) {
      reasons.push({
        status: "pass",
        title: `Retour acceptable sur ta mise de fond (Cash-on-Cash ${m.cashOnCash.toFixed(1)}%)`,
        detail: `Chaque année, l'immeuble te retourne ${m.cashOnCash.toFixed(1)}% de ta mise de fond en cash flow (avant l'appréciation). C'est dans la fourchette normale (4-8%).`
      });
    } else if (m.cashOnCash >= 0) {
      reasons.push({
        status: "warn",
        title: `Retour faible sur ta mise de fond (Cash-on-Cash ${m.cashOnCash.toFixed(1)}%)`,
        detail: `Chaque année, l'immeuble te retourne seulement ${m.cashOnCash.toFixed(1)}% de ta mise de fond en cash flow. Tu paries surtout sur l'appréciation pour générer du rendement.`
      });
    } else {
      reasons.push({
        status: "fail",
        title: `Retour négatif sur ta mise de fond (Cash-on-Cash ${m.cashOnCash.toFixed(1)}%)`,
        detail: `Tu sors plus d'argent que tu n'en encaisses chaque année. L'investissement n'est rentable que si l'appréciation compense largement.`
      });
    }
  }

  // --- Break-even occupancy (à quel point l'immeuble est résistant aux logements vides) ---
  if (m.breakEvenOccupancy !== null && m.grossAnnualRent > 0) {
    if (m.breakEvenOccupancy < 85) {
      reasons.push({
        status: "pass",
        title: `Marge confortable aux vacances (équilibre à ${m.breakEvenOccupancy.toFixed(0)}% d'occupation)`,
        detail: `Tu peux te permettre d'avoir jusqu'à ${(100 - m.breakEvenOccupancy).toFixed(0)}% de tes loyers en vacance avant de perdre de l'argent. Bonne marge de sécurité.`
      });
    } else if (m.breakEvenOccupancy <= 95) {
      reasons.push({
        status: "warn",
        title: `Marge mince aux vacances (équilibre à ${m.breakEvenOccupancy.toFixed(0)}% d'occupation)`,
        detail: `Tu dois conserver au moins ${m.breakEvenOccupancy.toFixed(0)}% de tes loyers chaque mois pour ne pas perdre d'argent. Un seul logement vide longtemps peut faire mal.`
      });
    } else {
      reasons.push({
        status: "fail",
        title: `Très fragile aux vacances (équilibre à ${m.breakEvenOccupancy.toFixed(0)}% d'occupation)`,
        detail: `Il faut que ${m.breakEvenOccupancy.toFixed(0)}% des loyers rentrent chaque mois pour couvrir les frais. La moindre vacance prolongée te met dans le rouge.`
      });
    }
  }

  // --- Stress test (+2 % de taux) ---
  if (a.purchasePrice > 0 && m.principal > 0) {
    const stress = m.stressMonthlyCashFlow;
    if (stress >= 0) {
      reasons.push({
        status: "pass",
        title: `Résistant à une hausse de taux (+${fmtMoney(stress)} /mois avec taux +2 %)`,
        detail: `Si le taux hypothécaire montait de 2 % au renouvellement (ex: passer de 5,5 % à 7,5 %), tu resterais en équilibre ou positif. Bonne marge de sécurité.`
      });
    } else if (stress >= -200 || (ownerOccupied && stress >= -500)) {
      reasons.push({
        status: "warn",
        title: `Stress test gérable (${fmtMoney(stress)} /mois avec taux +2 %)`,
        detail: `Une hausse de 2 % du taux te coûterait ${fmtMoney(Math.abs(stress))} de plus par mois. C'est gérable mais à surveiller au renouvellement hypothécaire (typiquement 5 ans).`
      });
    } else if (ownerOccupied && stress >= -1500) {
      reasons.push({
        status: "warn",
        title: `Stress test serré (${fmtMoney(stress)} /mois avec taux +2 %)`,
        detail: `Une hausse de 2 % du taux te coûterait ${fmtMoney(Math.abs(stress))} additionnels par mois — assure-toi d'avoir un coussin financier solide avant le renouvellement.`
      });
    } else {
      reasons.push({
        status: "fail",
        title: `Stress test dangereux (${fmtMoney(stress)} /mois avec taux +2 %)`,
        detail: `Si les taux montaient de 2 %, il te faudrait sortir ${fmtMoney(Math.abs(stress))} de plus par mois. Très risqué — si les taux remontent au renouvellement, tu pourrais être forcé de vendre.`
      });
    }
  }

  return reasons;
}

// Projection long terme : valeur future, solde hypothécaire, loyers cumulés, rendement annualisé
function projectRealEstate(a, years) {
  years = Math.max(1, Math.min(50, Number(years) || 10));
  const base = calculateRealEstateMetrics(a);
  const price = Number(a.purchasePrice) || 0;
  const apprRate = (Number(a.appreciationPercent) || 0) / 100;
  const rentRate = (Number(a.rentIncreasePercent) || 0) / 100;

  // Valeur future de l'immeuble (composition annuelle)
  const futureValue = price * Math.pow(1 + apprRate, years);
  // Prise de valeur = gain en $ provenant de l'appréciation seule
  const appreciationGain = futureValue - price;

  // Solde hypothécaire après k paiements mensuels — formule fermée
  // B_k = P*(1+i)^k - PMT*((1+i)^k - 1)/i
  const annualR = (Number(a.interestRate) || 0) / 100;
  const iMonthly = Math.pow(1 + annualR / 2, 2 / 12) - 1;
  const amortYears = Number(a.amortYears) || 0;
  const k = Math.min(years, amortYears) * 12;
  let mortgageBalance;
  if (years >= amortYears) {
    mortgageBalance = 0;
  } else if (iMonthly === 0) {
    mortgageBalance = Math.max(0, base.principal - base.monthlyPmt * k);
  } else {
    mortgageBalance = Math.max(
      0,
      base.principal * Math.pow(1 + iMonthly, k)
      - base.monthlyPmt * (Math.pow(1 + iMonthly, k) - 1) / iMonthly
    );
  }
  const principalPaidDown = Math.max(0, base.principal - mortgageBalance);

  // Année par année : loyers et cash flow avec augmentation annuelle des loyers
  // Hypothèse : les charges fixes (taxes, assurances, services) suivent le même taux d'augmentation
  // Le maintenance % et le management % restent constants, donc grandissent avec les loyers naturellement
  const fixedOpexY1 = base.municipalTax + base.schoolTax + base.insurance + base.servicesY;
  let cumGrossRent = 0;
  let cumNOI = 0;
  let cumCashFlow = 0;
  for (let y = 1; y <= years; y++) {
    const g = Math.pow(1 + rentRate, y - 1);
    const yGrossRent   = base.grossAnnualRent * g;
    const yVacancyLoss = yGrossRent * ((Number(a.vacancyPercent) || 0) / 100);
    const yEffIncome   = yGrossRent - yVacancyLoss;
    const yFixedOpex   = fixedOpexY1 * g;
    const yMaintenance = yGrossRent * ((Number(a.maintenancePercent) || 0) / 100);
    const yManagement  = yEffIncome * ((Number(a.managementPercent) || 0) / 100);
    const yOpex = yFixedOpex + yMaintenance + yManagement;
    const yNOI  = yEffIncome - yOpex;
    // L'hypothèque ne s'indexe pas — paiement constant pendant toute l'amortissation
    const yMortgage = (y <= amortYears) ? base.monthlyPmt * 12 : 0;
    const yCashFlow = yNOI - yMortgage;
    cumGrossRent += yGrossRent;
    cumNOI += yNOI;
    cumCashFlow += yCashFlow;
  }

  // Équité finale et rendement annualisé (CAGR)
  const equity = futureValue - mortgageBalance;
  const equityNetGain = equity - base.downPayment;
  // Patrimoine net si on vend tout à la fin : équité + flux de trésorerie cumulés
  const totalWealth = equity + cumCashFlow;
  const totalProfit = totalWealth - base.downPayment;

  let annualizedReturn = null;
  if (base.downPayment > 0 && years > 0) {
    if (totalWealth > 0) {
      annualizedReturn = (Math.pow(totalWealth / base.downPayment, 1 / years) - 1) * 100;
    } else {
      annualizedReturn = -100; // perte totale (ou plus)
    }
  }

  return {
    years,
    futureValue, appreciationGain, mortgageBalance, principalPaidDown,
    equity, equityNetGain,
    cumGrossRent, cumNOI, cumCashFlow,
    totalWealth, totalProfit,
    annualizedReturn,
    fullyPaidOff: years >= amortYears
  };
}

function renderRealEstatePage() {
  if (reMode === "edit" && reCurrent) return renderRealEstateEdit();
  return renderRealEstateList();
}

function renderRealEstateList() {
  let h = `<div class="serene-page">
    <div class="serene-hero-header">
      <div>
        <div class="kicker" style="margin-bottom:10px">${t("re_subtitle").toUpperCase()}</div>
        <h1 class="serene-hero-h1" style="margin:0">${t("re_title")}</h1>
      </div>
      <button class="btn-pill" onclick="reNew()">${icon("plus", 14)} ${t("re_add")}</button>
    </div>`;
  if (!realEstateAnalyses.length) {
    h += `<div class="empty">
      <div style="margin-bottom:12px;color:var(--text3);display:flex;justify-content:center">${icon("home", 48)}</div>
      <p>${t("re_empty")}</p>
    </div></div>`;
    return h;
  }
  h += `<div class="re-list">`;
  for (const a of realEstateAnalyses) {
    const m = calculateRealEstateMetrics(a);
    const cf = m.monthlyCashFlow;
    const cfClass = cf >= 0 ? "pos" : "neg";
    h += `<div class="re-card" onclick="reEdit('${a.id}')">
      <div class="re-card__head">
        <div class="re-card__icon">${icon("home", 20)}</div>
        <div class="re-card__title">
          <div class="re-card__name">${esc(a.name || "(Sans nom)")}</div>
          <div class="re-card__addr">${esc(a.address || "")}</div>
        </div>
        <div class="re-verdict re-verdict--${m.verdict}">${t("re_verdict_" + m.verdict)}</div>
      </div>
      <div class="re-card__stats">
        <div class="re-stat">
          <div class="re-stat__label">${t("re_metric_cashflow")}</div>
          <div class="re-stat__value re-stat__value--${cfClass}">${fmtMoney(cf)}<span class="re-stat__suffix">${t("re_metric_per_month")}</span></div>
        </div>
        <div class="re-stat">
          <div class="re-stat__label">${t("re_metric_cap_rate")}</div>
          <div class="re-stat__value">${m.capRate.toFixed(2)}%</div>
        </div>
        <div class="re-stat">
          <div class="re-stat__label">${t("re_metric_mrb")}</div>
          <div class="re-stat__value">${m.grossAnnualRent > 0 ? m.mrb.toFixed(1) : "—"}</div>
        </div>
        <div class="re-stat">
          <div class="re-stat__label">${t("re_field_price")}</div>
          <div class="re-stat__value">${fmtMoney(a.purchasePrice)}</div>
        </div>
      </div>
    </div>`;
  }
  h += `</div></div>`;
  return h;
}

function renderRealEstateEdit() {
  const a = reCurrent;
  let h = `<div class="serene-page re-page">
    <div class="serene-hero-header">
      <div>
        <button class="btn-link" onclick="reBackToList()">${t("re_back_to_list")}</button>
        <h1 class="serene-hero-h1" style="margin:4px 0 0">${a.id ? t("re_update") : t("re_add")}</h1>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        ${a.id ? `<button class="btn re-btn-danger" onclick="reDelete('${a.id}')">${icon("trash", 14)} ${t("re_delete")}</button>` : ``}
        <button class="btn btn-primary" onclick="reSave()">${icon("check", 14)} ${a.id ? t("re_update") : t("re_save")}</button>
      </div>
    </div>

    <div class="re-grid">
      <div class="re-form">

        <section class="re-block">
          <h3 class="re-block__title">${t("re_section_property")}</h3>
          <div class="re-fields">
            <label class="re-field re-field--wide">
              <span>${t("re_field_name")}</span>
              <input type="text" placeholder="${t("re_field_name_hint")}" value="${esc(a.name || "")}" oninput="reCurrent.name=this.value">
            </label>
            <label class="re-field re-field--wide">
              <span>${t("re_field_address")}</span>
              <input type="text" value="${esc(a.address || "")}" oninput="reCurrent.address=this.value">
            </label>
            <label class="re-field">
              <span>${t("re_field_price")}</span>
              <input type="number" inputmode="numeric" min="0" step="1000" value="${a.purchasePrice || ""}" oninput="reCurrent.purchasePrice=Math.max(0,Number(this.value)||0);reRefreshDownPaymentHint();reRefresh()">
            </label>
            <div class="re-field">
              <div class="re-field__head">
                <span>${t("re_field_downpayment")}${reTip("re_tip_dp_mode")}</span>
                <div class="re-toggle" role="tablist">
                  <button type="button" class="re-toggle__btn ${a.downPaymentMode !== "percent" ? "is-active" : ""}" onclick="reSetDownPaymentMode('amount')">$</button>
                  <button type="button" class="re-toggle__btn ${a.downPaymentMode === "percent" ? "is-active" : ""}" onclick="reSetDownPaymentMode('percent')">%</button>
                </div>
              </div>
              ${a.downPaymentMode === "percent" ? `
                <div class="re-input-suffix">
                  <input type="number" inputmode="decimal" min="0" max="100" step="0.5" value="${a.downPaymentPercent ?? ""}" oninput="reCurrent.downPaymentPercent=Math.min(100,Math.max(0,Number(this.value)||0));reRefreshDownPaymentHint();reRefresh()">
                  <span class="re-input-suffix__symbol">%</span>
                </div>
              ` : `
                <div class="re-input-suffix">
                  <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                  <input type="number" inputmode="numeric" min="0" max="${Number(a.purchasePrice) || 99999999}" step="1000" value="${a.downPayment ?? ""}" oninput="reCurrent.downPayment=Math.max(0,Math.min(Number(reCurrent.purchasePrice)||Infinity, Number(this.value)||0));reRefreshDownPaymentHint();reRefresh()">
                </div>
              `}
              <small class="re-hint" id="re-downpayment-hint">${reDownPaymentHintText(a)}</small>
            </div>
            <label class="re-field re-field--wide">
              <span>${t("re_field_unit_type")}</span>
              <select onchange="reSetUnitType(this.value)">
                ${RE_UNIT_TYPES.map(u => `<option value="${u.value}" ${a.unitType === u.value ? "selected" : ""}>${t(u.label)}</option>`).join("")}
              </select>
            </label>
          </div>
        </section>

        <section class="re-block">
          <h3 class="re-block__title">${t("re_section_mortgage")}</h3>
          <div class="re-fields">
            <label class="re-field">
              <span>${t("re_field_amort")}${reTip("re_tip_amort")}</span>
              <input type="number" inputmode="numeric" min="1" max="40" step="1" value="${a.amortYears || ""}" oninput="reCurrent.amortYears=Math.min(40,Math.max(1,Number(this.value)||0));reRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_rate")}${reTip("re_tip_interest")}</span>
              <input type="number" inputmode="decimal" min="0" max="25" step="0.01" value="${a.interestRate || ""}" oninput="reCurrent.interestRate=Math.min(25,Math.max(0,Number(this.value)||0));reRefresh()">
            </label>
            <label class="re-field re-field--wide">
              <span>${t("re_field_payment_freq")}${reTip("re_tip_payment_freq")}</span>
              <select onchange="reCurrent.paymentFrequency=this.value;reRefresh()">
                <option value="monthly" ${a.paymentFrequency === "monthly" ? "selected" : ""}>${t("re_freq_monthly")}</option>
                <option value="biweekly_accel" ${a.paymentFrequency === "biweekly_accel" ? "selected" : ""}>${t("re_freq_biweekly")}</option>
                <option value="weekly_accel" ${a.paymentFrequency === "weekly_accel" ? "selected" : ""}>${t("re_freq_weekly")}</option>
              </select>
            </label>
          </div>
        </section>

        <section class="re-block">
          <h3 class="re-block__title">${t("re_section_charges")}</h3>
          <div class="re-fields">
            <label class="re-field">
              <span>${t("re_field_municipal_tax")}</span>
              <input type="number" inputmode="numeric" min="0" step="100" value="${a.municipalTax || ""}" oninput="reCurrent.municipalTax=Math.max(0,Number(this.value)||0);reRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_school_tax")}</span>
              <input type="number" inputmode="numeric" min="0" step="50" value="${a.schoolTax || ""}" oninput="reCurrent.schoolTax=Math.max(0,Number(this.value)||0);reRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_insurance")}</span>
              <input type="number" inputmode="numeric" min="0" step="50" value="${a.insurance || ""}" oninput="reCurrent.insurance=Math.max(0,Number(this.value)||0);reRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_electricity")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="10" value="${a.electricity || ""}" oninput="reCurrent.electricity=Math.max(0,Number(this.value)||0);reRefresh()">
                <span class="re-input-suffix__symbol">${t("re_metric_per_month")}</span>
              </div>
              <small class="re-hint">${t("re_field_electricity_hint")}</small>
            </label>
            <div class="re-field">
              <div class="re-field__head">
                <input type="text" class="re-field__inline-input" placeholder="${t("re_field_other_service_placeholder")}" value="${esc(a.otherServiceName || "")}" maxlength="50" oninput="reCurrent.otherServiceName=this.value">
              </div>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="10" value="${a.otherServiceAmount || ""}" oninput="reCurrent.otherServiceAmount=Math.max(0,Number(this.value)||0);reRefresh()">
                <span class="re-input-suffix__symbol">${t("re_metric_per_month")}</span>
              </div>
              <small class="re-hint">${t("re_field_other_service_hint")}</small>
            </div>
            <label class="re-field">
              <span>${t("re_field_maintenance")}${reTip("re_tip_maintenance")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="0" max="50" step="0.5" value="${a.maintenancePercent ?? ""}" oninput="reCurrent.maintenancePercent=Math.min(50,Math.max(0,Number(this.value)||0));reRefresh()">
                <span class="re-input-suffix__symbol">%</span>
              </div>
              <small class="re-hint">${t("re_field_maintenance_hint")}</small>
            </label>
            <label class="re-field">
              <span>${t("re_field_vacancy")}${reTip("re_tip_vacancy")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="0" max="50" step="0.5" value="${a.vacancyPercent ?? ""}" oninput="reCurrent.vacancyPercent=Math.min(50,Math.max(0,Number(this.value)||0));reRefresh()">
                <span class="re-input-suffix__symbol">%</span>
              </div>
              <small class="re-hint">${t("re_field_vacancy_hint")}</small>
            </label>
            <label class="re-field re-field--wide">
              <span>${t("re_field_management")}${reTip("re_tip_management")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="0" max="30" step="0.5" value="${a.managementPercent ?? ""}" oninput="reCurrent.managementPercent=Math.min(30,Math.max(0,Number(this.value)||0));reRefresh()">
                <span class="re-input-suffix__symbol">%</span>
              </div>
              <small class="re-hint">${t("re_field_management_hint")}</small>
            </label>
          </div>
        </section>

        <section class="re-block">
          <h3 class="re-block__title">${t("re_section_projection")}</h3>
          <div class="re-fields">
            <label class="re-field">
              <span>${t("re_field_appreciation")}${reTip("re_tip_appreciation")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="-10" max="30" step="0.1" value="${a.appreciationPercent ?? ""}" oninput="reCurrent.appreciationPercent=Math.min(30,Math.max(-10,Number(this.value)||0));reRefresh()">
                <span class="re-input-suffix__symbol">% /an</span>
              </div>
              <small class="re-hint">${t("re_field_appreciation_hint")}</small>
            </label>
            <label class="re-field">
              <span>${t("re_field_rent_increase")}${reTip("re_tip_rent_increase")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="-5" max="20" step="0.1" value="${a.rentIncreasePercent ?? ""}" oninput="reCurrent.rentIncreasePercent=Math.min(20,Math.max(-5,Number(this.value)||0));reRefresh()">
                <span class="re-input-suffix__symbol">% /an</span>
              </div>
              <small class="re-hint">${t("re_field_rent_increase_hint")}</small>
            </label>
          </div>
        </section>

        <section class="re-block">
          <h3 class="re-block__title">${t("re_section_units")}
            ${a.unitType === "custom" ? `<button class="btn-link" style="margin-left:auto" onclick="reAddUnit()">${t("re_unit_add")}</button>` : ""}
          </h3>
          <div class="re-units">
            ${a.units.map((u, i) => `
              <div class="re-unit ${u.ownerOccupied ? "re-unit--owner" : ""}">
                <div class="re-unit__head">
                  <div class="re-unit__label">${t("re_unit_label").replace("{n}", i + 1)}</div>
                  ${u.ownerOccupied ? `<span class="re-unit__owner-badge">${icon("home", 12)} ${t("re_unit_owner_badge")}</span>` : ""}
                </div>
                <label class="re-checkbox re-checkbox--owner">
                  <input type="checkbox" ${u.ownerOccupied ? "checked" : ""} onchange="reToggleOwnerOccupied(${i}, this.checked)">
                  <span>${t("re_unit_owner_occupied")}${reTip("re_tip_owner_occupied")}</span>
                </label>
                ${u.ownerOccupied ? `
                  <div class="re-unit__hint">${t("re_unit_owner_hint")}</div>
                ` : `
                  <label class="re-field">
                    <span>${t("re_unit_rent")}</span>
                    <div class="re-input-suffix">
                      <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                      <input type="number" inputmode="numeric" min="0" max="20000" step="25" value="${u.rent || ""}" oninput="reCurrent.units[${i}].rent=Math.max(0,Number(this.value)||0);reRefresh()">
                      <span class="re-input-suffix__symbol">${t("re_metric_per_month")}</span>
                    </div>
                  </label>
                  <label class="re-checkbox">
                    <input type="checkbox" ${u.utilitiesIncluded ? "checked" : ""} onchange="reCurrent.units[${i}].utilitiesIncluded=this.checked">
                    <span>${t("re_unit_utilities")}${reTip("re_tip_utilities")}</span>
                  </label>
                `}
                ${a.unitType === "custom" && a.units.length > 1 ? `<button class="btn-link btn-link--danger" onclick="reRemoveUnit(${i})">${t("re_unit_remove")}</button>` : ""}
              </div>
            `).join("")}
          </div>
        </section>

        <section class="re-block">
          <h3 class="re-block__title">${t("re_notes")}</h3>
          <textarea class="re-textarea" rows="3" oninput="reCurrent.notes=this.value">${esc(a.notes || "")}</textarea>
        </section>
      </div>

      <aside class="re-results" id="re-results">
        ${renderRealEstateResults(a)}
      </aside>
    </div>
  </div>`;
  return h;
}

function renderRealEstateResults(a) {
  const m = calculateRealEstateMetrics(a);
  const cfClass = m.monthlyCashFlow >= 0 ? "pos" : "neg";
  const stressClass = m.stressMonthlyCashFlow >= 0 ? "pos" : "neg";
  // Coût pour habiter : positif = ça sort de la poche, négatif = on encaisse même en habitant
  const costClass = m.costToLiveMonthly <= 0 ? "pos" : "neg";
  return `
    <div class="re-results__sticky">
      <div class="re-verdict-big re-verdict--${m.verdict}">
        <div class="re-verdict-big__label">${t("re_verdict_" + m.verdict)}</div>
        <div class="re-verdict-big__hint">${t("re_hint_" + (m.verdict === "unknown" ? "good" : m.verdict))}</div>
      </div>

      <details class="re-reasons">
        <summary class="re-reasons__summary">
          ${icon("info", 14)}
          <span>${t("re_reasons_summary")}</span>
        </summary>
        <div class="re-reasons__body">
          ${getVerdictReasons(a, m).map(r => `
            <div class="re-reason re-reason--${r.status}">
              <div class="re-reason__icon">${r.status === 'pass' ? '✓' : r.status === 'warn' ? '!' : '✗'}</div>
              <div class="re-reason__body">
                <div class="re-reason__title">${r.title}</div>
                <div class="re-reason__detail">${r.detail}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </details>

      ${m.hasOwnerOccupied ? `
        <div class="re-metric re-metric--highlight">
          <div class="re-metric__label">${icon("home", 12)} ${t("re_metric_cost_to_live")}${reTip("re_tip_cost_to_live")}</div>
          <div class="re-metric__value re-metric__value--big re-metric__value--${costClass}">${m.costToLiveMonthly <= 0 ? "+" : ""}${fmtMoney(Math.abs(m.costToLiveMonthly))}<span class="re-metric__suffix">${t("re_metric_per_month")}</span></div>
          <div class="re-metric__sub">${m.costToLiveMonthly > 0 ? t("re_metric_cost_to_live_neg") : t("re_metric_cost_to_live_pos")}</div>
        </div>
      ` : ""}

      <div class="re-metric">
        <div class="re-metric__label">${t("re_metric_cashflow")}${reTip("re_tip_cashflow")}</div>
        <div class="re-metric__value re-metric__value--big re-metric__value--${cfClass}">${fmtMoney(m.monthlyCashFlow)}<span class="re-metric__suffix">${t("re_metric_per_month")}</span></div>
        <div class="re-metric__sub">${fmtMoney(m.annualCashFlow)}${t("re_metric_per_year")}</div>
      </div>

      <div class="re-metric-row">
        <div class="re-metric">
          <div class="re-metric__label">${t("re_metric_cap_rate")}${reTip("re_tip_cap_rate")}</div>
          <div class="re-metric__value">${m.capRate.toFixed(2)}%</div>
        </div>
        <div class="re-metric">
          <div class="re-metric__label">${t("re_metric_mrb")}${reTip("re_tip_mrb")}</div>
          <div class="re-metric__value">${m.grossAnnualRent > 0 ? m.mrb.toFixed(1) : "—"}</div>
        </div>
      </div>

      <div class="re-metric-row">
        <div class="re-metric">
          <div class="re-metric__label">${t("re_metric_dscr")}${reTip("re_tip_dscr")}</div>
          <div class="re-metric__value ${m.dscr !== null && m.dscr < 1 ? "re-metric__value--neg" : (m.dscr !== null && m.dscr >= 1.2 ? "re-metric__value--pos" : "")}">${m.dscr === null ? "—" : m.dscr.toFixed(2)}</div>
        </div>
        <div class="re-metric">
          <div class="re-metric__label">${t("re_metric_coc")}${reTip("re_tip_coc")}</div>
          <div class="re-metric__value ${m.cashOnCash !== null && m.cashOnCash < 0 ? "re-metric__value--neg" : (m.cashOnCash !== null && m.cashOnCash >= 5 ? "re-metric__value--pos" : "")}">${m.cashOnCash === null ? "—" : m.cashOnCash.toFixed(2) + "%"}</div>
        </div>
      </div>

      <div class="re-metric">
        <div class="re-metric__label">${t("re_metric_breakeven")}${reTip("re_tip_breakeven")}</div>
        <div class="re-metric__value ${m.breakEvenOccupancy !== null && m.breakEvenOccupancy > 95 ? "re-metric__value--neg" : (m.breakEvenOccupancy !== null && m.breakEvenOccupancy < 85 ? "re-metric__value--pos" : "")}">${m.breakEvenOccupancy === null ? "—" : m.breakEvenOccupancy.toFixed(1) + "%"}</div>
        <div class="re-metric__sub">${t("re_metric_breakeven_sub")}</div>
      </div>

      <div class="re-metric">
        <div class="re-metric__label">${t("re_metric_mortgage_pmt")}${reTip("re_tip_mortgage_pmt")}</div>
        <div class="re-metric__breakdown">
          <div><span>${t("re_metric_mortgage_monthly")}</span><strong>${fmtMoney(m.monthlyPmt)}</strong></div>
          <div><span>${t("re_metric_mortgage_biw")}</span><strong>${fmtMoney(m.biweeklyPmt)}</strong></div>
          <div><span>${t("re_metric_mortgage_wkl")}</span><strong>${fmtMoney(m.weeklyPmt)}</strong></div>
        </div>
      </div>

      <div class="re-metric">
        <div class="re-metric__label">${t("re_metric_gross_rent")}${reTip("re_tip_gross_rent")}</div>
        <div class="re-metric__value">${fmtMoney(m.grossMonthlyRent)}<span class="re-metric__suffix">${t("re_metric_per_month")}</span></div>
        <div class="re-metric__sub">${fmtMoney(m.grossAnnualRent)}${t("re_metric_per_year")}</div>
      </div>

      <div class="re-metric">
        <div class="re-metric__label">${t("re_metric_noi")}${reTip("re_tip_noi")}</div>
        <div class="re-metric__value">${fmtMoney(m.noi)}${t("re_metric_per_year")}</div>
      </div>

      <div class="re-metric">
        <div class="re-metric__label">${t("re_metric_total_exp")}${reTip("re_tip_total_exp")}</div>
        <div class="re-metric__value">${fmtMoney(m.totalOpex)}${t("re_metric_per_year")}</div>
      </div>

      <div class="re-metric re-metric--stress">
        <div class="re-metric__label">${t("re_metric_stress")}${reTip("re_tip_stress")}</div>
        <div class="re-metric__value re-metric__value--${stressClass}">${fmtMoney(m.stressMonthlyCashFlow)}<span class="re-metric__suffix">${t("re_metric_per_month")}</span></div>
      </div>

      <div id="re-projection">${renderRealEstateProjection(a, reProjectionYears)}</div>
    </div>
  `;
}

function renderRealEstateProjection(a, years) {
  const p = projectRealEstate(a, years);
  const profitClass = p.totalProfit >= 0 ? "pos" : "neg";
  const cumCfClass = p.cumCashFlow >= 0 ? "pos" : "neg";
  const returnClass = (p.annualizedReturn ?? 0) >= 0 ? "pos" : "neg";
  const pills = [5, 10, 15, 25];
  return `
    <div class="re-projection">
      <div class="re-projection__head">
        <div class="re-metric__label" style="margin-bottom:0">${icon("trending-up", 12)} ${t("re_section_projection_results")}</div>
      </div>
      <div class="re-projection__years">
        ${pills.map(y => `<button class="re-toggle__btn ${p.years === y ? "is-active" : ""}" onclick="reSetProjectionYears(${y})">${y} ${t("re_years_short")}</button>`).join("")}
        <div class="re-projection__custom">
          <input type="number" min="1" max="50" step="1" value="${p.years}" oninput="reSetProjectionYears(Number(this.value)||10)" aria-label="${t("re_field_custom_years")}">
          <span class="re-projection__custom-label">${t("re_years")}</span>
        </div>
      </div>

      <div class="re-proj-grid">
        <div class="re-proj-stat">
          <div class="re-proj-stat__label">${t("re_proj_future_value")}</div>
          <div class="re-proj-stat__value">${fmtMoney(p.futureValue)}</div>
          <div class="re-proj-stat__sub">${t("re_proj_initial_price").replace("{n}", fmtMoney(a.purchasePrice || 0))}</div>
        </div>
        <div class="re-proj-stat re-proj-stat--gain">
          <div class="re-proj-stat__label">${icon("trending-up", 12)} ${t("re_proj_appreciation_gain")}</div>
          <div class="re-proj-stat__value re-proj-stat__value--pos">+${fmtMoney(p.appreciationGain)}</div>
          <div class="re-proj-stat__sub">${(Number(a.appreciationPercent) || 0).toFixed(1)}% /an &times; ${p.years} ${t("re_years_short")}</div>
        </div>
        <div class="re-proj-stat">
          <div class="re-proj-stat__label">${t("re_proj_mortgage_balance")}</div>
          <div class="re-proj-stat__value">${fmtMoney(p.mortgageBalance)}</div>
          <div class="re-proj-stat__sub">${p.fullyPaidOff ? t("re_proj_fully_paid") : t("re_proj_paid_down").replace("{n}", fmtMoney(p.principalPaidDown))}</div>
        </div>
        <div class="re-proj-stat re-proj-stat--accent">
          <div class="re-proj-stat__label">${t("re_proj_equity")}</div>
          <div class="re-proj-stat__value">${fmtMoney(p.equity)}</div>
          <div class="re-proj-stat__sub">${t("re_proj_equity_gain").replace("{n}", fmtMoney(p.equityNetGain))}</div>
        </div>
        <div class="re-proj-stat">
          <div class="re-proj-stat__label">${t("re_proj_cum_rent")}</div>
          <div class="re-proj-stat__value">${fmtMoney(p.cumGrossRent)}</div>
        </div>
        <div class="re-proj-stat">
          <div class="re-proj-stat__label">${t("re_proj_cum_cashflow")}</div>
          <div class="re-proj-stat__value re-proj-stat__value--${cumCfClass}">${fmtMoney(p.cumCashFlow)}</div>
        </div>
        <div class="re-proj-stat re-proj-stat--total">
          <div class="re-proj-stat__label">${t("re_proj_total_profit")}</div>
          <div class="re-proj-stat__value re-proj-stat__value--${profitClass}">${fmtMoney(p.totalProfit)}</div>
        </div>
      </div>

      <div class="re-proj-breakdown">
        <div class="re-proj-breakdown__title">${t("re_proj_breakdown_title")}</div>
        <div class="re-proj-breakdown__row">
          <span class="re-proj-breakdown__icon" style="background:var(--status-green-bg);color:var(--status-green)">${icon("trending-up", 12)}</span>
          <span class="re-proj-breakdown__label">${t("re_proj_bd_appreciation")}</span>
          <span class="re-proj-breakdown__val">+${fmtMoney(p.appreciationGain)}</span>
        </div>
        <div class="re-proj-breakdown__row">
          <span class="re-proj-breakdown__icon" style="background:var(--status-blue-bg);color:var(--status-blue)">${icon("shield-check", 12)}</span>
          <span class="re-proj-breakdown__label">${t("re_proj_bd_principal")}</span>
          <span class="re-proj-breakdown__val">+${fmtMoney(p.principalPaidDown)}</span>
        </div>
        <div class="re-proj-breakdown__row">
          <span class="re-proj-breakdown__icon" style="background:${p.cumCashFlow >= 0 ? 'var(--status-green-bg)' : 'var(--status-red-bg)'};color:${p.cumCashFlow >= 0 ? 'var(--status-green)' : 'var(--status-red)'}">${icon("dollar-sign", 12)}</span>
          <span class="re-proj-breakdown__label">${t("re_proj_bd_cashflow")}</span>
          <span class="re-proj-breakdown__val ${p.cumCashFlow < 0 ? 're-proj-breakdown__val--neg' : ''}">${p.cumCashFlow >= 0 ? '+' : ''}${fmtMoney(p.cumCashFlow)}</span>
        </div>
        <div class="re-proj-breakdown__row re-proj-breakdown__row--total">
          <span class="re-proj-breakdown__label">${t("re_proj_bd_total")}</span>
          <span class="re-proj-breakdown__val re-proj-breakdown__val--${profitClass}">${p.totalProfit >= 0 ? '+' : ''}${fmtMoney(p.totalProfit)}</span>
        </div>
      </div>

      <div class="re-proj-return re-proj-return--${returnClass}">
        <div class="re-proj-return__label">${t("re_proj_annualized_return")}</div>
        <div class="re-proj-return__value">${p.annualizedReturn === null ? "—" : p.annualizedReturn.toFixed(2) + "%"}<span class="re-proj-return__suffix">/an</span></div>
        <div class="re-proj-return__hint">${t("re_proj_annualized_hint").replace("{dp}", fmtMoney(calculateRealEstateMetrics(a).downPayment))}</div>
      </div>
    </div>
  `;
}

function reSetProjectionYears(years) {
  reProjectionYears = Math.max(1, Math.min(50, Number(years) || 10));
  const block = document.getElementById("re-projection");
  if (block && reCurrent) block.innerHTML = renderRealEstateProjection(reCurrent, reProjectionYears);
}

// Handlers
function reNew() {
  reCurrent = reNewAnalysis();
  reMode = "edit";
  renderPage();
}
function reEdit(id) {
  const a = realEstateAnalyses.find(x => x.id === id);
  if (!a) return;
  reCurrent = JSON.parse(JSON.stringify(a)); // clone profond pour ne pas muter Firestore en live
  // Migration douce : appliquer les valeurs par défaut pour les champs ajoutés après la sauvegarde initiale
  const defaults = reNewAnalysis();
  for (const key of Object.keys(defaults)) {
    if (reCurrent[key] === undefined || reCurrent[key] === null) {
      reCurrent[key] = defaults[key];
    }
  }
  // Migration du champ legacy "services" → électricité (compatibilité)
  if (reCurrent.services !== undefined && reCurrent.electricity === undefined) {
    reCurrent.electricity = reCurrent.services;
    delete reCurrent.services;
  }
  // Assurer que chaque unité a les nouveaux champs
  reCurrent.units = (reCurrent.units || []).map(u => ({
    name: u.name || "Logement",
    rent: Number(u.rent) || 0,
    utilitiesIncluded: u.utilitiesIncluded !== undefined ? !!u.utilitiesIncluded : true,
    ownerOccupied: !!u.ownerOccupied
  }));
  if (!reCurrent.units.length) reCurrent.units = [{ name: "Logement 1", rent: 0, utilitiesIncluded: true, ownerOccupied: false }];
  reMode = "edit";
  renderPage();
}
function reBackToList() {
  reCurrent = null;
  reMode = "list";
  renderPage();
}
function reRefresh() {
  // Met à jour seulement le panneau de résultats, sans recréer les inputs (préserve le focus)
  const panel = document.getElementById("re-results");
  if (panel && reCurrent) panel.innerHTML = renderRealEstateResults(reCurrent);
}
function reRefreshDownPaymentHint() {
  const el = document.getElementById("re-downpayment-hint");
  if (el && reCurrent) el.textContent = reDownPaymentHintText(reCurrent);
}
function reDownPaymentHintText(a) {
  const price = Number(a.purchasePrice) || 0;
  if (a.downPaymentMode === "percent") {
    const pct = Number(a.downPaymentPercent) || 0;
    const dollar = (price * pct) / 100;
    if (price <= 0) return "Entre d'abord le prix d'achat pour voir l'équivalent en $.";
    if (pct === 0) return "≈ 0 $ — Sans mise de fond, tu finances 100% du prix.";
    return `≈ ${fmtMoney(dollar)}`;
  }
  const dp = Number(a.downPayment) || 0;
  if (price <= 0) return "Entre d'abord le prix d'achat pour voir l'équivalent en %.";
  if (dp === 0) return "≈ 0% — Sans mise de fond, tu finances 100% du prix.";
  const pct = (dp / price) * 100;
  return `≈ ${pct.toFixed(1)}% du prix d'achat`;
}
function reSetDownPaymentMode(mode) {
  if (!reCurrent) return;
  const price = Number(reCurrent.purchasePrice) || 0;
  // Quand on bascule, on synchronise pour préserver la valeur saisie
  if (mode === "percent" && reCurrent.downPaymentMode !== "percent") {
    if (price > 0) reCurrent.downPaymentPercent = +(((Number(reCurrent.downPayment) || 0) / price) * 100).toFixed(2);
  } else if (mode === "amount" && reCurrent.downPaymentMode === "percent") {
    if (price > 0) reCurrent.downPayment = Math.round((price * (Number(reCurrent.downPaymentPercent) || 0)) / 100);
  }
  reCurrent.downPaymentMode = mode;
  renderPage();
}
function reToggleOwnerOccupied(idx, checked) {
  if (!reCurrent || !reCurrent.units || !reCurrent.units[idx]) return;
  reCurrent.units[idx].ownerOccupied = !!checked;
  if (checked) {
    // On garde le loyer à 0 et utilities included par défaut quand on habite
    reCurrent.units[idx].rent = 0;
  }
  renderPage();
}
function reSetUnitType(type) {
  if (!reCurrent) return;
  const def = RE_UNIT_TYPES.find(u => u.value === type);
  reCurrent.unitType = type;
  if (type !== "custom") {
    const target = def ? def.count : 1;
    const cur = reCurrent.units || [];
    const newUnits = [];
    for (let i = 0; i < target; i++) {
      newUnits.push(cur[i] || { name: `Logement ${i + 1}`, rent: 0, utilitiesIncluded: true, ownerOccupied: false });
    }
    reCurrent.units = newUnits;
  } else {
    if (!reCurrent.units || !reCurrent.units.length) {
      reCurrent.units = [{ name: "Logement 1", rent: 0, utilitiesIncluded: true, ownerOccupied: false }];
    }
  }
  renderPage();
}
function reAddUnit() {
  if (!reCurrent) return;
  const idx = (reCurrent.units || []).length + 1;
  reCurrent.units.push({ name: `Logement ${idx}`, rent: 0, utilitiesIncluded: true, ownerOccupied: false });
  renderPage();
}
function reRemoveUnit(i) {
  if (!reCurrent || !reCurrent.units || reCurrent.units.length <= 1) return;
  reCurrent.units.splice(i, 1);
  renderPage();
}
async function reSave() {
  if (!reCurrent) return;
  if (!reCurrent.name || !reCurrent.name.trim()) {
    alert("Donne un nom à ton analyse (ex: Triplex St-Jean-Baptiste).");
    return;
  }
  const now = Date.now();
  const payload = { ...reCurrent, updatedAt: now };
  if (!payload.createdAt) payload.createdAt = now;
  if (reCurrent.id) {
    const id = reCurrent.id;
    delete payload.id;
    await db.collection("realEstateAnalyses").doc(id).set(payload, { merge: true });
  } else {
    delete payload.id;
    const ref = await db.collection("realEstateAnalyses").add(payload);
    reCurrent.id = ref.id;
  }
  reBackToList();
}
async function reDelete(id) {
  if (!id) return;
  if (!confirm(t("re_confirm_delete"))) return;
  await db.collection("realEstateAnalyses").doc(id).delete();
  reBackToList();
}
