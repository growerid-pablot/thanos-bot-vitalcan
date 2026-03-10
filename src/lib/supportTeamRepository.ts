import { supportTeams, type SupportTeamRecord } from '@/data/supportTeams';

export function getAllSupportTeams(): SupportTeamRecord[] {
  return supportTeams.filter(t => t.active);
}

export function getSupportTeamBySpecialty(specialty: string): SupportTeamRecord | null {
  const q = specialty.toLowerCase();
  return supportTeams.find(t =>
    t.specialties.some(s => s.includes(q) || q.includes(s))
  ) ?? null;
}

export function getSupportTeamByName(name: string): SupportTeamRecord | null {
  const q = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  return supportTeams.find(t =>
    t.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
  ) ?? null;
}

export function getSupportTeamsForClaimCategory(claimCategory: string): SupportTeamRecord[] {
  const categoryToSpecialty: Record<string, string[]> = {
    producto_calidad: ['calidad_producto', 'analisis_reclamos'],
    producto_envase: ['calidad_producto'],
    producto_contenido: ['calidad_producto', 'producto_formulacion'],
    salud_nutricion: ['producto_formulacion', 'nutricion'],
    facturacion: ['facturacion', 'cobranzas'],
    documentacion: ['documentacion', 'administracion'],
    logistica: ['entregas', 'distribucion', 'despacho'],
    atencion_comercial: ['ventas', 'clientes'],
    otros: ['clientes', 'reclamos'],
  };

  const specialties = categoryToSpecialty[claimCategory] || ['clientes'];
  return supportTeams.filter(t =>
    t.specialties.some(s => specialties.includes(s))
  );
}
