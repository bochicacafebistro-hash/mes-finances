// ── État global de l'application ──────────────────────
let accounts = [];
let transactions = [];
let categories = [];
let budgets = [];          // { id, categoryId, monthlyLimit }
let subscriptions = [];    // { id, key, name, amount, frequency, lastDate, accountId, categoryId, active }
let realEstateAnalyses = []; // {
//   id, name, address,
//   purchasePrice, downPaymentMode ("amount"|"percent"), downPayment, downPaymentPercent,
//   amortYears, interestRate, paymentFrequency ("monthly"|"biweekly_accel"|"weekly_accel"),
//   municipalTax, schoolTax, insurance,
//   electricity, otherServiceName, otherServiceAmount,
//   maintenancePercent, vacancyPercent, managementPercent,
//   appreciationPercent, rentIncreasePercent,
//   unitType ("single"|"duplex"|"triplex"|"quadruplex"|"5plex"|"6plex"|"custom"),
//   units: [{ name, rent, utilitiesIncluded, ownerOccupied }],
//   notes, createdAt, updatedAt
// }

// ── État UI de la page Achats immobilier ──────────────
let reMode = "list";       // "list" | "edit"
let reCurrent = null;      // brouillon en cours (objet analyse non sauvegardé)
let reProjectionYears = 10; // durée affichée dans le bloc Projection (modifiable)

let isLoggedIn = false, isAdmin = false, pinBuffer = "", darkMode = false;
let activePage = "dashboard";
let sidebarOpen = true;
let pendingConfirm = null, openDropId = null;

// Filtres et sélections
let txFilterMonth = new Date().getMonth();
let txFilterYear = new Date().getFullYear();
let txFilterAccount = "all";   // id d'un compte ou "all"
let txFilterCategory = "all";  // id d'une catégorie ou "all"
let txFilterType = "all";      // "all" | "expense" | "income" | "transfer"
let txSearchQuery = "";

// User connecté (pour logs éventuels)
let loggedInUser = null;
