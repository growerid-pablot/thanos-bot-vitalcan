export interface ClaimReasonRecord {
  id: string;
  name: string;
  category: string;
  active: boolean;
}

function categorize(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('remito') || n.includes('documentación') || n.includes('comprobante') || n.includes('error de documentación')) return 'documentacion';
  if (n.includes('nc') || n.includes('nota de crédito') || n.includes('precio') || n.includes('descuento') || n.includes('factura') || n.includes('crédito')) return 'facturacion';
  if (n.includes('bichos') || n.includes('hongos') || n.includes('moho') || n.includes('material extraño') || n.includes('objeto') || n.includes('palatabilidad')) return 'producto_calidad';
  if (n.includes('envase') || n.includes('bolsa') || n.includes('lata') || n.includes('pouch') || n.includes('sellad') || n.includes('rotulo') || n.includes('sticker') || n.includes('packaging') || n.includes('menos kilos')) return 'producto_envase';
  if (n.includes('croqueta')) return 'producto_contenido';
  if (n.includes('gastroenteritis') || n.includes('piel') || n.includes('pelo') || n.includes('urinario')) return 'salud_nutricion';
  if (n.includes('descarga') || n.includes('faltante') || n.includes('sobrante') || n.includes('pedido no recibido') || n.includes('palletizado') || n.includes('retiro') || n.includes('rotura')) return 'logistica';
  if (n.includes('vendedor') || n.includes('trato') || n.includes('cambio de vendedor') || n.includes('anulación') || n.includes('pedido')) return 'atencion_comercial';
  return 'otros';
}

export const claimReasons: ClaimReasonRecord[] = [
  { id: 'cr-001', name: 'Solicitud de Remito', category: categorize('Solicitud de Remito'), active: true },
  { id: 'cr-002', name: 'Falta envío de comprobante', category: categorize('Falta envío de comprobante'), active: true },
  { id: 'cr-003', name: 'Error devolución mercadería', category: categorize('Error devolución mercadería'), active: true },
  { id: 'cr-004', name: 'Atención agente Cobranzas', category: categorize('Atención agente Cobranzas'), active: true },
  { id: 'cr-005', name: 'Solicitud de NC', category: categorize('Solicitud de NC'), active: true },
  { id: 'cr-006', name: 'Bichos', category: categorize('Bichos'), active: true },
  { id: 'cr-007', name: 'Hongos/Mohos', category: categorize('Hongos/Mohos'), active: true },
  { id: 'cr-008', name: 'Croquetas', category: categorize('Croquetas'), active: true },
  { id: 'cr-009', name: 'Envase - Bolsa', category: categorize('Envase - Bolsa'), active: true },
  { id: 'cr-010', name: 'Falta Rotulo (Venc/Lote/Elaboración)', category: categorize('Falta Rotulo'), active: true },
  { id: 'cr-011', name: 'Material Extraño - Objetos', category: categorize('Material Extraño - Objetos'), active: true },
  { id: 'cr-012', name: 'Packaging - Menos Kilos', category: categorize('Packaging - Menos Kilos'), active: true },
  { id: 'cr-013', name: 'Envase - Lata', category: categorize('Envase - Lata'), active: true },
  { id: 'cr-014', name: 'Envase - Pouch', category: categorize('Envase - Pouch'), active: true },
  { id: 'cr-015', name: 'Bolsa mal sellada', category: categorize('Bolsa mal sellada'), active: true },
  { id: 'cr-016', name: 'Otros motivos', category: 'otros', active: true },
  { id: 'cr-017', name: 'Gastroenteritis', category: categorize('Gastroenteritis'), active: true },
  { id: 'cr-018', name: 'Problemas Piel y Pelo', category: categorize('Problemas Piel y Pelo'), active: true },
  { id: 'cr-019', name: 'Problemas urinarios', category: categorize('Problemas urinarios'), active: true },
  { id: 'cr-020', name: 'Palatabilidad', category: categorize('Palatabilidad'), active: true },
  { id: 'cr-021', name: 'Rotura', category: categorize('Rotura'), active: true },
  { id: 'cr-022', name: 'Error de descarga - Faltante', category: categorize('Error de descarga - Faltante'), active: true },
  { id: 'cr-023', name: 'Error de descarga - Sobrante', category: categorize('Error de descarga - Sobrante'), active: true },
  { id: 'cr-024', name: 'Pedido no recibido', category: categorize('Pedido no recibido'), active: true },
  { id: 'cr-025', name: 'Bolsas c/sticker s/lata', category: categorize('Bolsas c/sticker'), active: true },
  { id: 'cr-026', name: 'Mal Palletizado', category: categorize('Mal Palletizado'), active: true },
  { id: 'cr-027', name: 'Retiro Mercadería - No realizada', category: categorize('Retiro Mercadería'), active: true },
  { id: 'cr-028', name: 'Error de Documentación', category: categorize('Error de Documentación'), active: true },
  { id: 'cr-029', name: 'Error toma de Pedido', category: categorize('Error toma de Pedido'), active: true },
  { id: 'cr-030', name: 'Retiro Mercadería - No solicitada', category: categorize('Retiro Mercadería'), active: true },
  { id: 'cr-031', name: 'Diferencia de precio', category: categorize('Diferencia de precio'), active: true },
  { id: 'cr-032', name: 'Falta Nota de Crédito - Comercial', category: categorize('Falta Nota de Crédito'), active: true },
  { id: 'cr-033', name: 'Disconforme precio', category: categorize('Disconforme precio'), active: true },
  { id: 'cr-034', name: 'Anulación de Pedido', category: categorize('Anulación de Pedido'), active: true },
  { id: 'cr-035', name: 'Disconforme con el trato del Vendedor', category: categorize('Disconforme con el trato del Vendedor'), active: true },
  { id: 'cr-036', name: 'Cambio de Vendedor', category: categorize('Cambio de Vendedor'), active: true },
  { id: 'cr-037', name: 'Falta descuento en factura', category: categorize('Falta descuento en factura'), active: true },
  { id: 'cr-038', name: 'Análisis de solicitud', category: 'otros', active: true },
];
