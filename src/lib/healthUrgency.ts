// ─── Health urgency detection for product claims ─────────────────────────────
// Detects keywords that may indicate a pet health emergency.
// Does NOT diagnose — only offers priority routing to an advisor.

const HEALTH_ALERT_KEYWORDS: string[] = [
  // Multi-word phrases first (checked as substrings)
  'sangre en materia fecal',
  'vomitos con sangre',
  'no puede caminar',
  'esta sufriendo',
  'está sufriendo',
  'mascota enferma',
  'problema de salud',
  'dificultad para respirar',
  'jadeo excesivo',
  'no quiere comer',
  'no toma agua',
  'no se mueve',
  'esta mal',
  'está mal',
  'muy mal',
  'se desmayo',
  'se desmayó',
  'se intoxico',
  'se intoxicó',
  'se hincho',
  'se hinchó',
  // Single words
  'sangre',
  'sangrado',
  'vomito',
  'vómito',
  'vomita',
  'vomitó',
  'diarrea',
  'convulsion',
  'convulsión',
  'convulsiones',
  'decaido',
  'decaída',
  'decaído',
  'decaimiento',
  'enfermo',
  'enferma',
  'dolor',
  'intoxicacion',
  'intoxicación',
  'urgente',
  'gravedad',
  'grave',
  'malestar',
  'fiebre',
  'temblores',
  'espuma',
  'baba',
  'descompuesto',
  'desmayo',
  'emergencia',
  'respiracion',
  'respiración',
  'alergia',
  'reaccion',
  'reacción',
  'inflamacion',
  'inflamación',
  'lastimado',
  'lesion',
  'lesión',
  'salud',
];

/**
 * Returns true if the text contains keywords suggesting a possible pet health urgency.
 */
export function detectHealthUrgency(text: string): boolean {
  const normalized = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  for (const kw of HEALTH_ALERT_KEYWORDS) {
    const kwNorm = kw
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    if (normalized.includes(kwNorm)) {
      return true;
    }
  }

  return false;
}
