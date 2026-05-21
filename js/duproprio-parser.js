// ── Parseur HTML DuProprio ────────────────────────────────────────────
// Adapté pour les fiches duproprio.com (équivalent du parseur Centris).
// Réutilise les helpers communs exposés par centris-parser.js via
// window._propertyHelpers.
//
// Stratégies (best-effort, robustes aux changements de structure) :
//   1. Meta tags Open Graph (og:price:amount, og:title, og:description)
//   2. JSON-LD si Schema.org/Product/Residence présent
//   3. Sélecteurs CSS spécifiques DuProprio (.listing-* / .description)
//   4. Labels textuels génériques (taxes municipales/scolaires, évaluation)

(function() {
  "use strict";

  // Helpers partagés depuis centris-parser.js (chargé avant ce fichier)
  const H = (typeof window !== "undefined" && window._propertyHelpers) || {};

  // Fallback minimal si les helpers ne sont pas dispo (sécurité)
  function parseMoney(s) {
    if (H.parseMoney) return H.parseMoney(s);
    if (!s) return null;
    let str = String(s).replace(/[$\s ]/g, "");
    const lc = str.lastIndexOf(","), ld = str.lastIndexOf(".");
    if (lc > ld && /,\d{1,2}$/.test(str)) str = str.replace(/\./g, "").replace(",", ".");
    else str = str.replace(/,/g, "");
    const n = Number(str);
    return Number.isFinite(n) ? n : null;
  }

  // ── Parseur principal DuProprio ───────────────────────────────────
  function parseDuProprioHTML(html) {
    const result = {
      propertyType: null,
      rawTypeText: null,
      price: null,
      address: null,
      addressFull: null,
      description: null,
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
      units: [],
      unitSubtypes: [],
      centrisId: null,        // gardé pour compat (sera l'ID DuProprio)
      centrisUrl: null,        // gardé pour compat (sera l'URL DuProprio)
      _source: "duproprio",
      _foundFields: [],
      _confidence: 0
    };

    if (!html || typeof html !== "string") return result;

    let doc;
    try {
      doc = new DOMParser().parseFromString(html, "text/html");
    } catch (e) {
      return result;
    }

    // ── 1. URL canonique et ID DuProprio ──────────────────────────
    const ogUrl = doc.querySelector('meta[property="og:url"]');
    if (ogUrl) result.centrisUrl = ogUrl.getAttribute("content");
    const linkCanon = doc.querySelector('link[rel="canonical"]');
    if (linkCanon && !result.centrisUrl) result.centrisUrl = linkCanon.getAttribute("href");
    // L'ID DuProprio est à la fin de l'URL : /duplex-a-vendre/.../1129246
    // Lookahead négatif (?!\d) pour empêcher de couper au milieu d'un grand nombre.
    const idMatch = html.match(/duproprio\.com\/[^"'\s]*?-(\d{6,8})(?!\d)/i);
    if (idMatch) result.centrisId = idMatch[1];

    // ── 2. JSON-LD ─────────────────────────────────────────────────
    const jsonLdScripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const s of jsonLdScripts) {
      try {
        const obj = JSON.parse(s.textContent || "{}");
        const items = Array.isArray(obj) ? obj : (obj["@graph"] || [obj]);
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
          if (it.description && !result.description) {
            const d = String(it.description).replace(/\s+/g, " ").trim();
            if (d.length > 30) {
              result.description = d.length > 4000 ? d.slice(0, 4000) + "…" : d;
              result._foundFields.push("description (JSON-LD)");
            }
          }
        }
      } catch (e) { /* JSON-LD malformé */ }
    }

    // ── 3. Meta tags Open Graph ────────────────────────────────────
    if (result.price == null) {
      const ogPrice = doc.querySelector('meta[property="og:price:amount"], meta[property="product:price:amount"]');
      if (ogPrice) {
        const p = parseMoney(ogPrice.getAttribute("content"));
        if (p != null) { result.price = p; result._foundFields.push("price (og)"); }
      }
    }
    if (!result.description) {
      const ogDesc = doc.querySelector('meta[property="og:description"], meta[name="description"]');
      if (ogDesc) {
        const d = (ogDesc.getAttribute("content") || "").replace(/\s+/g, " ").trim();
        if (d.length > 40) {
          result.description = d;
          result._foundFields.push("description (og)");
        }
      }
    }

    // og:title contient souvent le type + l'adresse, ex:
    //   "Duplex à vendre — 3471-3475 Rue Loyola, Beauport"
    const ogTitle = doc.querySelector('meta[property="og:title"]');
    let ogTitleText = ogTitle ? (ogTitle.getAttribute("content") || "").trim() : "";
    if (ogTitleText) {
      // Extrait le type (avant le tiret/séparateur)
      const parts = ogTitleText.split(/\s+[—–\-|]\s+/);
      if (parts.length >= 1) {
        const typePart = parts[0].trim();
        if (typePart && H.classifyPropertyType) {
          const cls = H.classifyPropertyType(typePart);
          if (cls) {
            result.propertyType = cls;
            result.rawTypeText = typePart;
            result._foundFields.push("type (og:title)");
          }
        }
      }
      // Si l'adresse est dans og:title et qu'on n'a rien encore
      if (!result.address && parts.length >= 2) {
        const addrPart = parts.slice(1).join(", ").trim();
        if (addrPart && /^\d/.test(addrPart) && addrPart.length < 200) {
          result.address = addrPart;
          result._foundFields.push("address (og:title)");
        }
      }
    }

    // ── 4. Prix : sélecteurs DuProprio communs ─────────────────────
    if (result.price == null) {
      const priceSelectors = [
        '[class*="listing-price" i]',
        '[class*="price" i]:not([class*="taxe" i]):not([class*="eval" i])',
        '[itemprop="price"]',
        '[data-id*="price" i]'
      ];
      for (const sel of priceSelectors) {
        const els = doc.querySelectorAll(sel);
        for (const el of els) {
          const t = (el.textContent || "").trim();
          const p = parseMoney(t);
          if (p != null && p >= 50000 && p <= 50000000) {
            result.price = p;
            result._foundFields.push("price (" + sel + ")");
            break;
          }
        }
        if (result.price != null) break;
      }
    }

    // ── 5. Adresse : sélecteurs DuProprio ──────────────────────────
    if (!result.address || !/^\d/.test(result.address)) {
      const addrSelectors = [
        '[class*="listing-address" i]',
        '[class*="property-address" i]',
        '[class*="address" i]',
        '[itemprop="streetAddress"]',
        'h1, h2'
      ];
      for (const sel of addrSelectors) {
        const els = doc.querySelectorAll(sel);
        for (const el of els) {
          const t = (el.textContent || "").trim().replace(/\s+/g, " ");
          // Adresse plausible : commence par chiffre, contient un nom de voie
          if (t && t.length > 10 && t.length < 200 &&
              /^\d/.test(t) &&
              /(rue|avenue|boulevard|chemin|route|place|côte|cote|allée|allee|impasse|montée|montee|terrasse|croissant|rang|av\.|boul\.|ch\.)/i.test(t)) {
            result.address = t;
            result.addressFull = t;
            result._foundFields.push("address (" + sel + ")");
            break;
          }
        }
        if (result.address && /^\d/.test(result.address)) break;
      }
    }

    // ── 6. Description longue ──────────────────────────────────────
    if (!result.description) {
      const descSelectors = [
        '[class*="listing-description" i]',
        '[class*="description-content" i]',
        '[class*="property-description" i]',
        '#description',
        '[itemprop="description"]'
      ];
      for (const sel of descSelectors) {
        const el = doc.querySelector(sel);
        if (el) {
          const d = (el.textContent || "").replace(/\s+/g, " ").trim();
          if (d.length > 40) {
            result.description = d.length > 4000 ? d.slice(0, 4000) + "…" : d;
            result._foundFields.push("description (" + sel + ")");
            break;
          }
        }
      }
    }

    // ── 7. Type de propriété (fallback) ────────────────────────────
    if (!result.propertyType) {
      const candidates = doc.querySelectorAll("h1, h2, h3, [class*='category' i], [class*='type' i], [class*='listing-type' i]");
      for (const el of candidates) {
        const t = (el.textContent || "").trim();
        if (!t || t.length > 100) continue;
        const cls = H.classifyPropertyType && H.classifyPropertyType(t);
        if (cls) {
          result.propertyType = cls;
          if (!result.rawTypeText) result.rawTypeText = t;
          result._foundFields.push("type (" + cls + ")");
          break;
        }
      }
      // Dernier recours : chercher dans le HTML brut
      if (!result.propertyType && H.classifyPropertyType) {
        const cls = H.classifyPropertyType(html.slice(0, 8000));
        if (cls) {
          result.propertyType = cls;
          result._foundFields.push("type (html)");
        }
      }
    }

    // ── 8. Détails financiers : taxes / évaluation ─────────────────
    // DuProprio utilise généralement des sections "Taxes" et "Évaluation
    // municipale" similaires à Centris.
    if (H.findValueByLabel) {
      const munTax = H.findValueByLabel(doc, [/taxes?\s+municipales?/i, /^municipales?\b/i]);
      if (munTax) {
        const v = parseMoney(munTax);
        if (v != null && v > 0 && v < 100000) {
          result.municipalTax = v;
          result._foundFields.push("municipalTax");
        }
      }
      const schoolTax = H.findValueByLabel(doc, [/taxes?\s+scolaires?/i, /^scolaires?\b/i]);
      if (schoolTax) {
        const v = parseMoney(schoolTax);
        if (v != null && v > 0 && v < 50000) {
          result.schoolTax = v;
          result._foundFields.push("schoolTax");
        }
      }

      // Évaluation municipale : terrain / bâtiment / total
      if (H.findValueInSection) {
        const eb = H.findValueInSection(doc, "évaluation", [/b[âa]timent/i]);
        if (eb) {
          const v = parseMoney(eb);
          if (v != null && v > 1000) {
            result.municipalAssessmentBuilding = v;
            result._foundFields.push("evalBuilding");
          }
        }
        const el = H.findValueInSection(doc, "évaluation", [/terrain/i]);
        if (el) {
          const v = parseMoney(el);
          if (v != null && v > 100) {
            result.municipalAssessmentLand = v;
            result._foundFields.push("evalLand");
          }
        }
        const et = H.findValueInSection(doc, "évaluation", [/^total\b/i]);
        if (et) {
          const v = parseMoney(et);
          if (v != null && v > 1000) {
            result.municipalAssessment = v;
            result._foundFields.push("evalTotal");
          }
        }
      }
      if (result.municipalAssessment == null && result.municipalAssessmentBuilding != null && result.municipalAssessmentLand != null) {
        result.municipalAssessment = result.municipalAssessmentBuilding + result.municipalAssessmentLand;
      }
    }

    // ── 9. Année / superficie / chambres / sdb ────────────────────
    if (H.findValueByLabel) {
      const yearStr = H.findValueByLabel(doc, [/année\s+(?:de\s+)?construction/i, /annee\s+(?:de\s+)?construction/i]);
      if (yearStr && H.parseYear) {
        const y = H.parseYear(yearStr);
        if (y) { result.year = y; result._foundFields.push("year"); }
      }
      const livingStr = H.findValueByLabel(doc, [/superficie\s+habitable/i, /superficie\s+du\s+b[âa]timent/i, /aire\s+habitable/i]);
      if (livingStr && H.parseArea) {
        const a = H.parseArea(livingStr);
        if (a) { result.livingAreaSqft = a.sqft; result._foundFields.push("livingArea"); }
      }
      const landStr = H.findValueByLabel(doc, [/superficie\s+du\s+terrain/i, /dimensions\s+du\s+terrain/i]);
      if (landStr && H.parseArea) {
        const a = H.parseArea(landStr);
        if (a) { result.landAreaSqft = a.sqft; result._foundFields.push("landArea"); }
      }
      const bedStr = H.findValueByLabel(doc, [/(?:nombre\s+de\s+)?chambres?(?:\s*à\s*coucher)?/i]);
      if (bedStr) {
        const m = bedStr.match(/\d+/);
        if (m) { result.bedrooms = Number(m[0]); result._foundFields.push("bedrooms"); }
      }
      const bathStr = H.findValueByLabel(doc, [/(?:nombre\s+de\s+)?salles?\s+de\s+bain/i]);
      if (bathStr) {
        const m = bathStr.match(/\d+/);
        if (m) { result.bathrooms = Number(m[0]); result._foundFields.push("bathrooms"); }
      }
      const roomsStr = H.findValueByLabel(doc, [/(?:nombre\s+de\s+)?pièces?/i, /nombre\s+de\s+pieces?/i]);
      if (roomsStr) {
        const m = roomsStr.match(/\d+/);
        if (m) { result.rooms = Number(m[0]); result._foundFields.push("rooms"); }
      }
    }

    // ── 10. Revenus bruts (locatif) ───────────────────────────────
    if (H.findValueByLabel) {
      const grossStr = H.findValueByLabel(doc, [/revenus?\s+bruts?\s+(?:potentiels?\s+)?annuels?/i, /revenus?\s+totaux/i]);
      if (grossStr) {
        const v = parseMoney(grossStr);
        if (v != null && v > 1000) {
          result.grossRevenue = v;
          result._foundFields.push("grossRevenue");
        }
      }
    }

    // ── 11. Score de confiance ────────────────────────────────────
    let score = 0;
    if (result.price != null) score += 30;
    if (result.address) score += 20;
    if (result.propertyType) score += 10;
    if (result.municipalTax != null) score += 10;
    if (result.schoolTax != null) score += 5;
    if (result.municipalAssessment != null) score += 10;
    if (result.year) score += 5;
    if (result.livingAreaSqft) score += 5;
    if (result.description) score += 5;
    result._confidence = Math.min(100, score);

    return result;
  }

  // Expose au global
  window.parseDuProprioHTML = parseDuProprioHTML;
})();
