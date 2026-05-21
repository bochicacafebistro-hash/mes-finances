// ── Proxy serveur pour fiches immobilières (Centris + DuProprio) ─────
// Fonction serverless Vercel qui contourne le blocage CORS côté navigateur.
// Accepte les URL de centris.ca ET duproprio.com.
// Le client appelle /api/centris?url=… qui fetch le HTML côté serveur
// et le retourne pour parsing côté client.
//
// Note : Centris et DuProprio peuvent bloquer le scraping (Cloudflare,
// rate limiting). Si ça arrive, l'app a un fallback : coller le HTML manuel.

// Vercel Node.js Runtime — handler classique (req, res)
module.exports = async function handler(req, res) {
  // CORS permissif (l'app et l'API sont sur le même domaine Vercel
  // mais on autorise tout pour les éventuelles previews/branches)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const rawUrl = (req.query && req.query.url) || "";
  if (!rawUrl) {
    res.status(400).json({ error: "missing_url", message: "Paramètre 'url' requis." });
    return;
  }

  // Validation stricte : seulement les domaines immobiliers autorisés
  // (sécurité — évite que la fonction soit utilisée comme open proxy général).
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch (e) {
    res.status(400).json({ error: "invalid_url", message: "URL invalide." });
    return;
  }
  const ALLOWED_HOSTS = [/(^|\.)centris\.ca$/i, /(^|\.)duproprio\.com$/i];
  const hostOk = ALLOWED_HOSTS.some(re => re.test(parsed.hostname));
  if (!hostOk || parsed.protocol !== "https:") {
    res.status(400).json({
      error: "not_allowed_host",
      message: "Seules les URL https://www.centris.ca/… ou https://duproprio.com/… sont autorisées."
    });
    return;
  }

  // En-têtes "humains" pour minimiser le blocage Cloudflare
  const headers = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-CA,fr;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
  };

  try {
    // AbortController pour timeout 12 s (Vercel limite à 10-30 s selon le plan)
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 12000);

    const upstream = await fetch(parsed.toString(), {
      method: "GET",
      headers,
      redirect: "follow",
      signal: ctrl.signal
    });
    clearTimeout(timeoutId);

    if (!upstream.ok) {
      const site = /duproprio\.com/i.test(parsed.hostname) ? "DuProprio" : "Centris";
      res.status(502).json({
        error: "upstream_error",
        status: upstream.status,
        message: site + " a refusé la requête (statut " + upstream.status + "). Utilise le fallback « coller le HTML »."
      });
      return;
    }

    const html = await upstream.text();

    // Vérif basique : la réponse doit ressembler à du HTML Centris.
    // Cloudflare renvoie souvent une page de challenge — on la détecte.
    const lower = html.slice(0, 4000).toLowerCase();
    if (lower.includes("cf-browser-verification") ||
        lower.includes("just a moment") ||
        lower.includes("attention required")) {
      const site = /duproprio\.com/i.test(parsed.hostname) ? "DuProprio" : "Centris";
      res.status(502).json({
        error: "cloudflare_challenge",
        message: site + " a renvoyé un défi anti-bot. Utilise le fallback « coller le HTML »."
      });
      return;
    }

    // Cache CDN Vercel 5 minutes pour éviter de re-frapper Centris sur la
    // même URL plusieurs fois rapidement.
    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=300, stale-while-revalidate=60");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (err) {
    const msg = err && err.name === "AbortError" ? "Timeout (>12 s)." : (err && err.message) || "Erreur inconnue.";
    res.status(504).json({
      error: "fetch_failed",
      message: "Impossible de récupérer la page : " + msg
    });
  }
};
