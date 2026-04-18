// ── État global de l'application ──────────────────────
let accounts = [];
let transactions = [];
let categories = [];

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
