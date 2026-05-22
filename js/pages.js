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
        <input id="a-balance" type="number" step="any"value="${a?.initialBalance ?? 0}"/>
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
  else { const nid = genId(); await db.collection("accounts").doc(nid).set({ ...data, id: nid, sortOrder: accounts.length, userId: currentUserId }); }
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
      <label>${t("tx_field_amount")}<input id="tx-amount" type="number" step="any"min="0" value="${tx?.amount ?? ""}" autofocus/></label>
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
    await db.collection("transactions").doc(nid).set({ ...data, id: nid, userId: currentUserId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
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
    await db.collection("categories").doc(id).set({ ...c, id, userId: currentUserId });
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
    await db.collection("categories").doc(newId).set({ ...data, id: newId, userId: currentUserId });
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
      <input id="b-limit" type="number" step="any"min="0" value="${existing?.monthlyLimit || ""}" placeholder="ex: 500" autofocus/>
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
    await db.collection("budgets").doc(nid).set({ ...data, id: nid, userId: currentUserId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
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
    await db.collection("subscriptions").doc(nid).set({ ...data, id: nid, userId: currentUserId, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  }
}

async function ignoreSubscription(key, name) {
  const existing = subscriptions.find(s => s.key === key);
  if (existing) {
    await db.collection("subscriptions").doc(existing.id).update({ status: "ignored" });
  } else {
    const nid = genId();
    await db.collection("subscriptions").doc(nid).set({
      id: nid, key, name, status: "ignored", userId: currentUserId,
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
    downPaymentMode: "percent",  // "amount" | "percent"
    downPayment: 0,
    downPaymentPercent: 5,       // défaut : mise de fonds minimale légale
    amortYears: 30,              // défaut : amortissement long
    interestRate: 4,             // défaut : taux conservateur
    paymentFrequency: "monthly",
    municipalTax: 0,
    schoolTax: 0,
    insurance: 0,
    // Services décomposés
    electricity: 0,             // $/mois (électricité payée par le proprio)
    otherServiceName: "",       // nom libre (ex: "Internet immeuble", "Déneigement")
    otherServiceAmount: 0,      // montant tel que saisi (en $)
    otherServiceFrequency: "monthly", // "monthly" | "annual" — fréquence du montant
    // Maintenance & travaux — peut être % de loyer, $/mois fixe, ou $/an fixe
    maintenancePercent: 5,
    maintenanceMode: "percent", // "percent" | "monthly" | "annual"
    maintenanceAmount: 0,       // utilisé si mode = monthly ou annual
    vacancyPercent: 3,
    vacancyEnabled: true,       // si false, vacance ignorée
    managementPercent: 0,
    // Projection à long terme
    appreciationPercent: 5,    // appréciation annuelle du prix (% / an) — médiane historique Qc long terme
    rentIncreasePercent: 3.1,  // augmentation annuelle du loyer (% / an) — TAL Qc 2026 officiel
    // Seuils MRB personnalisables (varient selon le marché local : centre urbain plus haut, banlieue plus bas)
    mrbTargetGood: 14,         // MRB max pour qualifier de "bon" investissement (défaut Qc urbain)
    mrbTargetExcellent: 10,    // MRB max pour qualifier d'"excellent" investissement
    // Simulateur de prix d'offre — cash flow mensuel souhaité (défaut 0 = équilibre)
    simTargetCashFlow: 0,
    // Coût d'opportunité — taux annuel d'un placement alternatif en bourse (FNB indiciel)
    stockMarketRate: 7,
    // Frais de clôture (ponctuels, payés à l'achat) — auto-calculés mais modifiables
    welcomeTaxAuto: true,      // si true, recalculer auto selon prix
    welcomeTax: 0,             // taxe de bienvenue Qc
    notaryFees: 2500,          // honoraires notaire (défaut prudent)
    inspectionFees: 600,       // inspection pré-achat
    otherClosingFees: 0,       // autres (assurance titre, etc.)
    // Assurance hypothécaire SCHL (si DP < 20%, ajoutée au prêt)
    schlAuto: true,            // recalculer auto selon ratio DP
    schlPremium: 0,            // prime SCHL en $
    // Fiscalité (estimation simplifiée)
    fiscalEnabled: false,      // si true, applique les calculs fiscaux
    marginalTaxRate: 37.12,    // taux marginal combiné (fédéral+Qc) — moyen-supérieur défaut
    useCCA: false,             // déduction pour amortissement (CCA classe 1)
    buildingPortionPercent: 80, // % du prix attribué au bâtiment (pas le terrain)
    unitType: "triplex",
    units: [
      { name: "Logement 1", subtype: "", rent: 0, utilitiesIncluded: true, ownerOccupied: false },
      { name: "Logement 2", subtype: "", rent: 0, utilitiesIncluded: true, ownerOccupied: false },
      { name: "Logement 3", subtype: "", rent: 0, utilitiesIncluded: true, ownerOccupied: false }
    ],
    notes: ""
  };
}

// Calcule la taxe de bienvenue (droits de mutation) au Québec selon le prix d'achat.
// Grille générale Québec 2025 (la plupart des municipalités hors Montréal centre)
function reComputeWelcomeTax(price) {
  if (!price || price <= 0) return 0;
  // Tranches Qc (2025) — ajustées annuellement à l'IPC, valeurs approx
  const brackets = [
    { upTo: 58900,   rate: 0.005 },  // 0.5%
    { upTo: 294600,  rate: 0.010 },  // 1.0%
    { upTo: 552300,  rate: 0.015 },  // 1.5%
    { upTo: Infinity, rate: 0.020 }  // 2.0% (Montréal va jusqu'à 3-4% sur tranches supérieures)
  ];
  let tax = 0;
  let prev = 0;
  for (const b of brackets) {
    if (price > prev) {
      const slice = Math.min(price, b.upTo) - prev;
      tax += slice * b.rate;
      prev = b.upTo;
      if (price <= b.upTo) break;
    }
  }
  return tax;
}

// Calcule la prime d'assurance SCHL si la mise de fond est < 20%.
// Tarifs SCHL 2024 — la prime est ajoutée au principal du prêt.
function reComputeSchlPremium(price, downPayment) {
  if (!price || price <= 0 || downPayment >= price) return 0;
  const baseLoan = price - downPayment;
  const dpRatio = downPayment / price;
  // Tolérance epsilon pour éviter le drift IEEE 754 aux seuils exacts (20%, 15%, 10%, 5%)
  const EPS = 1e-6;
  let rate = 0;
  if (dpRatio >= 0.20 - EPS) rate = 0;             // pas d'assurance requise
  else if (dpRatio >= 0.15 - EPS) rate = 0.028;    // 2.80%
  else if (dpRatio >= 0.10 - EPS) rate = 0.031;    // 3.10%
  else if (dpRatio >= 0.05 - EPS) rate = 0.040;    // 4.00%
  else rate = 0; // < 5% : prêt assuré non disponible normalement
  return baseLoan * rate;
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

// Calcule l'IRR (taux de rendement interne) d'un flux de trésorerie.
// cashFlows[0] doit être négatif (investissement initial), suivi des CF annuels.
// Retourne le taux en pourcentage, ou null si impossible à calculer.
function reIRR(cashFlows) {
  if (!Array.isArray(cashFlows) || cashFlows.length < 2) return null;
  // Vérifie qu'il y a au moins un négatif et un positif
  const hasNeg = cashFlows.some(c => c < 0);
  const hasPos = cashFlows.some(c => c > 0);
  if (!hasNeg || !hasPos) return null;
  // Newton-Raphson : start avec 10% comme guess
  let r = 0.10;
  const maxIter = 200;
  for (let iter = 0; iter < maxIter; iter++) {
    let npv = 0, dnpv = 0;
    for (let t = 0; t < cashFlows.length; t++) {
      const cf = cashFlows[t];
      const denom = Math.pow(1 + r, t);
      if (!isFinite(denom) || denom === 0) { return null; }
      npv += cf / denom;
      if (t > 0) dnpv -= t * cf / (denom * (1 + r));
    }
    if (Math.abs(dnpv) < 1e-12) break;
    const rNew = r - npv / dnpv;
    // Floor à -99% pour éviter divergence
    const rClamped = Math.max(-0.99, Math.min(10, rNew));
    if (Math.abs(rClamped - r) < 1e-8) { r = rClamped; break; }
    r = rClamped;
  }
  if (!isFinite(r)) return null;
  return r * 100;
}

// Calcule le tableau d'amortissement (12 premiers paiements mensuels) pour la 1ère année.
function reAmortizationFirstYear(principal, annualRatePct, years) {
  if (!principal || principal <= 0 || !years) return [];
  const i = Math.pow(1 + annualRatePct / 100 / 2, 2 / 12) - 1;
  const n = years * 12;
  if (i === 0) {
    const PMT = principal / n;
    let balance = principal;
    const rows = [];
    for (let m = 1; m <= 12; m++) {
      balance -= PMT;
      rows.push({ month: m, payment: PMT, interest: 0, principalPaid: PMT, balance: Math.max(0, balance) });
    }
    return rows;
  }
  const PMT = principal * i / (1 - Math.pow(1 + i, -n));
  let balance = principal;
  const rows = [];
  for (let m = 1; m <= 12; m++) {
    const interest = balance * i;
    const principalPaid = PMT - interest;
    balance -= principalPaid;
    rows.push({ month: m, payment: PMT, interest, principalPaid, balance: Math.max(0, balance) });
  }
  return rows;
}

// Calcule l'intérêt total payé sur la 1ère année d'hypothèque (utile pour fiscalité).
function reInterestPaidYear1(principal, annualRatePct, years) {
  if (!principal || principal <= 0 || annualRatePct <= 0 || !years) return 0;
  const i = Math.pow(1 + annualRatePct / 100 / 2, 2 / 12) - 1;
  const n = years * 12;
  if (i === 0) return 0;
  const PMT = principal * i / (1 - Math.pow(1 + i, -n));
  let balance = principal;
  let totalInterest = 0;
  for (let m = 1; m <= 12; m++) {
    const interestPortion = balance * i;
    totalInterest += interestPortion;
    balance -= (PMT - interestPortion);
  }
  return totalInterest;
}

// Calcule l'impact fiscal annuel : revenu locatif imposable, impôt, cash flow après impôt.
// Optionnel : CCA (amortissement bâtiment 4% classe 1, règle demi-année année 1).
// Optionnel : projection du gain en capital à la vente.
function reFiscalImpact(a, m, horizon) {
  if (!a || !m) return null;
  const taxRate = (Number(a.marginalTaxRate) || 0) / 100;
  // Intérêt hypothécaire déductible (approximation : intérêt année 1, légèrement décroissant chaque année)
  const interestY1 = reInterestPaidYear1(m.principal, a.interestRate, a.amortYears || 25);
  // CCA optionnelle
  const buildingPct = Math.min(100, Math.max(0, Number(a.buildingPortionPercent) || 80)) / 100;
  const buildingValue = (Number(a.purchasePrice) || 0) * buildingPct;
  // Règle demi-année : année 1 CCA = bâtiment × 4% × 50%
  const ccaY1 = a.useCCA ? buildingValue * 0.04 * 0.5 : 0;
  // Revenu net imposable = NOI − intérêts − CCA (plancher à 0 car CCA ne peut créer une perte au Qc)
  const taxableIncomePreCCA = m.noi - interestY1;
  const taxableIncome = Math.max(0, taxableIncomePreCCA - ccaY1);
  const annualIncomeTax = Math.max(0, taxableIncome * taxRate);
  const annualAfterTaxCashFlow = m.annualCashFlow - annualIncomeTax;
  const monthlyAfterTaxCashFlow = annualAfterTaxCashFlow / 12;
  // Gain en capital projeté à l'horizon de projection
  const apprRate = (Number(a.appreciationPercent) || 0) / 100;
  const horizonYears = Math.max(1, Number(horizon) || 10);
  const futureValue = (Number(a.purchasePrice) || 0) * Math.pow(1 + apprRate, horizonYears);
  const capitalGain = Math.max(0, futureValue - (Number(a.purchasePrice) || 0));
  const taxableCapitalGain = capitalGain * 0.50; // 50% inclus au revenu
  const capitalGainTax = taxableCapitalGain * taxRate;
  // Récupération CCA à la vente : tout le CCA réclamé est ré-imposé (au taux marginal complet)
  // Estimation simplifiée : CCA cumulée sur N années
  let totalCCA = 0;
  if (a.useCCA) {
    let ucc = buildingValue;
    for (let y = 1; y <= horizonYears; y++) {
      const ccaYear = (y === 1) ? ucc * 0.04 * 0.5 : ucc * 0.04;
      totalCCA += ccaYear;
      ucc -= ccaYear;
    }
  }
  const ccaRecaptureTax = totalCCA * taxRate;
  // Total impôt à la vente
  const totalSaleTax = capitalGainTax + ccaRecaptureTax;
  return {
    taxRate: taxRate * 100,
    interestPaidYear1: interestY1,
    ccaYear1: ccaY1,
    taxableIncome,
    annualIncomeTax,
    annualAfterTaxCashFlow,
    monthlyAfterTaxCashFlow,
    capitalGain,
    capitalGainTax,
    totalCCA,
    ccaRecaptureTax,
    totalSaleTax,
    horizonYears,
    futureValue
  };
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
  // Vacance — appliquée seulement si vacancyEnabled est true (par défaut true pour compat)
  const vacancyApplied = a.vacancyEnabled === false ? 0 : (Number(a.vacancyPercent) || 0);
  const vacancyLoss = grossAnnualRent * (vacancyApplied / 100);
  const effectiveGrossIncome = grossAnnualRent - vacancyLoss;
  // Charges opérationnelles annuelles (sans hypothèque)
  const municipalTax = Number(a.municipalTax) || 0;
  const schoolTax    = Number(a.schoolTax) || 0;
  const insurance    = Number(a.insurance) || 0;
  // Services : électricité (toujours mensuelle) + autre service (mensuel ou annuel)
  const electricityMo = Number(a.electricity) || 0;
  const otherRaw = Number(a.otherServiceAmount) || 0;
  const otherIsAnnual = a.otherServiceFrequency === "annual";
  const otherServiceMo = otherIsAnnual ? (otherRaw / 12) : otherRaw;
  // Compat descendante (anciens docs avec field "services")
  const legacyServicesMo = (a.electricity === undefined && a.otherServiceAmount === undefined)
    ? (Number(a.services) || 0) : 0;
  const servicesMonthly = electricityMo + otherServiceMo + legacyServicesMo;
  const servicesY    = servicesMonthly * 12;
  // Maintenance — selon le mode choisi : % loyer | $/mois fixe | $/an fixe
  let maintenanceFromRent;
  if (a.maintenanceMode === "monthly") {
    maintenanceFromRent = (Number(a.maintenanceAmount) || 0) * 12;
  } else if (a.maintenanceMode === "annual") {
    maintenanceFromRent = Number(a.maintenanceAmount) || 0;
  } else {
    maintenanceFromRent = grossAnnualRent * ((Number(a.maintenancePercent) || 0) / 100);
  }
  // Floor pour proprio-occupant : 1% de la valeur de l'immeuble si aucun logement loué
  const maintenanceFromValue = (Number(a.purchasePrice) || 0) * 0.01;
  const maintenance  = (rentingUnits.length === 0)
    ? Math.max(maintenanceFromRent, maintenanceFromValue)
    : maintenanceFromRent;
  const management   = effectiveGrossIncome * ((Number(a.managementPercent) || 0) / 100);
  const totalOpex = municipalTax + schoolTax + insurance + servicesY + maintenance + management;
  // NOI (Net Operating Income) — exclut le service de la dette
  const noi = effectiveGrossIncome - totalOpex;
  // Hypothèque — basée sur la mise de fond effective (peu importe le mode de saisie)
  const downPayment = reEffectiveDownPayment(a);
  const downPaymentPct = reEffectiveDownPaymentPercent(a);
  const basePrincipal = Math.max(0, (Number(a.purchasePrice) || 0) - downPayment);
  // Prime SCHL — forcée à 0 si DP ≥ 20% (pas d'assurance requise) ou DP < 5% (pas prêt assuré standard)
  // peu importe que schlAuto soit on ou off, on respecte les règles canadiennes
  const purchasePriceNum = Number(a.purchasePrice) || 0;
  const dpRatio = purchasePriceNum > 0 ? downPayment / purchasePriceNum : 0;
  let schlPremium = 0;
  if (dpRatio >= 0.05 - 1e-6 && dpRatio < 0.20 - 1e-6) {
    schlPremium = a.schlAuto !== false
      ? reComputeSchlPremium(purchasePriceNum, downPayment)
      : (Number(a.schlPremium) || 0);
  }
  const principal = basePrincipal + schlPremium;
  // Frais de clôture ponctuels (taxe de bienvenue + notaire + inspection + autres)
  const welcomeTax = a.welcomeTaxAuto !== false
    ? reComputeWelcomeTax(Number(a.purchasePrice) || 0)
    : (Number(a.welcomeTax) || 0);
  const notaryFees = Number(a.notaryFees) || 0;
  const inspectionFees = Number(a.inspectionFees) || 0;
  const otherClosingFees = Number(a.otherClosingFees) || 0;
  const closingCostsTotal = welcomeTax + notaryFees + inspectionFees + otherClosingFees;
  // Cash réellement requis à l'achat (mise de fond + frais de clôture)
  const cashToClose = downPayment + closingCostsTotal;
  const monthlyPmt  = canadianMortgagePayment(principal, a.interestRate, a.amortYears, "monthly");
  const biweeklyPmt = canadianMortgagePayment(principal, a.interestRate, a.amortYears, "biweekly_accel");
  const weeklyPmt   = canadianMortgagePayment(principal, a.interestRate, a.amortYears, "weekly_accel");
  // Coût annuel selon la FRÉQUENCE choisie
  // - mensuel : 12 × paiement
  // - bi-mensuel accéléré : 26 × (mensuel/2) = 13 × mensuel
  // - hebdo accéléré : 52 × (mensuel/4) = 13 × mensuel
  const selectedFreq = a.paymentFrequency || "monthly";
  let annualMortgageStd;
  if (selectedFreq === "biweekly_accel")      annualMortgageStd = biweeklyPmt * 26;
  else if (selectedFreq === "weekly_accel")   annualMortgageStd = weeklyPmt   * 52;
  else                                        annualMortgageStd = monthlyPmt  * 12;
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
  // Cash-on-Cash : retour annuel sur le CASH RÉELLEMENT INVESTI (mise de fond + frais de clôture)
  const cashOnCash = (cashToClose > 0) ? (annualCashFlow / cashToClose) * 100 : null;
  // Break-even occupancy : à quel taux d'occupation l'immeuble couvre tout juste ses coûts
  // ((charges + hypothèque) - frais variables liés aux loyers) / loyers bruts annuels
  // Simplification : on inclut tout dans le seuil. Sous 85% = confortable, au-dessus = fragile.
  const breakEvenOccupancy = (grossAnnualRent > 0)
    ? ((totalOpex + annualMortgageStd) / grossAnnualRent) * 100
    : null;
  // Ratio de charges opérationnelles (RDR) : opex / loyers bruts × 100
  // Standard : <40% bon, 40-50% moyen, >50% élevé. N'inclut pas l'hypothèque.
  const operatingExpenseRatio = (grossAnnualRent > 0) ? (totalOpex / grossAnnualRent) * 100 : null;
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
    // Seuils MRB configurables par analyse (secteur)
    const mrbGood = Number(a.mrbTargetGood) || 14;
    const mrbExc  = Number(a.mrbTargetExcellent) || 10;
    if (monthlyCashFlow < -300) verdict = "bad";                            // Tolère un petit déficit si les fondamentaux sont bons
    else if (capRate < 4 || mrb > mrbGood || stressMonthlyCashFlow < -300) verdict = "risky";
    else if (capRate >= 5 && mrb <= mrbExc && stressMonthlyCashFlow >= 0) verdict = "excellent";
    else verdict = "good";
  }
  return {
    grossMonthlyRent, grossAnnualRent, vacancyLoss, effectiveGrossIncome,
    municipalTax, schoolTax, insurance,
    electricityMo, otherServiceMo, servicesMonthly, servicesY,
    maintenance, management, totalOpex,
    noi, principal, basePrincipal, schlPremium,
    downPayment, downPaymentPct,
    welcomeTax, notaryFees, inspectionFees, otherClosingFees, closingCostsTotal, cashToClose,
    monthlyPmt, biweeklyPmt, weeklyPmt,
    annualMortgageStd, annualCashFlow, monthlyCashFlow,
    costToLiveMonthly,
    capRate, mrb,
    dscr, cashOnCash, breakEvenOccupancy, operatingExpenseRatio,
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
  return `<span class="re-tip" tabindex="0" data-tip="${escAttr(text)}" role="button" aria-label="Définition" onclick="this.classList.toggle('is-open');event.stopPropagation()">i</span>`;
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
    const mrbGood = Number(a.mrbTargetGood) || 14;
    const mrbExc  = Number(a.mrbTargetExcellent) || 10;
    if (m.mrb <= mrbExc) {
      reasons.push({
        status: "pass",
        title: `Prix raisonnable par rapport aux loyers (MRB ${m.mrb.toFixed(1)})`,
        detail: `L'immeuble coûte ${m.mrb.toFixed(1)} × les revenus locatifs annuels. C'est sous ton seuil "excellent" (≤ ${mrbExc}) — bonne affaire pour ce secteur.`
      });
    } else if (m.mrb <= mrbGood) {
      reasons.push({
        status: "warn",
        title: `Prix moyen par rapport aux loyers (MRB ${m.mrb.toFixed(1)})`,
        detail: `L'immeuble coûte ${m.mrb.toFixed(1)} × les revenus locatifs annuels. Entre ${mrbExc} et ${mrbGood} — acceptable pour ce secteur, mais sans aubaine. Le retour par les loyers seuls est lent.`
      });
    } else {
      reasons.push({
        status: "fail",
        title: `Prix élevé par rapport aux loyers (MRB ${m.mrb.toFixed(1)})`,
        detail: `L'immeuble coûte ${m.mrb.toFixed(1)} × les revenus locatifs annuels — c'est plus de ${mrbGood} × (ton seuil pour ce secteur), donc cher. Tu paries fortement sur l'appréciation future plutôt que sur les revenus locatifs.`
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

// Simulateur de prix : étant donné un cash flow mensuel cible, calcule le prix d'achat
// nécessaire pour l'atteindre, en gardant les autres paramètres identiques.
function reSimulatePrice(a, targetMonthlyCashFlow) {
  const rentingUnits = (a.units || []).filter(u => !u.ownerOccupied);
  const hasOwnerOccupied = (a.units || []).some(u => u.ownerOccupied);
  const grossAnnualRent = rentingUnits.reduce((s, u) => s + (Number(u.rent) || 0), 0) * 12;

  if (rentingUnits.length === 0) {
    return { incomplete: true, reason: "all_owner_occupied" };
  }
  if (grossAnnualRent <= 0) {
    return { incomplete: true, reason: "no_rent_entered" };
  }

  // NOI assume rent-based maintenance (mode percent) ou montant fixe (modes monthly/annual)
  const vacancyPct = a.vacancyEnabled === false ? 0 : (Number(a.vacancyPercent) || 0);
  const effIncome = grossAnnualRent * (1 - vacancyPct / 100);
  const electricityMo = Number(a.electricity) || 0;
  const otherRaw = Number(a.otherServiceAmount) || 0;
  const otherIsAnnual = a.otherServiceFrequency === "annual";
  const otherMo = otherIsAnnual ? (otherRaw / 12) : otherRaw;
  const fixedOpex = (Number(a.municipalTax) || 0)
                  + (Number(a.schoolTax) || 0)
                  + (Number(a.insurance) || 0)
                  + (electricityMo + otherMo) * 12;
  let maintenance;
  if (a.maintenanceMode === "monthly") maintenance = (Number(a.maintenanceAmount) || 0) * 12;
  else if (a.maintenanceMode === "annual") maintenance = Number(a.maintenanceAmount) || 0;
  else maintenance = grossAnnualRent * ((Number(a.maintenancePercent) || 0) / 100);
  const management = effIncome * ((Number(a.managementPercent) || 0) / 100);
  const noi = effIncome - (fixedOpex + maintenance + management);

  if (noi <= 0) {
    return { infeasible: true, reason: "Les charges opérationnelles dépassent les loyers, peu importe le prix d'achat. Augmenter les loyers, baisser les charges, ou choisir un autre immeuble." };
  }

  // DP effectif en % (utilisé pour le simulateur, peu importe le mode de saisie)
  const currentPrice = Number(a.purchasePrice) || 0;
  let effectiveDpPct;
  if (a.downPaymentMode === "percent") {
    effectiveDpPct = Number(a.downPaymentPercent) || 0;
  } else {
    effectiveDpPct = currentPrice > 0 ? ((Number(a.downPayment) || 0) / currentPrice) * 100 : 20;
  }
  effectiveDpPct = Math.max(0, Math.min(100, effectiveDpPct));

  // Taux SCHL selon le %, ajouté au principal (epsilon pour éviter drift IEEE 754)
  const EPS_PCT = 1e-4; // 0.0001% de tolérance
  let schlRate = 0;
  if (effectiveDpPct < 20 - EPS_PCT && effectiveDpPct >= 15 - EPS_PCT) schlRate = 0.028;
  else if (effectiveDpPct < 15 - EPS_PCT && effectiveDpPct >= 10 - EPS_PCT) schlRate = 0.031;
  else if (effectiveDpPct < 10 - EPS_PCT && effectiveDpPct >= 5 - EPS_PCT) schlRate = 0.040;

  // Facteur d'hypothèque annuel par $1 de principal (composition canadienne)
  const r = (Number(a.interestRate) || 0) / 100;
  const n = (Number(a.amortYears) || 25) * 12;
  const iMonthly = Math.pow(1 + r / 2, 2 / 12) - 1;
  const mortFactor = iMonthly === 0 ? 12 / n : 12 * iMonthly / (1 - Math.pow(1 + iMonthly, -n));

  // Coefficient principal en fonction du prix:
  //   baseLoan = price × (1 - dpPct/100)
  //   principal = baseLoan × (1 + schlRate)
  //   annualMortgage = principal × mortFactor
  const principalCoef = (1 - effectiveDpPct / 100) * (1 + schlRate);

  // Cible: cashFlowAnnuel = noi - annualMortgage = 12 × T
  // => annualMortgage = noi - 12 × T
  // => price × principalCoef × mortFactor = noi - 12 × T
  // => price = (noi - 12 × T) / (principalCoef × mortFactor)
  const T = Number(targetMonthlyCashFlow) || 0;
  const requiredAnnualNetRent = noi - 12 * T;

  if (principalCoef <= 0) {
    // 100% comptant — pas d'hypothèque, cash flow = NOI/12 indépendant du prix
    return { infeasible: true, reason: "Avec 100% de mise de fond, il n'y a pas d'hypothèque — le prix d'achat n'affecte plus le cash flow.", noi };
  }

  if (requiredAnnualNetRent <= 0) {
    return { infeasible: true, reason: "Ton objectif de cash flow dépasse le revenu net de l'immeuble. Baisse la cible ou améliore les revenus locatifs." };
  }

  const simulatedPrice = requiredAnnualNetRent / (mortFactor * principalCoef);

  // Métriques au prix simulé
  const simBaseLoan = simulatedPrice * (1 - effectiveDpPct / 100);
  const simSchlPremium = simBaseLoan * schlRate;
  const simPrincipal = simBaseLoan + simSchlPremium;
  const simMortPmtMonthly = canadianMortgagePayment(simPrincipal, a.interestRate, a.amortYears, "monthly");
  const simAnnualMortgage = simMortPmtMonthly * 12;
  const simCapRate = simulatedPrice > 0 ? (noi / simulatedPrice) * 100 : 0;
  const simMrb = grossAnnualRent > 0 ? simulatedPrice / grossAnnualRent : null;
  const simDscr = simAnnualMortgage > 0 ? noi / simAnnualMortgage : null;
  const simDownPaymentDollar = simulatedPrice * effectiveDpPct / 100;
  const simWelcomeTax = a.welcomeTaxAuto !== false ? reComputeWelcomeTax(simulatedPrice) : 0;
  const simClosing = simWelcomeTax + (Number(a.notaryFees) || 0) + (Number(a.inspectionFees) || 0) + (Number(a.otherClosingFees) || 0);
  const simCashToClose = simDownPaymentDollar + simClosing;
  const simAnnualCashFlow = noi - simAnnualMortgage;
  const simCoC = simCashToClose > 0 ? (simAnnualCashFlow / simCashToClose) * 100 : null;

  // Comparaison avec le prix demandé
  const diff = currentPrice - simulatedPrice;
  const diffPct = currentPrice > 0 ? (diff / currentPrice) * 100 : 0;

  return {
    incomplete: false, infeasible: false,
    targetCashFlow: T,
    simulatedPrice,
    simCapRate, simMrb, simDscr, simCoC,
    simDownPaymentDollar, simSchlPremium, simCashToClose,
    simMortPmtMonthly, simAnnualMortgage,
    diff, diffPct,
    effectiveDpPct, schlRate,
    noi, grossAnnualRent,
    askingPrice: currentPrice
  };
}

// Ancien calcul de prix conseillé conservé pour compatibilité (utilisé nulle part maintenant)
function reSuggestedPrice(a) {
  const rentingUnits = (a.units || []).filter(u => !u.ownerOccupied);
  const hasOwnerOccupied = (a.units || []).some(u => u.ownerOccupied);
  const grossAnnualRent = rentingUnits.reduce((s, u) => s + (Number(u.rent) || 0), 0) * 12;
  // États "pas applicable" : on retourne un objet avec une raison plutôt que null
  if (rentingUnits.length === 0) {
    return { incomplete: true, reason: "all_owner_occupied" };
  }
  if (grossAnnualRent <= 0) {
    return { incomplete: true, reason: "no_rent_entered" };
  }

  const vacancyPct = Number(a.vacancyPercent) || 0;
  const maintenancePct = Number(a.maintenancePercent) || 0;
  const managementPct = Number(a.managementPercent) || 0;
  const fixedOpex = (Number(a.municipalTax) || 0)
                  + (Number(a.schoolTax) || 0)
                  + (Number(a.insurance) || 0)
                  + ((Number(a.electricity) || 0) + (Number(a.otherServiceAmount) || 0)) * 12;
  const effIncome = grossAnnualRent * (1 - vacancyPct / 100);
  const maintenance = grossAnnualRent * (maintenancePct / 100);
  const management = effIncome * (managementPct / 100);
  // NOI assume rent-based maintenance (simplification, le floor 0.5% du prix est ignoré ici)
  const noi = effIncome - (fixedOpex + maintenance + management);

  // Facteur d'hypothèque : paiement annuel par dollar de principal
  const r = (Number(a.interestRate) || 0) / 100;
  const n = (Number(a.amortYears) || 25) * 12;
  const iMonthly = Math.pow(1 + r / 2, 2 / 12) - 1;
  const mortFactor = (iMonthly === 0) ? 12 / n
                   : 12 * iMonthly / (1 - Math.pow(1 + iMonthly, -n));
  // Stress test +2%
  const rStress = ((Number(a.interestRate) || 0) + 2) / 100;
  const iStress = Math.pow(1 + rStress / 2, 2 / 12) - 1;
  const mortFactorStress = (iStress === 0) ? 12 / n
                         : 12 * iStress / (1 - Math.pow(1 + iStress, -n));

  // Contraintes sur le prix max
  // (a) Cash flow ≥ 0 :  NOI ≥ mortFactor × principal
  //     - mode amount :  principal = price - dp  →  price ≤ NOI/mortFactor + dp
  //     - mode percent : principal = price × (1 - dp%/100)  →  price ≤ NOI / (mortFactor × (1 - dp%/100))
  const dpMode = a.downPaymentMode;
  const dpAmount = Number(a.downPayment) || 0;
  const dpPct = Number(a.downPaymentPercent) || 0;
  let priceFromCashflow, priceFromStress;
  if (dpMode === "percent") {
    const principalCoef = 1 - dpPct / 100;
    if (principalCoef <= 0) {
      // 100% mise de fond → pas d'hypothèque → cash flow toujours = NOI > 0 normalement
      priceFromCashflow = Infinity;
      priceFromStress = Infinity;
    } else {
      priceFromCashflow = noi / (mortFactor * principalCoef);
      priceFromStress   = noi / (mortFactorStress * principalCoef);
    }
  } else {
    priceFromCashflow = noi / mortFactor + dpAmount;
    priceFromStress   = noi / mortFactorStress + dpAmount;
  }

  // (b) Cap rate cible : NOI/price ≥ cible%  →  price ≤ NOI/cible
  const priceFromCapGood       = noi / 0.04;  // 4%
  const priceFromCapExcellent  = noi / 0.05;  // 5%

  // (c) MRB cible : price/grossAnnual ≤ cible  →  price ≤ grossAnnual × cible
  // Seuils MRB configurables par analyse (varient selon le marché local)
  const mrbGoodTarget = Number(a.mrbTargetGood) || 14;
  const mrbExcellentTarget = Number(a.mrbTargetExcellent) || 10;
  const priceFromMrbGood       = grossAnnualRent * mrbGoodTarget;
  const priceFromMrbExcellent  = grossAnnualRent * mrbExcellentTarget;

  // Si NOI ≤ 0, aucun prix ne peut donner un bon investissement (les charges dépassent les loyers)
  if (noi <= 0) {
    return { noi, grossAnnualRent, infeasible: true,
      reason: "Les charges opérationnelles dépassent les loyers, peu importe le prix d'achat. Augmenter les loyers, baisser les charges, ou choisir un autre immeuble." };
  }

  // Le prix maximum est le MINIMUM des contraintes
  const goodCandidates = {
    cashflow: priceFromCashflow,
    capRate:  priceFromCapGood,
    mrb:      priceFromMrbGood
  };
  const excellentCandidates = {
    cashflow: priceFromCashflow,
    capRate:  priceFromCapExcellent,
    mrb:      priceFromMrbExcellent,
    stress:   priceFromStress
  };

  const goodPrice      = Math.min(...Object.values(goodCandidates));
  const excellentPrice = Math.min(...Object.values(excellentCandidates));

  // Identifie quelle contrainte limite (pour le dropdown explicatif)
  const goodBinding      = Object.entries(goodCandidates).reduce((acc, [k, v]) => v === goodPrice ? k : acc, null);
  const excellentBinding = Object.entries(excellentCandidates).reduce((acc, [k, v]) => v === excellentPrice ? k : acc, null);

  return {
    grossAnnualRent, noi,
    goodPrice, excellentPrice, goodBinding, excellentBinding,
    candidates: { good: goodCandidates, excellent: excellentCandidates },
    askingPrice: Number(a.purchasePrice) || 0,
    infeasible: false
  };
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
  const fixedOpexY1 = base.municipalTax + base.schoolTax + base.insurance + base.servicesY;
  // Vacance respecte le toggle vacancyEnabled
  const vacancyPctProj = a.vacancyEnabled === false ? 0 : (Number(a.vacancyPercent) || 0);
  // Maintenance respecte le mode choisi (% loyer / $/mois / $/an)
  const maintMode = a.maintenanceMode || "percent";
  const maintAmount = Number(a.maintenanceAmount) || 0;
  const maintPctVal = Number(a.maintenancePercent) || 0;
  let cumGrossRent = 0;
  let cumNOI = 0;
  let cumCashFlow = 0;
  const yearlyCashFlows = []; // pour le calcul d'IRR
  for (let y = 1; y <= years; y++) {
    const g = Math.pow(1 + rentRate, y - 1);
    const yGrossRent   = base.grossAnnualRent * g;
    const yVacancyLoss = yGrossRent * (vacancyPctProj / 100);
    const yEffIncome   = yGrossRent - yVacancyLoss;
    const yFixedOpex   = fixedOpexY1 * g;
    // Maintenance selon le mode : % suit la croissance, montant fixe est indexé à l'inflation aussi
    let yMaintenance;
    if (maintMode === "monthly") yMaintenance = maintAmount * 12 * g;
    else if (maintMode === "annual") yMaintenance = maintAmount * g;
    else yMaintenance = yGrossRent * (maintPctVal / 100);
    const yManagement  = yEffIncome * ((Number(a.managementPercent) || 0) / 100);
    const yOpex = yFixedOpex + yMaintenance + yManagement;
    const yNOI  = yEffIncome - yOpex;
    // L'hypothèque ne s'indexe pas — paiement constant pendant toute l'amortissation
    const yMortgage = (y <= amortYears) ? base.monthlyPmt * 12 : 0;
    const yCashFlow = yNOI - yMortgage;
    cumGrossRent += yGrossRent;
    cumNOI += yNOI;
    cumCashFlow += yCashFlow;
    yearlyCashFlows.push(yCashFlow);
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

  // IRR : flux de trésorerie = -investissement initial puis CF annuels + équité finale au dernier
  // Investissement initial = cash requis à la clôture (mise de fond + tous frais)
  const initialInvestment = base.cashToClose || base.downPayment;
  const irrCashFlows = [-initialInvestment];
  for (let y = 0; y < yearlyCashFlows.length; y++) {
    if (y === yearlyCashFlows.length - 1) {
      // Année finale : cash flow + valeur récupérée si vendu (équité)
      irrCashFlows.push(yearlyCashFlows[y] + equity);
    } else {
      irrCashFlows.push(yearlyCashFlows[y]);
    }
  }
  const irr = reIRR(irrCashFlows);

  // Coût d'opportunité — si la mise de fond + frais avait été placée en bourse
  const stockRate = (Number(a.stockMarketRate) || 0) / 100;
  const stockEndValue = initialInvestment * Math.pow(1 + stockRate, years);
  const stockProfit = stockEndValue - initialInvestment;
  const realEstateAdvantage = totalWealth - stockEndValue;

  return {
    years,
    futureValue, appreciationGain, mortgageBalance, principalPaidDown,
    equity, equityNetGain,
    cumGrossRent, cumNOI, cumCashFlow,
    totalWealth, totalProfit,
    annualizedReturn, irr,
    stockEndValue, stockProfit, realEstateAdvantage, stockRate: stockRate * 100,
    initialInvestment, yearlyCashFlows,
    fullyPaidOff: years >= amortYears
  };
}

function renderRealEstatePage() {
  if (reMode === "edit" && reCurrent) return renderRealEstateEdit();
  if (reMode === "compare") return renderRealEstateCompare();
  return renderRealEstateList();
}

function renderRealEstateList() {
  const selectedCount = reCompareIds.length;
  let h = `<div class="serene-page">
    <div class="serene-hero-header">
      <div>
        <div class="kicker" style="margin-bottom:10px">${t("re_subtitle").toUpperCase()}</div>
        <h1 class="serene-hero-h1" style="margin:0">${t("re_title")}</h1>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        ${selectedCount >= 2 ? `<button class="btn-pill re-compare-btn" onclick="reStartCompare()">${icon("clipboard", 14)} ${t("re_compare").replace("{n}", selectedCount)}</button>` : ""}
        <button class="btn-pill" onclick="reNewFromCentris()">${icon("download", 14)} ${t("re_import_centris")}</button>
        <button class="btn-pill" onclick="reNew()">${icon("plus", 14)} ${t("re_add")}</button>
      </div>
    </div>`;
  if (!realEstateAnalyses.length) {
    h += `<div class="empty">
      <div style="margin-bottom:12px;color:var(--text3);display:flex;justify-content:center">${icon("home", 48)}</div>
      <p>${t("re_empty")}</p>
    </div></div>`;
    return h;
  }
  if (realEstateAnalyses.length >= 2) {
    h += `<div class="re-compare-hint">${t("re_compare_hint")}</div>`;
  }
  h += `<div class="re-list">`;
  for (const a of realEstateAnalyses) {
    const m = calculateRealEstateMetrics(a);
    const cf = m.monthlyCashFlow;
    const cfClass = cf >= 0 ? "pos" : "neg";
    const isSelected = reCompareIds.includes(a.id);
    h += `<div class="re-card ${isSelected ? "re-card--selected" : ""}">
      <label class="re-card__select" onclick="event.stopPropagation()" title="${t("re_compare_select")}">
        <input type="checkbox" ${isSelected ? "checked" : ""} onchange="reToggleCompare('${a.id}')">
      </label>
      <div class="re-card__body" onclick="reEdit('${a.id}')">
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
      </div>
    </div>`;
  }
  h += `</div></div>`;
  return h;
}

function reToggleCompare(id) {
  const idx = reCompareIds.indexOf(id);
  if (idx >= 0) reCompareIds.splice(idx, 1);
  else reCompareIds.push(id);
  renderPage();
}

function reStartCompare() {
  if (reCompareIds.length < 2) return;
  reMode = "compare";
  renderPage();
}

function reExitCompare() {
  reMode = "list";
  renderPage();
}

function reClearCompare() {
  reCompareIds = [];
  renderPage();
}

// Vue de comparaison côte à côte
function renderRealEstateCompare() {
  const items = reCompareIds
    .map(id => realEstateAnalyses.find(x => x.id === id))
    .filter(Boolean);
  if (items.length < 2) {
    reMode = "list";
    return renderRealEstateList();
  }
  const data = items.map(a => {
    const m = calculateRealEstateMetrics(a);
    const p = projectRealEstate(a, 10);
    return { a, m, p };
  });

  // Pour chaque métrique, trouve le best/worst pour highlighting
  const findBest = (key, dir = "max", source = "m") =>
    data.reduce((best, d, i) => {
      const v = d[source][key];
      if (v === null || v === undefined || isNaN(v)) return best;
      if (best === null) return { i, v };
      return (dir === "max" ? v > best.v : v < best.v) ? { i, v } : best;
    }, null);
  const bestCashFlow = findBest("monthlyCashFlow", "max");
  const bestCapRate  = findBest("capRate", "max");
  const bestMrb      = findBest("mrb", "min");
  const bestDscr     = findBest("dscr", "max");
  const bestCoc      = findBest("cashOnCash", "max");
  const bestBreak    = findBest("breakEvenOccupancy", "min");
  const bestEquity10 = findBest("equity", "max", "p");
  const bestCagr     = findBest("annualizedReturn", "max", "p");

  const cell = (val, bestIdx, i, fmt = (v) => v) => {
    const isBest = bestIdx && bestIdx.i === i;
    return `<td class="re-cmp__cell ${isBest ? "re-cmp__cell--best" : ""}">${fmt(val)}</td>`;
  };

  return `<div class="serene-page">
    <div class="serene-hero-header">
      <div>
        <button class="btn-link" onclick="reExitCompare()">${t("re_back_to_list")}</button>
        <h1 class="serene-hero-h1" style="margin:4px 0 0">${t("re_compare_title")}</h1>
      </div>
      <button class="btn-pill" onclick="reClearCompare()">${icon("trash", 14)} ${t("re_compare_clear")}</button>
    </div>

    <div class="re-cmp-wrap">
      <table class="re-cmp">
        <thead>
          <tr>
            <th class="re-cmp__header re-cmp__header--label">${t("re_compare_metric")}</th>
            ${data.map(d => `
              <th class="re-cmp__header">
                <div class="re-cmp__name">${esc(d.a.name || "(Sans nom)")}</div>
                <div class="re-cmp__addr">${esc(d.a.address || "")}</div>
                <div class="re-verdict re-verdict--${d.m.verdict}" style="margin-top:6px">${t("re_verdict_" + d.m.verdict)}</div>
              </th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
          <tr><td class="re-cmp__label">${t("re_field_price")}</td>${data.map((d, i) => cell(d.a.purchasePrice, null, i, fmtMoney)).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_field_downpayment")}</td>${data.map((d, i) => cell(d.m.downPayment, null, i, fmtMoney)).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_metric_gross_rent")} (/mois)</td>${data.map((d, i) => cell(d.m.grossMonthlyRent, null, i, fmtMoney)).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_metric_mortgage_pmt")} (/mois)</td>${data.map((d, i) => cell(d.m.monthlyPmt, null, i, fmtMoney)).join("")}</tr>
          <tr class="re-cmp__row--key"><td class="re-cmp__label">${t("re_metric_cashflow")} (/mois)</td>${data.map((d, i) => cell(d.m.monthlyCashFlow, bestCashFlow, i, fmtMoney)).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_metric_cap_rate")}</td>${data.map((d, i) => cell(d.m.capRate, bestCapRate, i, v => v.toFixed(2) + "%")).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_metric_mrb")}</td>${data.map((d, i) => cell(d.m.mrb, bestMrb, i, v => (d.m.grossAnnualRent > 0 ? v.toFixed(1) : "—"))).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_metric_dscr")}</td>${data.map((d, i) => cell(d.m.dscr, bestDscr, i, v => v === null ? "—" : v.toFixed(2))).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_metric_coc")}</td>${data.map((d, i) => cell(d.m.cashOnCash, bestCoc, i, v => v === null ? "—" : v.toFixed(2) + "%")).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_metric_breakeven")}</td>${data.map((d, i) => cell(d.m.breakEvenOccupancy, bestBreak, i, v => v === null ? "—" : v.toFixed(1) + "%")).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_metric_cash_to_close")}</td>${data.map((d, i) => cell(d.m.cashToClose, null, i, fmtMoney)).join("")}</tr>
          <tr class="re-cmp__divider"><td colspan="${data.length + 1}">${t("re_compare_projection_10")}</td></tr>
          <tr><td class="re-cmp__label">${t("re_proj_future_value")}</td>${data.map((d, i) => cell(d.p.futureValue, null, i, fmtMoney)).join("")}</tr>
          <tr class="re-cmp__row--key"><td class="re-cmp__label">${t("re_proj_equity")}</td>${data.map((d, i) => cell(d.p.equity, bestEquity10, i, fmtMoney)).join("")}</tr>
          <tr><td class="re-cmp__label">${t("re_proj_cum_cashflow")}</td>${data.map((d, i) => cell(d.p.cumCashFlow, null, i, fmtMoney)).join("")}</tr>
          <tr class="re-cmp__row--key"><td class="re-cmp__label">${t("re_proj_annualized_return")}</td>${data.map((d, i) => cell(d.p.annualizedReturn, bestCagr, i, v => v === null ? "—" : v.toFixed(2) + "% /an")).join("")}</tr>
        </tbody>
      </table>
    </div>
    <div class="re-cmp__legend">${t("re_compare_legend")}</div>
  </div>`;
}

function renderRealEstateEdit() {
  const a = reCurrent;
  // Calcule les métriques pour afficher des résumés dans les titres des sections collapsibles
  const _m = calculateRealEstateMetrics(a);
  let h = `<div class="serene-page re-page">
    <div class="serene-hero-header">
      <div>
        <button class="btn-link" onclick="reBackToList()">${t("re_back_to_list")}</button>
        <h1 class="serene-hero-h1" style="margin:4px 0 0">${a.id ? (esc(a.name) || t("re_add")) : t("re_add")}</h1>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="openCentrisImportModal('rental')">${icon("download", 14)} ${t("re_import_centris")}</button>
        ${a.id ? `<button class="btn btn-secondary" onclick="reExportPDF()">${icon("download", 14)} ${t("re_export_pdf")}</button>` : ``}
        ${a.id ? `<button class="btn re-btn-danger" onclick="reDelete('${a.id}')">${icon("trash", 14)} ${t("re_delete")}</button>` : ``}
        <button class="btn btn-primary" onclick="reSave()">${icon("check", 14)} ${t("re_save")}</button>
      </div>
    </div>

    <div class="re-grid">
      <div class="re-form">

        <section class="re-block re-block--property">
          <h3 class="re-block__title">${icon("home", 16)} <span>${t("re_section_property")}</span></h3>
          <div class="re-fields">
            <label class="re-field re-field--wide">
              <span>${t("re_field_name")}</span>
              <input type="text" placeholder="${t("re_field_name_hint")}" value="${esc(a.name || "")}" oninput="reCurrent.name=this.value">
            </label>
            <label class="re-field re-field--wide">
              <span>${t("re_field_address")}</span>
              <input type="text" value="${esc(a.address || "")}" oninput="reCurrent.address=this.value">
            </label>
            <label class="re-field re-field--wide">
              <span>${t("re_field_unit_type")}</span>
              <select onchange="reSetUnitType(this.value)">
                ${RE_UNIT_TYPES.map(u => `<option value="${u.value}" ${a.unitType === u.value ? "selected" : ""}>${t(u.label)}</option>`).join("")}
              </select>
            </label>
          </div>
        </section>

        <section class="re-block re-block--mortgage">
          <h3 class="re-block__title">${icon("dollar-sign", 16)} <span>${t("re_section_mortgage")}</span></h3>
          <div class="re-fields">
            <label class="re-field">
              <div class="re-field__head">
                <span>${t("re_field_price")}</span>
              </div>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.purchasePrice || ""}" oninput="reCurrent.purchasePrice=Math.max(0,Number(this.value)||0);reRefreshDownPaymentHint();reRefresh()">
              </div>
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
                  <input type="number" inputmode="decimal" min="0" max="100" step="any" value="${a.downPaymentPercent ?? ""}" oninput="reCurrent.downPaymentPercent=Math.min(100,Math.max(0,Number(this.value)||0));reRefreshDownPaymentHint();reRefresh()">
                  <span class="re-input-suffix__symbol">%</span>
                </div>
              ` : `
                <div class="re-input-suffix">
                  <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                  <input type="number" inputmode="numeric" min="0" max="${Number(a.purchasePrice) || 99999999}" step="any" value="${a.downPayment ?? ""}" oninput="reCurrent.downPayment=Math.max(0,Math.min(Number(reCurrent.purchasePrice)||Infinity, Number(this.value)||0));reRefreshDownPaymentHint();reRefresh()">
                </div>
              `}
              <small class="re-hint" id="re-downpayment-hint">${reDownPaymentHintText(a)}</small>
            </div>
            <label class="re-field">
              <div class="re-field__head"><span>${t("re_field_amort")}${reTip("re_tip_amort")}</span></div>
              <input type="number" inputmode="numeric" min="1" max="40" step="1" value="${a.amortYears || ""}" oninput="reCurrent.amortYears=Math.min(40,Math.max(1,Number(this.value)||0));reRefresh()">
            </label>
            <label class="re-field">
              <div class="re-field__head"><span>${t("re_field_rate")}${reTip("re_tip_interest")}</span></div>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="0" max="25" step="any" value="${a.interestRate || ""}" oninput="reCurrent.interestRate=Math.min(25,Math.max(0,Number(this.value)||0));reRefresh()">
                <span class="re-input-suffix__symbol">%</span>
              </div>
            </label>
            <div class="re-field re-field--wide">
              <div class="re-field__head"><span>${t("re_field_payment_freq")}${reTip("re_tip_payment_freq")}</span></div>
              ${renderPaymentFrequencyRadios(a)}
            </div>
          </div>
        </section>

        <section class="re-block re-block--charges">
          <h3 class="re-block__title">${icon("receipt", 16)} <span>${t("re_section_charges")}</span></h3>
          <div class="re-fields">
            <label class="re-field">
              <span>${t("re_field_municipal_tax")}</span>
              <input type="number" inputmode="numeric" min="0" step="any"value="${a.municipalTax || ""}" oninput="reCurrent.municipalTax=Math.max(0,Number(this.value)||0);reRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_school_tax")}</span>
              <input type="number" inputmode="numeric" min="0" step="any"value="${a.schoolTax || ""}" oninput="reCurrent.schoolTax=Math.max(0,Number(this.value)||0);reRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_insurance")}</span>
              <input type="number" inputmode="numeric" min="0" step="any"value="${a.insurance || ""}" oninput="reCurrent.insurance=Math.max(0,Number(this.value)||0);reRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_electricity")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any"value="${a.electricity || ""}" oninput="reCurrent.electricity=Math.max(0,Number(this.value)||0);reRefresh()">
                <span class="re-input-suffix__symbol">${t("re_metric_per_month")}</span>
              </div>
              <small class="re-hint">${t("re_field_electricity_hint")}</small>
            </label>
            <div class="re-field">
              <div class="re-field__head">
                <input type="text" class="re-field__inline-input" placeholder="${t("re_field_other_service_placeholder")}" value="${esc(a.otherServiceName || "")}" maxlength="50" oninput="reCurrent.otherServiceName=this.value;reRefresh()">
                <div class="re-toggle" role="tablist">
                  <button type="button" class="re-toggle__btn ${a.otherServiceFrequency !== "annual" ? "is-active" : ""}" onclick="reCurrent.otherServiceFrequency='monthly';renderPage()">${t("re_freq_mo_short")}</button>
                  <button type="button" class="re-toggle__btn ${a.otherServiceFrequency === "annual" ? "is-active" : ""}" onclick="reCurrent.otherServiceFrequency='annual';renderPage()">${t("re_freq_an_short")}</button>
                </div>
              </div>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.otherServiceAmount || ""}" oninput="reCurrent.otherServiceAmount=Math.max(0,Number(this.value)||0);reRefresh()">
                <span class="re-input-suffix__symbol">${a.otherServiceFrequency === "annual" ? t("re_metric_per_year") : t("re_metric_per_month")}</span>
              </div>
              <small class="re-hint">${t("re_field_other_service_hint")}</small>
            </div>
            <div class="re-field">
              <div class="re-field__head">
                <span>${t("re_field_maintenance")}${reTip("re_tip_maintenance")}</span>
                <div class="re-toggle" role="tablist">
                  <button type="button" class="re-toggle__btn ${(a.maintenanceMode || "percent") === "percent" ? "is-active" : ""}" onclick="reCurrent.maintenanceMode='percent';renderPage()">%</button>
                  <button type="button" class="re-toggle__btn ${a.maintenanceMode === "monthly" ? "is-active" : ""}" onclick="reCurrent.maintenanceMode='monthly';renderPage()">${t("re_freq_mo_short")}</button>
                  <button type="button" class="re-toggle__btn ${a.maintenanceMode === "annual" ? "is-active" : ""}" onclick="reCurrent.maintenanceMode='annual';renderPage()">${t("re_freq_an_short")}</button>
                </div>
              </div>
              ${(a.maintenanceMode || "percent") === "percent" ? `
                <div class="re-input-suffix">
                  <input type="number" inputmode="decimal" min="0" max="50" step="any" value="${a.maintenancePercent ?? ""}" oninput="reCurrent.maintenancePercent=Math.min(50,Math.max(0,Number(this.value)||0));reRefresh()">
                  <span class="re-input-suffix__symbol">${t("re_field_maint_pct_suffix")}</span>
                </div>
              ` : `
                <div class="re-input-suffix">
                  <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                  <input type="number" inputmode="numeric" min="0" step="any" value="${a.maintenanceAmount ?? ""}" oninput="reCurrent.maintenanceAmount=Math.max(0,Number(this.value)||0);reRefresh()">
                  <span class="re-input-suffix__symbol">${a.maintenanceMode === "annual" ? t("re_metric_per_year") : t("re_metric_per_month")}</span>
                </div>
              `}
              <small class="re-hint">${t("re_field_maintenance_hint")}</small>
            </div>
          </div>

          <details class="re-advanced">
            <summary class="re-advanced__summary">
              <span>${icon("settings", 14)}</span>
              <span>${t("re_section_advanced")}</span>
              <span class="re-advanced__chevron">▾</span>
            </summary>
            <div class="re-fields re-fields--nested">
              <div class="re-field">
                <div class="re-field__head">
                  <span>${t("re_field_vacancy")}${reTip("re_tip_vacancy")}</span>
                  <label class="re-checkbox re-checkbox--inline">
                    <input type="checkbox" ${a.vacancyEnabled !== false ? "checked" : ""} onchange="reCurrent.vacancyEnabled=this.checked;renderPage()">
                    <span>${t("re_field_vacancy_enable")}</span>
                  </label>
                </div>
                ${a.vacancyEnabled !== false ? `
                  <div class="re-input-suffix">
                    <input type="number" inputmode="decimal" min="0" max="50" step="any" value="${a.vacancyPercent ?? ""}" oninput="reCurrent.vacancyPercent=Math.min(50,Math.max(0,Number(this.value)||0));reRefresh()">
                    <span class="re-input-suffix__symbol">%</span>
                  </div>
                ` : `<small class="re-hint" style="color:var(--text3);font-style:italic">${t("re_field_vacancy_ignored")}</small>`}
                <small class="re-hint">${t("re_field_vacancy_hint")}</small>
              </div>
              <label class="re-field">
                <span>${t("re_field_management")}${reTip("re_tip_management")}</span>
                <div class="re-input-suffix">
                  <input type="number" inputmode="decimal" min="0" max="30" step="any"value="${a.managementPercent ?? ""}" oninput="reCurrent.managementPercent=Math.min(30,Math.max(0,Number(this.value)||0));reRefresh()">
                  <span class="re-input-suffix__symbol">%</span>
                </div>
                <small class="re-hint">${t("re_field_management_hint")}</small>
              </label>
            </div>
          </details>
        </section>

        <details class="re-block re-block--collapsible re-block--closing">
          <summary class="re-block__title re-block__title--summary">
            ${icon("shield-check", 16)} <span>${t("re_section_closing")}</span>
            <span class="re-block__summary-value">${fmtMoney(_m.closingCostsTotal || 0)}</span>
            <span class="re-block__chevron">▾</span>
          </summary>
          ${renderClosingCostsFields(a)}
        </details>

        <details class="re-block re-block--collapsible re-block--projection">
          <summary class="re-block__title re-block__title--summary">
            ${icon("trending-up", 16)} <span>${t("re_section_projection")}</span>
            <span class="re-block__chevron">▾</span>
          </summary>
          <div class="re-fields">
            <label class="re-field">
              <span>${t("re_field_appreciation")}${reTip("re_tip_appreciation")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="-10" max="30" step="any"value="${a.appreciationPercent ?? ""}" oninput="reCurrent.appreciationPercent=Math.min(30,Math.max(-10,Number(this.value)||0));reRefresh()">
                <span class="re-input-suffix__symbol">% /an</span>
              </div>
              <small class="re-hint">${t("re_field_appreciation_hint")}</small>
            </label>
            <label class="re-field">
              <span>${t("re_field_rent_increase")}${reTip("re_tip_rent_increase")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="-5" max="20" step="any"value="${a.rentIncreasePercent ?? ""}" oninput="reCurrent.rentIncreasePercent=Math.min(20,Math.max(-5,Number(this.value)||0));reRefresh()">
                <span class="re-input-suffix__symbol">% /an</span>
              </div>
              <small class="re-hint">${t("re_field_rent_increase_hint")}</small>
            </label>
            <label class="re-field">
              <span>${t("re_field_mrb_good")}${reTip("re_tip_mrb_good")}</span>
              <input type="number" inputmode="decimal" min="3" max="30" step="any" value="${a.mrbTargetGood ?? 14}" oninput="reCurrent.mrbTargetGood=Math.min(30,Math.max(3,Number(this.value)||14));reRefresh()">
              <small class="re-hint">${t("re_field_mrb_good_hint")}</small>
            </label>
            <label class="re-field">
              <span>${t("re_field_mrb_excellent")}${reTip("re_tip_mrb_excellent")}</span>
              <input type="number" inputmode="decimal" min="3" max="30" step="any" value="${a.mrbTargetExcellent ?? 10}" oninput="reCurrent.mrbTargetExcellent=Math.min(30,Math.max(3,Number(this.value)||10));reRefresh()">
              <small class="re-hint">${t("re_field_mrb_excellent_hint")}</small>
            </label>
            <label class="re-field re-field--wide">
              <span>${t("re_field_stock_rate")}${reTip("re_tip_stock_rate")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="-10" max="30" step="any" value="${a.stockMarketRate ?? 7}" oninput="reCurrent.stockMarketRate=Math.min(30,Math.max(-10,Number(this.value)||0));reRefresh()">
                <span class="re-input-suffix__symbol">% /an</span>
              </div>
              <small class="re-hint">${t("re_field_stock_rate_hint")}</small>
            </label>
          </div>
        </details>

        <details class="re-block re-block--collapsible re-block--fiscal">
          <summary class="re-block__title re-block__title--summary">
            ${icon("receipt", 16)} <span>${t("re_section_fiscal")}</span>
            ${a.fiscalEnabled ? `<span class="re-block__summary-value" style="color:var(--status-green)">${t("active") || "actif"}</span>` : ""}
            <span class="re-block__chevron">▾</span>
          </summary>
          <div class="re-fields">
            <label class="re-checkbox re-field--wide">
              <input type="checkbox" ${a.fiscalEnabled ? "checked" : ""} onchange="reCurrent.fiscalEnabled=this.checked;renderPage()">
              <span>${t("re_field_fiscal_enable")}${reTip("re_tip_fiscal_enable")}</span>
            </label>
            ${a.fiscalEnabled ? `
              <label class="re-field">
                <div class="re-field__head"><span>${t("re_field_marginal_tax")}${reTip("re_tip_marginal_tax")}</span></div>
                <div class="re-input-suffix">
                  <input type="number" inputmode="decimal" min="0" max="60" step="any" value="${a.marginalTaxRate ?? 37.12}" oninput="reCurrent.marginalTaxRate=Math.min(60,Math.max(0,Number(this.value)||0));reRefresh()">
                  <span class="re-input-suffix__symbol">%</span>
                </div>
                <small class="re-hint">${t("re_field_marginal_tax_hint")}</small>
              </label>
              <label class="re-checkbox re-field--wide">
                <input type="checkbox" ${a.useCCA ? "checked" : ""} onchange="reCurrent.useCCA=this.checked;renderPage()">
                <span>${t("re_field_use_cca")}${reTip("re_tip_cca")}</span>
              </label>
              ${a.useCCA ? `
                <label class="re-field re-field--wide">
                  <div class="re-field__head"><span>${t("re_field_building_portion")}${reTip("re_tip_building_portion")}</span></div>
                  <div class="re-input-suffix">
                    <input type="number" inputmode="decimal" min="0" max="100" step="any" value="${a.buildingPortionPercent ?? 80}" oninput="reCurrent.buildingPortionPercent=Math.min(100,Math.max(0,Number(this.value)||0));reRefresh()">
                    <span class="re-input-suffix__symbol">%</span>
                  </div>
                  <small class="re-hint">${t("re_field_building_portion_hint")}</small>
                </label>
              ` : ""}
            ` : ""}
          </div>
        </details>

        <section class="re-block re-block--units">
          <h3 class="re-block__title">${icon("users", 16)} <span>${t("re_section_units")}</span>
            ${a.unitType === "custom" ? `<button class="btn-link" style="margin-left:auto" onclick="reAddUnit()">${t("re_unit_add")}</button>` : ""}
          </h3>
          <div class="re-units">
            ${a.units.map((u, i) => `
              <div class="re-unit ${u.ownerOccupied ? "re-unit--owner" : ""}">
                <div class="re-unit__head">
                  <div class="re-unit__label-wrap">
                    <div class="re-unit__label">${t("re_unit_label").replace("{n}", i + 1)}</div>
                    <input type="text" class="re-unit__subtype" placeholder="${t("re_unit_subtype_placeholder")}" value="${escAttr(u.subtype || "")}" oninput="reCurrent.units[${i}].subtype=this.value" maxlength="40" aria-label="${t("re_unit_subtype_label")}">
                  </div>
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
                      <input type="number" inputmode="numeric" min="0" max="20000" step="any"value="${u.rent || ""}" oninput="reCurrent.units[${i}].rent=Math.max(0,Number(this.value)||0);reRefresh()">
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

        <section class="re-block re-block--notes">
          <h3 class="re-block__title">${icon("pencil", 16)} <span>${t("re_notes")}</span></h3>
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

// Calcule la durée réelle d'amortissement en années pour un paiement périodique donné.
// Utilise la composition semi-annuelle canadienne.
function reEffectiveAmortYears(principal, periodicPmt, periodsPerYear, annualRatePct) {
  if (!principal || principal <= 0 || !periodicPmt || periodicPmt <= 0) return 0;
  const r = (Number(annualRatePct) || 0) / 100;
  const i = Math.pow(1 + r / 2, 2 / periodsPerYear) - 1;
  if (i === 0) return principal / (periodicPmt * periodsPerYear);
  const factor = 1 - (principal * i) / periodicPmt;
  if (factor <= 0) return Infinity;
  return -Math.log(factor) / Math.log(1 + i) / periodsPerYear;
}

// Rendu des 3 options de fréquence de paiement hypothécaire en radio buttons
function renderPaymentFrequencyRadios(a) {
  const downPayment = reEffectiveDownPayment(a);
  const purchasePriceNum = Number(a.purchasePrice) || 0;
  const dpRatio = purchasePriceNum > 0 ? downPayment / purchasePriceNum : 0;
  const baseLoan = Math.max(0, purchasePriceNum - downPayment);
  let schlPremium = 0;
  if (dpRatio >= 0.05 - 1e-6 && dpRatio < 0.20 - 1e-6) {
    schlPremium = a.schlAuto !== false
      ? reComputeSchlPremium(purchasePriceNum, downPayment)
      : (Number(a.schlPremium) || 0);
  }
  const principal = baseLoan + schlPremium;
  const monthlyPmt = canadianMortgagePayment(principal, a.interestRate, a.amortYears, "monthly");
  const biweeklyPmt = canadianMortgagePayment(principal, a.interestRate, a.amortYears, "biweekly_accel");
  const weeklyPmt = canadianMortgagePayment(principal, a.interestRate, a.amortYears, "weekly_accel");
  const current = a.paymentFrequency || "monthly";
  // Durée RÉELLE d'amortissement pour chaque option (mensuel = amort tel quel, accéléré = plus court)
  const yearsMonthly  = a.amortYears || 25;
  const yearsBiweekly = reEffectiveAmortYears(principal, biweeklyPmt, 26, a.interestRate);
  const yearsWeekly   = reEffectiveAmortYears(principal, weeklyPmt,   52, a.interestRate);
  const fmtYears = (y) => (isFinite(y) && y > 0) ? y.toFixed(1) + " " + t("re_years") : "—";
  const savedBiweekly = Math.max(0, yearsMonthly - yearsBiweekly);
  const savedWeekly   = Math.max(0, yearsMonthly - yearsWeekly);
  const options = [
    { value: "monthly",        label: t("re_freq_monthly"),  amount: monthlyPmt,  suffix: t("re_metric_per_month"),
      duration: fmtYears(yearsMonthly), badge: null },
    { value: "biweekly_accel", label: t("re_freq_biweekly"), amount: biweeklyPmt, suffix: t("re_freq_per_biweek"),
      duration: fmtYears(yearsBiweekly), badge: savedBiweekly > 0.1 ? `−${savedBiweekly.toFixed(1)} ${t("re_years")}` : null },
    { value: "weekly_accel",   label: t("re_freq_weekly"),   amount: weeklyPmt,   suffix: t("re_freq_per_week"),
      duration: fmtYears(yearsWeekly), badge: savedWeekly > 0.1 ? `−${savedWeekly.toFixed(1)} ${t("re_years")}` : null }
  ];
  return `
    <div class="re-freq-radios">
      ${options.map(o => `
        <label class="re-freq-radio ${current === o.value ? "is-active" : ""}">
          <input type="radio" name="payFreq" value="${o.value}" ${current === o.value ? "checked" : ""} onchange="reCurrent.paymentFrequency=this.value;renderPage()">
          <div class="re-freq-radio__content">
            <div class="re-freq-radio__label">${o.label}</div>
            <div class="re-freq-radio__amount">${fmtMoney(o.amount)}<span class="re-freq-radio__suffix">${o.suffix}</span></div>
            <div class="re-freq-radio__duration">
              ${t("re_freq_real_duration")}: <strong>${o.duration}</strong>
              ${o.badge ? `<span class="re-freq-radio__savings">${o.badge}</span>` : ""}
            </div>
          </div>
        </label>
      `).join("")}
    </div>
  `;
}

// Rendu de la section Frais de clôture & SCHL dans le formulaire
function renderClosingCostsFields(a) {
  const price = Number(a.purchasePrice) || 0;
  const dp = reEffectiveDownPayment(a);
  const dpPct = price > 0 ? (dp / price) * 100 : 0;
  const autoWelcomeTax = reComputeWelcomeTax(price);
  const currentWelcomeTax = a.welcomeTaxAuto !== false ? autoWelcomeTax : (Number(a.welcomeTax) || 0);
  const autoSchl = reComputeSchlPremium(price, dp);
  const currentSchl = a.schlAuto !== false ? autoSchl : (Number(a.schlPremium) || 0);
  const schlApplicable = price > 0 && dpPct < 20 - 1e-4 && dpPct >= 5 - 1e-4;
  const totalClosing = currentWelcomeTax + (Number(a.notaryFees) || 0) + (Number(a.inspectionFees) || 0) + (Number(a.otherClosingFees) || 0);
  return `
    <div class="re-fields">
      <label class="re-field">
        <span>${t("re_field_welcome_tax")}${reTip("re_tip_welcome_tax")}</span>
        <div class="re-input-suffix">
          <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
          <input type="number" inputmode="numeric" min="0" step="any" value="${a.welcomeTaxAuto !== false ? autoWelcomeTax.toFixed(0) : (a.welcomeTax || '')}" oninput="reCurrent.welcomeTaxAuto=false;reCurrent.welcomeTax=Math.max(0,Number(this.value)||0);reRefresh()" ${a.welcomeTaxAuto !== false ? 'disabled style="opacity:0.7;cursor:not-allowed"' : ''}>
        </div>
        <label class="re-checkbox" style="margin-top:6px">
          <input type="checkbox" ${a.welcomeTaxAuto !== false ? 'checked' : ''} onchange="reCurrent.welcomeTaxAuto=this.checked;if(this.checked)reCurrent.welcomeTax=reComputeWelcomeTax(Number(reCurrent.purchasePrice)||0);renderPage()">
          <span>${t("re_field_auto_calc")}</span>
        </label>
      </label>
      <label class="re-field">
        <span>${t("re_field_notary")}${reTip("re_tip_notary")}</span>
        <div class="re-input-suffix">
          <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
          <input type="number" inputmode="numeric" min="0" step="any" value="${a.notaryFees ?? ""}" oninput="reCurrent.notaryFees=Math.max(0,Number(this.value)||0);reRefresh()">
        </div>
      </label>
      <label class="re-field">
        <span>${t("re_field_inspection")}${reTip("re_tip_inspection")}</span>
        <div class="re-input-suffix">
          <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
          <input type="number" inputmode="numeric" min="0" step="any" value="${a.inspectionFees ?? ""}" oninput="reCurrent.inspectionFees=Math.max(0,Number(this.value)||0);reRefresh()">
        </div>
      </label>
      <label class="re-field">
        <span>${t("re_field_other_closing")}</span>
        <div class="re-input-suffix">
          <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
          <input type="number" inputmode="numeric" min="0" step="any" value="${a.otherClosingFees || ""}" oninput="reCurrent.otherClosingFees=Math.max(0,Number(this.value)||0);reRefresh()">
        </div>
        <small class="re-hint">${t("re_field_other_closing_hint")}</small>
      </label>
      <div class="re-field re-field--wide re-field--summary">
        <span>${t("re_field_closing_total")} <strong>${fmtMoney(totalClosing)}</strong></span>
      </div>
      ${schlApplicable ? `
        <div class="re-field re-field--wide">
          <div class="re-field__head">
            <span>${t("re_field_schl")}${reTip("re_tip_schl")}</span>
          </div>
          <div class="re-input-suffix">
            <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
            <input type="number" inputmode="numeric" min="0" step="any" value="${a.schlAuto !== false ? autoSchl.toFixed(0) : (a.schlPremium || '')}" oninput="reCurrent.schlAuto=false;reCurrent.schlPremium=Math.max(0,Number(this.value)||0);reRefresh()" ${a.schlAuto !== false ? 'disabled style="opacity:0.7;cursor:not-allowed"' : ''}>
          </div>
          <label class="re-checkbox" style="margin-top:6px">
            <input type="checkbox" ${a.schlAuto !== false ? 'checked' : ''} onchange="reCurrent.schlAuto=this.checked;renderPage()">
            <span>${t("re_field_auto_calc")} (${(dpPct).toFixed(1)}% MF → ${(currentSchl/Math.max(1,price-dp)*100).toFixed(2)}%)</span>
          </label>
          <small class="re-hint">${t("re_field_schl_hint")}</small>
        </div>
      ` : (price > 0 && dpPct >= 20 ? `
        <div class="re-field re-field--wide">
          <small class="re-hint" style="color:var(--status-green)">✓ ${t("re_field_schl_not_needed")}</small>
        </div>
      ` : '')}
    </div>
  `;
}

// Simulateur de prix d'offre : tu entres un cash flow cible, on calcule le prix nécessaire.
function renderSuggestedPriceCard(a) {
  const target = Number(a.simTargetCashFlow) || 0;
  const s = reSimulatePrice(a, target);
  if (!s) return "";
  // États "incomplet" ou "infaisable"
  if (s.incomplete) {
    const msgKey = s.reason === "all_owner_occupied" ? "re_suggested_all_owner" : "re_suggested_no_rent";
    return `
      <div class="re-suggested re-suggested--incomplete">
        <div class="re-suggested__title">${icon("dollar-sign", 14)} ${t("re_simulator_title")}</div>
        <div class="re-suggested__hint">${t(msgKey)}</div>
      </div>
    `;
  }
  if (s.infeasible) {
    return `
      <div class="re-suggested re-suggested--infeasible">
        <div class="re-suggested__title">${icon("alert-triangle", 14)} ${t("re_suggested_infeasible_title")}</div>
        <div class="re-suggested__hint">${s.reason || ""}</div>
        <div class="re-sim__target-row">
          <label class="re-sim__target-label">${t("re_sim_target_cf")}</label>
          ${renderSimTargetInput(target)}
        </div>
      </div>
    `;
  }
  const askingPrice = s.askingPrice;
  const simPrice = Math.max(0, Math.round(s.simulatedPrice));
  const diff = Math.round(s.diff);
  const diffPct = s.diffPct;
  // Direction: si simPrice <= askingPrice, il faut négocier vers le bas (économie). Sinon, le prix demandé est déjà très bon.
  const isDeal = askingPrice > 0 && askingPrice <= simPrice;
  return `
    <div class="re-suggested ${isDeal ? "re-suggested--recommended" : ""}">
      <div class="re-suggested__title">${icon("dollar-sign", 14)} ${t("re_simulator_title")}</div>

      <div class="re-suggested__row">
        <div class="re-suggested__label">${t("re_suggested_asking")}</div>
        <div class="re-suggested__price re-suggested__price--asking">${fmtMoney(askingPrice)}</div>
      </div>

      <div class="re-sim__target-row">
        <label class="re-sim__target-label">${t("re_sim_target_cf")}${reTip("re_tip_sim_target")}</label>
        ${renderSimTargetInput(target)}
      </div>

      <div class="re-suggested__row re-suggested__row--good">
        <div class="re-suggested__label">${t("re_sim_required_price")}</div>
        <div class="re-suggested__price re-suggested__price--good">${fmtMoney(simPrice)}</div>
        ${askingPrice > 0 ? `<div class="re-suggested__diff ${diff >= 0 ? "re-suggested__diff--save" : "re-suggested__diff--over"}">
          <span class="re-suggested__diff-money">${diff >= 0 ? "−" : "+"}${fmtMoney(Math.abs(diff))}</span>
          <span class="re-suggested__diff-pct">${diffPct >= 0 ? "−" : "+"}${Math.abs(diffPct).toFixed(1)}%</span>
        </div>` : ""}
      </div>

      ${isDeal ? `<div class="re-sim__deal-banner">${icon("check-circle", 12)} ${t("re_sim_already_good")}</div>` : ""}

      <div class="re-sim__metrics">
        <div class="re-sim__metric">
          <div class="re-sim__metric-label">${t("re_metric_cap_rate")}</div>
          <div class="re-sim__metric-value">${s.simCapRate.toFixed(2)}%</div>
        </div>
        <div class="re-sim__metric">
          <div class="re-sim__metric-label">${t("re_metric_mrb")}</div>
          <div class="re-sim__metric-value">${s.simMrb !== null ? s.simMrb.toFixed(1) : "—"}</div>
        </div>
        <div class="re-sim__metric">
          <div class="re-sim__metric-label">${t("re_metric_dscr")}</div>
          <div class="re-sim__metric-value">${s.simDscr !== null ? s.simDscr.toFixed(2) : "—"}</div>
        </div>
        <div class="re-sim__metric">
          <div class="re-sim__metric-label">${t("re_metric_coc")}</div>
          <div class="re-sim__metric-value">${s.simCoC !== null ? s.simCoC.toFixed(2) + "%" : "—"}</div>
        </div>
      </div>

      <details class="re-suggested__details">
        <summary class="re-suggested__more">
          <span>${t("re_sim_more_detail")}</span>
          <span class="re-verdict-details__chevron">▾</span>
        </summary>
        <div class="re-suggested__explain">
          <div class="re-suggested__expl-row">
            <strong>${t("re_sim_dp_at_price")}</strong>
            <div>${fmtMoney(s.simDownPaymentDollar)} (${s.effectiveDpPct.toFixed(1)}%)${s.simSchlPremium > 0 ? ` + ${fmtMoney(s.simSchlPremium)} SCHL au prêt` : ""}</div>
          </div>
          <div class="re-suggested__expl-row">
            <strong>${t("re_sim_cash_to_close")}</strong>
            <div>${fmtMoney(s.simCashToClose)} ${t("re_sim_dp_plus_closing")}</div>
          </div>
          <div class="re-suggested__expl-row">
            <strong>${t("re_sim_monthly_pmt")}</strong>
            <div>${fmtMoney(s.simMortPmtMonthly)} ${t("re_metric_per_month")}</div>
          </div>
          <div class="re-suggested__expl-note">${t("re_sim_note")}</div>
        </div>
      </details>
    </div>
  `;
}

// Petit input avec boutons − / + pour ajuster le cash flow cible
function renderSimTargetInput(currentValue) {
  return `
    <div class="re-sim__target-input">
      <button type="button" class="re-sim__btn" onclick="reAdjustSimTarget(-100)" aria-label="−100">−</button>
      <div class="re-input-suffix re-sim__input-wrap">
        <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
        <input type="number" inputmode="numeric" step="any" value="${currentValue}" onchange="reSetSimTarget(Number(this.value)||0)" oninput="reSetSimTargetLive(Number(this.value)||0)">
        <span class="re-input-suffix__symbol">/mois</span>
      </div>
      <button type="button" class="re-sim__btn" onclick="reAdjustSimTarget(100)" aria-label="+100">+</button>
    </div>
  `;
}

function reSetSimTarget(value) {
  if (!reCurrent) return;
  reCurrent.simTargetCashFlow = value;
  renderPage();
}
function reSetSimTargetLive(value) {
  if (!reCurrent) return;
  reCurrent.simTargetCashFlow = value;
  reRefresh();
}
function reAdjustSimTarget(delta) {
  if (!reCurrent) return;
  reCurrent.simTargetCashFlow = (Number(reCurrent.simTargetCashFlow) || 0) + delta;
  renderPage();
}

// Ancien renderSuggestedPriceCard supprimé — voici sa version remplacée par le simulateur ci-dessus.
function _oldRenderSuggestedPriceCard_unused(a) {
  const s = reSuggestedPrice(a);
  if (!s) return ""; // sécurité — ne devrait pas arriver
  // État incomplet : tous proprio-occupant, ou pas de loyers entrés
  if (s.incomplete) {
    const msgKey = s.reason === "all_owner_occupied"
      ? "re_suggested_all_owner"
      : "re_suggested_no_rent";
    return `
      <div class="re-suggested re-suggested--incomplete">
        <div class="re-suggested__title">${icon("dollar-sign", 14)} ${t("re_suggested_title")}</div>
        <div class="re-suggested__hint">${t(msgKey)}</div>
      </div>
    `;
  }
  // Cas infaisable : charges > loyers, peu importe le prix
  if (s.infeasible) {
    return `
      <div class="re-suggested re-suggested--infeasible">
        <div class="re-suggested__title">${icon("alert-triangle", 14)} ${t("re_suggested_infeasible_title")}</div>
        <div class="re-suggested__hint">${s.reason}</div>
      </div>
    `;
  }
  const asking = s.askingPrice;
  const goodPrice = Math.max(0, Math.round(s.goodPrice));
  const excellentPrice = Math.max(0, Math.round(s.excellentPrice));
  const diffGood = asking - goodPrice;
  const diffExcellent = asking - excellentPrice;
  // Rabais en pourcentage (ce qu'il faudrait négocier sur le prix demandé)
  const pctGood = asking > 0 ? (diffGood / asking) * 100 : 0;
  const pctExcellent = asking > 0 ? (diffExcellent / asking) * 100 : 0;
  const fmtPct = (p) => (p >= 0 ? "−" : "+") + Math.abs(p).toFixed(1) + "%";
  const bindingLabels = {
    cashflow: t("re_binding_cashflow"),
    capRate:  t("re_binding_cap_rate"),
    mrb:      t("re_binding_mrb"),
    stress:   t("re_binding_stress")
  };
  const explainBlock = `
    <details class="re-suggested__details">
      <summary class="re-suggested__more">
        <span>${t("re_suggested_why")}</span>
        <span class="re-verdict-details__chevron">▾</span>
      </summary>
      <div class="re-suggested__explain">
        <div class="re-suggested__expl-row">
          <strong>${t("re_suggested_good_label")} (${fmtMoney(goodPrice)})</strong>
          <div>${t("re_suggested_why_good").replace("{constraint}", bindingLabels[s.goodBinding] || s.goodBinding)}</div>
        </div>
        <div class="re-suggested__expl-row">
          <strong>${t("re_suggested_excellent_label")} (${fmtMoney(excellentPrice)})</strong>
          <div>${t("re_suggested_why_excellent").replace("{constraint}", bindingLabels[s.excellentBinding] || s.excellentBinding)}</div>
        </div>
        <div class="re-suggested__expl-note">${t("re_suggested_note")}</div>
      </div>
    </details>
  `;

  // CAS 1 : Le prix demandé est déjà au niveau "excellent" → achat fortement recommandé
  if (asking > 0 && asking <= excellentPrice) {
    return `
      <div class="re-suggested re-suggested--recommended re-suggested--recommended-excellent">
        <div class="re-suggested__title">${icon("check-circle", 14)} ${t("re_suggested_strongly_recommended")}</div>
        <div class="re-suggested__hint">${t("re_suggested_strongly_hint").replace("{price}", fmtMoney(asking))}</div>
        ${explainBlock}
      </div>
    `;
  }

  // CAS 2 : Le prix demandé est dans la zone "bon" mais pas "excellent" → achat conseillé, peut négocier
  if (asking > 0 && asking <= goodPrice) {
    return `
      <div class="re-suggested re-suggested--recommended">
        <div class="re-suggested__title">${icon("check-circle", 14)} ${t("re_suggested_recommended")}</div>
        <div class="re-suggested__hint">${t("re_suggested_recommended_hint").replace("{price}", fmtMoney(asking))}</div>
        <div class="re-suggested__row re-suggested__row--excellent">
          <div class="re-suggested__label">${t("re_suggested_push_excellent")}</div>
          <div class="re-suggested__price re-suggested__price--excellent">${fmtMoney(excellentPrice)}</div>
          <div class="re-suggested__diff re-suggested__diff--save">
            <span class="re-suggested__diff-money">−${fmtMoney(Math.abs(diffExcellent))}</span>
            <span class="re-suggested__diff-pct">${fmtPct(pctExcellent)}</span>
          </div>
        </div>
        ${explainBlock}
      </div>
    `;
  }

  // CAS 3 : Le prix demandé est au-dessus du seuil "bon" → on suggère les deux niveaux pour négocier
  return `
    <div class="re-suggested">
      <div class="re-suggested__title">${icon("dollar-sign", 14)} ${t("re_suggested_title")}</div>

      <div class="re-suggested__row">
        <div class="re-suggested__label">${t("re_suggested_asking")}</div>
        <div class="re-suggested__price re-suggested__price--asking">${fmtMoney(asking)}</div>
      </div>

      <div class="re-suggested__row re-suggested__row--good">
        <div class="re-suggested__label">${t("re_suggested_good_label")}</div>
        <div class="re-suggested__price re-suggested__price--good">${fmtMoney(goodPrice)}</div>
        ${asking > 0 ? `<div class="re-suggested__diff re-suggested__diff--save">
          <span class="re-suggested__diff-money">−${fmtMoney(Math.abs(diffGood))}</span>
          <span class="re-suggested__diff-pct">${fmtPct(pctGood)}</span>
        </div>` : ""}
      </div>

      <div class="re-suggested__row re-suggested__row--excellent">
        <div class="re-suggested__label">${t("re_suggested_excellent_label")}</div>
        <div class="re-suggested__price re-suggested__price--excellent">${fmtMoney(excellentPrice)}</div>
        ${asking > 0 ? `<div class="re-suggested__diff re-suggested__diff--save">
          <span class="re-suggested__diff-money">−${fmtMoney(Math.abs(diffExcellent))}</span>
          <span class="re-suggested__diff-pct">${fmtPct(pctExcellent)}</span>
        </div>` : ""}
      </div>

      ${explainBlock}
    </div>
  `;
}

function renderRealEstateResults(a) {
  const m = calculateRealEstateMetrics(a);
  const cfClass = m.monthlyCashFlow >= 0 ? "pos" : "neg";
  const stressClass = m.stressMonthlyCashFlow >= 0 ? "pos" : "neg";
  const costClass = m.costToLiveMonthly <= 0 ? "pos" : "neg";
  const price = Number(a.purchasePrice) || 0;
  return `
    <div class="re-results__sticky">

      <!-- 1. HERO : Prix demandé en TRÈS gros -->
      <div class="re-hero-price">
        <div class="re-hero-price__label">${t("re_suggested_asking") || "Prix demandé"}</div>
        <div class="re-hero-price__value">${fmtMoney(price)}</div>
      </div>

      <!-- 2. Verdict compact + flèche pour détails -->
      <details class="re-verdict-compact re-verdict--${m.verdict}">
        <summary class="re-verdict-compact__summary">
          <div class="re-verdict-compact__main">
            <div class="re-verdict-compact__label">${t("re_verdict_" + m.verdict)}</div>
            <div class="re-verdict-compact__hint">${t("re_hint_" + (m.verdict === "unknown" ? "good" : m.verdict))}</div>
          </div>
          <span class="re-verdict-details__chevron" aria-label="Voir les raisons">▾</span>
        </summary>
        <div class="re-verdict-details__body">
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

      ${renderSuggestedPriceCard(a)}

      ${m.hasOwnerOccupied ? `
        <div class="re-metric re-metric--highlight">
          <div class="re-metric__label">${icon("home", 12)} ${t("re_metric_cost_to_live")}${reTip("re_tip_cost_to_live")}</div>
          <div class="re-metric__value re-metric__value--big re-metric__value--${costClass}">${m.costToLiveMonthly <= 0 ? "+" : ""}${fmtMoney(Math.abs(m.costToLiveMonthly))}<span class="re-metric__suffix">${t("re_metric_per_month")}</span></div>
          <div class="re-metric__sub">${m.costToLiveMonthly > 0 ? t("re_metric_cost_to_live_neg") : t("re_metric_cost_to_live_pos")}</div>
          ${renderCashFlowBreakdown(m, a)}
        </div>
      ` : ""}

      <!-- Cash flow (métrique principale) -->
      <div class="re-metric">
        <div class="re-metric__label">${t("re_metric_cashflow")}${reTip("re_tip_cashflow")}</div>
        <div class="re-metric__value re-metric__value--big re-metric__value--${cfClass}">${fmtMoney(m.monthlyCashFlow)}<span class="re-metric__suffix">${t("re_metric_per_month")}</span></div>
        <div class="re-metric__sub">${fmtMoney(m.annualCashFlow)}${t("re_metric_per_year")}</div>
        ${renderCashFlowBreakdown(m, a)}
      </div>

      <!-- Cash requis à l'achat -->
      <div class="re-metric re-metric--highlight">
        <div class="re-metric__label">${icon("dollar-sign", 12)} ${t("re_metric_cash_to_close")}${reTip("re_tip_cash_to_close")}</div>
        <div class="re-metric__value">${fmtMoney(m.cashToClose)}</div>
        <details class="re-metric-details">
          <summary class="re-metric-details__summary">${t("re_sim_more_detail") || "Voir le détail"} <span class="re-verdict-details__chevron">▾</span></summary>
          <div class="re-metric__breakdown">
            <div><span>${t("re_field_downpayment")}</span><strong>${fmtMoney(m.downPayment)}</strong></div>
            <div><span>${t("re_field_welcome_tax")}</span><strong>${fmtMoney(m.welcomeTax)}</strong></div>
            <div><span>${t("re_field_notary")}</span><strong>${fmtMoney(m.notaryFees)}</strong></div>
            <div><span>${t("re_field_inspection")}</span><strong>${fmtMoney(m.inspectionFees)}</strong></div>
            ${m.otherClosingFees > 0 ? `<div><span>${t("re_field_other_closing")}</span><strong>${fmtMoney(m.otherClosingFees)}</strong></div>` : ""}
            ${m.schlPremium > 0 ? `<div><span>${t("re_field_schl")} (au prêt)</span><strong>+${fmtMoney(m.schlPremium)}</strong></div>` : ""}
          </div>
        </details>
      </div>

      <!-- Hypothèque -->
      <div class="re-metric">
        <div class="re-metric__label">${t("re_metric_mortgage_pmt")}${reTip("re_tip_mortgage_pmt")}</div>
        <div class="re-metric__value re-metric__value--big">${fmtMoney(m.monthlyPmt)}<span class="re-metric__suffix">${t("re_metric_per_month")}</span></div>
        <details class="re-metric-details">
          <summary class="re-metric-details__summary">${t("re_sim_more_detail") || "Voir le détail"} <span class="re-verdict-details__chevron">▾</span></summary>
          <div class="re-metric__breakdown">
            <div><span>${t("re_metric_mortgage_biw")}</span><strong>${fmtMoney(m.biweeklyPmt)}</strong></div>
            <div><span>${t("re_metric_mortgage_wkl")}</span><strong>${fmtMoney(m.weeklyPmt)}</strong></div>
          </div>
          ${renderAmortizationTable(a, m)}
        </details>
      </div>

      <!-- Métriques clés (toujours visibles, 2x2) -->
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

      <!-- Métriques avancées (collapsibles) -->
      <details class="re-section-collapsible">
        <summary class="re-section-collapsible__summary">
          <span>${t("re_advanced_metrics") || "Métriques avancées"}</span>
          <span class="re-verdict-details__chevron">▾</span>
        </summary>
        <div class="re-section-collapsible__body">
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
          <div class="re-metric-row">
            <div class="re-metric">
              <div class="re-metric__label">${t("re_metric_breakeven")}${reTip("re_tip_breakeven")}</div>
              <div class="re-metric__value ${m.breakEvenOccupancy !== null && m.breakEvenOccupancy > 95 ? "re-metric__value--neg" : (m.breakEvenOccupancy !== null && m.breakEvenOccupancy < 85 ? "re-metric__value--pos" : "")}">${m.breakEvenOccupancy === null ? "—" : m.breakEvenOccupancy.toFixed(1) + "%"}</div>
            </div>
            <div class="re-metric">
              <div class="re-metric__label">${t("re_metric_oer")}${reTip("re_tip_oer")}</div>
              <div class="re-metric__value ${m.operatingExpenseRatio !== null && m.operatingExpenseRatio > 50 ? "re-metric__value--neg" : (m.operatingExpenseRatio !== null && m.operatingExpenseRatio < 40 ? "re-metric__value--pos" : "")}">${m.operatingExpenseRatio === null ? "—" : m.operatingExpenseRatio.toFixed(1) + "%"}</div>
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
        </div>
      </details>

      <!-- Projection long terme (collapsible) -->
      <details class="re-section-collapsible">
        <summary class="re-section-collapsible__summary">
          <span>${t("re_section_projection_results") || "Projection long terme"}</span>
          <span class="re-verdict-details__chevron">▾</span>
        </summary>
        <div class="re-section-collapsible__body">
          <div id="re-projection">${renderRealEstateProjection(a, reProjectionYears)}</div>
          <div id="re-projection-chart-wrap" class="re-projection-chart-wrap">
            <div class="re-projection-chart__title">${t("re_chart_title")}</div>
            <canvas id="re-projection-chart" height="220"></canvas>
          </div>
          ${renderProjectionTable(a, reProjectionYears)}
        </div>
      </details>

      ${a.fiscalEnabled ? renderFiscalImpactCard(a, m, reProjectionYears) : ""}
    </div>
  `;
}

// Carte "Impact fiscal" — visible seulement si fiscalEnabled = true
function renderFiscalImpactCard(a, m, horizon) {
  const f = reFiscalImpact(a, m, horizon);
  if (!f) return "";
  const atcfClass = f.monthlyAfterTaxCashFlow >= 0 ? "pos" : "neg";
  return `
    <div class="re-fiscal-card">
      <div class="re-fiscal-card__title">${icon("receipt", 14)} ${t("re_fiscal_impact")}</div>
      <div class="re-fiscal-card__hint">${t("re_fiscal_disclaimer")}</div>

      <div class="re-metric-row">
        <div class="re-metric">
          <div class="re-metric__label">${t("re_fiscal_after_tax_cf")}${reTip("re_tip_after_tax_cf")}</div>
          <div class="re-metric__value re-metric__value--big re-metric__value--${atcfClass}">${fmtMoney(f.monthlyAfterTaxCashFlow)}<span class="re-metric__suffix">${t("re_metric_per_month")}</span></div>
          <div class="re-metric__sub">${fmtMoney(f.annualAfterTaxCashFlow)}${t("re_metric_per_year")}</div>
        </div>
        <div class="re-metric">
          <div class="re-metric__label">${t("re_fiscal_annual_tax")}${reTip("re_tip_annual_tax")}</div>
          <div class="re-metric__value">${fmtMoney(f.annualIncomeTax)}${t("re_metric_per_year")}</div>
        </div>
      </div>

      <details class="re-cf-breakdown">
        <summary class="re-cf-breakdown__summary">
          <span>${t("re_fiscal_see_detail")}</span>
          <span class="re-verdict-details__chevron">▾</span>
        </summary>
        <div class="re-cf-breakdown__body">
          <div class="re-cf-row"><span class="re-cf-row__label">${t("re_fiscal_taxable_income")}</span><span class="re-cf-row__value">${fmtMoney(f.taxableIncome)}/an</span></div>
          <div class="re-cf-row"><span class="re-cf-row__label">${t("re_fiscal_interest_y1")}</span><span class="re-cf-row__value">${fmtMoney(f.interestPaidYear1)}/an</span></div>
          ${a.useCCA ? `<div class="re-cf-row"><span class="re-cf-row__label">${t("re_fiscal_cca_y1")}</span><span class="re-cf-row__value">${fmtMoney(f.ccaYear1)}/an</span></div>` : ""}
          <div class="re-cf-row"><span class="re-cf-row__label">${t("re_fiscal_tax_rate")}</span><span class="re-cf-row__value">${f.taxRate.toFixed(2)}%</span></div>
          <div class="re-cf-row re-cf-row--total">
            <span class="re-cf-row__label">${t("re_fiscal_annual_tax")}</span>
            <span class="re-cf-row__value">${fmtMoney(f.annualIncomeTax)}</span>
          </div>
        </div>
      </details>

      <div class="re-fiscal-card__divider">${t("re_fiscal_sale_horizon").replace("{n}", f.horizonYears)}</div>

      <div class="re-metric-row">
        <div class="re-metric">
          <div class="re-metric__label">${t("re_fiscal_capital_gain")}${reTip("re_tip_capital_gain")}</div>
          <div class="re-metric__value">${fmtMoney(f.capitalGain)}</div>
        </div>
        <div class="re-metric">
          <div class="re-metric__label">${t("re_fiscal_capital_gain_tax")}</div>
          <div class="re-metric__value re-metric__value--neg">${fmtMoney(f.capitalGainTax)}</div>
          ${a.useCCA && f.ccaRecaptureTax > 0 ? `<div class="re-metric__sub">+ ${fmtMoney(f.ccaRecaptureTax)} ${t("re_fiscal_cca_recapture")}</div>` : ""}
        </div>
      </div>
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

      <div class="re-proj-returns-row">
        <div class="re-proj-return re-proj-return--${returnClass}">
          <div class="re-proj-return__label">${t("re_proj_annualized_return")}${reTip("re_tip_cagr")}</div>
          <div class="re-proj-return__value">${p.annualizedReturn === null ? "—" : p.annualizedReturn.toFixed(2) + "%"}<span class="re-proj-return__suffix">/an</span></div>
        </div>
        <div class="re-proj-return ${p.irr !== null && p.irr >= 0 ? "re-proj-return--pos" : "re-proj-return--neg"}">
          <div class="re-proj-return__label">${t("re_proj_irr")}${reTip("re_tip_irr")}</div>
          <div class="re-proj-return__value">${p.irr === null ? "—" : p.irr.toFixed(2) + "%"}<span class="re-proj-return__suffix">/an</span></div>
        </div>
      </div>

      ${renderStockComparison(p, a)}
    </div>
  `;
}

// Tableau année par année : montre l'évolution détaillée sur la durée de projection
function renderProjectionTable(a, years) {
  years = Math.max(1, Math.min(30, Number(years) || 10));
  const base = calculateRealEstateMetrics(a);
  if (base.grossAnnualRent <= 0 && !base.hasOwnerOccupied) {
    return ""; // pas pertinent sans loyers
  }
  const apprRate = (Number(a.appreciationPercent) || 0) / 100;
  const rentRate = (Number(a.rentIncreasePercent) || 0) / 100;
  const r = (Number(a.interestRate) || 0) / 100;
  const n = (Number(a.amortYears) || 25) * 12;
  const iMonthly = Math.pow(1 + r / 2, 2 / 12) - 1;
  const PMT = base.monthlyPmt;
  const fixedOpexY1 = base.municipalTax + base.schoolTax + base.insurance + base.servicesY;
  const price = Number(a.purchasePrice) || 0;

  // Vacance respecte le toggle vacancyEnabled (sinon ignorée)
  const vacancyPctTbl = a.vacancyEnabled === false ? 0 : (Number(a.vacancyPercent) || 0);
  // Maintenance respecte le mode choisi
  const maintModeTbl = a.maintenanceMode || "percent";
  const maintAmountTbl = Number(a.maintenanceAmount) || 0;
  const maintPctTbl = Number(a.maintenancePercent) || 0;
  const rows = [];
  let cumCashFlow = 0;
  for (let y = 1; y <= years; y++) {
    const g = Math.pow(1 + rentRate, y - 1);
    const yGrossRent   = base.grossAnnualRent * g;
    const yVacancyLoss = yGrossRent * (vacancyPctTbl / 100);
    const yEffIncome   = yGrossRent - yVacancyLoss;
    const yFixedOpex   = fixedOpexY1 * g;
    let yMaintenance;
    if (maintModeTbl === "monthly") yMaintenance = maintAmountTbl * 12 * g;
    else if (maintModeTbl === "annual") yMaintenance = maintAmountTbl * g;
    else yMaintenance = yGrossRent * (maintPctTbl / 100);
    const yManagement  = yEffIncome * ((Number(a.managementPercent) || 0) / 100);
    const yOpex = yFixedOpex + yMaintenance + yManagement;
    const yNOI  = yEffIncome - yOpex;
    const yMortgage = (y <= (a.amortYears || 25)) ? PMT * 12 : 0;
    const yCashFlow = yNOI - yMortgage;
    cumCashFlow += yCashFlow;
    // Valeur de l'immeuble et solde hypothécaire à la fin de cette année
    const yValue = price * Math.pow(1 + apprRate, y);
    const k = Math.min(y, a.amortYears || 25) * 12;
    let yBalance = 0;
    if (y < (a.amortYears || 25)) {
      yBalance = (iMonthly === 0) ? Math.max(0, base.principal - PMT * k)
        : Math.max(0, base.principal * Math.pow(1 + iMonthly, k) - PMT * (Math.pow(1 + iMonthly, k) - 1) / iMonthly);
    }
    const yEquity = yValue - yBalance;
    rows.push({ y, yGrossRent, yOpex, yMortgage, yCashFlow, cumCashFlow, yBalance, yValue, yEquity });
  }
  // Une ligne par année. Format compact pour tenir dans le panneau.
  const tableRows = rows.map(r => `
    <tr>
      <td class="re-table__year">${r.y}</td>
      <td>${fmtMoneyCompact(r.yGrossRent)}</td>
      <td class="${r.yCashFlow >= 0 ? 're-table__pos' : 're-table__neg'}">${fmtMoneyCompact(r.yCashFlow)}</td>
      <td>${fmtMoneyCompact(r.yValue)}</td>
      <td class="re-table__equity">${fmtMoneyCompact(r.yEquity)}</td>
    </tr>
  `).join("");

  return `
    <details class="re-table-wrap">
      <summary class="re-table-wrap__summary">
        <span>${icon("clipboard", 12)} ${t("re_table_title")}</span>
        <span class="re-verdict-details__chevron">▾</span>
      </summary>
      <div class="re-table-wrap__body">
        <div class="re-table-wrap__scroll">
          <table class="re-table">
            <thead>
              <tr>
                <th>${t("re_table_year")}</th>
                <th>${t("re_table_rent")}</th>
                <th>${t("re_table_cashflow")}</th>
                <th>${t("re_table_value")}</th>
                <th>${t("re_table_equity")}</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
        <small class="re-hint">${t("re_table_note")}</small>
      </div>
    </details>
  `;
}

// Tableau d'amortissement 12 mois année 1 (intérêt vs capital chaque paiement)
function renderAmortizationTable(a, m) {
  if (!m || !m.principal || m.principal <= 0) return "";
  const rows = reAmortizationFirstYear(m.principal, a.interestRate, a.amortYears);
  if (!rows.length) return "";
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalPrincipal = rows.reduce((s, r) => s + r.principalPaid, 0);
  return `
    <details class="re-amort-table">
      <summary class="re-amort-table__summary">
        <span>${icon("clipboard", 12)} ${t("re_amort_title")}</span>
        <span class="re-verdict-details__chevron">▾</span>
      </summary>
      <div class="re-amort-table__body">
        <div class="re-amort-table__totals">
          <div><span>${t("re_amort_year_interest")}</span><strong>${fmtMoney(totalInterest)}</strong></div>
          <div><span>${t("re_amort_year_principal")}</span><strong>${fmtMoney(totalPrincipal)}</strong></div>
        </div>
        <div class="re-table-wrap__scroll">
          <table class="re-table">
            <thead>
              <tr>
                <th>${t("re_amort_month")}</th>
                <th>${t("re_amort_payment")}</th>
                <th>${t("re_amort_interest")}</th>
                <th>${t("re_amort_principal")}</th>
                <th>${t("re_amort_balance")}</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(r => `
                <tr>
                  <td class="re-table__year">${r.month}</td>
                  <td>${fmtMoneyCompact(r.payment)}</td>
                  <td class="re-table__neg">${fmtMoneyCompact(r.interest)}</td>
                  <td class="re-table__pos">${fmtMoneyCompact(r.principalPaid)}</td>
                  <td>${fmtMoneyCompact(r.balance)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        <small class="re-hint">${t("re_amort_note")}</small>
      </div>
    </details>
  `;
}

// Génère le détail du cash flow avec 2 colonnes : annuel et mensuel.
// Chaque ligne = { label, monthly: number (signé), kind: "income"|"expense" }
function renderCashFlowBreakdown(m, a) {
  const rows = [];
  // Revenus
  if (m.grossMonthlyRent > 0) {
    rows.push({ label: t("re_cf_gross_rent"), monthly: m.grossMonthlyRent, kind: "income" });
  }
  if (m.vacancyLoss > 0) {
    rows.push({ label: t("re_cf_vacancy"), monthly: -m.vacancyLoss / 12, kind: "expense" });
  }
  // Charges opérationnelles (les valeurs m.municipalTax sont déjà annuelles)
  if (m.municipalTax > 0) rows.push({ label: t("re_cf_municipal_tax"), monthly: -m.municipalTax / 12, kind: "expense" });
  if (m.schoolTax > 0)    rows.push({ label: t("re_cf_school_tax"),    monthly: -m.schoolTax / 12,    kind: "expense" });
  if (m.insurance > 0)    rows.push({ label: t("re_cf_insurance"),     monthly: -m.insurance / 12,    kind: "expense" });
  if (m.electricityMo > 0) rows.push({ label: t("re_cf_electricity"),  monthly: -m.electricityMo,     kind: "expense" });
  if (m.otherServiceMo > 0) {
    const otherLabel = (a && a.otherServiceName && a.otherServiceName.trim()) ? a.otherServiceName.trim() : t("re_cf_other_service");
    rows.push({ label: otherLabel, monthly: -m.otherServiceMo, kind: "expense" });
  }
  if (m.maintenance > 0)  rows.push({ label: t("re_cf_maintenance"),   monthly: -m.maintenance / 12,  kind: "expense" });
  if (m.management > 0)   rows.push({ label: t("re_cf_management"),    monthly: -m.management / 12,   kind: "expense" });
  if (m.monthlyPmt > 0)   rows.push({ label: t("re_cf_mortgage"),      monthly: -m.monthlyPmt,        kind: "expense" });

  if (rows.length === 0) return "";

  // Helper : formate un montant signé "+1 234 $" / "−1 234 $"
  const sgn = (v) => (v >= 0 ? "+" : "−") + fmtMoney(Math.abs(v));

  return `
    <details class="re-cf-breakdown">
      <summary class="re-cf-breakdown__summary">
        <span>${t("re_cf_see_detail")}</span>
        <span class="re-verdict-details__chevron">▾</span>
      </summary>
      <div class="re-cf-breakdown__body">
        <div class="re-cf-row re-cf-row--head">
          <span class="re-cf-row__label"></span>
          <span class="re-cf-col-h">/ an</span>
          <span class="re-cf-col-h">/ mois</span>
        </div>
        ${rows.map(r => `
          <div class="re-cf-row re-cf-row--${r.kind}">
            <span class="re-cf-row__label">${r.label}</span>
            <span class="re-cf-col-a">${sgn(r.monthly * 12)}</span>
            <span class="re-cf-col-m">${sgn(r.monthly)}</span>
          </div>
        `).join("")}
        <div class="re-cf-row re-cf-row--total">
          <span class="re-cf-row__label">${t("re_cf_total")}</span>
          <span class="re-cf-col-a ${m.monthlyCashFlow >= 0 ? 're-cf-row__value--pos' : 're-cf-row__value--neg'}">${sgn(m.monthlyCashFlow * 12)}</span>
          <span class="re-cf-col-m ${m.monthlyCashFlow >= 0 ? 're-cf-row__value--pos' : 're-cf-row__value--neg'}">${sgn(m.monthlyCashFlow)}</span>
        </div>
      </div>
    </details>
  `;
}

// Format compact "$1,2M", "$45k", "$890" pour les tableaux denses
function fmtMoneyCompact(n) {
  const num = Number(n) || 0;
  const abs = Math.abs(num);
  const sign = num < 0 ? "−" : "";
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(2)} M$`;
  if (abs >= 1e4) return `${sign}${(abs / 1e3).toFixed(0)} k$`;
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(1)} k$`;
  return `${sign}${abs.toFixed(0)} $`;
}

// Carte de comparaison vs placement en bourse (FNB indiciel, etc.)
function renderStockComparison(p, a) {
  if (!p || p.initialInvestment <= 0) return "";
  const reAdv = p.realEstateAdvantage;
  const reAdvPct = p.stockEndValue > 0 ? (reAdv / p.stockEndValue) * 100 : 0;
  const isAdvantage = reAdv >= 0;
  return `
    <div class="re-stock-cmp">
      <div class="re-stock-cmp__title">${icon("trending-up", 12)} ${t("re_stock_title")}</div>
      <div class="re-stock-cmp__rows">
        <div class="re-stock-cmp__row">
          <span class="re-stock-cmp__label">${t("re_stock_initial")}</span>
          <span class="re-stock-cmp__value">${fmtMoney(p.initialInvestment)}</span>
        </div>
        <div class="re-stock-cmp__row">
          <span class="re-stock-cmp__label">${t("re_stock_at_rate").replace("{rate}", (p.stockRate || 0).toFixed(1))}</span>
          <span class="re-stock-cmp__value">${fmtMoney(p.stockEndValue)}</span>
        </div>
        <div class="re-stock-cmp__row">
          <span class="re-stock-cmp__label">${t("re_stock_real_estate")}</span>
          <span class="re-stock-cmp__value">${fmtMoney(p.totalWealth)}</span>
        </div>
        <div class="re-stock-cmp__row re-stock-cmp__row--total ${isAdvantage ? "re-stock-cmp__row--pos" : "re-stock-cmp__row--neg"}">
          <span class="re-stock-cmp__label">${isAdvantage ? t("re_stock_re_wins") : t("re_stock_bourse_wins")}</span>
          <span class="re-stock-cmp__value">${reAdv >= 0 ? "+" : "−"}${fmtMoney(Math.abs(reAdv))} (${reAdvPct >= 0 ? "+" : ""}${reAdvPct.toFixed(1)}%)</span>
        </div>
      </div>
    </div>
  `;
}

function reSetProjectionYears(years) {
  reProjectionYears = Math.max(1, Math.min(50, Number(years) || 10));
  const block = document.getElementById("re-projection");
  if (block && reCurrent) block.innerHTML = renderRealEstateProjection(reCurrent, reProjectionYears);
  // Met à jour aussi le graphique
  if (reCurrent) setTimeout(() => reDrawProjectionChart(reCurrent), 0);
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
  // ÉTAPE 1 : migrations legacy AVANT d'appliquer les défauts (sinon les défauts écrasent)
  // services (ancien champ unique) → electricity (nouveau champ décomposé)
  if (reCurrent.services !== undefined && reCurrent.electricity === undefined) {
    reCurrent.electricity = reCurrent.services;
    delete reCurrent.services;
  }
  // ÉTAPE 2 : appliquer les valeurs par défaut pour les champs ajoutés après la sauvegarde initiale
  const defaults = reNewAnalysis();
  for (const key of Object.keys(defaults)) {
    if (reCurrent[key] === undefined || reCurrent[key] === null) {
      reCurrent[key] = defaults[key];
    }
  }
  // Assurer que chaque unité a les nouveaux champs (incluant subtype)
  reCurrent.units = (reCurrent.units || []).map(u => ({
    name: u.name || "Logement",
    subtype: u.subtype || "",
    rent: Number(u.rent) || 0,
    utilitiesIncluded: u.utilitiesIncluded !== undefined ? !!u.utilitiesIncluded : true,
    ownerOccupied: !!u.ownerOccupied
  }));
  if (!reCurrent.units.length) reCurrent.units = [{ name: "Logement 1", subtype: "", rent: 0, utilitiesIncluded: true, ownerOccupied: false }];
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
  if (panel && reCurrent) {
    panel.innerHTML = renderRealEstateResults(reCurrent);
    // Redessine le graphique de projection
    setTimeout(() => reDrawProjectionChart(reCurrent), 0);
  }
}

let reChartInstance = null;
function reDrawProjectionChart(a) {
  if (typeof Chart === "undefined") return;
  const canvas = document.getElementById("re-projection-chart");
  if (!canvas || !a) return;
  // Calcule les valeurs année par année jusqu'à la durée de projection (max 30)
  const horizon = Math.max(5, Math.min(30, Number(reProjectionYears) || 10));
  const labels = [];
  const dataValue = [];
  const dataBalance = [];
  const dataEquity = [];
  for (let y = 1; y <= horizon; y++) {
    const p = projectRealEstate(a, y);
    labels.push(`${y}`);
    dataValue.push(Math.round(p.futureValue));
    dataBalance.push(Math.round(p.mortgageBalance));
    dataEquity.push(Math.round(p.equity));
  }
  // Couleurs depuis les variables CSS
  const styles = getComputedStyle(document.documentElement);
  const accent = styles.getPropertyValue("--status-green").trim() || "#10b981";
  const blue   = styles.getPropertyValue("--status-blue").trim()  || "#2563eb";
  const red    = styles.getPropertyValue("--status-red").trim()   || "#ef4444";
  const muted  = styles.getPropertyValue("--text3").trim()        || "#64748b";
  // Destroy existing instance if any
  if (reChartInstance) {
    reChartInstance.destroy();
    reChartInstance = null;
  }
  reChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("re_chart_value"),
          data: dataValue,
          borderColor: blue,
          backgroundColor: blue + "20",
          tension: 0.25,
          fill: false,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5
        },
        {
          label: t("re_chart_balance"),
          data: dataBalance,
          borderColor: red,
          backgroundColor: red + "20",
          tension: 0.25,
          fill: false,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5
        },
        {
          label: t("re_chart_equity"),
          data: dataEquity,
          borderColor: accent,
          backgroundColor: accent + "30",
          tension: 0.25,
          fill: true,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, font: { size: 11 }, color: muted }
        },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              return ctx.dataset.label + ": " + fmtMoney(ctx.parsed.y);
            },
            title: function(items) {
              return t("re_chart_year") + " " + items[0].label;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: t("re_chart_year"), color: muted, font: { size: 11 } },
          ticks: { color: muted, font: { size: 10 } },
          grid: { display: false }
        },
        y: {
          ticks: {
            color: muted,
            font: { size: 10 },
            callback: function(value) {
              if (value >= 1e6) return (value/1e6).toFixed(1) + "M";
              if (value >= 1e3) return (value/1e3).toFixed(0) + "k";
              return value;
            }
          },
          grid: { color: muted + "22" }
        }
      }
    }
  });
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
      newUnits.push(cur[i] || { name: `Logement ${i + 1}`, subtype: "", rent: 0, utilitiesIncluded: true, ownerOccupied: false });
    }
    reCurrent.units = newUnits;
  } else {
    if (!reCurrent.units || !reCurrent.units.length) {
      reCurrent.units = [{ name: "Logement 1", subtype: "", rent: 0, utilitiesIncluded: true, ownerOccupied: false }];
    }
  }
  renderPage();
}
function reAddUnit() {
  if (!reCurrent) return;
  const idx = (reCurrent.units || []).length + 1;
  reCurrent.units.push({ name: `Logement ${idx}`, subtype: "", rent: 0, utilitiesIncluded: true, ownerOccupied: false });
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
    alert(t("re_save_need_name") || "Donne un nom à ton analyse (ex: Triplex St-Jean-Baptiste).");
    return;
  }
  const now = Date.now();
  const payload = { ...reCurrent, updatedAt: now };
  if (!payload.createdAt) payload.createdAt = now;
  // Multi-usagers : assure que le doc est lié à l'usager courant
  if (!payload.userId) payload.userId = currentUserId;
  if (reCurrent.id) {
    const id = reCurrent.id;
    delete payload.id;
    await db.collection("realEstateAnalyses").doc(id).set(payload, { merge: true });
  } else {
    delete payload.id;
    const ref = await db.collection("realEstateAnalyses").add(payload);
    reCurrent.id = ref.id;
  }
  // On reste en mode édition : pas de retour à la liste
  reShowSaveToast();
  renderPage();
}

// Affiche un petit toast "Sauvegardé" en bas de l'écran (auto-disparaît)
function reShowSaveToast() {
  let toast = document.getElementById("re-save-toast");
  if (toast) toast.remove();
  toast = document.createElement("div");
  toast.id = "re-save-toast";
  toast.className = "re-toast re-toast--success";
  toast.innerHTML = `${icon("check", 14)} <span>${t("re_save_toast") || "Analyse sauvegardée"}</span>`;
  document.body.appendChild(toast);
  // Forcer un reflow pour activer la transition
  requestAnimationFrame(() => toast.classList.add("is-visible"));
  setTimeout(() => {
    toast.classList.remove("is-visible");
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}
async function reDelete(id) {
  if (!id) return;
  if (!confirm(t("re_confirm_delete"))) return;
  await db.collection("realEstateAnalyses").doc(id).delete();
  reBackToList();
}

// Exporte la fiche en PDF via la boîte d'impression du navigateur
// (l'utilisateur choisit "Enregistrer en PDF" dans la destination)
function reExportPDF() {
  // Marque le body pour activer le mode impression personnalisé
  document.body.classList.add("re-printing");
  // S'assure que tous les <details> du panneau résultats sont ouverts pour l'impression
  document.querySelectorAll(".re-results details").forEach(d => {
    d.dataset.wasOpen = d.open ? "1" : "0";
    d.open = true;
  });
  // Lance l'impression
  setTimeout(() => {
    window.print();
    // Nettoyage après impression
    setTimeout(() => {
      document.body.classList.remove("re-printing");
      document.querySelectorAll(".re-results details").forEach(d => {
        if (d.dataset.wasOpen === "0") d.open = false;
        delete d.dataset.wasOpen;
      });
    }, 100);
  }, 50);
}

// ─── Import Centris ────────────────────────────────────────────────
// L'utilisateur colle le HTML brut d'une fiche Centris (Ctrl+U sur la
// page Centris puis Ctrl+A/Ctrl+C). On parse, on affiche un aperçu
// des champs détectés, et on remplit reCurrent / houseCurrent.

// Démarre une nouvelle analyse locative ET ouvre le modal d'import
function reNewFromCentris() {
  reCurrent = reNewAnalysis();
  reMode = "edit";
  renderPage();
  setTimeout(() => openCentrisImportModal("rental"), 60);
}

// Démarre une nouvelle fiche maison ET ouvre le modal d'import
function houseNewFromCentris() {
  if (typeof houseNew === "function") {
    houseNew();
    setTimeout(() => openCentrisImportModal("house"), 60);
  }
}

// Ouvre le modal d'import
// target : "rental" (immeuble locatif) | "house" (résidence)
function openCentrisImportModal(target) {
  const targetLabel = target === "house" ? t("nav_house") : t("re_title");
  const html = `
    <div class="modal" style="max-width:680px">
      <div class="modal-header">
        <h3>${icon("download", 18)} ${t("centris_import_title")}</h3>
        <button class="close-btn" onclick="closeModal()" aria-label="${t("close")}">${icon("x", 18)}</button>
      </div>
      <div style="padding:0 4px">
        <p style="color:var(--text2);font-size:14px;line-height:1.55;margin:0 0 12px">
          ${t("centris_import_step_intro").replace("{target}", targetLabel)}
        </p>

        <!-- Champ URL : méthode principale -->
        <label style="display:block;font-weight:600;font-size:13px;color:var(--text);margin-bottom:6px">
          ${t("centris_import_label_url")}
        </label>
        <div style="display:flex;gap:8px;align-items:stretch;margin-bottom:6px">
          <input id="centris-url-input" type="text" inputmode="url" autocomplete="off" spellcheck="false" placeholder="${t("centris_import_url_placeholder")}" onkeydown="if(event.key==='Enter'){event.preventDefault();centrisFetchFromUrl();}" style="flex:1;font-size:13px;padding:9px 12px;border:1px solid var(--border, #ddd);border-radius:8px;background:var(--bg-soft, #fff);color:var(--text)">
          <button type="button" class="btn btn-primary" id="centris-fetch-btn" onclick="centrisFetchFromUrl()" style="white-space:nowrap">
            ${icon("download", 14)} ${t("centris_import_load_url")}
          </button>
        </div>
        <div id="centris-fetch-status" style="font-size:12px;color:var(--text3);margin-bottom:14px;min-height:16px"></div>

        <!-- Séparateur OR -->
        <div style="display:flex;align-items:center;gap:10px;margin:18px 0 12px;color:var(--text3);font-size:12px;text-transform:uppercase;letter-spacing:0.06em">
          <div style="flex:1;height:1px;background:var(--border, #e5e0d6)"></div>
          <div>${t("centris_import_or_manual")}</div>
          <div style="flex:1;height:1px;background:var(--border, #e5e0d6)"></div>
        </div>

        <!-- Fallback : coller le HTML -->
        <details class="centris-help" style="margin:0 0 14px;background:var(--surface-soft, #f6f3ed);padding:10px 14px;border-radius:8px">
          <summary style="cursor:pointer;font-weight:600;font-size:13px;color:var(--text)">${t("centris_import_help_summary")}</summary>
          <ol style="margin:10px 0 0;padding-left:22px;font-size:13px;color:var(--text2);line-height:1.7">
            <li>${t("centris_import_step1")}</li>
            <li>${t("centris_import_step2")}</li>
            <li>${t("centris_import_step3")}</li>
            <li>${t("centris_import_step4")}</li>
          </ol>
        </details>
        <label style="display:block;font-weight:600;font-size:13px;color:var(--text);margin-bottom:6px">
          ${t("centris_import_label_html")}
        </label>
        <textarea id="centris-html-input" rows="6" placeholder="${t("centris_import_placeholder")}" style="width:100%;font-family:monospace;font-size:12px;padding:10px;border:1px solid var(--border, #ddd);border-radius:8px;resize:vertical;background:var(--bg-soft, #fff);color:var(--text)"></textarea>
        <input type="hidden" id="centris-target" value="${esc(target)}">
        <div id="centris-preview" style="margin-top:14px"></div>
      </div>
      <div class="modal-actions" style="margin-top:16px">
        <button class="btn-cancel" onclick="closeModal()">${t("cancel")}</button>
        <button class="btn btn-secondary" onclick="centrisAnalyze()">${icon("search", 14)} ${t("centris_import_analyze")}</button>
        <button class="btn btn-primary" id="centris-apply-btn" disabled onclick="centrisApply()">${icon("check", 14)} ${t("centris_import_apply")}</button>
      </div>
    </div>`;
  showModal(html);
  // Stocke le résultat du parsing dans une variable globale du scope du modal
  window._centrisParsedResult = null;
  setTimeout(() => {
    const inp = document.getElementById("centris-url-input");
    if (inp) inp.focus();
  }, 100);
}

// Normalise une URL collée par l'utilisateur : trim, ajoute https:// si
// manquant. Retourne l'URL normalisée ou null si invalide.
function normalizePropertyUrl(rawUrl) {
  if (!rawUrl) return null;
  let u = String(rawUrl).trim();
  if (!u) return null;
  // Enlève d'éventuels guillemets ou backticks copiés par accident
  u = u.replace(/^[`"']+|[`"']+$/g, "");
  // Ajoute https:// si l'URL commence directement par le domaine
  if (!/^https?:\/\//i.test(u)) {
    u = "https://" + u.replace(/^\/+/, "");
  }
  try {
    const parsed = new URL(u);
    return parsed.toString();
  } catch (e) {
    return null;
  }
}

// Détecte le site immobilier depuis une URL : "centris" | "duproprio" | null
function detectPropertySite(url) {
  if (!url) return null;
  if (/^https?:\/\/([\w-]+\.)*centris\.ca\//i.test(url)) return "centris";
  if (/^https?:\/\/([\w-]+\.)*duproprio\.com\//i.test(url)) return "duproprio";
  return null;
}

// Choisit le bon parseur selon le HTML / la source connue
function parsePropertyHTML(html, source) {
  if (source === "duproprio" && typeof parseDuProprioHTML === "function") {
    return parseDuProprioHTML(html);
  }
  if (typeof parseCentrisHTML === "function") {
    return parseCentrisHTML(html);
  }
  return null;
}

// Fetch l'URL Centris/DuProprio via le proxy serverless /api/centris,
// met le résultat dans le textarea HTML et lance l'analyse automatiquement.
async function centrisFetchFromUrl() {
  const inp = document.getElementById("centris-url-input");
  const btn = document.getElementById("centris-fetch-btn");
  const status = document.getElementById("centris-fetch-status");
  const ta = document.getElementById("centris-html-input");
  if (!inp || !btn || !status || !ta) return;
  const raw = (inp.value || "").trim();
  if (!raw) {
    status.style.color = "var(--status-red)";
    status.textContent = t("centris_import_url_required");
    return;
  }
  // Normalise (ajoute https:// si manquant, trim guillemets, etc.)
  const url = normalizePropertyUrl(raw);
  if (!url) {
    status.style.color = "var(--status-red)";
    status.textContent = t("centris_import_url_invalid");
    return;
  }
  // Met à jour le champ avec l'URL normalisée pour que l'utilisateur voie
  // ce qui est envoyé (transparence)
  if (url !== raw) inp.value = url;
  // Validation site
  const site = detectPropertySite(url);
  if (!site) {
    status.style.color = "var(--status-red)";
    status.textContent = t("centris_import_url_invalid");
    return;
  }
  // Avertissement si la fiche Centris est en anglais (/en/) — le parseur
  // est optimisé pour les fiches françaises mais supporte aussi l'anglais.
  if (site === "centris" && /\/en\//i.test(url)) {
    // Ne bloque pas, juste un message indicatif (mis à jour après chargement)
  }
  // Stocke la source détectée pour que centrisAnalyze utilise le bon parseur
  window._propertySource = site;
  btn.disabled = true;
  status.style.color = "var(--text3)";
  status.textContent = t("centris_import_url_loading");
  try {
    const resp = await fetch("/api/centris?url=" + encodeURIComponent(url));
    if (!resp.ok) {
      let errMsg = t("centris_import_url_failed");
      try {
        const body = await resp.json();
        if (body && body.message) errMsg = body.message;
      } catch (e) { /* ignore */ }
      status.style.color = "var(--status-red)";
      status.innerHTML = `${esc(errMsg)} <br><span style="color:var(--text3)">${t("centris_import_url_fallback")}</span>`;
      btn.disabled = false;
      return;
    }
    const html = await resp.text();
    ta.value = html;
    status.style.color = "var(--status-green)";
    status.textContent = t("centris_import_url_loaded").replace("{kb}", Math.round(html.length / 1024));
    btn.disabled = false;
    // Auto-analyse
    centrisAnalyze();
  } catch (err) {
    status.style.color = "var(--status-red)";
    status.innerHTML = `${esc(t("centris_import_url_failed"))} (${esc(err.message || "")}) <br><span style="color:var(--text3)">${t("centris_import_url_fallback")}</span>`;
    btn.disabled = false;
  }
}

// Analyse le HTML collé et affiche un aperçu des champs détectés
function centrisAnalyze() {
  const ta = document.getElementById("centris-html-input");
  const previewEl = document.getElementById("centris-preview");
  const applyBtn = document.getElementById("centris-apply-btn");
  if (!ta || !previewEl) return;
  const html = ta.value || "";
  if (html.trim().length < 50) {
    previewEl.innerHTML = `<div class="centris-warn">${t("centris_import_need_html")}</div>`;
    if (applyBtn) applyBtn.disabled = true;
    return;
  }
  if (typeof parseCentrisHTML !== "function") {
    previewEl.innerHTML = `<div class="centris-warn">${t("centris_import_parser_missing")}</div>`;
    return;
  }
  // Détermine la source : 1) source forcée par centrisFetchFromUrl,
  // 2) détection auto dans le HTML (Centris a "centris.ca", DuProprio a "duproprio.com").
  let source = window._propertySource || null;
  if (!source) {
    if (/duproprio\.com/i.test(html)) source = "duproprio";
    else if (/centris\.ca/i.test(html)) source = "centris";
    else source = "centris"; // défaut
  }
  const parsed = parsePropertyHTML(html, source);
  if (!parsed) {
    previewEl.innerHTML = `<div class="centris-warn">${t("centris_import_parser_missing")}</div>`;
    return;
  }
  parsed._source = parsed._source || source;
  window._centrisParsedResult = parsed;
  // Confiance : 0-30 rouge, 30-60 orange, 60+ vert
  const conf = parsed._confidence;
  const confColor = conf >= 60 ? "var(--status-green)" : conf >= 30 ? "var(--status-orange, #f59e0b)" : "var(--status-red)";
  const fmtV = (v, isMoney) => v == null ? `<span style="color:var(--text3)">${t("centris_import_not_found")}</span>` : (isMoney ? fmtMoney(v) : esc(String(v)));
  // Note sur le type détecté vs cible
  const target = document.getElementById("centris-target")?.value || "rental";
  let typeMismatch = "";
  if (parsed.propertyType && parsed.propertyType !== target) {
    const detectedLabel = parsed.propertyType === "rental" ? t("centris_type_rental") : t("centris_type_house");
    const targetLabel = target === "rental" ? t("centris_type_rental") : t("centris_type_house");
    typeMismatch = `<div class="centris-warn" style="margin-bottom:10px">${t("centris_import_type_mismatch").replace("{detected}", detectedLabel).replace("{target}", targetLabel)}</div>`;
  }
  let unitsHtml = "";
  if (parsed.units && parsed.units.length > 0) {
    unitsHtml = `<div class="centris-row"><span class="centris-row__label">${t("centris_field_units")}</span><span class="centris-row__value">${parsed.units.map(u => `${esc(u.label)} → ${fmtMoney(u.rent)}/mois`).join("<br>")}</span></div>`;
  }
  previewEl.innerHTML = `
    <div class="centris-preview-box">
      <div class="centris-preview-head">
        <div style="font-weight:600;font-size:13px">${t("centris_import_detected")}</div>
        <div style="font-size:12px;color:${confColor};font-weight:600">${t("centris_import_confidence")}: ${conf}%</div>
      </div>
      ${typeMismatch}
      <div class="centris-rows">
        <div class="centris-row"><span class="centris-row__label">${t("centris_field_price")}</span><span class="centris-row__value">${fmtV(parsed.price, true)}</span></div>
        <div class="centris-row"><span class="centris-row__label">${t("centris_field_address")}</span><span class="centris-row__value">${fmtV(parsed.address)}</span></div>
        <div class="centris-row"><span class="centris-row__label">${t("centris_field_type")}</span><span class="centris-row__value">${fmtV(parsed.rawTypeText)}</span></div>
        <div class="centris-row"><span class="centris-row__label">${t("centris_field_year")}</span><span class="centris-row__value">${fmtV(parsed.year)}</span></div>
        <div class="centris-row"><span class="centris-row__label">${t("centris_field_mun_tax")}</span><span class="centris-row__value">${fmtV(parsed.municipalTax, true)}</span></div>
        <div class="centris-row"><span class="centris-row__label">${t("centris_field_school_tax")}</span><span class="centris-row__value">${fmtV(parsed.schoolTax, true)}</span></div>
        <div class="centris-row"><span class="centris-row__label">${t("centris_field_eval")}</span><span class="centris-row__value">${fmtV(parsed.municipalAssessment, true)}</span></div>
        ${parsed.livingAreaSqft ? `<div class="centris-row"><span class="centris-row__label">${t("centris_field_living_area")}</span><span class="centris-row__value">${parsed.livingAreaSqft} pi²</span></div>` : ""}
        ${parsed.landAreaSqft ? `<div class="centris-row"><span class="centris-row__label">${t("centris_field_land_area")}</span><span class="centris-row__value">${parsed.landAreaSqft} pi²</span></div>` : ""}
        ${parsed.bedrooms != null ? `<div class="centris-row"><span class="centris-row__label">${t("centris_field_bedrooms")}</span><span class="centris-row__value">${parsed.bedrooms}</span></div>` : ""}
        ${parsed.bathrooms != null ? `<div class="centris-row"><span class="centris-row__label">${t("centris_field_bathrooms")}</span><span class="centris-row__value">${parsed.bathrooms}${parsed.powderRooms ? ` + ${parsed.powderRooms} ${t("centris_field_powder_short")}` : ""}</span></div>` : ""}
        ${parsed.grossRevenue != null ? `<div class="centris-row"><span class="centris-row__label">${t("centris_field_gross_rev")}</span><span class="centris-row__value">${fmtMoney(parsed.grossRevenue)}/an</span></div>` : ""}
        ${unitsHtml}
        ${parsed.centrisId ? `<div class="centris-row"><span class="centris-row__label">Nº MLS</span><span class="centris-row__value">${esc(parsed.centrisId)}</span></div>` : ""}
      </div>
    </div>
  `;
  if (applyBtn) applyBtn.disabled = conf === 0;
}

// Applique le résultat parsé sur le draft courant et ferme le modal
function centrisApply() {
  const parsed = window._centrisParsedResult;
  if (!parsed) return;
  const target = document.getElementById("centris-target")?.value || "rental";
  if (target === "rental") {
    if (!reCurrent) reCurrent = reNewAnalysis();
    if (typeof applyCentrisToRentalAnalysis === "function") {
      applyCentrisToRentalAnalysis(parsed, reCurrent);
    }
    reMode = "edit";
  } else if (target === "house") {
    if (typeof houseCurrent === "undefined" || !houseCurrent) {
      if (typeof houseNew === "function") houseNew();
    }
    if (typeof applyCentrisToHouseAnalysis === "function" && typeof houseCurrent !== "undefined") {
      applyCentrisToHouseAnalysis(parsed, houseCurrent);
    }
  }
  window._centrisParsedResult = null;
  closeModal();
  renderPage();
  // Petit toast de confirmation
  reShowSaveToast();
}
