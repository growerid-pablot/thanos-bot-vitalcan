import { products, type ProductRecord } from '@/data/products';

export function getAllProducts(): ProductRecord[] {
  return products.filter(p => p.active);
}

export function searchProducts(query: string): ProductRecord[] {
  const q = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (q.length < 2) return [];

  return getAllProducts().filter(p => {
    const nameMatch = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
    const aliasMatch = p.aliases.some(a => a.includes(q));
    const refMatch = p.internalReference?.toLowerCase().includes(q) ?? false;
    const brandMatch = p.brand.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
    return nameMatch || aliasMatch || refMatch || brandMatch;
  });
}

export function findBestProductMatch(query: string): ProductRecord | null {
  const results = searchProducts(query);
  if (results.length === 0) return null;

  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();
  const qWords = q.split(' ').filter(w => w.length > 1);

  let bestScore = -1;
  let bestProduct: ProductRecord | null = null;

  for (const p of results) {
    const pName = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    let score = 0;

    // Exact match bonus
    if (pName.includes(q)) score += 50;

    // Word match scoring
    for (const word of qWords) {
      if (pName.includes(word)) score += 10;
    }

    // Brand match bonus
    if (p.brand.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)) score += 20;

    // Shorter names are more likely to be the right match (less noise)
    score -= p.name.length * 0.1;

    if (score > bestScore) {
      bestScore = score;
      bestProduct = p;
    }
  }

  return bestProduct;
}

export function getProductsByBrand(brand: string): ProductRecord[] {
  return getAllProducts().filter(p => p.brand.toLowerCase() === brand.toLowerCase());
}

export function getProductsBySpecies(species: 'perro' | 'gato'): ProductRecord[] {
  return getAllProducts().filter(p => p.species === species || p.species === 'ambos');
}
