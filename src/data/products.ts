export interface ProductRecord {
  id: string;
  name: string;
  internalReference: string | null;
  aliases: string[];
  brand: string;
  species: 'perro' | 'gato' | 'ambos' | 'otro';
  category: 'alimento_seco' | 'alimento_humedo' | 'snack' | 'arena' | 'accesorio' | 'otro';
  active: boolean;
}

function generateId(name: string, ref: string | null): string {
  const base = ref || name;
  return base.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
}

function generateAliases(name: string): string[] {
  const normalized = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return [normalized];
}

// Curated catalog of consumer-facing Vitalcan products, filtered from ~6000 rows
export const products: ProductRecord[] = [
  // ═══════════════════════════════════════════
  // BALANCED - Perro Seco
  // ═══════════════════════════════════════════
  { id: 'bal-pe-ad-gde-20kg', name: 'Balanced Perro Adulto Raza Grande x 20 Kg', internalReference: '011723', aliases: generateAliases('Balanced Perro Adulto Raza Grande x 20 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ad-gde-3kg', name: 'Balanced Perro Adulto Raza Grande x 3 Kg', internalReference: '011722', aliases: generateAliases('Balanced Perro Adulto Raza Grande x 3 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ad-gig-20kg', name: 'Balanced Perro Adulto Raza Gigante x 20 Kg', internalReference: '011721', aliases: generateAliases('Balanced Perro Adulto Raza Gigante x 20 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ad-med-20kg', name: 'Balanced Perro Adulto Raza Mediana x 20 Kg', internalReference: '011726', aliases: generateAliases('Balanced Perro Adulto Raza Mediana x 20 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ad-med-12kg', name: 'Balanced Perro Adulto Raza Mediana x 12 Kg', internalReference: '011725', aliases: generateAliases('Balanced Perro Adulto Raza Mediana x 12 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ad-med-3kg', name: 'Balanced Perro Adulto Raza Mediana x 3 Kg', internalReference: '011724', aliases: generateAliases('Balanced Perro Adulto Raza Mediana x 3 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ad-peq-7kg', name: 'Balanced Perro Adulto Raza Pequeña x 7.5 Kg', internalReference: '011728', aliases: generateAliases('Balanced Perro Adulto Raza Pequeña x 7.5 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ad-peq-3kg', name: 'Balanced Perro Adulto Raza Pequeña x 3 Kg', internalReference: '011727', aliases: generateAliases('Balanced Perro Adulto Raza Pequeña x 3 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ad-peq-15kg', name: 'Balanced Perro Adulto Raza Pequeña x 15 Kg', internalReference: '011912', aliases: generateAliases('Balanced Perro Adulto Raza Pequeña x 15 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-cach-gde-20kg', name: 'Balanced Perro Cachorro Raza Grande x 20 Kg', internalReference: '031725', aliases: generateAliases('Balanced Perro Cachorro Raza Grande x 20 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-cach-gde-3kg', name: 'Balanced Perro Cachorro Raza Grande x 3 Kg', internalReference: '031724', aliases: generateAliases('Balanced Perro Cachorro Raza Grande x 3 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-cach-med-20kg', name: 'Balanced Perro Cachorro Raza Mediana x 20 Kg', internalReference: '031728', aliases: generateAliases('Balanced Perro Cachorro Raza Mediana x 20 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-cach-peq-3kg', name: 'Balanced Perro Cachorro Raza Pequeña x 3 Kg', internalReference: '031729', aliases: generateAliases('Balanced Perro Cachorro Raza Pequeña x 3 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-cach-peq-7kg', name: 'Balanced Perro Cachorro Raza Pequeña x 7.5 Kg', internalReference: '031730', aliases: generateAliases('Balanced Perro Cachorro Raza Pequeña x 7.5 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-sr-gde-15kg', name: 'Balanced Perro Senior Raza Grande x 15 Kg', internalReference: '011731', aliases: generateAliases('Balanced Perro Senior Raza Grande x 15 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-sr-gde-3kg', name: 'Balanced Perro Senior Raza Grande x 3 Kg', internalReference: '011730', aliases: generateAliases('Balanced Perro Senior Raza Grande x 3 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-sr-med-12kg', name: 'Balanced Perro Senior Raza Mediana x 12 Kg', internalReference: '011733', aliases: generateAliases('Balanced Perro Senior Raza Mediana x 12 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-sr-peq-3kg', name: 'Balanced Perro Senior Raza Pequeña x 3 Kg', internalReference: '011734', aliases: generateAliases('Balanced Perro Senior Raza Pequeña x 3 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ctrl-peso-20kg', name: 'Balanced Perro Control de Peso x 20 Kg', internalReference: '031733', aliases: generateAliases('Balanced Perro Control de Peso x 20 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bal-pe-ctrl-peso-3kg', name: 'Balanced Perro Control de Peso x 3 Kg', internalReference: '031731', aliases: generateAliases('Balanced Perro Control de Peso x 3 Kg'), brand: 'Balanced', species: 'perro', category: 'alimento_seco', active: true },

  // BALANCED - Gato Seco
  { id: 'bal-ga-ad-7kg', name: 'Balanced Gato Adulto x 7.5 Kg', internalReference: '021705', aliases: generateAliases('Balanced Gato Adulto x 7.5 Kg'), brand: 'Balanced', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bal-ga-ad-2kg', name: 'Balanced Gato Adulto x 2 Kg', internalReference: '021704', aliases: generateAliases('Balanced Gato Adulto x 2 Kg'), brand: 'Balanced', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bal-ga-cp-7kg', name: 'Balanced Gato Control de Peso x 7.5 Kg', internalReference: '021708', aliases: generateAliases('Balanced Gato Control de Peso x 7.5 Kg'), brand: 'Balanced', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bal-ga-kit-7kg', name: 'Balanced Gato Kitten x 7.5 Kg', internalReference: '021711', aliases: generateAliases('Balanced Gato Kitten x 7.5 Kg'), brand: 'Balanced', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bal-ga-kit-2kg', name: 'Balanced Gato Kitten x 2 Kg', internalReference: '021710', aliases: generateAliases('Balanced Gato Kitten x 2 Kg'), brand: 'Balanced', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bal-ga-sr-2kg', name: 'Balanced Gato Senior x 2 Kg', internalReference: '021716', aliases: generateAliases('Balanced Gato Senior x 2 Kg'), brand: 'Balanced', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bal-ga-ph-7kg', name: 'Balanced Gato Control PH x 7.5 Kg', internalReference: '021714', aliases: generateAliases('Balanced Gato Control PH x 7.5 Kg'), brand: 'Balanced', species: 'gato', category: 'alimento_seco', active: true },

  // BALANCED - Natural Recipe Seco
  { id: 'bnr-cerdo-pe-15kg', name: 'Balanced Natural Recipe Cerdo Perro Adulto x 15 Kg', internalReference: '011935', aliases: generateAliases('Balanced Natural Recipe Cerdo Perro Adulto x 15 Kg'), brand: 'Balanced Natural Recipe', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bnr-cerdo-pe-3kg', name: 'Balanced Natural Recipe Cerdo Perro Adulto x 3 Kg', internalReference: '011934', aliases: generateAliases('Balanced Natural Recipe Cerdo Perro Adulto x 3 Kg'), brand: 'Balanced Natural Recipe', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bnr-cord-pe-15kg', name: 'Balanced Natural Recipe Cordero Perro Adulto x 15 Kg', internalReference: '011937', aliases: generateAliases('Balanced Natural Recipe Cordero Perro Adulto x 15 Kg'), brand: 'Balanced Natural Recipe', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bnr-po-pe-15kg', name: 'Balanced Natural Recipe Pollo Perro Adulto x 15 Kg', internalReference: '011929', aliases: generateAliases('Balanced Natural Recipe Pollo Perro Adulto x 15 Kg'), brand: 'Balanced Natural Recipe', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bnr-po-pe-3kg', name: 'Balanced Natural Recipe Pollo Perro Adulto x 3 Kg', internalReference: '011928', aliases: generateAliases('Balanced Natural Recipe Pollo Perro Adulto x 3 Kg'), brand: 'Balanced Natural Recipe', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bnr-sal-pe-15kg', name: 'Balanced Natural Recipe Salmón Perro Adulto x 15 Kg', internalReference: '011933', aliases: generateAliases('Balanced Natural Recipe Salmón Perro Adulto x 15 Kg'), brand: 'Balanced Natural Recipe', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bnr-cord-ga-15kg', name: 'Balanced Natural Recipe Cordero Gato Adulto x 15 Kg', internalReference: '021751', aliases: generateAliases('Balanced Natural Recipe Cordero Gato Adulto x 15 Kg'), brand: 'Balanced Natural Recipe', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bnr-cord-ga-7kg', name: 'Balanced Natural Recipe Cordero Gato Adulto x 7.5 Kg', internalReference: '021750', aliases: generateAliases('Balanced Natural Recipe Cordero Gato Adulto x 7.5 Kg'), brand: 'Balanced Natural Recipe', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bnr-cord-ga-3kg', name: 'Balanced Natural Recipe Cordero Gato Adulto x 3 Kg', internalReference: '021749', aliases: generateAliases('Balanced Natural Recipe Cordero Gato Adulto x 3 Kg'), brand: 'Balanced Natural Recipe', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bnr-po-ga-7kg', name: 'Balanced Natural Recipe Pollo Gato Adulto x 7.5 Kg', internalReference: '021738', aliases: generateAliases('Balanced Natural Recipe Pollo Gato Adulto x 7.5 Kg'), brand: 'Balanced Natural Recipe', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bnr-sal-ga-7kg', name: 'Balanced Natural Recipe Salmón Gato Adulto x 7.5 Kg', internalReference: '021753', aliases: generateAliases('Balanced Natural Recipe Salmón Gato Adulto x 7.5 Kg'), brand: 'Balanced Natural Recipe', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bnr-mer-ga-7kg', name: 'Balanced Natural Recipe Merluza Gato Adulto x 7.5 Kg', internalReference: '021744', aliases: generateAliases('Balanced Natural Recipe Merluza Gato Adulto x 7.5 Kg'), brand: 'Balanced Natural Recipe', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bnr-tru-ga-7kg', name: 'Balanced Natural Recipe Trucha Patagónica Gato Adulto x 7.5 Kg', internalReference: '021741', aliases: generateAliases('Balanced Natural Recipe Trucha Patagónica Gato Adulto x 7.5 Kg'), brand: 'Balanced Natural Recipe', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bnr-ca-pe-15kg', name: 'Balanced Natural Recipe Carne Perro Adulto x 15 Kg', internalReference: '011931', aliases: generateAliases('Balanced Natural Recipe Carne Perro Adulto x 15 Kg'), brand: 'Balanced Natural Recipe', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bnr-ca-pe-3kg', name: 'Balanced Natural Recipe Carne Perro Adulto x 3 Kg', internalReference: '011930', aliases: generateAliases('Balanced Natural Recipe Carne Perro Adulto x 3 Kg'), brand: 'Balanced Natural Recipe', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bnr-ca-ga-7kg', name: 'Balanced Natural Recipe Carne Gato Adulto x 7.5 Kg', internalReference: '021747', aliases: generateAliases('Balanced Natural Recipe Carne Gato Adulto x 7.5 Kg'), brand: 'Balanced Natural Recipe', species: 'gato', category: 'alimento_seco', active: true },

  // BALANCED - Húmedo (Soufflé, Soft Cream, Filetes)
  { id: 'bal-sff-ca-pe-ad-340', name: 'Balanced Soufflé Carne Perro Adulto x 340g', internalReference: '132017', aliases: generateAliases('Balanced Soufflé Carne Perro Adulto x 340g'), brand: 'Balanced', species: 'perro', category: 'alimento_humedo', active: true },
  { id: 'bal-sff-po-pe-ad-340', name: 'Balanced Soufflé Pollo Perro Adulto x 340g', internalReference: '132018', aliases: generateAliases('Balanced Soufflé Pollo Perro Adulto x 340g'), brand: 'Balanced', species: 'perro', category: 'alimento_humedo', active: true },
  { id: 'bal-sff-mer-ga-ad-85', name: 'Balanced Soufflé Merluza Gato Adulto x 85g', internalReference: '132010', aliases: generateAliases('Balanced Soufflé Merluza Gato Adulto x 85g'), brand: 'Balanced', species: 'gato', category: 'alimento_humedo', active: true },
  { id: 'bal-sff-po-ga-ad-340', name: 'Balanced Soufflé Pollo Gato Adulto x 340g', internalReference: '132023', aliases: generateAliases('Balanced Soufflé Pollo Gato Adulto x 340g'), brand: 'Balanced', species: 'gato', category: 'alimento_humedo', active: true },
  { id: 'bnr-sc-ga-cord-85', name: 'Balanced Natural Recipe Soft Cream Gato Cordero x 85g', internalReference: 'L00031', aliases: generateAliases('Balanced Natural Recipe Soft Cream Gato Cordero x 85g'), brand: 'Balanced Natural Recipe', species: 'gato', category: 'alimento_humedo', active: true },
  { id: 'bnr-sc-pe-cord-340', name: 'Balanced Natural Recipe Soft Cream Perro Cordero x 340g', internalReference: 'L00043', aliases: generateAliases('Balanced Natural Recipe Soft Cream Perro Cordero x 340g'), brand: 'Balanced Natural Recipe', species: 'perro', category: 'alimento_humedo', active: true },

  // ═══════════════════════════════════════════
  // COMPLETE - Perro Seco
  // ═══════════════════════════════════════════
  { id: 'cpt-pe-ad-myg-20kg', name: 'Complete Perro Adulto Raza Mediana y Grande x 20 Kg', internalReference: '013777', aliases: generateAliases('Complete Perro Adulto Raza Mediana y Grande x 20 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-ad-myg-3kg', name: 'Complete Perro Adulto Raza Mediana y Grande x 3 Kg', internalReference: '013776', aliases: generateAliases('Complete Perro Adulto Raza Mediana y Grande x 3 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-ad-peq-20kg', name: 'Complete Perro Adulto Raza Pequeña x 20 Kg', internalReference: '013775', aliases: generateAliases('Complete Perro Adulto Raza Pequeña x 20 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-ad-peq-3kg', name: 'Complete Perro Adulto Razas Pequeñas x 3 Kg', internalReference: '013774', aliases: generateAliases('Complete Perro Adulto Razas Pequeñas x 3 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-cach-myg-20kg', name: 'Complete Perro Cachorro Raza Mediana y Grande x 20 Kg', internalReference: '013773', aliases: generateAliases('Complete Perro Cachorro Raza Mediana y Grande x 20 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-cach-myg-3kg', name: 'Complete Perro Cachorro Raza Mediana y Grande x 3 Kg', internalReference: '013772', aliases: generateAliases('Complete Perro Cachorro Raza Mediana y Grande x 3 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-cach-peq-20kg', name: 'Complete Perro Cachorro Raza Pequeña x 20 Kg', internalReference: '013771', aliases: generateAliases('Complete Perro Cachorro Raza Pequeña x 20 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-cach-peq-3kg', name: 'Complete Perro Cachorro Raza Pequeña x 3 Kg', internalReference: '013770', aliases: generateAliases('Complete Perro Cachorro Raza Pequeña x 3 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-ctrl-peso-20kg', name: 'Complete Perro Control Peso x 20 Kg', internalReference: '013781', aliases: generateAliases('Complete Perro Control Peso x 20 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-sr-20kg', name: 'Complete Perro Senior All Breeds x 20 Kg', internalReference: '013779', aliases: generateAliases('Complete Perro Senior All Breeds x 20 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'cpt-pe-sr-3kg', name: 'Complete Perro Senior All Breeds x 3 Kg', internalReference: '013778', aliases: generateAliases('Complete Perro Senior All Breeds x 3 Kg'), brand: 'Complete', species: 'perro', category: 'alimento_seco', active: true },

  // COMPLETE - Gato Seco
  { id: 'cpt-ga-ad-15kg', name: 'Complete Gato Adulto x 15 Kg', internalReference: '025628', aliases: generateAliases('Complete Gato Adulto x 15 Kg'), brand: 'Complete', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'cpt-ga-ad-1kg', name: 'Complete Gato Adulto x 1.5 Kg', internalReference: '025627', aliases: generateAliases('Complete Gato Adulto x 1.5 Kg'), brand: 'Complete', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'cpt-ga-cp-7kg', name: 'Complete Gato Control Peso/Castrado x 7.5 Kg', internalReference: '025630', aliases: generateAliases('Complete Gato Control Peso/Castrado x 7.5 Kg'), brand: 'Complete', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'cpt-ga-kit-7kg', name: 'Complete Gato Kitten x 7.5 Kg', internalReference: '025625', aliases: generateAliases('Complete Gato Kitten x 7.5 Kg'), brand: 'Complete', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'cpt-ga-sr-7kg', name: 'Complete Gato Senior x 7.5 Kg', internalReference: '025632', aliases: generateAliases('Complete Gato Senior x 7.5 Kg'), brand: 'Complete', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'cpt-ga-uri-7kg', name: 'Complete Gato Adulto Urinary Care x 7.5 Kg', internalReference: '025636', aliases: generateAliases('Complete Gato Adulto Urinary Care x 7.5 Kg'), brand: 'Complete', species: 'gato', category: 'alimento_seco', active: true },

  // ═══════════════════════════════════════════
  // PREMIUM - Perro Seco
  // ═══════════════════════════════════════════
  { id: 'pre-pe-ad-20kg', name: 'Premium Perro Adulto x 20 Kg', internalReference: '021300', aliases: generateAliases('Premium Perro Adulto x 20 Kg'), brand: 'Premium', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'pre-pe-ad-3kg', name: 'Premium Perro Adulto x 3 Kg', internalReference: '011201', aliases: generateAliases('Premium Perro Adulto x 3 Kg'), brand: 'Premium', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'pre-pe-ad-rp-20kg', name: 'Premium Perro Adulto Razas Pequeñas x 20 Kg', internalReference: '031121', aliases: generateAliases('Premium Perro Adulto Razas Pequeñas x 20 Kg'), brand: 'Premium', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'pre-pe-ad-rp-7kg', name: 'Premium Perro Adulto Razas Pequeñas x 7.5 Kg', internalReference: '031120', aliases: generateAliases('Premium Perro Adulto Razas Pequeñas x 7.5 Kg'), brand: 'Premium', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'pre-pe-cach-20kg', name: 'Premium Perro Cachorro x 20 Kg', internalReference: '021336', aliases: generateAliases('Premium Perro Cachorro x 20 Kg'), brand: 'Premium', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'pre-pe-cach-3kg', name: 'Premium Perro Cachorro x 3 Kg', internalReference: '021333', aliases: generateAliases('Premium Perro Cachorro x 3 Kg'), brand: 'Premium', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'pre-pe-cord-20kg', name: 'Premium Perro Adulto Cordero x 20 Kg', internalReference: '021307', aliases: generateAliases('Premium Perro Adulto Cordero x 20 Kg'), brand: 'Premium', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'pre-pe-cord-7kg', name: 'Premium Perro Adulto Cordero x 7.5 Kg', internalReference: '021306', aliases: generateAliases('Premium Perro Adulto Cordero x 7.5 Kg'), brand: 'Premium', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'pre-pe-ctrl-peso-20kg', name: 'Premium Perro Adulto Control de Peso x 20 Kg', internalReference: '021342', aliases: generateAliases('Premium Perro Adulto Control de Peso x 20 Kg'), brand: 'Premium', species: 'perro', category: 'alimento_seco', active: true },

  // PREMIUM - Gato Seco
  { id: 'pre-ga-ad-15kg', name: 'Premium Gato Adulto x 15 Kg', internalReference: '021203', aliases: generateAliases('Premium Gato Adulto x 15 Kg'), brand: 'Premium', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'pre-ga-ad-7kg', name: 'Premium Gato Adulto x 7.5 Kg', internalReference: '021202', aliases: generateAliases('Premium Gato Adulto x 7.5 Kg'), brand: 'Premium', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'pre-ga-ad-2kg', name: 'Premium Gato Adulto x 2 Kg', internalReference: '021201', aliases: generateAliases('Premium Gato Adulto x 2 Kg'), brand: 'Premium', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'pre-ga-cach-7kg', name: 'Premium Gato Cachorro x 7.5 Kg', internalReference: '031125', aliases: generateAliases('Premium Gato Cachorro x 7.5 Kg'), brand: 'Premium', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'pre-ga-uri-7kg', name: 'Premium Gato Adulto Urinary x 7.5 Kg', internalReference: '021305', aliases: generateAliases('Premium Gato Adulto Urinary x 7.5 Kg'), brand: 'Premium', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'pre-sal-ga-15kg', name: 'Premium Gato Adulto Salmón x 15 Kg', internalReference: '031138', aliases: generateAliases('Premium Gato Adulto Salmón x 15 Kg'), brand: 'Premium', species: 'gato', category: 'alimento_seco', active: true },

  // PREMIUM - Húmedo (Paté, En su Salsa)
  { id: 'pre-pate-pe-ad-340', name: 'Premium Paté Perro Adulto Carnes x 340g', internalReference: 'L00013', aliases: generateAliases('Premium Paté Perro Adulto Carnes x 340g'), brand: 'Premium', species: 'perro', category: 'alimento_humedo', active: true },
  { id: 'pre-pate-ga-ad-340', name: 'Premium Paté Gato Adulto Carnes x 340g', internalReference: 'L00014', aliases: generateAliases('Premium Paté Gato Adulto Carnes x 340g'), brand: 'Premium', species: 'gato', category: 'alimento_humedo', active: true },
  { id: 'pre-pate-pe-cach-340', name: 'Premium Paté Perro Cachorro Carnes x 340g', internalReference: 'L00015', aliases: generateAliases('Premium Paté Perro Cachorro Carnes x 340g'), brand: 'Premium', species: 'perro', category: 'alimento_humedo', active: true },

  // ═══════════════════════════════════════════
  // NUTRIQUE
  // ═══════════════════════════════════════════
  { id: 'nut-myb-3kg', name: 'Nutrique Mother & Babies Dogs x 3 Kg', internalReference: '070001', aliases: generateAliases('Nutrique Mother & Babies Dogs x 3 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-myb-7kg', name: 'Nutrique Mother & Babies Dogs x 7.5 Kg', internalReference: '070002', aliases: generateAliases('Nutrique Mother & Babies Dogs x 7.5 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-toy-puppy-1kg', name: 'Nutrique Toy & Mini Puppy x 1 Kg', internalReference: '070003', aliases: generateAliases('Nutrique Toy & Mini Puppy x 1 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-toy-puppy-3kg', name: 'Nutrique Toy & Mini Puppy x 3 Kg', internalReference: '070004', aliases: generateAliases('Nutrique Toy & Mini Puppy x 3 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-med-puppy-3kg', name: 'Nutrique Medium Puppy x 3 Kg', internalReference: '070006', aliases: generateAliases('Nutrique Medium Puppy x 3 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-med-puppy-12kg', name: 'Nutrique Medium Puppy x 12 Kg', internalReference: '070007', aliases: generateAliases('Nutrique Medium Puppy x 12 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-large-puppy-15kg', name: 'Nutrique Large Puppy x 15 Kg', internalReference: '070010', aliases: generateAliases('Nutrique Large Puppy x 15 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-giant-puppy-15kg', name: 'Nutrique Giant Puppy x 15 Kg', internalReference: '070011', aliases: generateAliases('Nutrique Giant Puppy x 15 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-toy-yng-ad-3kg', name: 'Nutrique Toy & Mini Young Adult Dog x 3 Kg', internalReference: '070013', aliases: generateAliases('Nutrique Toy & Mini Young Adult Dog x 3 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-med-yng-ad-12kg', name: 'Nutrique Medium Young Adult Dog x 12 Kg', internalReference: '070017', aliases: generateAliases('Nutrique Medium Young Adult Dog x 12 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-large-yng-ad-15kg', name: 'Nutrique Large Young Adult Dog x 15 Kg', internalReference: '070020', aliases: generateAliases('Nutrique Large Young Adult Dog x 15 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-med-7-12kg', name: 'Nutrique Medium Adult 7+ Dog x 12 Kg', internalReference: '070024', aliases: generateAliases('Nutrique Medium Adult 7+ Dog x 12 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-large-6-15kg', name: 'Nutrique Large Adult 6+ Dog x 15 Kg', internalReference: '070026', aliases: generateAliases('Nutrique Large Adult 6+ Dog x 15 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-hw-15kg', name: 'Nutrique Healthy Weight Dog x 15 Kg', internalReference: '070029', aliases: generateAliases('Nutrique Healthy Weight Dog x 15 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-dig-sens-15kg', name: 'Nutrique Digestive Sensitivity Dog x 15 Kg', internalReference: '070031', aliases: generateAliases('Nutrique Digestive Sensitivity Dog x 15 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-skin-sens-15kg', name: 'Nutrique Skin Sensitivity Dog x 15 Kg', internalReference: '070033', aliases: generateAliases('Nutrique Skin Sensitivity Dog x 15 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'nut-active-15kg', name: 'Nutrique Active Behaviour Dog x 15 Kg', internalReference: '070035', aliases: generateAliases('Nutrique Active Behaviour Dog x 15 Kg'), brand: 'Nutrique', species: 'perro', category: 'alimento_seco', active: true },
  // Nutrique Gatos
  { id: 'nut-baby-cat-2kg', name: 'Nutrique Baby Cat & Kitten x 2 Kg', internalReference: '070037', aliases: generateAliases('Nutrique Baby Cat & Kitten x 2 Kg'), brand: 'Nutrique', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'nut-baby-cat-7kg', name: 'Nutrique Baby Cat & Kitten x 7.5 Kg', internalReference: '070038', aliases: generateAliases('Nutrique Baby Cat & Kitten x 7.5 Kg'), brand: 'Nutrique', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'nut-yng-cat-2kg', name: 'Nutrique Young Adult Cat Healthy Maintenance x 2 Kg', internalReference: '070040', aliases: generateAliases('Nutrique Young Adult Cat Healthy Maintenance x 2 Kg'), brand: 'Nutrique', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'nut-yng-cat-str-7kg', name: 'Nutrique Young Adult Cat Sterilised / Healthy Weight x 7.5 Kg', internalReference: '070044', aliases: generateAliases('Nutrique Young Adult Cat Sterilised / Healthy Weight x 7.5 Kg'), brand: 'Nutrique', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'nut-7-cat-2kg', name: 'Nutrique Adult 7+ Cat Healthy Maintenance x 2 Kg', internalReference: '070045', aliases: generateAliases('Nutrique Adult 7+ Cat Healthy Maintenance x 2 Kg'), brand: 'Nutrique', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'nut-dig-cat-2kg', name: 'Nutrique Digestive & Skin Sensitivity Cat x 2 Kg', internalReference: '070048', aliases: generateAliases('Nutrique Digestive & Skin Sensitivity Cat x 2 Kg'), brand: 'Nutrique', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'nut-uri-cat-2kg', name: 'Nutrique Urinary Care Cat x 2 Kg', internalReference: '070049', aliases: generateAliases('Nutrique Urinary Care Cat x 2 Kg'), brand: 'Nutrique', species: 'gato', category: 'alimento_seco', active: true },

  // ═══════════════════════════════════════════
  // THERAPY
  // ═══════════════════════════════════════════
  { id: 'thp-pe-cardiac-2kg', name: 'Therapy Canine Cardiac Health x 2 Kg', internalReference: '040100', aliases: generateAliases('Therapy Canine Cardiac Health x 2 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-cardiac-10kg', name: 'Therapy Canine Cardiac Health x 10 Kg', internalReference: '040101', aliases: generateAliases('Therapy Canine Cardiac Health x 10 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-gastro-2kg', name: 'Therapy Canine Gastrointestinal Aid x 2 Kg', internalReference: '040200', aliases: generateAliases('Therapy Canine Gastrointestinal Aid x 2 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-gastro-10kg', name: 'Therapy Canine Gastrointestinal Aid x 10 Kg', internalReference: '040201', aliases: generateAliases('Therapy Canine Gastrointestinal Aid x 10 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-hypo-2kg', name: 'Therapy Canine Hypoallergenic Care x 2 Kg', internalReference: '040300', aliases: generateAliases('Therapy Canine Hypoallergenic Care x 2 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-hypo-10kg', name: 'Therapy Canine Hypoallergenic Care x 10 Kg', internalReference: '040301', aliases: generateAliases('Therapy Canine Hypoallergenic Care x 10 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-mobility-2kg', name: 'Therapy Canine Mobility Aid x 2 Kg', internalReference: '040400', aliases: generateAliases('Therapy Canine Mobility Aid x 2 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-obesity-2kg', name: 'Therapy Canine Obesity Management x 2 Kg', internalReference: '040500', aliases: generateAliases('Therapy Canine Obesity Management x 2 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-obesity-15kg', name: 'Therapy Canine Obesity Management x 15 Kg', internalReference: '040501', aliases: generateAliases('Therapy Canine Obesity Management x 15 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-renal-2kg', name: 'Therapy Canine Renal Care x 2 Kg', internalReference: '040600', aliases: generateAliases('Therapy Canine Renal Care x 2 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-pe-renal-10kg', name: 'Therapy Canine Renal Care x 10 Kg', internalReference: '040601', aliases: generateAliases('Therapy Canine Renal Care x 10 Kg'), brand: 'Therapy', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'thp-ga-gastro-2kg', name: 'Therapy Feline Gastrointestinal x 2 Kg', internalReference: '050200', aliases: generateAliases('Therapy Feline Gastrointestinal x 2 Kg'), brand: 'Therapy', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'thp-ga-hypo-2kg', name: 'Therapy Feline Hypoallergenic x 2 Kg', internalReference: '050300', aliases: generateAliases('Therapy Feline Hypoallergenic x 2 Kg'), brand: 'Therapy', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'thp-ga-obesity-2kg', name: 'Therapy Feline Obesity x 2 Kg', internalReference: '050500', aliases: generateAliases('Therapy Feline Obesity x 2 Kg'), brand: 'Therapy', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'thp-ga-renal-2kg', name: 'Therapy Feline Renal x 2 Kg', internalReference: '050600', aliases: generateAliases('Therapy Feline Renal x 2 Kg'), brand: 'Therapy', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'thp-ga-urinary-2kg', name: 'Therapy Feline Urinary x 2 Kg', internalReference: '050700', aliases: generateAliases('Therapy Feline Urinary x 2 Kg'), brand: 'Therapy', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'thp-ga-urinary-7kg', name: 'Therapy Feline Urinary x 7.5 Kg', internalReference: '050701', aliases: generateAliases('Therapy Feline Urinary x 7.5 Kg'), brand: 'Therapy', species: 'gato', category: 'alimento_seco', active: true },
  // Therapy Wet
  { id: 'thp-rec-canine-340', name: 'Therapy Recovery Canine x 340g', internalReference: 'L00027', aliases: generateAliases('Therapy Recovery Canine x 340g'), brand: 'Therapy', species: 'perro', category: 'alimento_humedo', active: true },
  { id: 'thp-rec-canine-85', name: 'Therapy Recovery Canine x 85g', internalReference: 'L00028', aliases: generateAliases('Therapy Recovery Canine x 85g'), brand: 'Therapy', species: 'perro', category: 'alimento_humedo', active: true },
  { id: 'thp-rec-feline-340', name: 'Therapy Recovery Feline x 340g', internalReference: 'L00029', aliases: generateAliases('Therapy Recovery Feline x 340g'), brand: 'Therapy', species: 'gato', category: 'alimento_humedo', active: true },
  { id: 'thp-rec-feline-85', name: 'Therapy Recovery Feline x 85g', internalReference: 'L00030', aliases: generateAliases('Therapy Recovery Feline x 85g'), brand: 'Therapy', species: 'gato', category: 'alimento_humedo', active: true },

  // ═══════════════════════════════════════════
  // HOP!
  // ═══════════════════════════════════════════
  { id: 'hop-ga-ad-15kg', name: 'Hop! Gato Adulto x 15 Kg', internalReference: '060105', aliases: generateAliases('Hop! Gato Adulto x 15 Kg'), brand: 'Hop!', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'hop-ga-ad-3kg', name: 'Hop! Gato Adulto x 3 Kg', internalReference: '060104', aliases: generateAliases('Hop! Gato Adulto x 3 Kg'), brand: 'Hop!', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'hop-ga-ad-1kg', name: 'Hop! Gato Adulto x 1 Kg', internalReference: '060103', aliases: generateAliases('Hop! Gato Adulto x 1 Kg'), brand: 'Hop!', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'hop-ga-kit-7kg', name: 'Hop! Gato Kitten x 7.5 Kg', internalReference: '060102', aliases: generateAliases('Hop! Gato Kitten x 7.5 Kg'), brand: 'Hop!', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'hop-pe-ad-myg-21kg', name: 'Hop! Perro Adulto Razas Medianas y Grandes x 21 Kg', internalReference: '060109', aliases: generateAliases('Hop! Perro Adulto Razas Medianas y Grandes x 21 Kg'), brand: 'Hop!', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'hop-pe-ad-myg-7kg', name: 'Hop! Perro Adulto Razas Medianas y Grandes x 7.5 Kg', internalReference: '060108', aliases: generateAliases('Hop! Perro Adulto Razas Medianas y Grandes x 7.5 Kg'), brand: 'Hop!', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'hop-pe-ad-myg-3kg', name: 'Hop! Perro Adulto Razas Medianas y Grandes x 3 Kg', internalReference: '060107', aliases: generateAliases('Hop! Perro Adulto Razas Medianas y Grandes x 3 Kg'), brand: 'Hop!', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'hop-pe-ad-peq-21kg', name: 'Hop! Perro Adulto Razas Pequeñas x 21 Kg', internalReference: '060157', aliases: generateAliases('Hop! Perro Adulto Razas Pequeñas x 21 Kg'), brand: 'Hop!', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'hop-pe-cach-myg-21kg', name: 'Hop! Perro Cachorro Razas Medianas y Grandes x 21 Kg', internalReference: '060156', aliases: generateAliases('Hop! Perro Cachorro Razas Medianas y Grandes x 21 Kg'), brand: 'Hop!', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'hop-pe-cach-peq-21kg', name: 'Hop! Perro Cachorro Razas Pequeñas x 21 Kg', internalReference: '060162', aliases: generateAliases('Hop! Perro Cachorro Razas Pequeñas x 21 Kg'), brand: 'Hop!', species: 'perro', category: 'alimento_seco', active: true },

  // ═══════════════════════════════════════════
  // BELCAN / BELCAT
  // ═══════════════════════════════════════════
  { id: 'bel-pe-ad-15kg', name: 'Belcan Perro Adulto x 15 Kg', internalReference: '012501', aliases: generateAliases('Belcan Perro Adulto x 15 Kg'), brand: 'Belcan', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bel-pe-ad-3kg', name: 'Belcan Perro Adulto x 3 Kg', internalReference: '031135', aliases: generateAliases('Belcan Perro Adulto x 3 Kg'), brand: 'Belcan', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bel-pe-jr-15kg', name: 'Belcan Junior x 15 Kg', internalReference: '032501', aliases: generateAliases('Belcan Junior x 15 Kg'), brand: 'Belcan', species: 'perro', category: 'alimento_seco', active: true },
  { id: 'bel-ga-ad-10kg', name: 'Belcat Gato Adulto x 10 Kg', internalReference: '022501', aliases: generateAliases('Belcat Gato Adulto x 10 Kg'), brand: 'Belcat', species: 'gato', category: 'alimento_seco', active: true },
  { id: 'bel-ga-ad-1kg', name: 'Belcat Gato Adulto x 1 Kg', internalReference: '011800', aliases: generateAliases('Belcat Gato Adulto x 1 Kg'), brand: 'Belcat', species: 'gato', category: 'alimento_seco', active: true },

  // ═══════════════════════════════════════════
  // ARENAS
  // ═══════════════════════════════════════════
  { id: 'arena-carbon-12kg', name: 'Arena Carbón x 12 Kg', internalReference: 'P00019', aliases: generateAliases('Arena Carbón x 12 Kg'), brand: 'Vitalcan', species: 'gato', category: 'arena', active: true },
  { id: 'arena-carbon-6kg', name: 'Arena Carbón x 6 Kg', internalReference: 'P00015', aliases: generateAliases('Arena Carbón x 6 Kg'), brand: 'Vitalcan', species: 'gato', category: 'arena', active: true },
  { id: 'arena-lavanda-12kg', name: 'Arena Lavanda x 12 Kg', internalReference: 'P00018', aliases: generateAliases('Arena Lavanda x 12 Kg'), brand: 'Vitalcan', species: 'gato', category: 'arena', active: true },
  { id: 'arena-lavanda-6kg', name: 'Arena Lavanda x 6 Kg', internalReference: 'P00014', aliases: generateAliases('Arena Lavanda x 6 Kg'), brand: 'Vitalcan', species: 'gato', category: 'arena', active: true },
  { id: 'arena-neutro-12kg', name: 'Arena Neutro x 12 Kg', internalReference: 'P00017', aliases: generateAliases('Arena Neutro x 12 Kg'), brand: 'Vitalcan', species: 'gato', category: 'arena', active: true },
  { id: 'arena-neutro-6kg', name: 'Arena Neutro x 6 Kg', internalReference: 'P00013', aliases: generateAliases('Arena Neutro x 6 Kg'), brand: 'Vitalcan', species: 'gato', category: 'arena', active: true },
];
