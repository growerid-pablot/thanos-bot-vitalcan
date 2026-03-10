import { claimReasons, type ClaimReasonRecord } from '@/data/claimReasons';

export function getAllClaimReasons(): ClaimReasonRecord[] {
  return claimReasons.filter(r => r.active);
}

export function getClaimReasonsByCategory(category: string): ClaimReasonRecord[] {
  return getAllClaimReasons().filter(r => r.category === category);
}

export function findClaimReasonByName(query: string): ClaimReasonRecord | null {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  return claimReasons.find(r => {
    const name = r.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return name.includes(q) || q.includes(name);
  }) ?? null;
}

export function getCategories(): string[] {
  return [...new Set(claimReasons.map(r => r.category))];
}
