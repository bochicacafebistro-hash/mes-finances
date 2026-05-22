// ── Page « Maisons » (résidence principale) ───────────────────────────
// Distincte de l'immobilier locatif : ici on analyse une maison qu'on
// achète pour y habiter (pas pour louer). Les calculs clés sont :
//   - Paiement hypothécaire mensuel (composition semi-annuelle Canada)
//   - Coût TOTAL mensuel de propriété (hypothèque + taxes + assurance
//     + chauffage + entretien estimé à 1 %/an du prix)
//   - Mise de fonds minimale requise (règles canadiennes 2025)
//   - Ratio prix demandé / évaluation municipale
//
// Réutilise les helpers existants (canadianMortgagePayment, reComputeWelcomeTax,
// reComputeSchlPremium) de pages.js.

// ── Modèle de données par défaut ──────────────────────────────────────
function houseNewAnalysis() {
  return {
    id: null,
    name: "",
    address: "",
    purchasePrice: 0,
    downPaymentMode: "percent",
    downPayment: 0,
    downPaymentPercent: 5,       // défaut : mise de fonds minimale légale
    amortYears: 30,              // défaut : amortissement long
    interestRate: 4,             // défaut : taux conservateur
    // Charges mensuelles (sauf taxes annuelles)
    municipalTax: 0,        // $/an
    schoolTax: 0,           // $/an
    insurance: 0,           // $/an
    heating: 150,           // $/mois (estimation par défaut maison Qc)
    electricity: 100,       // $/mois
    condoFees: 0,           // $/mois (0 = pas de copropriété)
    // Entretien : règle empirique "1 % du prix par année" (industrie)
    maintenancePercentOfPrice: 1,
    // Frais de clôture ponctuels (auto-calculés)
    welcomeTaxAuto: true,
    welcomeTax: 0,
    notaryFees: 2500,            // défaut prudent
    inspectionFees: 600,
    otherClosingFees: 0,
    schlAuto: true,
    schlPremium: 0,
    // Données Centris
    yearBuilt: null,
    livingAreaSqft: null,
    landAreaSqft: null,
    bedrooms: null,
    bathrooms: null,
    powderRooms: null,        // salles d'eau (sans bain)
    rooms: null,
    centrisUrl: "",
    centrisId: "",
    municipalAssessment: 0,
    // Projection
    appreciationPercent: 4,    // moyenne historique résidentielle Qc long terme
    notes: ""
  };
}

// ── Calculs ───────────────────────────────────────────────────────────
// Mise de fonds minimale au Canada (règles 2025) :
//   - Prix < 500 000 $ : 5 % du prix
//   - 500 000 à 999 999 $ : 5 % sur les premiers 500 000 + 10 % sur l'excédent
//   - 1 000 000 $ et + : 20 % du prix (assurance hypothécaire non disponible)
// Réf. : SCHL / gouvernement du Canada
function houseMinDownPayment(price) {
  if (!price || price <= 0) return 0;
  if (price >= 1000000) return price * 0.20;
  if (price <= 500000) return price * 0.05;
  return 500000 * 0.05 + (price - 500000) * 0.10;
}

// Calcule les métriques principales d'une analyse maison
function houseCalculateMetrics(a) {
  const price = Number(a.purchasePrice) || 0;
  // Mise de fonds effective
  let dp;
  if (a.downPaymentMode === "percent") {
    dp = price * (Number(a.downPaymentPercent) || 0) / 100;
  } else {
    dp = Math.min(price, Number(a.downPayment) || 0);
  }
  const dpPct = price > 0 ? (dp / price) * 100 : 0;

  // Prime SCHL (si MF < 20 %, ajoutée au prêt)
  let schl = 0;
  if (a.schlAuto !== false) {
    schl = (typeof reComputeSchlPremium === "function") ? reComputeSchlPremium(price, dp) : 0;
  } else {
    schl = Number(a.schlPremium) || 0;
  }

  // Principal du prêt = prix - mise de fonds + prime SCHL
  const principal = Math.max(0, price - dp + schl);

  // Paiement hypothécaire mensuel (composition semi-annuelle Canada)
  const monthlyPmt = (typeof canadianMortgagePayment === "function")
    ? canadianMortgagePayment(principal, Number(a.interestRate) || 0, Number(a.amortYears) || 25, "monthly")
    : 0;

  // Coût total mensuel de propriété
  const munTaxM = (Number(a.municipalTax) || 0) / 12;
  const schoolTaxM = (Number(a.schoolTax) || 0) / 12;
  const insuranceM = (Number(a.insurance) || 0) / 12;
  const heatingM = Number(a.heating) || 0;
  const electricityM = Number(a.electricity) || 0;
  const condoM = Number(a.condoFees) || 0;
  const maintM = price * ((Number(a.maintenancePercentOfPrice) || 0) / 100) / 12;
  const totalMonthly = monthlyPmt + munTaxM + schoolTaxM + insuranceM
                     + heatingM + electricityM + condoM + maintM;

  // Mise de fonds minimale requise
  const minDown = houseMinDownPayment(price);
  const dpOk = dp >= minDown - 0.5; // tolérance 0,5 $ pour arrondi
  const dpShortfall = Math.max(0, minDown - dp);

  // Frais de clôture
  let welcomeTax = 0;
  if (a.welcomeTaxAuto !== false) {
    welcomeTax = (typeof reComputeWelcomeTax === "function") ? reComputeWelcomeTax(price) : 0;
  } else {
    welcomeTax = Number(a.welcomeTax) || 0;
  }
  const closingTotal = welcomeTax
                     + (Number(a.notaryFees) || 0)
                     + (Number(a.inspectionFees) || 0)
                     + (Number(a.otherClosingFees) || 0);
  const cashToClose = dp + closingTotal;

  // Ratio prix / évaluation municipale
  let priceToAssessment = null;
  if (a.municipalAssessment && Number(a.municipalAssessment) > 0) {
    priceToAssessment = price / Number(a.municipalAssessment);
  }

  // Verdict simple (basé sur les heuristiques industrie)
  // - dp < min : red flag
  // - cost > 35 % d'un revenu typique ? on ne connaît pas le revenu, donc indicatif
  // - ratio prix/éval > 1.30 = très cher, < 1.0 = bonne affaire
  let assessmentVerdict = null;
  if (priceToAssessment != null) {
    if (priceToAssessment < 1.00) assessmentVerdict = "under";       // sous-évalué (rare au Qc 2025)
    else if (priceToAssessment <= 1.15) assessmentVerdict = "fair";  // juste
    else if (priceToAssessment <= 1.35) assessmentVerdict = "high";  // cher
    else assessmentVerdict = "overpriced";                            // très cher
  }

  return {
    dp, dpPct, schl, principal, monthlyPmt,
    munTaxM, schoolTaxM, insuranceM, heatingM, electricityM, condoM, maintM,
    totalMonthly,
    minDown, dpOk, dpShortfall,
    welcomeTax, closingTotal, cashToClose,
    priceToAssessment, assessmentVerdict
  };
}

// ── État UI de la page ────────────────────────────────────────────────
let houseAnalyses = [];
let houseMode = "list";       // "list" | "edit"
let houseCurrent = null;

// ── Rendu principal ───────────────────────────────────────────────────
function renderHousePage() {
  if (houseMode === "edit" && houseCurrent) return renderHouseEdit();
  return renderHouseList();
}

function renderHouseList() {
  let h = `<div class="serene-page">
    <div class="serene-hero-header">
      <div>
        <div class="kicker" style="margin-bottom:10px">${t("house_subtitle").toUpperCase()}</div>
        <h1 class="serene-hero-h1" style="margin:0">${t("house_title")}</h1>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
        <button class="btn-pill" onclick="houseNewFromCentris()">${icon("download", 14)} ${t("re_import_centris")}</button>
        <button class="btn-pill" onclick="houseNew()">${icon("plus", 14)} ${t("house_add")}</button>
      </div>
    </div>`;
  if (!houseAnalyses.length) {
    h += `<div class="empty">
      <div style="margin-bottom:12px;color:var(--text3);display:flex;justify-content:center">${icon("home", 48)}</div>
      <p>${t("house_empty")}</p>
    </div></div>`;
    return h;
  }
  h += `<div class="re-list">`;
  for (const a of houseAnalyses) {
    const m = houseCalculateMetrics(a);
    h += `<div class="re-card">
      <div class="re-card__body" onclick="houseEdit('${a.id}')" style="cursor:pointer">
        <div class="re-card__head">
          <div class="re-card__icon">${icon("home", 20)}</div>
          <div class="re-card__title">
            <div class="re-card__name">${esc(a.name || "(Sans nom)")}</div>
            <div class="re-card__addr">${esc(a.address || "")}</div>
          </div>
          ${m.assessmentVerdict ? `<div class="re-verdict re-verdict--${m.assessmentVerdict === "under" || m.assessmentVerdict === "fair" ? "good" : (m.assessmentVerdict === "high" ? "risky" : "bad")}">${t("house_verdict_" + m.assessmentVerdict)}</div>` : ""}
        </div>
        <div class="re-card__stats">
          <div class="re-stat">
            <div class="re-stat__label">${t("house_total_monthly")}</div>
            <div class="re-stat__value">${fmtMoney(m.totalMonthly)}<span class="re-stat__suffix">/mois</span></div>
          </div>
          <div class="re-stat">
            <div class="re-stat__label">${t("house_mortgage_pmt")}</div>
            <div class="re-stat__value">${fmtMoney(m.monthlyPmt)}</div>
          </div>
          <div class="re-stat">
            <div class="re-stat__label">${t("house_min_down")}</div>
            <div class="re-stat__value">${fmtMoney(m.minDown)}</div>
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

function renderHouseEdit() {
  const a = houseCurrent;
  const m = houseCalculateMetrics(a);

  // Verdicts couleur
  const dpClass = m.dpOk ? "var(--status-green)" : "var(--status-red)";
  const ratioColor = m.assessmentVerdict === "under" ? "var(--status-green)"
                  : m.assessmentVerdict === "fair" ? "var(--status-green)"
                  : m.assessmentVerdict === "high" ? "var(--status-orange, #f59e0b)"
                  : m.assessmentVerdict === "overpriced" ? "var(--status-red)"
                  : "var(--text2)";

  return `<div class="serene-page re-page">
    <div class="serene-hero-header">
      <div>
        <button class="btn-link" onclick="houseBackToList()">${t("house_back")}</button>
        <h1 class="serene-hero-h1" style="margin:4px 0 0">${a.id ? (esc(a.name) || t("house_add")) : t("house_add")}</h1>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-secondary" onclick="openCentrisImportModal('house')">${icon("download", 14)} ${t("re_import_centris")}</button>
        ${a.id ? `<button class="btn re-btn-danger" onclick="houseDelete('${a.id}')">${icon("trash", 14)} ${t("house_delete")}</button>` : ``}
        <button class="btn btn-primary" onclick="houseSave()">${icon("check", 14)} ${t("house_save")}</button>
      </div>
    </div>

    <div class="re-grid">
      <div class="re-form">

        <section class="re-block re-block--property">
          <h3 class="re-block__title">${icon("home", 16)} <span>${t("re_section_property")}</span></h3>
          <div class="re-fields">
            <label class="re-field re-field--wide">
              <span>${t("house_field_name")}</span>
              <input type="text" placeholder="${t("house_field_name_hint")}" value="${esc(a.name || "")}" oninput="houseCurrent.name=this.value">
            </label>
            <label class="re-field re-field--wide">
              <span>${t("re_field_address")}</span>
              <input type="text" value="${esc(a.address || "")}" oninput="houseCurrent.address=this.value">
            </label>
            <label class="re-field">
              <span>${t("house_field_year_built")}</span>
              <input type="number" inputmode="numeric" min="1700" max="${new Date().getFullYear() + 2}" value="${a.yearBuilt || ""}" oninput="houseCurrent.yearBuilt=Number(this.value)||null;houseRefresh()">
            </label>
            <label class="re-field">
              <span>${t("house_field_living_area")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="numeric" min="0" value="${a.livingAreaSqft || ""}" oninput="houseCurrent.livingAreaSqft=Number(this.value)||null;houseRefresh()">
                <span class="re-input-suffix__symbol">pi²</span>
              </div>
            </label>
            <label class="re-field">
              <span>${t("house_field_bedrooms")}</span>
              <input type="number" inputmode="numeric" min="0" max="20" value="${a.bedrooms ?? ""}" oninput="houseCurrent.bedrooms=Number(this.value)||null">
            </label>
            <label class="re-field">
              <span>${t("house_field_bathrooms")}</span>
              <input type="number" inputmode="numeric" min="0" max="20" value="${a.bathrooms ?? ""}" oninput="houseCurrent.bathrooms=Number(this.value)||null">
            </label>
            <label class="re-field">
              <span>${t("house_field_powder_rooms")}</span>
              <input type="number" inputmode="numeric" min="0" max="20" value="${a.powderRooms ?? ""}" oninput="houseCurrent.powderRooms=Number(this.value)||null">
            </label>
          </div>
        </section>

        <section class="re-block re-block--mortgage">
          <h3 class="re-block__title">${icon("dollar-sign", 16)} <span>${t("re_section_mortgage")}</span></h3>
          <div class="re-fields">
            <label class="re-field">
              <span>${t("re_field_price")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.purchasePrice || ""}" oninput="houseCurrent.purchasePrice=Math.max(0,Number(this.value)||0);houseRefresh()">
              </div>
            </label>
            <label class="re-field">
              <span>${t("house_field_mun_assessment")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.municipalAssessment || ""}" oninput="houseCurrent.municipalAssessment=Math.max(0,Number(this.value)||0);houseRefresh()">
              </div>
              <small class="re-hint">${t("house_field_mun_assessment_hint")}</small>
            </label>
            <div class="re-field">
              <div class="re-field__head">
                <span>${t("re_field_downpayment")}</span>
                <div class="re-toggle" role="tablist">
                  <button type="button" class="re-toggle__btn ${a.downPaymentMode !== "percent" ? "is-active" : ""}" onclick="houseSetDpMode('amount')">$</button>
                  <button type="button" class="re-toggle__btn ${a.downPaymentMode === "percent" ? "is-active" : ""}" onclick="houseSetDpMode('percent')">%</button>
                </div>
              </div>
              ${a.downPaymentMode === "percent" ? `
                <div class="re-input-suffix">
                  <input type="number" inputmode="decimal" min="0" max="100" step="any" value="${a.downPaymentPercent ?? ""}" oninput="houseCurrent.downPaymentPercent=Math.min(100,Math.max(0,Number(this.value)||0));houseRefresh()">
                  <span class="re-input-suffix__symbol">%</span>
                </div>
              ` : `
                <div class="re-input-suffix">
                  <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                  <input type="number" inputmode="numeric" min="0" step="any" value="${a.downPayment ?? ""}" oninput="houseCurrent.downPayment=Math.max(0,Number(this.value)||0);houseRefresh()">
                </div>
              `}
              <small class="re-hint" style="color:${dpClass}">
                ${m.dpOk
                  ? t("house_dp_ok").replace("{min}", fmtMoney(m.minDown))
                  : t("house_dp_short").replace("{short}", fmtMoney(m.dpShortfall)).replace("{min}", fmtMoney(m.minDown))}
              </small>
            </div>
            <label class="re-field">
              <span>${t("re_field_amort")}</span>
              <input type="number" inputmode="numeric" min="1" max="40" step="1" value="${a.amortYears || ""}" oninput="houseCurrent.amortYears=Math.min(40,Math.max(1,Number(this.value)||0));houseRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_rate")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="0" max="25" step="any" value="${a.interestRate || ""}" oninput="houseCurrent.interestRate=Math.min(25,Math.max(0,Number(this.value)||0));houseRefresh()">
                <span class="re-input-suffix__symbol">%</span>
              </div>
            </label>
          </div>
        </section>

        <section class="re-block re-block--charges">
          <h3 class="re-block__title">${icon("receipt", 16)} <span>${t("re_section_charges")}</span></h3>
          <div class="re-fields">
            <label class="re-field">
              <span>${t("re_field_municipal_tax")}</span>
              <input type="number" inputmode="numeric" min="0" step="any" value="${a.municipalTax || ""}" oninput="houseCurrent.municipalTax=Math.max(0,Number(this.value)||0);houseRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_school_tax")}</span>
              <input type="number" inputmode="numeric" min="0" step="any" value="${a.schoolTax || ""}" oninput="houseCurrent.schoolTax=Math.max(0,Number(this.value)||0);houseRefresh()">
            </label>
            <label class="re-field">
              <span>${t("re_field_insurance")}</span>
              <input type="number" inputmode="numeric" min="0" step="any" value="${a.insurance || ""}" oninput="houseCurrent.insurance=Math.max(0,Number(this.value)||0);houseRefresh()">
            </label>
            <label class="re-field">
              <span>${t("house_field_heating")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.heating ?? ""}" oninput="houseCurrent.heating=Math.max(0,Number(this.value)||0);houseRefresh()">
                <span class="re-input-suffix__symbol">/mois</span>
              </div>
            </label>
            <label class="re-field">
              <span>${t("re_field_electricity")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.electricity ?? ""}" oninput="houseCurrent.electricity=Math.max(0,Number(this.value)||0);houseRefresh()">
                <span class="re-input-suffix__symbol">/mois</span>
              </div>
            </label>
            <label class="re-field">
              <span>${t("house_field_condo_fees")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.condoFees ?? ""}" oninput="houseCurrent.condoFees=Math.max(0,Number(this.value)||0);houseRefresh()">
                <span class="re-input-suffix__symbol">/mois</span>
              </div>
              <small class="re-hint">${t("house_field_condo_fees_hint")}</small>
            </label>
            <label class="re-field re-field--wide">
              <span>${t("house_field_maintenance")}</span>
              <div class="re-input-suffix">
                <input type="number" inputmode="decimal" min="0" max="10" step="any" value="${a.maintenancePercentOfPrice ?? ""}" oninput="houseCurrent.maintenancePercentOfPrice=Math.min(10,Math.max(0,Number(this.value)||0));houseRefresh()">
                <span class="re-input-suffix__symbol">% du prix /an</span>
              </div>
              <small class="re-hint">${t("house_field_maintenance_hint")}</small>
            </label>
          </div>
        </section>

        <section class="re-block re-block--closing">
          <h3 class="re-block__title">${icon("shield-check", 16)} <span>${t("re_section_closing")}</span></h3>
          <div class="re-fields">
            <label class="re-field re-field--wide">
              <span style="display:flex;align-items:center;gap:8px">
                <input type="checkbox" ${a.welcomeTaxAuto !== false ? "checked" : ""} onchange="houseCurrent.welcomeTaxAuto=this.checked;houseRefresh()">
                ${t("re_field_auto_calc")} — ${t("re_field_welcome_tax")}
              </span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.welcomeTaxAuto !== false ? Math.round(m.welcomeTax) : (a.welcomeTax || "")}" ${a.welcomeTaxAuto !== false ? "disabled" : ""} oninput="houseCurrent.welcomeTax=Math.max(0,Number(this.value)||0);houseRefresh()">
              </div>
            </label>
            <label class="re-field">
              <span>${t("re_field_notary")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.notaryFees ?? ""}" oninput="houseCurrent.notaryFees=Math.max(0,Number(this.value)||0);houseRefresh()">
              </div>
            </label>
            <label class="re-field">
              <span>${t("re_field_inspection")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.inspectionFees ?? ""}" oninput="houseCurrent.inspectionFees=Math.max(0,Number(this.value)||0);houseRefresh()">
              </div>
            </label>
            <label class="re-field re-field--wide">
              <span>${t("re_field_other_closing")}</span>
              <div class="re-input-suffix">
                <span class="re-input-suffix__symbol re-input-suffix__symbol--left">$</span>
                <input type="number" inputmode="numeric" min="0" step="any" value="${a.otherClosingFees ?? ""}" oninput="houseCurrent.otherClosingFees=Math.max(0,Number(this.value)||0);houseRefresh()">
              </div>
              <small class="re-hint">${t("re_field_other_closing_hint")}</small>
            </label>
          </div>
        </section>

        <section class="re-block re-block--notes">
          <h3 class="re-block__title">${icon("pencil", 16)} <span>${t("re_notes")}</span></h3>
          <textarea class="re-textarea" rows="3" oninput="houseCurrent.notes=this.value">${esc(a.notes || "")}</textarea>
          ${a.centrisUrl ? `<small class="re-hint" style="margin-top:8px;display:block">Centris: <a href="${escAttr(a.centrisUrl)}" target="_blank" rel="noopener" style="color:var(--accent)">${esc(a.centrisUrl)}</a></small>` : ""}
        </section>
      </div>

      <aside class="re-results" id="house-results">
        ${renderHouseResults(a, m)}
      </aside>
    </div>
  </div>`;
}

// ── Panneau résultats ─────────────────────────────────────────────────
function renderHouseResults(a, m) {
  m = m || houseCalculateMetrics(a);
  const price = Number(a.purchasePrice) || 0;

  // Ratio prix / évaluation
  let ratioRow = "";
  if (m.priceToAssessment != null) {
    const pct = (m.priceToAssessment * 100).toFixed(0);
    const verdictColor = m.assessmentVerdict === "under" || m.assessmentVerdict === "fair" ? "var(--status-green)"
                       : m.assessmentVerdict === "high" ? "var(--status-orange, #f59e0b)"
                       : "var(--status-red)";
    const diff = price - Number(a.municipalAssessment);
    const diffStr = (diff >= 0 ? "+" : "") + fmtMoney(diff);
    ratioRow = `
      <div class="re-metric">
        <div class="re-metric__label">${t("house_metric_ratio")}</div>
        <div class="re-metric__value" style="color:${verdictColor}">${pct}%</div>
        <div class="re-metric__sub">${diffStr} ${t("house_metric_ratio_vs_eval")}</div>
      </div>
    `;
  }

  return `
    <div class="re-results__head">
      <h3>${t("re_section_results")}</h3>
    </div>

    <div class="re-metric re-metric--key">
      <div class="re-metric__label">${t("house_total_monthly")}</div>
      <div class="re-metric__value">${fmtMoney(m.totalMonthly)}<span class="re-metric__suffix">/mois</span></div>
      <div class="re-metric__sub">${fmtMoney(m.totalMonthly * 12)}/an</div>
    </div>

    <div class="re-metric">
      <div class="re-metric__label">${t("house_mortgage_pmt")}</div>
      <div class="re-metric__value">${fmtMoney(m.monthlyPmt)}</div>
      <div class="re-metric__sub">${t("house_mortgage_principal")}: ${fmtMoney(m.principal)}${m.schl > 0 ? ` (${t("house_mortgage_with_schl")} ${fmtMoney(m.schl)})` : ""}</div>
    </div>

    <div class="re-metric">
      <div class="re-metric__label">${t("house_min_down")}</div>
      <div class="re-metric__value">${fmtMoney(m.minDown)}</div>
      <div class="re-metric__sub" style="color:${m.dpOk ? "var(--status-green)" : "var(--status-red)"}">
        ${m.dpOk ? t("house_dp_status_ok") : t("house_dp_status_short").replace("{n}", fmtMoney(m.dpShortfall))}
      </div>
    </div>

    ${ratioRow}

    <div class="re-metric">
      <div class="re-metric__label">${t("re_metric_cash_to_close")}</div>
      <div class="re-metric__value">${fmtMoney(m.cashToClose)}</div>
      <div class="re-metric__sub">${t("house_cash_breakdown")}</div>
    </div>

    <details class="re-cashflow-detail" style="margin-top:12px">
      <summary>${t("house_breakdown_summary")}</summary>
      <div class="re-cf-table re-cf-table--three">
        <div class="re-cf-row re-cf-row--head"><span></span><span class="re-cf-col-h">/ an</span><span class="re-cf-col-h">/ mois</span></div>
        <div class="re-cf-row"><span>${t("house_mortgage_pmt")}</span><span class="re-cf-col-a">${fmtMoney(m.monthlyPmt * 12)}</span><span class="re-cf-col-m">${fmtMoney(m.monthlyPmt)}</span></div>
        <div class="re-cf-row"><span>${t("re_field_municipal_tax")}</span><span class="re-cf-col-a">${fmtMoney(Number(a.municipalTax)||0)}</span><span class="re-cf-col-m">${fmtMoney(m.munTaxM)}</span></div>
        <div class="re-cf-row"><span>${t("re_field_school_tax")}</span><span class="re-cf-col-a">${fmtMoney(Number(a.schoolTax)||0)}</span><span class="re-cf-col-m">${fmtMoney(m.schoolTaxM)}</span></div>
        <div class="re-cf-row"><span>${t("re_field_insurance")}</span><span class="re-cf-col-a">${fmtMoney(Number(a.insurance)||0)}</span><span class="re-cf-col-m">${fmtMoney(m.insuranceM)}</span></div>
        <div class="re-cf-row"><span>${t("house_field_heating")}</span><span class="re-cf-col-a">${fmtMoney(m.heatingM * 12)}</span><span class="re-cf-col-m">${fmtMoney(m.heatingM)}</span></div>
        <div class="re-cf-row"><span>${t("re_field_electricity")}</span><span class="re-cf-col-a">${fmtMoney(m.electricityM * 12)}</span><span class="re-cf-col-m">${fmtMoney(m.electricityM)}</span></div>
        ${m.condoM > 0 ? `<div class="re-cf-row"><span>${t("house_field_condo_fees")}</span><span class="re-cf-col-a">${fmtMoney(m.condoM * 12)}</span><span class="re-cf-col-m">${fmtMoney(m.condoM)}</span></div>` : ""}
        <div class="re-cf-row"><span>${t("house_field_maintenance")} <small style="color:var(--text3)">(${(a.maintenancePercentOfPrice||0)}%)</small></span><span class="re-cf-col-a">${fmtMoney(m.maintM * 12)}</span><span class="re-cf-col-m">${fmtMoney(m.maintM)}</span></div>
        <div class="re-cf-row re-cf-row--total"><span>${t("house_total_monthly")}</span><span class="re-cf-col-a">${fmtMoney(m.totalMonthly * 12)}</span><span class="re-cf-col-m">${fmtMoney(m.totalMonthly)}</span></div>
      </div>
    </details>
  `;
}

// ── Handlers ──────────────────────────────────────────────────────────
function houseNew() {
  houseCurrent = houseNewAnalysis();
  houseMode = "edit";
  renderPage();
}
function houseEdit(id) {
  const a = houseAnalyses.find(x => x.id === id);
  if (!a) return;
  houseCurrent = JSON.parse(JSON.stringify(a));
  // Applique les défauts pour les nouveaux champs
  const defaults = houseNewAnalysis();
  for (const key of Object.keys(defaults)) {
    if (houseCurrent[key] === undefined || houseCurrent[key] === null) {
      houseCurrent[key] = defaults[key];
    }
  }
  houseMode = "edit";
  renderPage();
}
function houseBackToList() {
  houseCurrent = null;
  houseMode = "list";
  renderPage();
}
function houseRefresh() {
  const panel = document.getElementById("house-results");
  if (panel && houseCurrent) panel.innerHTML = renderHouseResults(houseCurrent);
}
function houseSetDpMode(mode) {
  if (!houseCurrent) return;
  const price = Number(houseCurrent.purchasePrice) || 0;
  if (mode === "percent" && houseCurrent.downPaymentMode !== "percent") {
    if (price > 0) houseCurrent.downPaymentPercent = +(((Number(houseCurrent.downPayment) || 0) / price) * 100).toFixed(2);
  } else if (mode === "amount" && houseCurrent.downPaymentMode === "percent") {
    if (price > 0) houseCurrent.downPayment = Math.round((price * (Number(houseCurrent.downPaymentPercent) || 0)) / 100);
  }
  houseCurrent.downPaymentMode = mode;
  renderPage();
}
async function houseSave() {
  if (!houseCurrent) return;
  if (!houseCurrent.name || !houseCurrent.name.trim()) {
    alert(t("house_need_name"));
    return;
  }
  const now = Date.now();
  const payload = { ...houseCurrent, updatedAt: now };
  if (!payload.createdAt) payload.createdAt = now;
  if (!payload.userId) payload.userId = currentUserId;
  if (houseCurrent.id) {
    const id = houseCurrent.id;
    delete payload.id;
    await db.collection("houseAnalyses").doc(id).set(payload, { merge: true });
  } else {
    delete payload.id;
    const ref = await db.collection("houseAnalyses").add(payload);
    houseCurrent.id = ref.id;
  }
  if (typeof reShowSaveToast === "function") reShowSaveToast();
  renderPage();
}
async function houseDelete(id) {
  if (!id) return;
  if (!confirm(t("house_confirm_delete"))) return;
  await db.collection("houseAnalyses").doc(id).delete();
  houseBackToList();
}
