// Shared data + helpers for all 4 directions

const DATA = {
  user: "Samia",
  month: "Avril 2026",
  totals: {
    balance: 21762.96,
    income: 2881.16,
    expenses: 2943.45,
    net: -62.29,
    savingsRate: 0.18,
  },
  categories: [
    { id: "food", label: "Alimentation", emoji: "🌿", tx: 128, spent: 463.49, limit: 600, hue: 142 },
    { id: "rest", label: "Restaurants", emoji: "🍽", tx: 200, spent: 284.74, limit: 350, hue: 12 },
    { id: "loge", label: "Logement", emoji: "🏠", tx: 6, spent: 1240.00, limit: 1300, hue: 268 },
    { id: "bills", label: "Factures & Abonnements", emoji: "🧾", tx: 83, spent: 415.35, limit: 500, hue: 40 },
    { id: "fun", label: "Loisirs", emoji: "✦", tx: 89, spent: 1078.88, limit: 900, hue: 180 },
    { id: "home", label: "Maison & Bricolage", emoji: "🔧", tx: 88, spent: 212.10, limit: 300, hue: 28 },
    { id: "loans", label: "Prêts", emoji: "↻", tx: 45, spent: 450.00, limit: 450, hue: 220 },
    { id: "gifts", label: "Cadeaux", emoji: "✦", tx: 0, spent: 0, limit: 100, hue: 350 },
  ],
  accounts: [
    { id: "cheque", label: "Compte chèque Desjardins", type: "Chèques", balance: 351.25, delta: 0.02 },
    { id: "visa", label: "Visa Desjardins Odyssée Elite", type: "Carte de crédit", balance: -2552.28, delta: -0.11 },
    { id: "savings", label: "Épargne CELI", type: "Placement", balance: 14200.00, delta: 0.04 },
    { id: "emergency", label: "Coussin d'urgence", type: "Épargne", balance: 9763.99, delta: 0.01 },
  ],
  transactions: [
    { day: "Mer 15 avril", items: [
      { label: "AIRBNB • HMQCWCNTW2", cat: "fun", acct: "Visa", amount: -466.95 },
      { label: "LOTO-QUEBEC 8779995389", cat: "gifts", acct: "Visa", amount: -50.00 },
      { label: "MARCHE CHARLESBOURG 26", cat: "food", acct: "Visa", amount: -45.89 },
    ]},
    { day: "Lun 13 avril", items: [
      { label: "Paiement caisse (Visa)", cat: null, acct: "Chèque", amount: 980.00, income: true },
      { label: "COSTCO WHOLESALE W503", cat: "food", acct: "Visa", amount: -182.59 },
      { label: "BELL CANADA (08) MONTREAL", cat: "bills", acct: "Visa", amount: -88.53 },
    ]},
    { day: "Ven 10 avril", items: [
      { label: "Dépôt direct — Employeur", cat: null, acct: "Chèque", amount: 1824.00, income: true },
      { label: "SAQ SÉLECTION 12876", cat: "rest", acct: "Visa", amount: -62.40 },
    ]},
  ],
  subscriptions: [
    { label: "Virement Interac à / Samia /", cat: "loge", amount: 900.00, per: "mois", last: "27 mars" },
    { label: "VIRGIN PLUS VERDUN QC", cat: "bills", amount: 52.89, per: "mois", last: "14 sept." },
    { label: "ECONOFITNESS BLAINVILLE", cat: "fun", amount: 37.34, per: "mois", last: "13 fév." },
    { label: "AMZN Apps CA amazon.ca", cat: "bills", amount: 10.34, per: "mois", last: "22 août" },
    { label: "Netflix.com TORONTO ON", cat: "bills", amount: 9.19, per: "mois", last: "5 janv." },
    { label: "Spotify P P6QCCR", cat: "bills", amount: 10.99, per: "mois", last: "2 avr." },
  ],
};

const money = (n, opts = {}) => {
  const sign = n < 0 ? "-" : opts.showPlus ? "+" : "";
  const abs = Math.abs(n).toLocaleString("fr-CA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${sign}${abs} $`;
};

const pct = (n) => `${(n * 100).toFixed(0)}%`;

// tiny icon set (line, monochrome) — no emoji
const Icon = ({ name, size = 16, stroke = "currentColor", strokeWidth = 1.6 }) => {
  const paths = {
    dashboard: <><path d="M3 13h7V3H3zM14 21h7V11h-7zM3 21h7v-5H3zM14 8h7V3h-7z"/></>,
    tx: <><path d="M4 7h12M16 7l-3-3M16 7l-3 3M20 17H8M8 17l3-3M8 17l3 3"/></>,
    wallet: <><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 13h2M3 10h18"/></>,
    budget: <><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></>,
    repeat: <><path d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5h5"/></>,
    tag: <><path d="M20.6 12.6 12 21l-9-9V3h9l8.6 9.6z"/><circle cx="7.5" cy="7.5" r="1.5"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    up: <><path d="M6 15l6-6 6 6"/></>,
    down: <><path d="M6 9l6 6 6-6"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    filter: <><path d="M3 5h18M6 12h12M10 19h4"/></>,
    spark: <><path d="M3 17l5-7 4 5 3-4 6 8"/></>,
    dot: <><circle cx="12" cy="12" r="4"/></>,
    close: <><path d="M6 6l12 12M6 18L18 6"/></>,
    leaf: <><path d="M21 3c-9 0-15 6-15 15 0 0 9 0 13-4s2-11 2-11zM6 18l7-7"/></>,
    home: <><path d="M3 11l9-8 9 8v10H3z"/><path d="M9 21v-7h6v7"/></>,
    fork: <><path d="M6 3v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V3M8 13v8M18 3v18M18 13h-3a3 3 0 0 1 0-6h3"/></>,
    gift: <><rect x="3" y="8" width="18" height="4"/><path d="M12 8v13M4 12v9h16v-9M7 8a3 3 0 0 1 0-6c2.5 0 5 6 5 6s-2.5 0-5 0zM17 8a3 3 0 0 0 0-6c-2.5 0-5 6-5 6s2.5 0 5 0z"/></>,
    star: <><path d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 18l-5.9 3 1.2-6.5L2.5 9.9 9.1 9z"/></>,
    tool: <><path d="M14 6l5 5-7 7-5-5zM14 6l3-3 3 3-3 3M7 13l-4 4v4h4l4-4"/></>,
    card: <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
    doc: <><path d="M6 2h9l5 5v15H6zM15 2v5h5"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
};

const categoryIconName = (id) => ({
  food: "leaf", rest: "fork", loge: "home", bills: "doc",
  fun: "star", home: "tool", loans: "repeat", gifts: "gift",
}[id] || "tag");

Object.assign(window, { DATA, money, pct, Icon, categoryIconName });
