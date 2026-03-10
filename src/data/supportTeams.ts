export interface SupportTeamRecord {
  id: string;
  name: string;
  specialties: string[];
  active: boolean;
}

export const supportTeams: SupportTeamRecord[] = [
  { id: 'st-001', name: 'Contact Center', specialties: ['atencion_general', 'primer_contacto'], active: true },
  { id: 'st-002', name: 'Mesa de ayuda', specialties: ['soporte_general', 'consultas_tecnicas'], active: true },
  { id: 'st-003', name: 'Atención al cliente', specialties: ['clientes', 'reclamos', 'seguimiento'], active: true },
  { id: 'st-004', name: 'Comercial', specialties: ['ventas', 'pedidos', 'precios'], active: true },
  { id: 'st-005', name: 'Calidad Técnico', specialties: ['calidad_producto', 'analisis_reclamos', 'producto_calidad'], active: true },
  { id: 'st-006', name: 'Formulación y Desarrollo', specialties: ['producto_formulacion', 'nutricion', 'desarrollo'], active: true },
  { id: 'st-007', name: 'Créditos y Cobranzas', specialties: ['facturacion', 'cobranzas', 'notas_credito'], active: true },
  { id: 'st-008', name: 'Logística', specialties: ['entregas', 'distribucion', 'despacho', 'retiros'], active: true },
  { id: 'st-009', name: 'Administración Operativa', specialties: ['administracion', 'documentacion', 'operaciones'], active: true },
];
