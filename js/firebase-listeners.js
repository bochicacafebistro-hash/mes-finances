// ── Listeners Firebase temps réel ─────────────────────

db.collection("accounts").onSnapshot(snap => {
  accounts = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  if (isLoggedIn) renderPage();
});

db.collection("transactions").orderBy("date", "desc").limit(1000).onSnapshot(snap => {
  transactions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (isLoggedIn) renderPage();
});

db.collection("categories").onSnapshot(snap => {
  categories = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (a.name_fr || a.name || "").localeCompare(b.name_fr || b.name || ""));
  if (isLoggedIn) renderPage();
});

db.collection("budgets").onSnapshot(snap => {
  budgets = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (isLoggedIn) renderPage();
});

db.collection("subscriptions").onSnapshot(snap => {
  subscriptions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  if (isLoggedIn) renderPage();
});
