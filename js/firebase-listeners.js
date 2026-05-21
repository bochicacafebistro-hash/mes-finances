// ── Listeners Firebase temps réel ─────────────────────
// Multi-usagers : chaque doc a un champ userId. Les docs sans userId sont attribués au 1er usager
// (migration douce — pas besoin d'éditer les anciens documents un par un).
// La fonction belongsToCurrentUser() est utilisée pour filtrer côté client.
function belongsToCurrentUser(doc) {
  const defaultOwner = (typeof USERS !== "undefined" && USERS.length > 0) ? USERS[0].id : null;
  const ownerId = doc.userId || defaultOwner;
  return ownerId === currentUserId;
}

db.collection("accounts").onSnapshot(snap => {
  accounts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(belongsToCurrentUser)
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  if (isLoggedIn) renderPage();
});

db.collection("transactions").orderBy("date", "desc").limit(1000).onSnapshot(snap => {
  transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(belongsToCurrentUser);
  if (isLoggedIn) renderPage();
});

db.collection("categories").onSnapshot(snap => {
  categories = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(belongsToCurrentUser)
    .sort((a, b) => (a.name_fr || a.name || "").localeCompare(b.name_fr || b.name || ""));
  if (isLoggedIn) renderPage();
});

db.collection("budgets").onSnapshot(snap => {
  budgets = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(belongsToCurrentUser);
  if (isLoggedIn) renderPage();
});

db.collection("subscriptions").onSnapshot(snap => {
  subscriptions = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(belongsToCurrentUser);
  if (isLoggedIn) renderPage();
});

db.collection("realEstateAnalyses").onSnapshot(snap => {
  realEstateAnalyses = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .filter(belongsToCurrentUser)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  if (isLoggedIn && activePage === "realestate" && reMode === "list") renderPage();
});
