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

// Keyword-based scoring to suggest the best claim reasons from user free-text description
const KEYWORD_MAP: Record<string, string[]> = {
  'cr-006': ['bicho', 'bichos', 'insecto', 'insectos', 'gusano', 'gusanos', 'larva', 'larvas', 'plaga'],
  'cr-007': ['hongo', 'hongos', 'moho', 'mohos', 'humedad', 'verdoso', 'manchas verdes'],
  'cr-008': ['croqueta', 'croquetas', 'forma', 'irregulares', 'rotas', 'desarmadas', 'polvo'],
  'cr-009': ['bolsa', 'envase', 'empaque', 'paquete', 'roto', 'rota', 'agujero', 'pinchada', 'rasgada', 'rasgado'],
  'cr-010': ['rotulo', 'etiqueta', 'vencimiento', 'lote', 'elaboracion', 'sin fecha', 'sin lote', 'ilegible'],
  'cr-011': ['objeto', 'objetos', 'material extraño', 'extraño', 'plastico', 'metal', 'piedra', 'vidrio', 'alambre', 'contaminacion'],
  'cr-012': ['peso', 'kilos', 'menos kilos', 'falta', 'faltante', 'liviano', 'packaging', 'incompleto'],
  'cr-013': ['lata', 'latas', 'abollada', 'abollado', 'abolladuras', 'oxidada', 'oxidado'],
  'cr-014': ['pouch', 'sachet', 'sobrecito', 'sachets'],
  'cr-015': ['sellado', 'sellada', 'mal sellada', 'abierta', 'abierto', 'sin cerrar', 'no cierra'],
  'cr-020': ['palatabilidad', 'no come', 'no lo come', 'rechaza', 'no quiere comer', 'olor', 'rancio', 'feo', 'mal olor', 'podrido', 'aspecto'],
  'cr-017': ['gastroenteritis', 'vomito', 'diarrea', 'descompostura', 'descompuesto', 'intoxicacion', 'enfermo', 'mal estado'],
  'cr-018': ['piel', 'pelo', 'pelaje', 'alergia', 'picazon', 'se rasca', 'irritacion', 'dermatitis', 'sarpullido'],
  'cr-019': ['urinario', 'orina', 'pipi', 'rinon', 'renal', 'cistitis'],
  'cr-021': ['rotura', 'roto', 'quebrado', 'dañado', 'destruido'],
  'cr-022': ['faltante', 'faltan', 'descarga', 'no llego', 'incompleto'],
  'cr-023': ['sobrante', 'sobra', 'de mas', 'excedente'],
  'cr-024': ['no recibido', 'no llego', 'no recibi', 'pedido no recibido', 'nunca llego'],
  'cr-026': ['palletizado', 'pallet', 'mal armado', 'mal apilado'],
  'cr-027': ['retiro', 'no retiraron', 'no vinieron', 'no pasaron'],
  'cr-031': ['precio', 'precios', 'diferencia', 'caro', 'cobro de mas'],
  'cr-033': ['disconforme', 'disconformidad', 'no estoy de acuerdo', 'costo'],
  'cr-037': ['descuento', 'factura', 'sin descuento', 'falta descuento'],
  'cr-005': ['nota de credito', 'nc', 'credito'],
  'cr-028': ['documentacion', 'error', 'comprobante'],
  'cr-029': ['pedido', 'error de pedido', 'mal tomado', 'equivocado'],
  'cr-034': ['anulacion', 'anular', 'cancelar'],
  'cr-035': ['vendedor', 'trato', 'maltrato', 'atencion', 'mal atendido'],
  'cr-036': ['cambio de vendedor', 'otro vendedor', 'nuevo vendedor'],
};

export function suggestClaimReasons(description: string): ClaimReasonRecord[] {
  const lower = description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  const words = lower.split(/\s+/);

  const scores: { reason: ClaimReasonRecord; score: number }[] = [];

  for (const reason of getAllClaimReasons()) {
    const keywords = KEYWORD_MAP[reason.id];
    if (!keywords) continue;

    let score = 0;
    for (const kw of keywords) {
      if (kw.includes(' ')) {
        // multi-word keyword: check as substring
        if (lower.includes(kw)) score += 15;
      } else {
        if (words.some(w => w === kw || w.startsWith(kw))) score += 10;
        else if (lower.includes(kw)) score += 5;
      }
    }

    // Also check if the reason name itself appears in the description
    const reasonName = reason.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (lower.includes(reasonName)) score += 20;

    if (score > 0) {
      scores.push({ reason, score });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 3).map(s => s.reason);
}
