// ─── Robust product matching engine ──────────────────────────────────────────
import { products, type ProductRecord } from '@/data/products';

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s\-\/x]+/)
    .filter(t => t.length > 1);
}

function scoreProductMatch(query: string, product: ProductRecord): number {
  const qNorm = normalizeText(query);
  const qTokens = tokenize(query);
  const pName = normalizeText(product.name);
  const pTokens = tokenize(product.name);

  let score = 0;

  // Exact full-name containment (high value)
  if (pName.includes(qNorm)) score += 100;
  if (qNorm.includes(pName)) score += 80;

  // Internal reference exact match
  if (product.internalReference) {
    const refNorm = normalizeText(product.internalReference);
    if (refNorm === qNorm || qNorm.includes(refNorm) || refNorm.includes(qNorm)) {
      score += 120;
    }
  }

  // Token overlap scoring
  let matchedTokens = 0;
  for (const qt of qTokens) {
    // Exact token match
    if (pTokens.some(pt => pt === qt)) {
      score += 15;
      matchedTokens++;
    }
    // Partial token match (startsWith)
    else if (pTokens.some(pt => pt.startsWith(qt) || qt.startsWith(pt))) {
      score += 8;
      matchedTokens++;
    }
    // Substring in full name
    else if (pName.includes(qt)) {
      score += 5;
      matchedTokens++;
    }
  }

  // Bonus for matching a high percentage of query tokens
  if (qTokens.length > 0) {
    const ratio = matchedTokens / qTokens.length;
    score += Math.round(ratio * 30);
  }

  // Alias matching
  for (const alias of product.aliases) {
    const aNorm = normalizeText(alias);
    if (aNorm.includes(qNorm) || qNorm.includes(aNorm)) {
      score += 60;
      break;
    }
    // Token overlap with alias
    const aTokens = tokenize(alias);
    let aliasMatches = 0;
    for (const qt of qTokens) {
      if (aTokens.some(at => at === qt || at.startsWith(qt) || qt.startsWith(at))) {
        aliasMatches++;
      }
    }
    if (aliasMatches > 0) {
      score += aliasMatches * 5;
    }
  }

  // Brand match bonus
  const brandNorm = normalizeText(product.brand);
  if (qTokens.some(qt => brandNorm === qt || brandNorm.startsWith(qt))) {
    score += 10;
  }

  // Prefer shorter names (less noise) — minor factor
  score -= product.name.length * 0.05;

  return score;
}

export function findTopProductMatches(query: string, limit = 5): ProductRecord[] {
  const q = normalizeText(query);
  if (q.length < 2) return [];

  const activeProducts = products.filter(p => p.active);
  const scored = activeProducts
    .map(p => ({ product: p, score: scoreProductMatch(query, p) }))
    .filter(s => s.score > 5)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => s.product);
}

export function findProductByInternalReference(query: string): ProductRecord | null {
  const q = normalizeText(query);
  return products.find(p => p.active && p.internalReference && normalizeText(p.internalReference) === q) ?? null;
}
