// ── Configuration Firebase ──────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDB7-cNiBeXoLEeWRKFXLFYamQsMCeYH4o",
  authDomain: "mes-finances-dfd6b.firebaseapp.com",
  projectId: "mes-finances-dfd6b",
  storageBucket: "mes-finances-dfd6b.firebasestorage.app",
  messagingSenderId: "262422281745",
  appId: "1:262422281745:web:5d1752eefcf6bc4594fbb0"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ── Constantes globales ────────────────────────────
const ADMIN_PIN = "8902"; // PIN de connexion personnel

// Types de comptes par défaut
const ACCOUNT_TYPES = [
  { value: "checking",   label_fr: "Chèques",         label_es: "Cuenta corriente", icon: "wallet" },
  { value: "savings",    label_fr: "Épargne",         label_es: "Ahorros",          icon: "shield-check" },
  { value: "credit",     label_fr: "Carte de crédit", label_es: "Tarjeta de crédito", icon: "receipt" },
  { value: "cash",       label_fr: "Espèces",         label_es: "Efectivo",         icon: "dollar-sign" },
  { value: "investment", label_fr: "Investissement",  label_es: "Inversión",        icon: "trending-up" },
  { value: "other",      label_fr: "Autre",           es: "Otro",                   icon: "folder" }
];

// Catégories par défaut (créées au premier lancement si absentes)
const DEFAULT_EXPENSE_CATEGORIES = [
  { name_fr: "Alimentation",     name_es: "Alimentación",      icon: "utensils",     color: "#27ae60", type: "expense" },
  { name_fr: "Restaurants",      name_es: "Restaurantes",      icon: "utensils",     color: "#e74c3c", type: "expense" },
  { name_fr: "Transport",        name_es: "Transporte",        icon: "package",      color: "#4a90e2", type: "expense" },
  { name_fr: "Logement",         name_es: "Vivienda",          icon: "store",        color: "#8b5cf6", type: "expense" },
  { name_fr: "Factures & Abonnements", name_es: "Facturas y suscripciones", icon: "receipt", color: "#f59e0b", type: "expense" },
  { name_fr: "Santé",            name_es: "Salud",             icon: "shield-check", color: "#ec4899", type: "expense" },
  { name_fr: "Loisirs",          name_es: "Ocio",              icon: "star",         color: "#14b8a6", type: "expense" },
  { name_fr: "Vêtements",        name_es: "Ropa",              icon: "tag",          color: "#6b1a1f", type: "expense" },
  { name_fr: "Cadeaux",          name_es: "Regalos",           icon: "tag",          color: "#f97316", type: "expense" },
  { name_fr: "Autres",           name_es: "Otros",             icon: "folder",       color: "#64748b", type: "expense" }
];

const DEFAULT_INCOME_CATEGORIES = [
  { name_fr: "Salaire",          name_es: "Salario",           icon: "dollar-sign",  color: "#27ae60", type: "income" },
  { name_fr: "Pourboires",       name_es: "Propinas",          icon: "wallet",       color: "#4a90e2", type: "income" },
  { name_fr: "Vente",            name_es: "Venta",             icon: "tag",          color: "#8b5cf6", type: "income" },
  { name_fr: "Remboursement",    name_es: "Reembolso",         icon: "refresh",      color: "#14b8a6", type: "income" },
  { name_fr: "Autres revenus",   name_es: "Otros ingresos",    icon: "folder",       color: "#64748b", type: "income" }
];

const MONTHS_FR = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// Devise par défaut
const DEFAULT_CURRENCY = "CAD";
const CURRENCY_SYMBOL = "$";
