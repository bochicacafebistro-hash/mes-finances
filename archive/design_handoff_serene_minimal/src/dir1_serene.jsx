// Direction 1 — Serene Minimal
// Paper-like, editorial serif display, muted sage/olive accent.
// Generous whitespace. Quiet confidence.

const sereneStyles = {
  page: {
    background: "var(--s-bg, #f3efe7)",
    color: "var(--s-ink, #1a1915)",
    fontFamily: "var(--s-body, 'Inter', system-ui, sans-serif)",
    fontSize: "var(--body, 15.5px)",
    lineHeight: 1.55,
    minHeight: "100vh",
  },
};

const SereneShell = ({ children, view }) => (
  <div style={sereneStyles.page} className="serene">
    <header style={{
      display: "flex", alignItems: "baseline", justifyContent: "space-between",
      padding: "28px var(--pad) 20px",
      borderBottom: "1px solid rgba(26,25,21,0.08)",
    }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
        <div style={{ fontFamily: "var(--s-display, 'Instrument Serif', serif)", fontSize: 26, letterSpacing: "-0.01em" }}>
          Mes Finan<em style={{ color: "var(--s-accent, #6b7a4a)" }}>ces</em>
        </div>
        <nav style={{ display: "flex", gap: 22, fontSize: 13, color: "#6b6a64" }}>
          {["Tableau de bord","Transactions","Budget","Abonnements","Catégories"].map((l,i) => (
            <span key={l} style={{ color: i===0 ? "var(--s-ink)" : "#6b6a64", borderBottom: i===0 ? "1px solid var(--s-ink)" : "none", paddingBottom: 2 }}>{l}</span>
          ))}
        </nav>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 12.5, color: "#6b6a64" }}>
        <span>Avril 2026</span>
        <div style={{ width: 30, height: 30, borderRadius: 100, background: "var(--s-accent, #6b7a4a)", color: "#fff", display: "grid", placeItems: "center", fontFamily: "var(--s-display, 'Instrument Serif', serif)", fontSize: 14 }}>S</div>
      </div>
    </header>
    {children}
  </div>
);

// ——— LANDING ———
const SereneLanding = () => (
  <SereneShell view="home">
    <section style={{ padding: "100px var(--pad) 120px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--s-mono, 'JetBrains Mono', monospace)", fontSize: 11, letterSpacing: "0.18em", color: "#6b6a64", marginBottom: 32 }}>
        GESTION · ÉPARGNE · CLARTÉ — DEPUIS 2024
      </div>
      <h1 style={{
        fontFamily: "var(--s-display, 'Instrument Serif', serif)",
        fontSize: "var(--h1, clamp(48px, 7vw, 108px))",
        lineHeight: 0.98, letterSpacing: "-0.025em",
        margin: "0 0 28px", fontWeight: 400,
        maxWidth: "14ch",
      }}>
        Des finances <em style={{ color: "var(--s-accent, #6b7a4a)" }}>sereines</em>,<br/>
        sans tableur.
      </h1>
      <p style={{ maxWidth: 540, fontSize: 17, lineHeight: 1.55, color: "#44433e", margin: "0 0 44px" }}>
        Un gestionnaire de budget pensé pour les québécois qui veulent comprendre où va chaque dollar — sans devenir comptable. Importez vos relevés, on s'occupe du reste.
      </p>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <button style={{
          background: "var(--s-ink, #1a1915)", color: "var(--s-bg, #f3efe7)",
          border: 0, padding: "14px 22px", borderRadius: 100,
          fontFamily: "inherit", fontSize: 14, cursor: "pointer",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          Commencer gratuitement <Icon name="arrow" size={14} stroke="currentColor" />
        </button>
        <button style={{ background: "transparent", border: 0, fontFamily: "inherit", fontSize: 14, color: "#44433e", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}>
          Voir une démo →
        </button>
      </div>

      {/* floating product fragment */}
      <div style={{ marginTop: 80, display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "var(--gap)", alignItems: "start" }}>
        <div style={{
          background: "#fbf8f2",
          border: "1px solid rgba(26,25,21,0.08)",
          borderRadius: 18,
          padding: "var(--card-p)",
          boxShadow: "0 40px 80px -40px rgba(26,25,21,0.18)",
        }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ fontFamily: "var(--s-display)", fontSize: 22 }}>Solde total</div>
            <div style={{ fontSize: 11, color: "#6b6a64", fontFamily: "var(--s-mono)", letterSpacing: "0.1em" }}>TOUS COMPTES</div>
          </div>
          <div style={{ fontFamily: "var(--s-display)", fontSize: "clamp(48px, 6vw, 86px)", lineHeight: 1, letterSpacing: "-0.02em" }}>
            {money(DATA.totals.balance).replace(" $","")}<span style={{ color: "var(--s-accent)", fontSize: "0.4em", verticalAlign: "top", marginLeft: 8 }}>$ CAD</span>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(26,25,21,0.08)" }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#6b6a64", textTransform: "uppercase", marginBottom: 4 }}>Revenus avril</div>
              <div style={{ fontFamily: "var(--s-display)", fontSize: 24 }}>{money(DATA.totals.income)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#6b6a64", textTransform: "uppercase", marginBottom: 4 }}>Dépenses</div>
              <div style={{ fontFamily: "var(--s-display)", fontSize: 24 }}>{money(DATA.totals.expenses)}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#6b6a64", textTransform: "uppercase", marginBottom: 4 }}>Taux d'épargne</div>
              <div style={{ fontFamily: "var(--s-display)", fontSize: 24, color: "var(--s-accent)" }}>{pct(DATA.totals.savingsRate)}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 0" }}>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.18em", color: "#6b6a64", marginBottom: 14 }}>
            ¶ CE MOIS-CI
          </div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid rgba(26,25,21,0.1)" }}>
            {DATA.categories.slice(0,5).map(c => {
              const p = Math.min(1, c.spent / c.limit);
              return (
                <li key={c.id} style={{ padding: "14px 0", borderBottom: "1px solid rgba(26,25,21,0.08)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon name={categoryIconName(c.id)} size={14} stroke="#44433e" />
                      <span style={{ fontFamily: "var(--s-display)", fontSize: 17 }}>{c.label}</span>
                    </div>
                    <span style={{ fontFamily: "var(--s-mono)", fontSize: 12, color: "#44433e" }}>
                      {money(c.spent)} <span style={{ color: "#6b6a64" }}>/ {money(c.limit).replace(",00","")}</span>
                    </span>
                  </div>
                  <div style={{ height: 2, background: "rgba(26,25,21,0.08)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ width: `${p*100}%`, height: "100%", background: p > 0.95 ? "#a04a34" : "var(--s-accent, #6b7a4a)" }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>

    {/* quiet feature section */}
    <section style={{ padding: "80px var(--pad) 120px", borderTop: "1px solid rgba(26,25,21,0.08)", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 64 }}>
        <div>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.18em", color: "#6b6a64", marginBottom: 12 }}>§ 01 — MÉTHODE</div>
          <h2 style={{ fontFamily: "var(--s-display)", fontSize: "clamp(32px,4vw,56px)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: 0, fontWeight: 400 }}>
            Tout part d'une idée simple : savoir où ton argent va, vraiment.
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, paddingTop: 8 }}>
          {[
            ["Import automatique","Relevés Desjardins, Tangerine, BMO — en PDF ou CSV. On détecte. On catégorise."],
            ["Abonnements détectés","Netflix, Spotify, le resto que tu fréquentes chaque semaine — tout est repéré."],
            ["Budgets vivants","Des limites par catégorie qui s'adaptent à ton rythme réel, pas à un idéal."],
            ["100 % privé","Rien ne quitte ton appareil sauf si tu le veux. Chiffrement bout-en-bout."],
          ].map(([t,d]) => (
            <div key={t}>
              <div style={{ fontFamily: "var(--s-display)", fontSize: 20, marginBottom: 6 }}>{t}</div>
              <p style={{ margin: 0, color: "#44433e", fontSize: 14.5 }}>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </SereneShell>
);

// ——— FEATURE (Abonnements) ———
const SereneFeature = () => (
  <SereneShell view="feature">
    <section style={{ padding: "48px var(--pad) 80px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.18em", color: "#6b6a64", marginBottom: 10 }}>
        § FONCTION — ABONNEMENTS
      </div>
      <h1 style={{ fontFamily: "var(--s-display)", fontSize: "clamp(40px,5vw,80px)", lineHeight: 1, letterSpacing: "-0.02em", margin: "0 0 16px", fontWeight: 400 }}>
        Les paiements qui se glissent,<br/>
        <em style={{ color: "var(--s-accent)" }}>repérés.</em>
      </h1>
      <p style={{ maxWidth: 560, fontSize: 16, color: "#44433e", margin: "0 0 48px" }}>
        On regarde vos transactions des 6 derniers mois et on identifie ce qui revient. Vous voyez tout, vous annulez ce qui ne sert plus.
      </p>

      <div style={{
        background: "#fbf8f2", border: "1px solid rgba(26,25,21,0.08)", borderRadius: 18,
        padding: "var(--card-p)", marginBottom: 24,
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 32, alignItems: "end" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#6b6a64", textTransform: "uppercase", marginBottom: 6 }}>Coût mensuel estimé</div>
            <div style={{ fontFamily: "var(--s-display)", fontSize: "clamp(40px,5vw,72px)", lineHeight: 1, letterSpacing: "-0.02em" }}>
              1&nbsp;020<span style={{ fontSize: "0.45em", color: "#6b6a64" }}>,75 $</span>
            </div>
            <div style={{ fontSize: 12, color: "#6b6a64", marginTop: 6 }}>/ mois · 12 249 $ / an</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#6b6a64", textTransform: "uppercase", marginBottom: 6 }}>Confirmés</div>
            <div style={{ fontFamily: "var(--s-display)", fontSize: 40 }}>7</div>
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#6b6a64", textTransform: "uppercase", marginBottom: 6 }}>À vérifier</div>
            <div style={{ fontFamily: "var(--s-display)", fontSize: 40, color: "var(--s-accent)" }}>3</div>
          </div>
        </div>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, borderTop: "1px solid rgba(26,25,21,0.1)" }}>
        {DATA.subscriptions.map((s,i) => (
          <li key={i} style={{
            display: "grid",
            gridTemplateColumns: "44px 1fr 140px 120px 40px",
            gap: 18, alignItems: "center",
            padding: "20px 0", borderBottom: "1px solid rgba(26,25,21,0.08)",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 100, background: "rgba(107,122,74,0.1)", color: "var(--s-accent)", display: "grid", placeItems: "center" }}>
              <Icon name={categoryIconName(s.cat)} size={16} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--s-display)", fontSize: 18, marginBottom: 2 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: "#6b6a64" }}>Mensuel · dernier prélèvement {s.last}</div>
            </div>
            <div style={{ fontFamily: "var(--s-mono)", fontSize: 13, color: "#6b6a64" }}>{DATA.categories.find(c=>c.id===s.cat)?.label}</div>
            <div style={{ fontFamily: "var(--s-display)", fontSize: 22, textAlign: "right" }}>{money(s.amount)}</div>
            <button style={{ background: "transparent", border: 0, color: "#6b6a64", cursor: "pointer", justifySelf: "end" }} aria-label="actions">
              <Icon name="arrow" size={16} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  </SereneShell>
);

// ——— DASHBOARD ———
const SereneDashboard = () => (
  <SereneShell view="dashboard">
    <section style={{ padding: "40px var(--pad)", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "end", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: "var(--s-mono)", fontSize: 11, letterSpacing: "0.18em", color: "#6b6a64", marginBottom: 8 }}>
            BONJOUR, SAMIA — {DATA.month.toUpperCase()}
          </div>
          <h1 style={{ fontFamily: "var(--s-display)", fontSize: "clamp(36px,4vw,64px)", lineHeight: 1, letterSpacing: "-0.02em", margin: 0, fontWeight: 400 }}>
            Tu es <em style={{ color: "var(--s-accent)" }}>à 62 $ près</em> d'équilibrer<br/>le mois.
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Jour","Semaine","Mois","Année"].map((l,i) => (
            <button key={l} style={{
              padding: "8px 14px", borderRadius: 100,
              border: "1px solid rgba(26,25,21,0.14)",
              background: i===2 ? "var(--s-ink)" : "transparent",
              color: i===2 ? "var(--s-bg)" : "var(--s-ink)",
              fontFamily: "inherit", fontSize: 13, cursor: "pointer",
            }}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        {[
          { label: "Solde total", val: money(DATA.totals.balance), hint: "4 comptes · +2,4 % vs mars" },
          { label: "Revenus", val: money(DATA.totals.income), hint: "2 dépôts confirmés" },
          { label: "Dépenses", val: money(DATA.totals.expenses), hint: "128 transactions" },
          { label: "Épargne", val: pct(DATA.totals.savingsRate), hint: "objectif 25 %", accent: true },
        ].map((k,i) => (
          <div key={i} style={{
            background: "#fbf8f2", border: "1px solid rgba(26,25,21,0.08)", borderRadius: 16,
            padding: "var(--card-p)",
          }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#6b6a64", textTransform: "uppercase", marginBottom: 12 }}>{k.label}</div>
            <div style={{ fontFamily: "var(--s-display)", fontSize: "clamp(32px,3vw,48px)", lineHeight: 1, letterSpacing: "-0.02em", color: k.accent ? "var(--s-accent)" : "var(--s-ink)" }}>
              {k.val}
            </div>
            <div style={{ fontSize: 12, color: "#6b6a64", marginTop: 10 }}>{k.hint}</div>
          </div>
        ))}
      </div>

      {/* main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--gap)" }}>
        {/* flow chart */}
        <div style={{ background: "#fbf8f2", border: "1px solid rgba(26,25,21,0.08)", borderRadius: 16, padding: "var(--card-p)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 28 }}>
            <div style={{ fontFamily: "var(--s-display)", fontSize: 22 }}>Flux sur 30 jours</div>
            <div style={{ fontSize: 12, color: "#6b6a64", fontFamily: "var(--s-mono)", letterSpacing: "0.1em" }}>REVENUS — DÉPENSES</div>
          </div>
          <SerenePulseChart />
          <div style={{ display: "flex", gap: 24, marginTop: 20, fontSize: 12, color: "#6b6a64" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 100, background: "var(--s-accent, #6b7a4a)" }}/>
              Revenus
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 100, background: "#a04a34" }}/>
              Dépenses
            </div>
          </div>
        </div>

        {/* categories */}
        <div style={{ background: "#fbf8f2", border: "1px solid rgba(26,25,21,0.08)", borderRadius: 16, padding: "var(--card-p)" }}>
          <div style={{ fontFamily: "var(--s-display)", fontSize: 22, marginBottom: 20 }}>Budgets du mois</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {DATA.categories.slice(0,6).map(c => {
              const p = Math.min(1.15, c.spent / c.limit);
              const over = p > 1;
              return (
                <li key={c.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14 }}>
                      <Icon name={categoryIconName(c.id)} size={13} stroke="#44433e" />
                      {c.label}
                    </div>
                    <span style={{ fontFamily: "var(--s-mono)", fontSize: 12, color: over ? "#a04a34" : "#44433e" }}>
                      {money(c.spent)} <span style={{ color: "#6b6a64" }}>/ {money(c.limit).replace(",00","")}</span>
                    </span>
                  </div>
                  <div style={{ height: 4, background: "rgba(26,25,21,0.06)", borderRadius: 100, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(100,p*100)}%`, height: "100%", background: over ? "#a04a34" : "var(--s-accent, #6b7a4a)", transition: "width .6s ease" }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* transactions */}
      <div style={{ background: "#fbf8f2", border: "1px solid rgba(26,25,21,0.08)", borderRadius: 16, padding: "var(--card-p)", marginTop: "var(--gap)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <div style={{ fontFamily: "var(--s-display)", fontSize: 22 }}>Dernières transactions</div>
          <button style={{ background: "transparent", border: 0, color: "#44433e", fontFamily: "inherit", fontSize: 13, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 4 }}>
            Tout voir →
          </button>
        </div>
        {DATA.transactions.map((g) => (
          <div key={g.day} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: "#6b6a64", textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: "var(--s-mono)", marginBottom: 8 }}>{g.day}</div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {g.items.map((t,i) => (
                <li key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 120px 140px",
                  padding: "12px 0", borderTop: "1px solid rgba(26,25,21,0.06)",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontSize: 14, marginBottom: 2 }}>{t.label}</div>
                    <div style={{ fontSize: 11.5, color: "#6b6a64" }}>
                      {t.cat ? DATA.categories.find(c=>c.id===t.cat)?.label : "Revenu"} · {t.acct}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "#6b6a64", fontFamily: "var(--s-mono)" }}>{t.acct}</div>
                  <div style={{ textAlign: "right", fontFamily: "var(--s-display)", fontSize: 18, color: t.income ? "var(--s-accent)" : "var(--s-ink)" }}>
                    {money(t.amount, { showPlus: t.income })}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  </SereneShell>
);

const SerenePulseChart = () => {
  // Simulate 30 days of income/expense flows using a lissajous-ish pattern
  const days = 30;
  const incomePts = [];
  const expensePts = [];
  for (let i=0; i<days; i++) {
    const t = i/(days-1);
    const inc = 10 + (i===5 || i===20 ? 80 : 0) + Math.sin(t*Math.PI*3)*6;
    const exp = 28 + Math.sin(t*Math.PI*5+1)*12 + (i===12 ? 42 : 0) + (i===27 ? 30 : 0);
    incomePts.push(inc);
    expensePts.push(exp);
  }
  const w = 620, h = 180, pad = 8;
  const max = 120;
  const toPath = (pts) => pts.map((v,i) => {
    const x = pad + (i/(days-1))*(w-pad*2);
    const y = h - pad - (v/max)*(h-pad*2);
    return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const areaPath = (pts) => {
    const base = h - pad;
    const p = pts.map((v,i) => {
      const x = pad + (i/(days-1))*(w-pad*2);
      const y = h - pad - (v/max)*(h-pad*2);
      return `${i===0?"M":"L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return `${p} L${w-pad},${base} L${pad},${base} Z`;
  };
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id="incg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--s-accent, #6b7a4a)" stopOpacity="0.18"/>
          <stop offset="1" stopColor="var(--s-accent, #6b7a4a)" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="expg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a04a34" stopOpacity="0.14"/>
          <stop offset="1" stopColor="#a04a34" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={areaPath(incomePts)} fill="url(#incg)" />
      <path d={areaPath(expensePts)} fill="url(#expg)" />
      <path d={toPath(incomePts)} fill="none" stroke="var(--s-accent, #6b7a4a)" strokeWidth="1.6" />
      <path d={toPath(expensePts)} fill="none" stroke="#a04a34" strokeWidth="1.6" />
    </svg>
  );
};

window.Serene = { SereneLanding, SereneFeature, SereneDashboard };
