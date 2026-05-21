// ── Parseur HTML Centris ──────────────────────────────────────────────
// Prend le HTML brut d'une fiche Centris (collé par l'utilisateur depuis
// "Afficher le code source de la page" / Ctrl+U) et extrait les champs
// utiles pour les analyses immobilières.
//
// Le parseur est best-effort : Centris change sa structure HTML
// régulièrement, donc on combine plusieurs stratégies (meta tags Open
// Graph, microdata, JSON-LD, labels textuels) pour maximiser le taux
// d'extraction. Tous les champs sont optionnels — l'utilisateur peut
// ajuster manuellement après l'import.

(function() {
  "use strict";

  // ── Helpers ───────────────────────────────────────────────────────
  // Convertit "499 000 $" / "499,000.00" / "1 234 567,89 $" en number.
  function parseMoney(str) {
    if (!str) return null;
    let s = String(str).trim();
    // Retire le symbole $ et autres
    s = s.replace(/[$\s ]/g, "");
    // Si format québécois avec virgule décimale : "1234,56"
    // Si format anglais : "1,234.56"
    // Heuristique : si la dernière virgule a 2 chiffres après et pas de point après, c'est décimal québécois
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot && /,\d{1,2}$/.test(s)) {
      // Virgule décimale (format Qc)
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // Point décimal ou pas de décimal — virgules sont séparateurs de milliers
      s = s.replace(/,/g, "");
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }

  // Convertit "1 234 pi²" / "115 m²" en pieds carrés.
  // Retourne { value: number, unit: "sqft" | "sqm" } ou null.
  function parseArea(str) {
    if (!str) return null;
    const s = String(str).trim();
    const num = parseMoney(s.replace(/(pi|m)[²2].*$/i, ""));
    if (num == null) return null;
    const isMetric = /m[²2]/i.test(s);
    return { value: num, unit: isMetric ? "sqm" : "sqft", sqft: isMetric ? Math.round(num * 10.7639) : num };
  }

  // Convertit "1985" / "Avant 1980" en année (number) ou null.
  function parseYear(str) {
    if (!str) return null;
    const m = String(str).match(/\b(1[89]\d{2}|20\d{2})\b/);
    return m ? Number(m[1]) : null;
  }

  // Normalise un type d'inscription Centris → catégorie interne.
  // Retourne "rental" (multi-logement / plex) ou "house" (unifamilial / condo).
  function classifyPropertyType(typeText) {
    if (!typeText) return null;
    const s = typeText.toLowerCase();
    if (/\b(duplex|triplex|quadruplex|quintuplex|sextuplex|multi[- ]?(logement|plex)|immeuble|plex)\b/.test(s)) {
      return "rental";
    }
    if (/\b(maison|cottage|bungalow|jumel|plain[- ]?pied|à étages|condo|copropri|appartement)\b/.test(s)) {
      return "house";
    }
    return null;
  }

  // Cherche un nœud texte contenant un label exact ou partiel, puis remonte
  // pour trouver la valeur associée (élément frère, td adjacent, etc).
  // Gère 3 cas :
  //   1. <td>Label</td><td>Valeur</td>      (frère suivant)
  //   2. <p>Label: Valeur</p>               (même élément, inline)
  //   3. <dt>Label</dt><dd>Valeur</dd>      (parent contient les deux)
  function findValueByLabel(doc, labelPatterns, opts = {}) {
    const patterns = Array.isArray(labelPatterns) ? labelPatterns : [labelPatterns];
    const candidates = doc.querySelectorAll(opts.containerSelector || "td, th, dt, dd, div, span, li, p, h3, h4, strong");
    for (const el of candidates) {
      const text = (el.textContent || "").trim();
      if (!text || text.length > 200) continue;
      // Le label doit matcher au début du texte (pour éviter de matcher "Taxes municipales" sur tout un paragraphe)
      const matches = patterns.some(p => p instanceof RegExp ? p.test(text) : text.toLowerCase().includes(String(p).toLowerCase()));
      if (!matches) continue;
      // Cas 2 : valeur inline dans le même élément ("Label: Valeur" ou "Label → Valeur")
      // On exige un $ explicite dans la valeur pour éviter de capturer une
      // année entre parenthèses (ex: "Municipales (2026)" ne doit PAS donner "(2026)").
      // Pour les valeurs sans $ (année, nombre de pièces, etc.), on tombe sur le Cas 1/3.
      for (const p of patterns) {
        const re = p instanceof RegExp ? p : new RegExp(String(p), "i");
        const match = text.match(re);
        if (match && match.index !== undefined) {
          // Saute aussi une éventuelle parenthèse d'année juste après le label
          // ("Municipales (2026) — 4 469 $" → on garde "4 469 $")
          let after = text.slice(match.index + match[0].length);
          after = after.replace(/^\s*\(\s*(?:19|20)\d{2}[^)]*\)\s*/, "");
          after = after.replace(/^[\s:：—→\-]+/, "").trim();
          // Exige un montant en $ pour considérer cette extraction inline valide
          if (after && after.length > 0 && after.length < 100 && /\$/.test(after)) {
            return after;
          }
        }
      }
      // Cas 1 : élément frère immédiat (cas tableaux Centris)
      let next = el.nextElementSibling;
      while (next && !((next.textContent || "").trim())) next = next.nextElementSibling;
      if (next) {
        const val = (next.textContent || "").trim();
        if (val && val.length < 200) return val;
      }
      // Cas 3 : parent contient label + valeur (<dt>/<dd>, etc.)
      const parent = el.parentElement;
      if (parent && parent !== doc.body) {
        const full = (parent.textContent || "").trim();
        const cleaned = full.replace(text, "").trim();
        if (cleaned && cleaned.length < 200 && /[\d$]/.test(cleaned)) return cleaned;
      }
    }
    return null;
  }

  // Cherche dans un bloc contextuel (ex: "Évaluation municipale")
  // puis trouve un sous-label (ex: "Bâtiment", "Terrain", "Total").
  function findValueInSection(doc, sectionPattern, subLabelPatterns) {
    const sections = doc.querySelectorAll("section, div, table, dl, ul");
    for (const sec of sections) {
      const text = (sec.textContent || "").toLowerCase();
      if (!text.includes(String(sectionPattern).toLowerCase())) continue;
      // Limite à des sections raisonnablement petites
      if (text.length > 5000) continue;
      const v = findValueByLabel(sec, subLabelPatterns);
      if (v) return v;
    }
    return null;
  }

  // Extrait le numéro MLS Centris (8 chiffres).
  function extractCentrisId(html) {
    const m = html.match(/\b(?:Centris\s*N[°o]?|MLS\s*N[°o]?|No\.?\s*Centris|N[°o]\s*Centris|N[°o]\s*MLS)\s*[:#]?\s*(\d{7,9})\b/i);
    if (m) return m[1];
    const m2 = html.match(/centris\.ca\/[^"'\s]*?(\d{8,9})/i);
    return m2 ? m2[1] : null;
  }

  // Extrait toutes les chaînes de loyer du HTML brut (texte des sections "Revenus" ou "Logements").
  // Cherche des patterns comme "5½ : 1 250 $" ou "Logement: 4 1/2, Loyer: 1100 $/mois".
  function extractUnitsFromText(text) {
    const units = [];
    // Pattern strict : un format de logement (X½ / X 1/2 / X.5) suivi d'un séparateur
    // explicite ("—" / ":" / "→" / "à" / "loyer" / "rent") puis un montant en $.
    // Le séparateur explicite évite de capturer "50 400 $" comme "5→400" (revenus annuels).
    const re = /(\d+(?:\s?(?:½|1\/2|\.5))?)\s*(?:pi[èe]ces?|p\.?|chambres?)?\s*(?:[—:→\-]|\b(?:[àa]|loyer\s*:?|rent\s*:?)\b)\s*(\d[\d  ,.]{2,8})\s*\$/gi;
    let m;
    let count = 0;
    const seen = new Set();
    while ((m = re.exec(text)) !== null && count < 12) {
      const rent = parseMoney(m[2]);
      // Filtre : loyer plausible (entre 300 $ et 6 000 $/mois)
      if (rent != null && rent >= 300 && rent <= 6000) {
        const key = m[1].trim() + "|" + rent;
        if (!seen.has(key)) {
          seen.add(key);
          units.push({ label: m[1].trim(), rent });
          count++;
        }
      }
    }
    return units;
  }

  // ── Parseur "Détails financiers" (format Centris actuel) ─────────
  // Cherche le bloc .financial-details-tables (ou un fallback contenant
  // à la fois "Évaluation municipale" et "Taxes") et parse en contexte
  // les deux sous-sections séparément.
  function parseFinancialDetailsBlock(doc, result) {
    // 1. Trouve le bloc des détails financiers
    let block = doc.querySelector('[class*="financial-details" i]');
    if (!block) {
      // Fallback : un container raisonnablement petit contenant les deux mots
      const containers = doc.querySelectorAll("section, div, table");
      for (const c of containers) {
        const text = (c.textContent || "");
        if (text.length > 4000 || text.length < 60) continue;
        if (/évaluation\s+municipale/i.test(text) && /\btaxes?\b/i.test(text)) {
          block = c;
          break;
        }
      }
    }
    if (!block) return;

    // 2. Pour chaque sous-titre dans le bloc, isole la sous-section
    // (l'élément suivant ou la table à proximité) et parse ses labels.
    const subTitles = block.querySelectorAll("h1, h2, h3, h4, h5, strong, caption, [class*='title' i], [class*='header' i], [class*='label' i]");
    const seenSections = new Set();

    function extractSubSectionElement(titleEl) {
      // a) Frère suivant qui contient des cellules (table) ou des div de valeurs
      let next = titleEl.nextElementSibling;
      while (next) {
        if (next.querySelector && (next.querySelector("td, dd, [class*='value' i]") || next.textContent.includes("$"))) {
          return next;
        }
        next = next.nextElementSibling;
      }
      // b) Le parent immédiat si pas trop gros (ex: <div class="block"><h3>TAXES</h3><table>...</table></div>)
      const parent = titleEl.parentElement;
      if (parent && parent !== block && (parent.textContent || "").length < 1500) return parent;
      return null;
    }

    for (const titleEl of subTitles) {
      const titleText = (titleEl.textContent || "").trim();
      if (!titleText || titleText.length > 80) continue;
      const lower = titleText.toLowerCase();

      // — Bloc ÉVALUATION MUNICIPALE —
      if (!seenSections.has("eval") && /^évaluation\s+municipale/i.test(lower)) {
        const sub = extractSubSectionElement(titleEl);
        if (!sub) continue;
        const land = findValueByLabel(sub, [/^terrain\b/i, /terrain/i]);
        if (land) {
          const v = parseMoney(land);
          if (v != null && v > 100 && v < 100000000) {
            result.municipalAssessmentLand = v;
            result._foundFields.push("evalLand");
          }
        }
        const building = findValueByLabel(sub, [/^b[âa]timent\b/i, /b[âa]timent/i]);
        if (building) {
          const v = parseMoney(building);
          if (v != null && v > 1000) {
            result.municipalAssessmentBuilding = v;
            result._foundFields.push("evalBuilding");
          }
        }
        const total = findValueByLabel(sub, [/^total\b/i]);
        if (total) {
          const v = parseMoney(total);
          if (v != null && v > 1000) {
            result.municipalAssessment = v;
            result._foundFields.push("evalTotal");
          }
        }
        seenSections.add("eval");
      }

      // — Bloc TAXES —
      else if (!seenSections.has("taxes") && /^taxes?\s*$/i.test(lower)) {
        const sub = extractSubSectionElement(titleEl);
        if (!sub) continue;
        // "Municipales (2026)" ou "Municipales"
        const mun = findValueByLabel(sub, [/^municipales?\b/i, /\bmunicipales?\b/i]);
        if (mun) {
          const v = parseMoney(mun);
          if (v != null && v < 100000) {
            result.municipalTax = v;
            result._foundFields.push("municipalTax");
          }
        }
        const school = findValueByLabel(sub, [/^scolaires?\b/i, /\bscolaires?\b/i]);
        if (school) {
          const v = parseMoney(school);
          if (v != null && v < 50000) {
            result.schoolTax = v;
            result._foundFields.push("schoolTax");
          }
        }
        seenSections.add("taxes");
      }
    }
  }

  // ── Mapping du type Centris → unitType de l'app ──────────────────
  // "Triplex à vendre" → "triplex" ; "Maison à étages" → "single", etc.
  function unitTypeFromTypeText(rawText) {
    if (!rawText) return null;
    const s = rawText.toLowerCase();
    if (/\bsextuplex\b|\b6\s*(?:plex|logements?)\b/.test(s)) return "6plex";
    if (/\bquintuplex\b|\b5\s*(?:plex|logements?)\b/.test(s)) return "5plex";
    if (/\bquadruplex\b|\b4\s*(?:plex|logements?)\b/.test(s)) return "quadruplex";
    if (/\btriplex\b|\b3\s*(?:plex|logements?)\b/.test(s)) return "triplex";
    if (/\bduplex\b|\b2\s*(?:plex|logements?)\b/.test(s)) return "duplex";
    if (/\bmaison|cottage|bungalow|plain[- ]?pied|à\s+étages|jumel|condo|copropri|appartement|unifamiliale\b/.test(s)) return "single";
    // Immeuble à logements multiples / multiplex / septuplex+ → laisser libre
    if (/\bmultiplex|septuplex|octuplex|multi[- ]?(plex|logements?)|immeuble/.test(s)) return "custom";
    return null;
  }

  // ── Parseur principal ─────────────────────────────────────────────
  // Prend le HTML brut d'une fiche Centris et retourne :
  //   { propertyType, price, address, year, livingAreaSqft, landAreaSqft,
  //     bedrooms, bathrooms, rooms, municipalTax, schoolTax,
  //     municipalAssessment, municipalAssessmentBuilding, municipalAssessmentLand,
  //     grossRevenue, units, centrisId, centrisUrl, rawTypeText, _confidence }
  function parseCentrisHTML(html) {
    const result = {
      propertyType: null,
      rawTypeText: null,
      price: null,
      address: null,
      addressFull: null,        // adresse complète (.pt-1 sur Centris)
      description: null,         // description longue (.col-lg-12.description)
      year: null,
      livingAreaSqft: null,
      landAreaSqft: null,
      bedrooms: null,
      bathrooms: null,
      rooms: null,
      municipalTax: null,
      schoolTax: null,
      municipalAssessment: null,
      municipalAssessmentBuilding: null,
      municipalAssessmentLand: null,
      grossRevenue: null,
      units: [],                 // chaque unit : { label, subtype, rent }
      unitSubtypes: [],          // types d'appartements (4½, 5½...) tels qu'extraits
      centrisId: null,
      centrisUrl: null,
      _foundFields: [],
      _confidence: 0
    };

    if (!html || typeof html !== "string") return result;

    // DOMParser : transforme le HTML brut en arbre navigable
    let doc;
    try {
      doc = new DOMParser().parseFromString(html, "text/html");
    } catch (e) {
      return result;
    }

    // ── 1. URL canonique et ID Centris ─────────────────────────────
    const ogUrl = doc.querySelector('meta[property="og:url"]');
    if (ogUrl) result.centrisUrl = ogUrl.getAttribute("content");
    const linkCanon = doc.querySelector('link[rel="canonical"]');
    if (linkCanon && !result.centrisUrl) result.centrisUrl = linkCanon.getAttribute("href");
    result.centrisId = extractCentrisId(html);

    // ── 2. JSON-LD : Centris embarque parfois un objet structured data ─
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const s of jsonLdScripts) {
      try {
        const obj = JSON.parse(s.textContent || "{}");
        const items = Array.isArray(obj) ? obj : [obj];
        for (const it of items) {
          if (!it) continue;
          if (it.offers && it.offers.price && result.price == null) {
            result.price = parseMoney(it.offers.price);
            result._foundFields.push("price (JSON-LD)");
          }
          if (it.address && result.address == null) {
            const a = it.address;
            const parts = [a.streetAddress, a.addressLocality, a.addressRegion, a.postalCode].filter(Boolean);
            if (parts.length) {
              result.address = parts.join(", ");
              result._foundFields.push("address (JSON-LD)");
            }
          }
        }
      } catch (e) {
        // JSON-LD malformé — on continue avec les autres stratégies
      }
    }

    // ── 3. Meta tags Open Graph / microdata ────────────────────────
    if (result.price == null) {
      const ogPrice = doc.querySelector('meta[property="og:price:amount"], meta[itemprop="price"]');
      if (ogPrice) {
        const p = parseMoney(ogPrice.getAttribute("content"));
        if (p != null) { result.price = p; result._foundFields.push("price (meta)"); }
      }
    }
    if (result.address == null) {
      const street = doc.querySelector('meta[property="og:street-address"], [itemprop="streetAddress"]');
      if (street) {
        const v = street.getAttribute("content") || street.textContent;
        if (v && v.trim()) { result.address = v.trim(); result._foundFields.push("address (meta)"); }
      }
    }

    // ── 4. Adresse : titres H1/H2 (Centris affiche souvent l'adresse en titre) ─
    if (result.address == null) {
      const h1 = doc.querySelector("h1, h2");
      if (h1) {
        const t = (h1.textContent || "").trim();
        // Heuristique : une adresse contient un numéro civique au début
        if (t && t.length < 200 && /^\d/.test(t)) {
          result.address = t;
          result._foundFields.push("address (h1)");
        }
      }
    }

    // ── 5. Prix : fallback texte ───────────────────────────────────
    if (result.price == null) {
      // Cherche un nœud avec class contenant "price" et un montant > 50 000 $
      const priceEls = doc.querySelectorAll('[class*="price" i], [class*="prix" i]');
      for (const el of priceEls) {
        const p = parseMoney(el.textContent);
        if (p != null && p >= 50000 && p <= 50000000) {
          result.price = p;
          result._foundFields.push("price (class)");
          break;
        }
      }
    }
    if (result.price == null) {
      // Dernier recours : premier nombre > 100 000 suivi de "$" dans le HTML
      const m = html.match(/(\d[\d  ]{4,12})\s*\$/);
      if (m) {
        const p = parseMoney(m[1]);
        if (p != null && p >= 100000 && p <= 50000000) {
          result.price = p;
          result._foundFields.push("price (regex)");
        }
      }
    }

    // ── 6. Type de propriété ───────────────────────────────────────
    // Centris affiche "Triplex à vendre" ou "Maison à étages à vendre" en haut.
    // Cherche dans plusieurs candidats et garde celui qui contient un mot-clé immobilier.
    const typeCandidates = doc.querySelectorAll("h1, h2, h3, [class*='category' i], [class*='type' i], [class*='property' i]");
    for (const el of typeCandidates) {
      const txt = (el.textContent || "").trim();
      if (!txt || txt.length > 100) continue;
      const cls = classifyPropertyType(txt);
      if (cls) {
        result.rawTypeText = txt;
        result.propertyType = cls;
        result._foundFields.push("type (" + cls + ")");
        break;
      }
    }
    if (!result.propertyType) {
      // Cherche dans tout le HTML
      const cls = classifyPropertyType(html.slice(0, 8000));
      if (cls) {
        result.propertyType = cls;
        result._foundFields.push("type (html)");
      }
    }

    // ── 7-8. Détails financiers : ÉVALUATION MUNICIPALE + TAXES ────
    // Centris regroupe les deux sous-tableaux dans un bloc
    // class="row financial-details-tables" (avec sous-titres "ÉVALUATION
    // MUNICIPALE (2026)" et "TAXES"). On parse en contexte pour ne pas
    // confondre les deux "Total" et reconnaître "Municipales (2026)"
    // sans le mot "Taxes" devant.
    parseFinancialDetailsBlock(doc, result);
    // Fallback ancien format pour les fiches Centris plus anciennes
    if (result.municipalTax == null) {
      const munTax = findValueByLabel(doc, [/taxes?\s+municipales?/i]);
      if (munTax) {
        const v = parseMoney(munTax);
        if (v != null && v < 100000) { result.municipalTax = v; result._foundFields.push("municipalTax (fallback)"); }
      }
    }
    if (result.schoolTax == null) {
      const schoolTax = findValueByLabel(doc, [/taxes?\s+scolaires?/i]);
      if (schoolTax) {
        const v = parseMoney(schoolTax);
        if (v != null && v < 50000) { result.schoolTax = v; result._foundFields.push("schoolTax (fallback)"); }
      }
    }
    // Si on a bâtiment+terrain mais pas total, on additionne
    if (result.municipalAssessment == null && result.municipalAssessmentBuilding != null && result.municipalAssessmentLand != null) {
      result.municipalAssessment = result.municipalAssessmentBuilding + result.municipalAssessmentLand;
    }

    // ── 9. Année de construction ───────────────────────────────────
    const yearStr = findValueByLabel(doc, [/année\s+de\s+construction/i, /annee\s+de\s+construction/i]);
    if (yearStr) {
      const y = parseYear(yearStr);
      if (y) { result.year = y; result._foundFields.push("year"); }
    }

    // ── 10. Superficies ────────────────────────────────────────────
    const livingStr = findValueByLabel(doc, [/superficie\s+habitable/i, /superficie\s+du\s+b[âa]timent/i]);
    if (livingStr) {
      const a = parseArea(livingStr);
      if (a) { result.livingAreaSqft = a.sqft; result._foundFields.push("livingArea"); }
    }
    const landStr = findValueByLabel(doc, [/superficie\s+du\s+terrain/i, /terrain\s*\(.*\)/i]);
    if (landStr) {
      const a = parseArea(landStr);
      if (a) { result.landAreaSqft = a.sqft; result._foundFields.push("landArea"); }
    }

    // ── 11. Chambres / pièces / salles de bain ─────────────────────
    const roomsStr = findValueByLabel(doc, [/nombre\s+de\s+pièces?/i, /nombre\s+de\s+pieces?/i]);
    if (roomsStr) {
      const m = roomsStr.match(/\d+/);
      if (m) { result.rooms = Number(m[0]); result._foundFields.push("rooms"); }
    }
    const bedStr = findValueByLabel(doc, [/nombre\s+de\s+chambres?/i, /chambres?\s*\(/i]);
    if (bedStr) {
      const m = bedStr.match(/\d+/);
      if (m) { result.bedrooms = Number(m[0]); result._foundFields.push("bedrooms"); }
    }
    const bathStr = findValueByLabel(doc, [/nombre\s+de\s+salles?\s+de\s+bains?/i, /salles?\s+de\s+bains?/i]);
    if (bathStr) {
      const m = bathStr.match(/\d+/);
      if (m) { result.bathrooms = Number(m[0]); result._foundFields.push("bathrooms"); }
    }

    // ── 12. Revenus bruts annuels (locatif) ────────────────────────
    const grossStr = findValueByLabel(doc, [/revenus?\s+bruts?\s+(potentiels?\s+)?annuels?/i, /revenus?\s+totaux/i]);
    if (grossStr) {
      const v = parseMoney(grossStr);
      if (v != null && v > 1000) { result.grossRevenue = v; result._foundFields.push("grossRevenue"); }
    }

    // ── 12.b Description longue (.col-lg-12.description) ───────────
    // Centris met l'argumentaire de vente dans ce bloc — on l'importe
    // dans les notes pour que l'utilisateur ait le contexte complet.
    const descEl = doc.querySelector(".col-lg-12.description, [class*='col-lg-12'][class*='description']");
    if (descEl) {
      const raw = (descEl.textContent || "").replace(/\s+/g, " ").trim();
      if (raw && raw.length > 20) {
        result.description = raw.length > 4000 ? raw.slice(0, 4000) + "…" : raw;
        result._foundFields.push("description");
      }
    }

    // ── 12.c Adresse complète (.pt-1) ──────────────────────────────
    // Sur Centris, l'adresse complète est dans un .pt-1 (très générique
    // dans Bootstrap, donc on prend le premier qui ressemble à une adresse).
    const ptEls = doc.querySelectorAll(".pt-1");
    for (const el of ptEls) {
      const txt = (el.textContent || "").trim().replace(/\s+/g, " ");
      // Heuristique : adresse = commence par un chiffre, contient un nom de voie
      if (txt && txt.length > 10 && txt.length < 200 &&
          /^\d+[a-z]?\s/i.test(txt) &&
          /(rue|avenue|boulevard|chemin|route|place|côte|cote|allée|allee|impasse|montée|montee|terrasse|croissant|rang|av\.|boul\.|ch\.)/i.test(txt)) {
        result.addressFull = txt;
        // Si on n'avait pas trouvé d'adresse avant, ou si celle-ci est plus complète,
        // on l'utilise
        if (!result.address || txt.length > result.address.length) {
          result.address = txt;
        }
        result._foundFields.push("addressFull (.pt-1)");
        break;
      }
    }

    // ── 12.d Sous-types de logements (data-id="NbUniteFormatted") ──
    // Chaque logement a son type "4½", "5½" dans cet attribut sur Centris.
    const subtypeEls = doc.querySelectorAll('[data-id="NbUniteFormatted"]');
    if (subtypeEls.length) {
      result.unitSubtypes = Array.from(subtypeEls)
        .map(el => (el.textContent || "").trim().replace(/\s+/g, " "))
        .filter(s => s && s.length > 0 && s.length < 40);
      if (result.unitSubtypes.length) result._foundFields.push("unitSubtypes (" + result.unitSubtypes.length + ")");
    }

    // ── 13. Détail des logements (loyers individuels) ──────────────
    // Cherche d'abord une section "Logements" / "Unités" et y extrait les loyers.
    const allSections = doc.querySelectorAll("section, div, table");
    for (const sec of allSections) {
      const txt = (sec.textContent || "").toLowerCase();
      if (txt.length > 6000 || txt.length < 30) continue;
      if (!/(logements?|unit[ée]s?\s+(de\s+)?(location|locatives?)|d[ée]tails?\s+des?\s+logements?|appartements?)/.test(txt)) continue;
      const units = extractUnitsFromText(sec.textContent || "");
      if (units.length >= 1) {
        result.units = units;
        result._foundFields.push("units (" + units.length + ")");
        break;
      }
    }
    // Si aucune section dédiée mais on est en mode locatif, scan global
    if (result.units.length === 0 && result.propertyType === "rental") {
      const units = extractUnitsFromText(doc.body ? doc.body.textContent || "" : "");
      if (units.length >= 2) {
        // Garde uniquement les premiers (souvent les autres patterns sont du bruit)
        result.units = units.slice(0, 6);
        result._foundFields.push("units fallback (" + result.units.length + ")");
      }
    }

    // ── 14. Score de confiance (0 à 100) ───────────────────────────
    // Basé sur le nombre de champs critiques trouvés
    let score = 0;
    if (result.price != null) score += 30;
    if (result.address) score += 20;
    if (result.propertyType) score += 10;
    if (result.municipalTax != null) score += 10;
    if (result.schoolTax != null) score += 5;
    if (result.municipalAssessment != null) score += 10;
    if (result.year) score += 5;
    if (result.livingAreaSqft) score += 5;
    if (result.units.length > 0 || result.grossRevenue != null) score += 5;
    result._confidence = Math.min(100, score);

    return result;
  }

  // ── Helpers d'application partagés ───────────────────────────────
  // Nettoie le texte du type ("Triplex à vendre" → "Triplex")
  function cleanTypeText(rawTypeText) {
    if (!rawTypeText) return "";
    return rawTypeText
      .replace(/\s*[—\-]?\s*à\s*vendre\s*$/i, "")
      .replace(/\s*-\s*Centris.*$/i, "")
      .trim();
  }
  // Construit un nom auto : "Type + adresse civique" (sans la ville/code postal)
  function buildAnalysisName(parsed) {
    const type = cleanTypeText(parsed.rawTypeText);
    // Adresse courte : juste le numéro civique + voie (sans ville/province/code postal)
    let shortAddr = "";
    const full = parsed.addressFull || parsed.address || "";
    if (full) {
      // Coupe à la première virgule pour enlever "Montréal, QC, H1H 1H1"
      shortAddr = full.split(",")[0].trim();
    }
    if (type && shortAddr) return type + " " + shortAddr;
    if (type) return type;
    if (shortAddr) return shortAddr;
    return "";
  }

  // ── Application des données parsées sur reCurrent (locatif) ──────
  function applyCentrisToRentalAnalysis(parsed, draft) {
    if (!parsed || !draft) return;
    if (parsed.price != null) draft.purchasePrice = parsed.price;
    if (parsed.address) draft.address = parsed.address;
    if (parsed.municipalTax != null) draft.municipalTax = parsed.municipalTax;
    if (parsed.schoolTax != null) draft.schoolTax = parsed.schoolTax;
    // Nom auto : "Type + adresse" (écrase l'ancien nom seulement si vide ou identique à l'ancien auto)
    const autoName = buildAnalysisName(parsed);
    if (autoName && (!draft.name || draft.name.trim() === "" || draft.name === draft._lastAutoName)) {
      draft.name = autoName;
      draft._lastAutoName = autoName; // mémorise pour pouvoir l'écraser au prochain import
    }
    // Notes : description Centris + métadonnées
    const notesParts = [];
    if (parsed.description) {
      notesParts.push("📝 Description Centris :");
      notesParts.push(parsed.description);
      notesParts.push(""); // ligne vide de séparation
    }
    const metaParts = [];
    if (parsed.centrisUrl) metaParts.push("Centris: " + parsed.centrisUrl);
    if (parsed.centrisId) metaParts.push("Nº MLS: " + parsed.centrisId);
    if (parsed.year) metaParts.push("Année: " + parsed.year);
    if (parsed.livingAreaSqft) metaParts.push("Sup. habitable: " + parsed.livingAreaSqft + " pi²");
    if (parsed.landAreaSqft) metaParts.push("Terrain: " + parsed.landAreaSqft + " pi²");
    if (parsed.municipalAssessment != null) metaParts.push("Éval. municipale: " + parsed.municipalAssessment.toLocaleString("fr-CA") + " $");
    if (parsed.grossRevenue != null) metaParts.push("Revenus bruts (Centris): " + parsed.grossRevenue.toLocaleString("fr-CA") + " $/an");
    if (metaParts.length) {
      if (notesParts.length) notesParts.push("📊 Données extraites :");
      notesParts.push(metaParts.join("\n"));
    }
    if (notesParts.length) {
      const existing = (draft.notes || "").trim();
      const block = notesParts.join("\n");
      draft.notes = existing && !existing.includes("Description Centris")
        ? existing + "\n\n— Importé de Centris —\n" + block
        : "— Importé de Centris —\n" + block;
    }
    // ── Type d'immeuble (unitType) ───────────────────────────────
    // Priorité : nombre de logements détectés > nb de sous-types > texte du type Centris
    const unitTypeFromText = parsed.rawTypeText ? unitTypeFromTypeText(parsed.rawTypeText) : null;
    const typeByCount = { 1: "single", 2: "duplex", 3: "triplex", 4: "quadruplex", 5: "5plex", 6: "6plex" };
    let inferredType = null;
    const subtypeCount = (parsed.unitSubtypes || []).length;
    if (parsed.units && parsed.units.length > 0) {
      inferredType = typeByCount[parsed.units.length] || "custom";
    } else if (subtypeCount >= 1) {
      inferredType = typeByCount[subtypeCount] || "custom";
    } else if (unitTypeFromText) {
      inferredType = unitTypeFromText;
    }
    if (inferredType) draft.unitType = inferredType;

    // ── Loyers individuels ──────────────────────────────────────
    // Chaque unit a maintenant un champ `subtype` (ex: "4½", "5½") qui
    // sera affiché en sous-libellé sous "Logement N" dans le formulaire.
    const subtypes = parsed.unitSubtypes || [];
    if (parsed.units && parsed.units.length > 0) {
      draft.units = parsed.units.map((u, i) => ({
        name: "Logement " + (i + 1),
        subtype: (u.subtype || subtypes[i] || u.label || "").trim(),
        rent: Math.round(u.rent),
        utilitiesIncluded: true,
        ownerOccupied: false
      }));
    } else {
      // Pas de loyers détaillés : initialise le bon nombre d'unités selon le type
      const counts = { single: 1, duplex: 2, triplex: 3, quadruplex: 4, "5plex": 5, "6plex": 6, custom: 1 };
      // Priorité : nombre de sous-types extraits > comptage par type
      const n = subtypes.length > 0 ? subtypes.length : (counts[draft.unitType] || 3);
      const monthlyEach = parsed.grossRevenue != null && parsed.grossRevenue > 0
        ? Math.round((parsed.grossRevenue / 12) / n) : 0;
      draft.units = Array.from({ length: n }, (_, i) => ({
        name: "Logement " + (i + 1),
        subtype: subtypes[i] || "",
        rent: monthlyEach,
        utilitiesIncluded: true,
        ownerOccupied: false
      }));
    }
  }

  // ── Application des données parsées sur le draft maison ──────────
  function applyCentrisToHouseAnalysis(parsed, draft) {
    if (!parsed || !draft) return;
    if (parsed.price != null) draft.purchasePrice = parsed.price;
    if (parsed.address) draft.address = parsed.address;
    if (parsed.municipalTax != null) draft.municipalTax = parsed.municipalTax;
    if (parsed.schoolTax != null) draft.schoolTax = parsed.schoolTax;
    if (parsed.municipalAssessment != null) draft.municipalAssessment = parsed.municipalAssessment;
    if (parsed.year) draft.yearBuilt = parsed.year;
    if (parsed.livingAreaSqft) draft.livingAreaSqft = parsed.livingAreaSqft;
    if (parsed.landAreaSqft) draft.landAreaSqft = parsed.landAreaSqft;
    if (parsed.bedrooms != null) draft.bedrooms = parsed.bedrooms;
    if (parsed.bathrooms != null) draft.bathrooms = parsed.bathrooms;
    if (parsed.rooms != null) draft.rooms = parsed.rooms;
    if (parsed.centrisUrl) draft.centrisUrl = parsed.centrisUrl;
    if (parsed.centrisId) draft.centrisId = parsed.centrisId;
    // Nom auto : "Type + adresse"
    const autoName = buildAnalysisName(parsed);
    if (autoName && (!draft.name || draft.name.trim() === "" || draft.name === draft._lastAutoName)) {
      draft.name = autoName;
      draft._lastAutoName = autoName;
    }
    // Notes : description Centris
    if (parsed.description) {
      const existing = (draft.notes || "").trim();
      const descBlock = "📝 Description Centris :\n" + parsed.description;
      draft.notes = existing && !existing.includes("Description Centris")
        ? existing + "\n\n" + descBlock
        : descBlock;
    }
  }

  // Expose au global
  window.parseCentrisHTML = parseCentrisHTML;
  window.applyCentrisToRentalAnalysis = applyCentrisToRentalAnalysis;
  window.applyCentrisToHouseAnalysis = applyCentrisToHouseAnalysis;
  window.classifyCentrisType = classifyPropertyType;
})();
