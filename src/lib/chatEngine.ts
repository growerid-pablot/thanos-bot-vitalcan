// ─── Types ───────────────────────────────────────────────────────────────────

export type ConversationState =
  | 'initial'
  | 'main_menu'
  | 'claim_menu'
  // Product claim states
  | 'product_claim_product_name'
  | 'product_claim_product_confirm'
  | 'product_claim_lot_number'
  | 'product_claim_lot_missing'
  | 'product_claim_packaging_date'
  | 'product_claim_packaging_missing'
  | 'product_claim_expiry_date'
  | 'product_claim_expiry_missing'
  | 'product_claim_reason'
  | 'product_claim_reason_confirm'
  | 'product_claim_purchase_location'
  | 'product_claim_summary'
  | 'product_claim_edit_select'
  // Billing claim states
  | 'billing_claim_invoice_date'
  | 'billing_claim_invoice_number'
  | 'billing_claim_reason'
  | 'billing_claim_summary'
  | 'billing_claim_edit_select'
  // Delivery claim states
  | 'delivery_claim_waybill_number'
  | 'delivery_claim_delivery_date'
  | 'delivery_claim_reason'
  | 'delivery_claim_summary'
  | 'delivery_claim_edit_select'
  // Misc
  | 'awaiting_customer_id_for_price_list'
  | 'awaiting_customer_id_for_account_status'
  | 'awaiting_customer_id_for_sales_order'
  | 'completed_step';

export interface ClaimData {
  product?: string | null;
  lot?: string | null;
  packagingDate?: string | null;
  expiryDate?: string | null;
  reason?: string | null;
  reasonFormatted?: string | null;
  purchaseLocation?: string | null;
  // billing
  invoiceDate?: string | null;
  invoiceNumber?: string | null;
  // delivery
  waybillNumber?: string | null;
  deliveryDate?: string | null;
  // track where we came from for edits
  editReturnState?: ConversationState;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

export interface BotResponse {
  messages: string[];
  quickReplies?: string[];
  nextState: ConversationState;
  claimData?: ClaimData;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let messageCounter = 0;
export function createMessage(sender: 'user' | 'bot', text: string, quickReplies?: string[]): Message {
  return {
    id: `msg-${Date.now()}-${messageCounter++}`,
    sender,
    text,
    timestamp: new Date(),
    quickReplies,
  };
}

let claimCounter = 45800;
function generateClaimNumber(): string {
  claimCounter += Math.floor(Math.random() * 5) + 1;
  return `REC-${claimCounter}`;
}

// ─── Validators ──────────────────────────────────────────────────────────────

function isValidLot(v: string): boolean {
  return /^[a-zA-Z0-9\-]{1,12}$/.test(v.trim());
}

function isValidDate(v: string): boolean {
  const m = v.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) return false;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2030) return false;
  return true;
}

function isMissingDataResponse(input: string): boolean {
  const lower = input.toLowerCase();
  const patterns = ['no lo tengo', 'no tengo', 'no encuentro', 'no lo veo', 'no dispongo', 'no sé', 'no se', 'no lo sé', 'no recuerdo', 'no me acuerdo'];
  return patterns.some(p => lower.includes(p));
}

function isShortReason(v: string): boolean {
  return v.trim().length < 15;
}

// ─── Product catalog (simulated) ────────────────────────────────────────────

const PRODUCT_CATALOG = [
  'Vitalcan Complete Adulto Razas Medianas y Grandes',
  'Vitalcan Complete Adulto Razas Pequeñas',
  'Vitalcan Complete Cachorro Razas Medianas y Grandes',
  'Vitalcan Complete Cachorro Razas Pequeñas',
  'Vitalcan V50 Adulto',
  'Vitalcan V50 Cachorro',
  'Vitalcan Balanced Gato Adulto',
  'Vitalcan Balanced Gato Cachorro',
  'Vitalcan Therapy Gastrointestinal',
  'Vitalcan Therapy Renal',
];

function findProduct(input: string): string | null {
  const lower = input.toLowerCase();
  // Try substring match
  const found = PRODUCT_CATALOG.find(p => p.toLowerCase().includes(lower));
  if (found) return found;
  // Try matching individual words (at least 2 words matching)
  const words = lower.split(/\s+/).filter(w => w.length > 2);
  let best: string | null = null;
  let bestScore = 0;
  for (const p of PRODUCT_CATALOG) {
    const pLower = p.toLowerCase();
    const score = words.filter(w => pLower.includes(w)).length;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return bestScore >= 1 ? best : null;
}

// ─── Reason reformulation (simulated) ───────────────────────────────────────

function reformulateReason(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('olor') || lower.includes('rancio') || lower.includes('podrido') || lower.includes('feo'))
    return 'anomalía en el olor del producto';
  if (lower.includes('envase') || lower.includes('paquete') || lower.includes('roto') || lower.includes('dañado') || lower.includes('abierto'))
    return 'daño o defecto en el envase del producto';
  if (lower.includes('vencid') || lower.includes('fecha') || lower.includes('expirad'))
    return 'producto vencido o con fecha de vencimiento irregular';
  if (lower.includes('moho') || lower.includes('hongo') || lower.includes('bicho') || lower.includes('insecto') || lower.includes('gusano'))
    return 'presencia de contaminación o cuerpo extraño en el producto';
  if (lower.includes('color') || lower.includes('aspecto') || lower.includes('textura') || lower.includes('consistencia'))
    return 'anomalía en el aspecto o consistencia del producto';
  if (lower.includes('calidad') || lower.includes('malo') || lower.includes('mal'))
    return 'inconveniente detectado en la calidad del producto';
  if (lower.includes('cantidad') || lower.includes('peso') || lower.includes('menos') || lower.includes('falta'))
    return 'diferencia en la cantidad o peso del producto';
  return 'inconveniente detectado en la calidad o condición del producto';
}

// ─── Menus ───────────────────────────────────────────────────────────────────

const MAIN_MENU_OPTIONS = [
  'Realizar un reclamo',
  'Consultar lista de precios',
  'Consultar cuenta corriente',
  'Realizar un pedido de venta',
];

const CLAIM_OPTIONS = [
  'Reclamo sobre productos',
  'Reclamo sobre facturación',
  'Reclamo sobre entregas',
];

// ─── Main entry point ────────────────────────────────────────────────────────

export function getInitialBotResponse(): BotResponse {
  return {
    messages: [
      '¡Hola! Soy Thanos, el asistente virtual de Vitalcan. Estoy acá para ayudarte con reclamos, consultas y gestiones comerciales. Decime qué necesitás hacer y te voy guiando paso a paso.',
    ],
    quickReplies: MAIN_MENU_OPTIONS,
    nextState: 'main_menu',
  };
}

export function processUserInput(state: ConversationState, input: string, claimData?: ClaimData): BotResponse {
  const data = claimData ?? {};

  switch (state) {
    case 'initial':
      return getInitialBotResponse();
    case 'main_menu':
      return handleMainMenu(input);
    case 'claim_menu':
      return handleClaimMenu(input);

    // ── Product claim ─────────────────────────────────────────────────────
    case 'product_claim_product_name':
      return handleProductName(input, data);
    case 'product_claim_product_confirm':
      return handleProductConfirm(input, data);
    case 'product_claim_lot_number':
      return handleLotNumber(input, data);
    case 'product_claim_lot_missing':
      return handleLotMissing(input, data);
    case 'product_claim_packaging_date':
      return handlePackagingDate(input, data);
    case 'product_claim_packaging_missing':
      return handlePackagingMissing(input, data);
    case 'product_claim_expiry_date':
      return handleExpiryDate(input, data);
    case 'product_claim_expiry_missing':
      return handleExpiryMissing(input, data);
    case 'product_claim_reason':
      return handleProductReason(input, data);
    case 'product_claim_reason_confirm':
      return handleProductReasonConfirm(input, data);
    case 'product_claim_purchase_location':
      return handlePurchaseLocation(input, data);
    case 'product_claim_summary':
      return handleProductSummary(input, data);
    case 'product_claim_edit_select':
      return handleProductEditSelect(input, data);

    // ── Billing claim ─────────────────────────────────────────────────────
    case 'billing_claim_invoice_date':
      return handleBillingInvoiceDate(input, data);
    case 'billing_claim_invoice_number':
      return handleBillingInvoiceNumber(input, data);
    case 'billing_claim_reason':
      return handleBillingReason(input, data);
    case 'billing_claim_summary':
      return handleBillingSummary(input, data);
    case 'billing_claim_edit_select':
      return handleBillingEditSelect(input, data);

    // ── Delivery claim ────────────────────────────────────────────────────
    case 'delivery_claim_waybill_number':
      return handleDeliveryWaybill(input, data);
    case 'delivery_claim_delivery_date':
      return handleDeliveryDate(input, data);
    case 'delivery_claim_reason':
      return handleDeliveryReason(input, data);
    case 'delivery_claim_summary':
      return handleDeliverySummary(input, data);
    case 'delivery_claim_edit_select':
      return handleDeliveryEditSelect(input, data);

    // ── Customer ID flows ─────────────────────────────────────────────────
    case 'awaiting_customer_id_for_price_list':
    case 'awaiting_customer_id_for_account_status':
    case 'awaiting_customer_id_for_sales_order': {
      const label =
        state === 'awaiting_customer_id_for_price_list' ? 'consulta de lista de precios' :
        state === 'awaiting_customer_id_for_account_status' ? 'consulta de cuenta corriente' :
        'pedido de venta';
      return {
        messages: [
          'Perfecto, ya recibí tu información. ✅',
          `En esta demo dejamos el flujo preparado hasta este punto, mostrando cómo Thanos identifica al cliente antes de continuar con la gestión de ${label}.`,
        ],
        quickReplies: ['Volver al menú principal', 'Finalizar'],
        nextState: 'completed_step',
      };
    }

    case 'completed_step':
      return handleCompletedStep(input);

    default:
      return getInitialBotResponse();
  }
}

// ─── Main menu / claim menu ──────────────────────────────────────────────────

function handleMainMenu(input: string): BotResponse {
  switch (input) {
    case 'Realizar un reclamo':
      return {
        messages: ['Perfecto, vamos a registrar tu reclamo. Indicame por favor sobre qué tipo de reclamo querés avanzar.'],
        quickReplies: CLAIM_OPTIONS,
        nextState: 'claim_menu',
      };
    case 'Consultar lista de precios':
      return { messages: ['Para continuar con tu consulta de lista de precios, por favor indicame tu número de cliente o tu CUIT.'], nextState: 'awaiting_customer_id_for_price_list' };
    case 'Consultar cuenta corriente':
      return { messages: ['Para continuar con tu consulta de cuenta corriente, por favor indicame tu número de cliente o tu CUIT.'], nextState: 'awaiting_customer_id_for_account_status' };
    case 'Realizar un pedido de venta':
      return { messages: ['Para continuar con tu pedido de venta, por favor indicame tu número de cliente o tu CUIT.'], nextState: 'awaiting_customer_id_for_sales_order' };
    default:
      return { messages: ['No entendí tu selección. Por favor elegí una de las opciones disponibles.'], quickReplies: MAIN_MENU_OPTIONS, nextState: 'main_menu' };
  }
}

function handleClaimMenu(input: string): BotResponse {
  switch (input) {
    case 'Reclamo sobre productos':
      return {
        messages: [
          'Entiendo. Vamos a avanzar con tu reclamo sobre productos y te voy a ir guiando paso a paso para registrar toda la información necesaria.',
          'Voy a pedirte información sobre el producto, lote, fechas y motivo del reclamo. Si no tenés alguno de los datos a mano, avisame y te acompaño. 😊',
          'Para comenzar, indicame por favor el nombre del producto.',
        ],
        nextState: 'product_claim_product_name',
        claimData: {},
      };
    case 'Reclamo sobre facturación':
      return {
        messages: [
          'Entiendo. Vamos a avanzar con tu reclamo sobre facturación.',
          'Te voy a pedir algunos datos de la factura y el motivo del inconveniente. Vamos paso a paso.',
          'Indicame por favor la fecha de emisión de la factura.',
        ],
        nextState: 'billing_claim_invoice_date',
        claimData: {},
      };
    case 'Reclamo sobre entregas':
      return {
        messages: [
          'Entiendo. Vamos a avanzar con tu reclamo sobre entrega.',
          'Te voy a pedir algunos datos del remito y el motivo del inconveniente. Vamos paso a paso.',
          'Por favor indicame el número de remito, tal como figura en el comprobante.',
        ],
        nextState: 'delivery_claim_waybill_number',
        claimData: {},
      };
    default:
      return { messages: ['Por favor elegí una de las opciones de reclamo disponibles.'], quickReplies: CLAIM_OPTIONS, nextState: 'claim_menu' };
  }
}

// ─── Edit return helper ──────────────────────────────────────────────────────

function returnToProductSummary(data: ClaimData): BotResponse {
  const cleaned = { ...data, editReturnState: undefined };
  return {
    messages: [
      'Dato actualizado. ✅ Este es el resumen actualizado:',
      formatProductSummary(cleaned),
      '¿Querés confirmar esta información?',
    ],
    quickReplies: ['Confirmar reclamo', 'Editar datos'],
    nextState: 'product_claim_summary',
    claimData: cleaned,
  };
}

function returnToBillingSummary(data: ClaimData): BotResponse {
  const cleaned = { ...data, editReturnState: undefined };
  return {
    messages: [
      'Dato actualizado. ✅ Este es el resumen actualizado:',
      formatBillingSummary(cleaned),
      '¿Querés confirmar esta información?',
    ],
    quickReplies: ['Confirmar reclamo', 'Editar datos'],
    nextState: 'billing_claim_summary',
    claimData: cleaned,
  };
}

function returnToDeliverySummary(data: ClaimData): BotResponse {
  const cleaned = { ...data, editReturnState: undefined };
  return {
    messages: [
      'Dato actualizado. ✅ Este es el resumen actualizado:',
      formatDeliverySummary(cleaned),
      '¿Querés confirmar esta información?',
    ],
    quickReplies: ['Confirmar reclamo', 'Editar datos'],
    nextState: 'delivery_claim_summary',
    claimData: cleaned,
  };
}

// ─── Product claim handlers ──────────────────────────────────────────────────

function handleProductName(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 3) {
    return {
      messages: ['El nombre del producto parece muy corto. ¿Podrías indicarme el nombre completo tal como figura en el envase?'],
      nextState: 'product_claim_product_name',
      claimData: data,
    };
  }
  const found = findProduct(trimmed);
  const productName = found ?? trimmed;
  const updated = { ...data, product: productName };

  if (found) {
    return {
      messages: [
        '🔍 Buscando el producto en la base de datos...',
        `Encontré este producto: **${found}**. ¿Es correcto?`,
      ],
      quickReplies: ['Sí, es correcto', 'No, quiero corregirlo'],
      nextState: 'product_claim_product_confirm',
      claimData: updated,
    };
  }
  return {
    messages: [
      '🔍 Buscando el producto en la base de datos...',
      `No encontré una coincidencia exacta, pero voy a registrarlo como: **${trimmed}**. ¿Es correcto?`,
    ],
    quickReplies: ['Sí, es correcto', 'No, quiero corregirlo'],
    nextState: 'product_claim_product_confirm',
    claimData: updated,
  };
}

function handleProductConfirm(input: string, data: ClaimData): BotResponse {
  if (input === 'Sí, es correcto' || input.toLowerCase().includes('si') || input.toLowerCase().includes('sí') || input.toLowerCase() === 'correcto') {
    if (data.editReturnState === 'product_claim_summary') {
      return returnToProductSummary(data);
    }
    return {
      messages: [
        `Perfecto, producto registrado. ✅`,
        'Ahora indicame por favor el número de lote del producto. Podés encontrarlo impreso en el envase o dentro del paquete.',
      ],
      nextState: 'product_claim_lot_number',
      claimData: data,
    };
  }
  return {
    messages: ['Perfecto, volvé a indicarme por favor el nombre del producto tal como figura en el envase.'],
    nextState: 'product_claim_product_name',
    claimData: { ...data, product: null },
  };
}

function handleLotNumber(input: string, data: ClaimData): BotResponse {
  if (isMissingDataResponse(input)) {
    return {
      messages: [
        'No hay problema. El número de lote suele encontrarse impreso en el envase o dentro del paquete. Si querés, podés revisarlo y seguimos. Si no lo tenés disponible ahora, podemos avanzar dejando ese dato pendiente.',
      ],
      quickReplies: ['Lo busco y continúo', 'Seguir sin ese dato'],
      nextState: 'product_claim_lot_missing',
      claimData: data,
    };
  }
  const trimmed = input.trim();
  if (!isValidLot(trimmed)) {
    return {
      messages: ['El número de lote debe ser alfanumérico y de hasta 12 caracteres (letras, números y guiones). Por favor, volvé a ingresarlo tal como figura en el envase.'],
      nextState: 'product_claim_lot_number',
      claimData: data,
    };
  }
  const updated = { ...data, lot: trimmed };
  if (data.editReturnState === 'product_claim_summary') {
    return returnToProductSummary(updated);
  }
  return {
    messages: [
      `Perfecto, lote **${trimmed}** registrado. ✅`,
      'Ahora indicame la fecha de envasado. También podés encontrarla en el envase o dentro del paquete. Formato esperado: DD/MM/AAAA.',
    ],
    nextState: 'product_claim_packaging_date',
    claimData: updated,
  };
}

function handleLotMissing(input: string, data: ClaimData): BotResponse {
  if (input === 'Lo busco y continúo') {
    return {
      messages: ['Dale, cuando lo tengas escribilo acá y continuamos. 👍'],
      nextState: 'product_claim_lot_number',
      claimData: data,
    };
  }
  // "Seguir sin ese dato" or anything else
  return {
    messages: [
      'Entendido, seguimos sin el número de lote. Podemos incorporarlo más adelante si lo encontrás.',
      'Ahora indicame la fecha de envasado. Podés encontrarla en el envase o dentro del paquete. Formato esperado: DD/MM/AAAA.',
    ],
    nextState: 'product_claim_packaging_date',
    claimData: { ...data, lot: '(pendiente)' },
  };
}

function handlePackagingDate(input: string, data: ClaimData): BotResponse {
  if (isMissingDataResponse(input)) {
    return {
      messages: ['No hay problema. La fecha de envasado suele estar impresa en el envase o dentro del paquete. Si no la tenés disponible ahora, puedo continuar y dejar ese dato pendiente.'],
      quickReplies: ['La busco y continúo', 'Seguir sin ese dato'],
      nextState: 'product_claim_packaging_missing',
      claimData: data,
    };
  }
  if (!isValidDate(input)) {
    return {
      messages: ['La fecha de envasado debe informarse con formato de fecha. Por ejemplo: **15/03/2026**. Por favor, escribila nuevamente de esa manera.'],
      nextState: 'product_claim_packaging_date',
      claimData: data,
    };
  }
  const updated = { ...data, packagingDate: input.trim() };
  if (data.editReturnState === 'product_claim_summary') {
    return returnToProductSummary(updated);
  }
  return {
    messages: [
      `Perfecto, fecha de envasado registrada: **${input.trim()}**. ✅`,
      'Ahora indicame por favor la fecha de vencimiento del producto. Formato esperado: DD/MM/AAAA.',
    ],
    nextState: 'product_claim_expiry_date',
    claimData: updated,
  };
}

function handlePackagingMissing(input: string, data: ClaimData): BotResponse {
  if (input === 'La busco y continúo') {
    return {
      messages: ['Dale, cuando la tengas escribila acá y continuamos. 👍'],
      nextState: 'product_claim_packaging_date',
      claimData: data,
    };
  }
  return {
    messages: [
      'Entendido, seguimos sin la fecha de envasado.',
      'Ahora indicame por favor la fecha de vencimiento del producto. Formato esperado: DD/MM/AAAA.',
    ],
    nextState: 'product_claim_expiry_date',
    claimData: { ...data, packagingDate: '(pendiente)' },
  };
}

function handleExpiryDate(input: string, data: ClaimData): BotResponse {
  if (isMissingDataResponse(input)) {
    return {
      messages: ['No hay problema. La fecha de vencimiento suele estar impresa en el envase. Si no la tenés ahora, podemos avanzar y dejarla pendiente.'],
      quickReplies: ['La busco y continúo', 'Seguir sin ese dato'],
      nextState: 'product_claim_expiry_missing',
      claimData: data,
    };
  }
  if (!isValidDate(input)) {
    return {
      messages: ['La fecha de vencimiento debe ingresarse con formato de fecha. Por ejemplo: **20/11/2026**. Por favor, ingresala nuevamente.'],
      nextState: 'product_claim_expiry_date',
      claimData: data,
    };
  }
  const updated = { ...data, expiryDate: input.trim() };
  if (data.editReturnState === 'product_claim_summary') {
    return returnToProductSummary(updated);
  }
  return {
    messages: [
      `Perfecto, fecha de vencimiento registrada: **${input.trim()}**. ✅`,
      'Ahora contame brevemente cuál es el motivo de tu reclamo. Si querés, podés adjuntar una imagen que nos ayude a entender mejor el problema. 📷',
    ],
    nextState: 'product_claim_reason',
    claimData: updated,
  };
}

function handleExpiryMissing(input: string, data: ClaimData): BotResponse {
  if (input === 'La busco y continúo') {
    return {
      messages: ['Dale, cuando la tengas escribila acá y continuamos. 👍'],
      nextState: 'product_claim_expiry_date',
      claimData: data,
    };
  }
  return {
    messages: [
      'Entendido, seguimos sin la fecha de vencimiento.',
      'Ahora contame brevemente cuál es el motivo de tu reclamo. Si querés, podés adjuntar una imagen que nos ayude a entender mejor el problema. 📷',
    ],
    nextState: 'product_claim_reason',
    claimData: { ...data, expiryDate: '(pendiente)' },
  };
}

function handleProductReason(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 3) {
    return {
      messages: ['Por favor, contame un poco más sobre qué ocurrió con el producto para poder registrar correctamente el reclamo.'],
      nextState: 'product_claim_reason',
      claimData: data,
    };
  }
  if (isShortReason(trimmed)) {
    return {
      messages: ['Gracias. Para poder registrar correctamente el reclamo, ¿podrías contarme un poco más sobre qué ocurrió con el producto?'],
      nextState: 'product_claim_reason',
      claimData: data,
    };
  }
  const formatted = reformulateReason(trimmed);
  return {
    messages: [
      `Entiendo. Voy a registrar el motivo del reclamo como: **${formatted}**. ¿Es correcto?`,
    ],
    quickReplies: ['Sí, correcto', 'No, quiero corregirlo'],
    nextState: 'product_claim_reason_confirm',
    claimData: { ...data, reason: trimmed, reasonFormatted: formatted },
  };
}

function handleProductReasonConfirm(input: string, data: ClaimData): BotResponse {
  if (input === 'Sí, correcto' || input.toLowerCase().includes('si') || input.toLowerCase().includes('sí') || input.toLowerCase() === 'correcto') {
    if (data.editReturnState === 'product_claim_summary') {
      return returnToProductSummary(data);
    }
    return {
      messages: ['Perfecto, motivo registrado. ✅', 'Por último, indicame dónde realizaste la compra del producto.'],
      nextState: 'product_claim_purchase_location',
      claimData: data,
    };
  }
  return {
    messages: ['Perfecto, contame nuevamente el motivo de tu reclamo con tus palabras.'],
    nextState: 'product_claim_reason',
    claimData: { ...data, reason: null, reasonFormatted: null },
  };
}

function handlePurchaseLocation(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return {
      messages: ['¿Podrías indicarme el nombre del comercio o el canal de compra?'],
      nextState: 'product_claim_purchase_location',
      claimData: data,
    };
  }
  const updated = { ...data, purchaseLocation: trimmed };
  return {
    messages: [
      `Perfecto. Este es el resumen de la información registrada para tu reclamo:`,
      formatProductSummary(updated),
      '¿Querés confirmar esta información?',
    ],
    quickReplies: ['Confirmar reclamo', 'Editar datos'],
    nextState: 'product_claim_summary',
    claimData: updated,
  };
}

function formatProductSummary(d: ClaimData): string {
  return [
    `📋 **Resumen del reclamo**`,
    `• **Producto:** ${d.product ?? '(pendiente)'}`,
    `• **Lote:** ${d.lot ?? '(pendiente)'}`,
    `• **Fecha de envasado:** ${d.packagingDate ?? '(pendiente)'}`,
    `• **Fecha de vencimiento:** ${d.expiryDate ?? '(pendiente)'}`,
    `• **Motivo:** ${d.reasonFormatted ?? d.reason ?? '(pendiente)'}`,
    `• **Lugar de compra:** ${d.purchaseLocation ?? '(pendiente)'}`,
  ].join('\n');
}

function handleProductSummary(input: string, data: ClaimData): BotResponse {
  if (input === 'Confirmar reclamo' || input.toLowerCase().includes('confirmar')) {
    const num = generateClaimNumber();
    return {
      messages: [
        `¡Perfecto! Tu reclamo sobre productos fue ingresado exitosamente con el número **${num}**. 📋`,
        'En breve, un asesor de Vitalcan se va a comunicar con vos para dar resolución al mismo. ¡Gracias por tu paciencia!',
      ],
      quickReplies: ['Volver al menú principal', 'Finalizar'],
      nextState: 'completed_step',
      claimData: {},
    };
  }
  if (input === 'Editar datos' || input.toLowerCase().includes('editar')) {
    return {
      messages: ['¿Qué dato querés corregir?'],
      quickReplies: ['Producto', 'Lote', 'Fecha de envasado', 'Fecha de vencimiento', 'Motivo', 'Lugar de compra'],
      nextState: 'product_claim_edit_select',
      claimData: data,
    };
  }
  return {
    messages: ['Por favor seleccioná una opción.'],
    quickReplies: ['Confirmar reclamo', 'Editar datos'],
    nextState: 'product_claim_summary',
    claimData: data,
  };
}

function handleProductEditSelect(input: string, data: ClaimData): BotResponse {
  const map: Record<string, { msg: string; state: ConversationState; clear: Partial<ClaimData> }> = {
    'Producto': { msg: 'Indicame el nombre correcto del producto.', state: 'product_claim_product_name', clear: { product: null } },
    'Lote': { msg: 'Indicame el número de lote correcto.', state: 'product_claim_lot_number', clear: { lot: null } },
    'Fecha de envasado': { msg: 'Indicame la fecha de envasado correcta. Formato: DD/MM/AAAA.', state: 'product_claim_packaging_date', clear: { packagingDate: null } },
    'Fecha de vencimiento': { msg: 'Indicame la fecha de vencimiento correcta. Formato: DD/MM/AAAA.', state: 'product_claim_expiry_date', clear: { expiryDate: null } },
    'Motivo': { msg: 'Contame nuevamente el motivo de tu reclamo.', state: 'product_claim_reason', clear: { reason: null, reasonFormatted: null } },
    'Lugar de compra': { msg: 'Indicame el lugar de compra correcto.', state: 'product_claim_purchase_location', clear: { purchaseLocation: null } },
  };
  const entry = map[input];
  if (entry) {
    return {
      messages: [entry.msg],
      nextState: entry.state,
      claimData: { ...data, ...entry.clear, editReturnState: 'product_claim_summary' },
    };
  }
  return {
    messages: ['Por favor seleccioná uno de los campos a editar.'],
    quickReplies: ['Producto', 'Lote', 'Fecha de envasado', 'Fecha de vencimiento', 'Motivo', 'Lugar de compra'],
    nextState: 'product_claim_edit_select',
    claimData: data,
  };
}

// ─── Billing claim handlers ──────────────────────────────────────────────────

function handleBillingInvoiceDate(input: string, data: ClaimData): BotResponse {
  if (!isValidDate(input)) {
    return {
      messages: ['La fecha de emisión debe informarse con formato de fecha. Por ejemplo: **05/02/2026**. Por favor, escribila nuevamente.'],
      nextState: 'billing_claim_invoice_date',
      claimData: data,
    };
  }
  const updated = { ...data, invoiceDate: input.trim() };
  if (data.editReturnState === 'billing_claim_summary') {
    return returnToBillingSummary(updated);
  }
  return {
    messages: ['Perfecto, fecha registrada. ✅', 'Ahora decime el número de factura, tal como figura en el comprobante.'],
    nextState: 'billing_claim_invoice_number',
    claimData: updated,
  };
}

function handleBillingInvoiceNumber(input: string, data: ClaimData): BotResponse {
  if (input.trim().length < 3) {
    return {
      messages: ['El número de factura parece incompleto. Por favor, ingresalo tal como figura en el comprobante.'],
      nextState: 'billing_claim_invoice_number',
      claimData: data,
    };
  }
  const updated = { ...data, invoiceNumber: input.trim() };
  if (data.editReturnState === 'billing_claim_summary') {
    return returnToBillingSummary(updated);
  }
  return {
    messages: ['Gracias. Ahora contame brevemente el motivo de tu reclamo sobre facturación. Si querés, podés adjuntar una imagen del comprobante. 📷'],
    nextState: 'billing_claim_reason',
    claimData: updated,
  };
}

function handleBillingReason(input: string, data: ClaimData): BotResponse {
  if (input.trim().length < 5) {
    return {
      messages: ['¿Podrías contarme un poco más sobre el inconveniente con la facturación?'],
      nextState: 'billing_claim_reason',
      claimData: data,
    };
  }
  const updated = { ...data, reason: input.trim() };
  return {
    messages: [
      'Perfecto. Este es el resumen de tu reclamo de facturación:',
      formatBillingSummary(updated),
      '¿Querés confirmar esta información?',
    ],
    quickReplies: ['Confirmar reclamo', 'Editar datos'],
    nextState: 'billing_claim_summary',
    claimData: updated,
  };
}

function formatBillingSummary(d: ClaimData): string {
  return [
    `📋 **Resumen del reclamo de facturación**`,
    `• **Fecha de factura:** ${d.invoiceDate ?? '(pendiente)'}`,
    `• **Número de factura:** ${d.invoiceNumber ?? '(pendiente)'}`,
    `• **Motivo:** ${d.reason ?? '(pendiente)'}`,
  ].join('\n');
}

function handleBillingSummary(input: string, data: ClaimData): BotResponse {
  if (input === 'Confirmar reclamo' || input.toLowerCase().includes('confirmar')) {
    const num = generateClaimNumber();
    return {
      messages: [
        `¡Perfecto! Tu reclamo sobre facturación fue ingresado con el número **${num}**. 📋`,
        'En breve, un asesor de Vitalcan se va a comunicar con vos para dar resolución al mismo.',
      ],
      quickReplies: ['Volver al menú principal', 'Finalizar'],
      nextState: 'completed_step',
      claimData: {},
    };
  }
  if (input === 'Editar datos' || input.toLowerCase().includes('editar')) {
    return {
      messages: ['¿Qué dato querés corregir?'],
      quickReplies: ['Fecha de factura', 'Número de factura', 'Motivo'],
      nextState: 'billing_claim_edit_select',
      claimData: data,
    };
  }
  return {
    messages: ['Por favor seleccioná una opción.'],
    quickReplies: ['Confirmar reclamo', 'Editar datos'],
    nextState: 'billing_claim_summary',
    claimData: data,
  };
}

function handleBillingEditSelect(input: string, data: ClaimData): BotResponse {
  const map: Record<string, { msg: string; state: ConversationState; clear: Partial<ClaimData> }> = {
    'Fecha de factura': { msg: 'Indicame la fecha de emisión correcta. Formato: DD/MM/AAAA.', state: 'billing_claim_invoice_date', clear: { invoiceDate: null } },
    'Número de factura': { msg: 'Indicame el número de factura correcto.', state: 'billing_claim_invoice_number', clear: { invoiceNumber: null } },
    'Motivo': { msg: 'Contame nuevamente el motivo de tu reclamo.', state: 'billing_claim_reason', clear: { reason: null } },
  };
  const entry = map[input];
  if (entry) {
    return {
      messages: [entry.msg],
      nextState: entry.state,
      claimData: { ...data, ...entry.clear, editReturnState: 'billing_claim_summary' },
    };
  }
  return {
    messages: ['Por favor seleccioná uno de los campos a editar.'],
    quickReplies: ['Fecha de factura', 'Número de factura', 'Motivo'],
    nextState: 'billing_claim_edit_select',
    claimData: data,
  };
}

// ─── Delivery claim handlers ─────────────────────────────────────────────────

function handleDeliveryWaybill(input: string, data: ClaimData): BotResponse {
  if (input.trim().length < 3) {
    return {
      messages: ['El número de remito parece incompleto. Por favor, ingresalo tal como figura en el comprobante.'],
      nextState: 'delivery_claim_waybill_number',
      claimData: data,
    };
  }
  const updated = { ...data, waybillNumber: input.trim() };
  if (data.editReturnState === 'delivery_claim_summary') {
    return returnToDeliverySummary(updated);
  }
  return {
    messages: ['Perfecto, remito registrado. ✅', 'Ahora indicame la fecha de entrega (o la fecha estimada de entrega). Formato: DD/MM/AAAA.'],
    nextState: 'delivery_claim_delivery_date',
    claimData: updated,
  };
}

function handleDeliveryDate(input: string, data: ClaimData): BotResponse {
  if (isMissingDataResponse(input)) {
    return {
      messages: [
        'No hay problema, seguimos sin la fecha de entrega.',
        'Ahora contame brevemente el motivo de tu reclamo sobre la entrega. Si querés, podés adjuntar una imagen del remito. 📷',
      ],
      nextState: 'delivery_claim_reason',
      claimData: { ...data, deliveryDate: '(pendiente)' },
    };
  }
  if (!isValidDate(input)) {
    return {
      messages: ['La fecha debe informarse con formato DD/MM/AAAA. Por ejemplo: **10/03/2026**. Por favor, ingresala nuevamente.'],
      nextState: 'delivery_claim_delivery_date',
      claimData: data,
    };
  }
  return {
    messages: ['Perfecto, fecha registrada. ✅', 'Ahora contame brevemente el motivo de tu reclamo sobre la entrega. Si querés, podés adjuntar una imagen del remito. 📷'],
    nextState: 'delivery_claim_reason',
    claimData: { ...data, deliveryDate: input.trim() },
  };
}

function handleDeliveryReason(input: string, data: ClaimData): BotResponse {
  if (input.trim().length < 5) {
    return {
      messages: ['¿Podrías contarme un poco más sobre el inconveniente con la entrega?'],
      nextState: 'delivery_claim_reason',
      claimData: data,
    };
  }
  const updated = { ...data, reason: input.trim() };
  return {
    messages: [
      'Perfecto. Este es el resumen de tu reclamo de entrega:',
      formatDeliverySummary(updated),
      '¿Querés confirmar esta información?',
    ],
    quickReplies: ['Confirmar reclamo', 'Editar datos'],
    nextState: 'delivery_claim_summary',
    claimData: updated,
  };
}

function formatDeliverySummary(d: ClaimData): string {
  return [
    `📋 **Resumen del reclamo de entrega**`,
    `• **Número de remito:** ${d.waybillNumber ?? '(pendiente)'}`,
    `• **Fecha de entrega:** ${d.deliveryDate ?? '(pendiente)'}`,
    `• **Motivo:** ${d.reason ?? '(pendiente)'}`,
  ].join('\n');
}

function handleDeliverySummary(input: string, data: ClaimData): BotResponse {
  if (input === 'Confirmar reclamo' || input.toLowerCase().includes('confirmar')) {
    const num = generateClaimNumber();
    return {
      messages: [
        `¡Perfecto! Tu reclamo sobre entrega fue ingresado con el número **${num}**. 📋`,
        'En breve, un asesor de Vitalcan se va a comunicar con vos para dar resolución al mismo.',
      ],
      quickReplies: ['Volver al menú principal', 'Finalizar'],
      nextState: 'completed_step',
      claimData: {},
    };
  }
  if (input === 'Editar datos' || input.toLowerCase().includes('editar')) {
    return {
      messages: ['¿Qué dato querés corregir?'],
      quickReplies: ['Número de remito', 'Fecha de entrega', 'Motivo'],
      nextState: 'delivery_claim_edit_select',
      claimData: data,
    };
  }
  return {
    messages: ['Por favor seleccioná una opción.'],
    quickReplies: ['Confirmar reclamo', 'Editar datos'],
    nextState: 'delivery_claim_summary',
    claimData: data,
  };
}

function handleDeliveryEditSelect(input: string, data: ClaimData): BotResponse {
  const map: Record<string, { msg: string; state: ConversationState; clear: Partial<ClaimData> }> = {
    'Número de remito': { msg: 'Indicame el número de remito correcto.', state: 'delivery_claim_waybill_number', clear: { waybillNumber: null } },
    'Fecha de entrega': { msg: 'Indicame la fecha de entrega correcta. Formato: DD/MM/AAAA.', state: 'delivery_claim_delivery_date', clear: { deliveryDate: null } },
    'Motivo': { msg: 'Contame nuevamente el motivo de tu reclamo.', state: 'delivery_claim_reason', clear: { reason: null } },
  };
  const entry = map[input];
  if (entry) {
    return {
      messages: [entry.msg],
      nextState: entry.state,
      claimData: { ...data, ...entry.clear, editReturnState: 'delivery_claim_summary' },
    };
  }
  return {
    messages: ['Por favor seleccioná uno de los campos a editar.'],
    quickReplies: ['Número de remito', 'Fecha de entrega', 'Motivo'],
    nextState: 'delivery_claim_edit_select',
    claimData: data,
  };
}

// ─── Completed step ──────────────────────────────────────────────────────────

function handleCompletedStep(input: string): BotResponse {
  if (input === 'Volver al menú principal') {
    return {
      messages: ['¡Por supuesto! Decime en qué más puedo ayudarte.'],
      quickReplies: MAIN_MENU_OPTIONS,
      nextState: 'main_menu',
    };
  }
  if (input === 'Finalizar') {
    return {
      messages: ['¡Gracias por usar Thanos! Si necesitás algo más, no dudes en escribirme. Que tengas un excelente día. 😊'],
      nextState: 'completed_step',
    };
  }
  return {
    messages: ['¿En qué más puedo ayudarte?'],
    quickReplies: ['Volver al menú principal', 'Finalizar'],
    nextState: 'completed_step',
  };
}

// ─── Demo scenarios ──────────────────────────────────────────────────────────

export const DEMO_SCENARIOS = [
  {
    label: 'Reclamo de producto',
    steps: [
      'Hola',
      'Realizar un reclamo',
      'Reclamo sobre productos',
      'Vitalcan V50 Adulto 20kg',
      'Sí, es correcto',
      'L-2024-0892',
      '15/01/2025',
      '15/07/2025',
      'El producto vino con el envase dañado y con olor rancio. Al abrirlo se notaba un aspecto diferente al habitual.',
      'Sí, correcto',
      'Puppis Palermo',
      'Confirmar reclamo',
    ],
  },
  {
    label: 'Reclamo de facturación',
    steps: [
      'Hola',
      'Realizar un reclamo',
      'Reclamo sobre facturación',
      '03/02/2025',
      'FAC-A-0001-00045892',
      'Me facturaron un monto diferente al pactado con el vendedor.',
      'Confirmar reclamo',
    ],
  },
  {
    label: 'Reclamo de entrega',
    steps: [
      'Hola',
      'Realizar un reclamo',
      'Reclamo sobre entregas',
      'R-0001-00078234',
      '08/03/2026',
      'El pedido llegó incompleto, faltan 2 bultos de los 5 enviados.',
      'Confirmar reclamo',
    ],
  },
  { label: 'Consulta de precios', steps: ['Hola', 'Consultar lista de precios', '20-30567890-4'] },
  { label: 'Cuenta corriente', steps: ['Hola', 'Consultar cuenta corriente', 'Cliente #4521'] },
  { label: 'Pedido de venta', steps: ['Hola', 'Realizar un pedido de venta', '20-27845632-1'] },
];
