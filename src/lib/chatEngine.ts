import { findContactByIdNumber } from './contactRepository';
import { findBestProductMatch, searchProducts } from './productRepository';
import { suggestClaimReasons } from './reasonRepository';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConversationState =
  | 'initial'
  | 'main_menu'
  // CUIT identification states
  | 'awaiting_cuit_for_claim'
  | 'confirm_client_for_claim'
  | 'awaiting_cuit_for_price_list'
  | 'confirm_client_for_price_list'
  | 'awaiting_cuit_for_account'
  | 'confirm_client_for_account'
  | 'awaiting_cuit_for_sales_order'
  | 'confirm_client_for_sales_order'
  | 'claim_menu'
  // Product claim states
  | 'product_claim_product_name'
  | 'product_claim_product_confirm'
  | 'product_claim_product_select'
  | 'product_claim_lot_number'
  | 'product_claim_lot_missing'
  | 'product_claim_packaging_date'
  | 'product_claim_packaging_missing'
  | 'product_claim_expiry_date'
  | 'product_claim_expiry_missing'
  | 'product_claim_reason'
  | 'product_claim_reason_confirm'
  | 'product_claim_reason_suggest'
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
  | 'completed_step';

export interface ClaimData {
  // Client info
  clientName?: string | null;
  clientCuit?: string | null;
  clientIsNew?: boolean;
  // Product claim
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
  // temp for product multi-match
  _productCandidates?: string[];
  // temp for reason alternatives
  _reasonAlternatives?: { id: string; name: string }[];
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

// ─── Claim closure messages ──────────────────────────────────────────────────

function buildClaimClosure(claimType: string, num: string): string[] {
  return [
    `Tu ticket de ${claimType} ya fue ingresado en la base de datos con el número **${num}**. 📋`,
    'Un asesor se va a comunicar con vos para continuar el seguimiento.',
    'Este caso será derivado a Contact Center y luego asignado al equipo correspondiente.',
    '_En esta versión demo la carga se simula localmente, pero en una implementación real el ticket quedaría registrado en el sistema._',
  ];
}

// ─── Client info line for summaries ──────────────────────────────────────────

function clientLine(data: ClaimData): string {
  if (data.clientIsNew || !data.clientName) {
    return `• **Cliente:** Cliente nuevo${data.clientCuit ? ` (CUIT: ${data.clientCuit})` : ''}`;
  }
  return `• **Cliente:** ${data.clientName}${data.clientCuit ? ` (CUIT: ${data.clientCuit})` : ''}`;
}

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

    // ── CUIT identification ─────────────────────────────────────────────
    case 'awaiting_cuit_for_claim':
      return handleCuit(input, data, 'claim');
    case 'confirm_client_for_claim':
      return handleClientConfirm(input, data, 'claim');
    case 'awaiting_cuit_for_price_list':
      return handleCuit(input, data, 'price_list');
    case 'confirm_client_for_price_list':
      return handleClientConfirm(input, data, 'price_list');
    case 'awaiting_cuit_for_account':
      return handleCuit(input, data, 'account');
    case 'confirm_client_for_account':
      return handleClientConfirm(input, data, 'account');
    case 'awaiting_cuit_for_sales_order':
      return handleCuit(input, data, 'sales_order');
    case 'confirm_client_for_sales_order':
      return handleClientConfirm(input, data, 'sales_order');

    case 'claim_menu':
      return handleClaimMenu(input, data);

    // ── Product claim ─────────────────────────────────────────────────────
    case 'product_claim_product_name':
      return handleProductName(input, data);
    case 'product_claim_product_confirm':
      return handleProductConfirm(input, data);
    case 'product_claim_product_select':
      return handleProductSelect(input, data);
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
    case 'product_claim_reason_suggest':
      return handleProductReasonSuggest(input, data);
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

    case 'completed_step':
      return handleCompletedStep(input);

    default:
      return getInitialBotResponse();
  }
}

// ─── Main menu ───────────────────────────────────────────────────────────────

function handleMainMenu(input: string): BotResponse {
  switch (input) {
    case 'Realizar un reclamo':
      return {
        messages: ['Perfecto, vamos a registrar tu reclamo. Para comenzar, necesito identificarte. Por favor indicame tu CUIT.'],
        nextState: 'awaiting_cuit_for_claim',
      };
    case 'Consultar lista de precios':
      return {
        messages: ['Para continuar con tu consulta de lista de precios, por favor indicame tu CUIT.'],
        nextState: 'awaiting_cuit_for_price_list',
      };
    case 'Consultar cuenta corriente':
      return {
        messages: ['Para continuar con tu consulta de cuenta corriente, por favor indicame tu CUIT.'],
        nextState: 'awaiting_cuit_for_account',
      };
    case 'Realizar un pedido de venta':
      return {
        messages: ['Para continuar con tu pedido de venta, por favor indicame tu CUIT.'],
        nextState: 'awaiting_cuit_for_sales_order',
      };
    default:
      return {
        messages: ['No entendí tu selección. Por favor elegí una de las opciones disponibles.'],
        quickReplies: MAIN_MENU_OPTIONS,
        nextState: 'main_menu',
      };
  }
}

// ─── CUIT identification (shared) ────────────────────────────────────────────

type CuitFlow = 'claim' | 'price_list' | 'account' | 'sales_order';

function handleCuit(input: string, data: ClaimData, flow: CuitFlow): BotResponse {
  const cuit = input.replace(/[\s\-]/g, '').trim();

  if (cuit.length < 5) {
    return {
      messages: ['El CUIT ingresado parece incompleto. Por favor, ingresalo con el formato correcto (ej: 30-71332270-5 o 30713322705).'],
      nextState: `awaiting_cuit_for_${flow}` as ConversationState,
      claimData: data,
    };
  }

  const contact = findContactByIdNumber(cuit);
  const confirmState = `confirm_client_for_${flow}` as ConversationState;

  if (contact) {
    return {
      messages: [`Encontré este cliente: **${contact.name}**. ¿Podés confirmarme si corresponde a tu cuenta?`],
      quickReplies: ['Sí, es correcto', 'No, no corresponde'],
      nextState: confirmState,
      claimData: { ...data, clientName: contact.name, clientCuit: cuit, clientIsNew: false },
    };
  }

  // Not found — handle per flow
  if (flow === 'account') {
    return {
      messages: [
        'No pude identificar tu CUIT en la base de clientes.',
        'Por favor comunicate con **facturaciones@vitalcan.com.ar** para realizar la consulta con un agente.',
      ],
      quickReplies: ['Volver al menú principal', 'Finalizar'],
      nextState: 'completed_step',
      claimData: {},
    };
  }

  const updated = { ...data, clientCuit: cuit, clientIsNew: true, clientName: null };
  return continueAfterClientIdentified(updated, flow, true);
}

function handleClientConfirm(input: string, data: ClaimData, flow: CuitFlow): BotResponse {
  if (input === 'Sí, es correcto' || input.toLowerCase().includes('si') || input.toLowerCase().includes('sí')) {
    return continueAfterClientIdentified(data, flow, false);
  }
  // Not the right client
  const updated = { ...data, clientIsNew: true, clientName: null };
  if (flow === 'account') {
    return {
      messages: [
        'No pude identificar tu cuenta. Por favor comunicate con **facturaciones@vitalcan.com.ar** para realizar la consulta con un agente.',
      ],
      quickReplies: ['Volver al menú principal', 'Finalizar'],
      nextState: 'completed_step',
      claimData: {},
    };
  }
  return continueAfterClientIdentified(updated, flow, true);
}

function continueAfterClientIdentified(data: ClaimData, flow: CuitFlow, isNew: boolean): BotResponse {
  const newClientMsg = isNew
    ? 'No encontré una coincidencia para ese CUIT. Para esta demo voy a continuar registrándote como cliente nuevo.'
    : null;

  switch (flow) {
    case 'claim': {
      const msgs = newClientMsg
        ? [newClientMsg, 'Indicame por favor sobre qué tipo de reclamo querés avanzar.']
        : ['Perfecto, cliente confirmado. ✅', 'Indicame por favor sobre qué tipo de reclamo querés avanzar.'];
      return {
        messages: msgs,
        quickReplies: CLAIM_OPTIONS,
        nextState: 'claim_menu',
        claimData: data,
      };
    }
    case 'price_list': {
      const msgs = newClientMsg
        ? [newClientMsg, 'Igualmente te comparto la lista de precios vigente.', '📄 [Descargar lista de precios](/Lista_de_precios.pdf)']
        : ['Perfecto. Te comparto la lista de precios vigente.', '📄 [Descargar lista de precios](/Lista_de_precios.pdf)'];
      return {
        messages: msgs,
        quickReplies: ['Volver al menú principal', 'Finalizar'],
        nextState: 'completed_step',
        claimData: {},
      };
    }
    case 'account': {
      // If we get here, the client was confirmed (not new)
      return {
        messages: [
          'Perfecto, cliente confirmado. ✅',
          `Te comparto tu cuenta corriente. En el contexto de esta demo no voy a mostrar un dato real, pero en una implementación productiva esta consulta se conectará con la base de datos del sistema para devolver la información real del cliente **${data.clientName}**.`,
        ],
        quickReplies: ['Volver al menú principal', 'Finalizar'],
        nextState: 'completed_step',
        claimData: {},
      };
    }
    case 'sales_order': {
      const msgs = newClientMsg
        ? [newClientMsg, 'Excelente. Esta es una versión demo. En una etapa futura estaremos recibiendo tu pedido por WhatsApp y procesándolo de forma integrada.']
        : ['Perfecto, cliente confirmado. ✅', 'Excelente. Esta es una versión demo. En una etapa futura estaremos recibiendo tu pedido por WhatsApp y procesándolo de forma integrada.'];
      return {
        messages: msgs,
        quickReplies: ['Volver al menú principal', 'Finalizar'],
        nextState: 'completed_step',
        claimData: {},
      };
    }
  }
}

// ─── Claim menu ──────────────────────────────────────────────────────────────

function handleClaimMenu(input: string, data: ClaimData): BotResponse {
  switch (input) {
    case 'Reclamo sobre productos':
      return {
        messages: [
          'Entiendo. Vamos a avanzar con tu reclamo sobre productos y te voy a ir guiando paso a paso para registrar toda la información necesaria.',
          'Voy a pedirte información sobre el producto, lote, fechas y motivo del reclamo. Si no tenés alguno de los datos a mano, avisame y te acompaño. 😊',
          'Para comenzar, indicame por favor el nombre del producto.',
        ],
        nextState: 'product_claim_product_name',
        claimData: { ...data },
      };
    case 'Reclamo sobre facturación':
      return {
        messages: [
          'Entiendo. Vamos a avanzar con tu reclamo sobre facturación.',
          'Te voy a pedir algunos datos de la factura y el motivo del inconveniente. Vamos paso a paso.',
          'Indicame por favor la fecha de emisión de la factura.',
        ],
        nextState: 'billing_claim_invoice_date',
        claimData: { ...data },
      };
    case 'Reclamo sobre entregas':
      return {
        messages: [
          'Entiendo. Vamos a avanzar con tu reclamo sobre entrega.',
          'Te voy a pedir algunos datos del remito y el motivo del inconveniente. Vamos paso a paso.',
          'Por favor indicame el número de remito, tal como figura en el comprobante.',
        ],
        nextState: 'delivery_claim_waybill_number',
        claimData: { ...data },
      };
    default:
      return {
        messages: ['Por favor elegí una de las opciones de reclamo disponibles.'],
        quickReplies: CLAIM_OPTIONS,
        nextState: 'claim_menu',
        claimData: data,
      };
  }
}

// ─── Edit return helpers ─────────────────────────────────────────────────────

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

  // Search using real product repository
  const results = searchProducts(trimmed);
  const bestMatch = findBestProductMatch(trimmed);

  if (results.length === 0) {
    // No match at all
    return {
      messages: [
        '🔍 Buscando el producto en la base de datos...',
        `No encontré el producto en la base local. Para esta demo voy a registrar el ticket con el producto: **${trimmed}**.`,
      ],
      quickReplies: ['Sí, continuar', 'Buscar otro producto'],
      nextState: 'product_claim_product_confirm',
      claimData: { ...data, product: trimmed },
    };
  }

  if (results.length === 1 || (bestMatch && results.length <= 3)) {
    // Single best match or clear winner
    const product = bestMatch ?? results[0];
    return {
      messages: [
        '🔍 Buscando el producto en la base de datos...',
        `Encontré este producto: **${product.name}**. ¿Querés seleccionarlo?`,
      ],
      quickReplies: ['Sí, seleccionar producto', 'No, buscar otro'],
      nextState: 'product_claim_product_confirm',
      claimData: { ...data, product: product.name },
    };
  }

  // Multiple matches — show top 3 as quick replies
  const top3 = results.slice(0, 3);
  const options = [...top3.map(p => p.name), 'Ninguno de estos'];
  return {
    messages: [
      '🔍 Buscando el producto en la base de datos...',
      'Encontré varias coincidencias. ¿Cuál es el producto correcto?',
    ],
    quickReplies: options,
    nextState: 'product_claim_product_select',
    claimData: { ...data, _productCandidates: top3.map(p => p.name) },
  };
}

function handleProductSelect(input: string, data: ClaimData): BotResponse {
  if (input === 'Ninguno de estos') {
    return {
      messages: ['No hay problema. Indicame nuevamente el nombre del producto tal como figura en el envase.'],
      nextState: 'product_claim_product_name',
      claimData: { ...data, product: null, _productCandidates: undefined },
    };
  }
  // User selected one of the product names
  const updated = { ...data, product: input, _productCandidates: undefined };
  if (data.editReturnState === 'product_claim_summary') {
    return returnToProductSummary(updated);
  }
  return {
    messages: [
      `Perfecto, producto registrado: **${input}**. ✅`,
      'Ahora indicame por favor el número de lote del producto. Podés encontrarlo impreso en el envase o dentro del paquete.',
    ],
    nextState: 'product_claim_lot_number',
    claimData: updated,
  };
}

function handleProductConfirm(input: string, data: ClaimData): BotResponse {
  const isYes = input === 'Sí, es correcto' || input === 'Sí, seleccionar producto' || input === 'Sí, continuar'
    || input.toLowerCase().includes('si') || input.toLowerCase().includes('sí') || input.toLowerCase() === 'correcto';

  if (isYes) {
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
      'Contame brevemente cuál es el motivo del reclamo.',
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
      'Contame brevemente cuál es el motivo del reclamo.',
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

  // Use real reason repository to suggest
  const suggestions = suggestClaimReasons(trimmed);

  if (suggestions.length > 0) {
    const best = suggestions[0];
    const alternatives = suggestions.slice(1);
    return {
      messages: [
        `En base a lo que me indicás, el motivo más cercano podría ser: **${best.name}**. ¿Querés usar este motivo?`,
      ],
      quickReplies: ['Sí, usar este motivo', ...(alternatives.length > 0 ? ['Ver otras opciones'] : []), 'Ninguna coincide'],
      nextState: 'product_claim_reason_confirm',
      claimData: {
        ...data,
        reason: trimmed,
        reasonFormatted: best.name,
        _reasonAlternatives: alternatives.map(r => ({ id: r.id, name: r.name })),
      },
    };
  }

  // No matches found — use generic
  return {
    messages: [
      `Entiendo. Voy a registrar el motivo del reclamo como: **Otros motivos**. ¿Es correcto?`,
    ],
    quickReplies: ['Sí, correcto', 'No, quiero corregirlo'],
    nextState: 'product_claim_reason_confirm',
    claimData: { ...data, reason: trimmed, reasonFormatted: 'Otros motivos', _reasonAlternatives: [] },
  };
}

function handleProductReasonConfirm(input: string, data: ClaimData): BotResponse {
  if (input === 'Sí, usar este motivo' || input === 'Sí, correcto'
    || input.toLowerCase().includes('si') || input.toLowerCase().includes('sí') || input.toLowerCase() === 'correcto') {
    const cleaned = { ...data, _reasonAlternatives: undefined };
    if (data.editReturnState === 'product_claim_summary') {
      return returnToProductSummary(cleaned);
    }
    return {
      messages: ['Perfecto, motivo registrado. ✅', 'Por último, indicame dónde realizaste la compra del producto.'],
      nextState: 'product_claim_purchase_location',
      claimData: cleaned,
    };
  }
  if (input === 'Ver otras opciones') {
    return handleProductReasonShowAlternatives(data);
  }
  if (input === 'Ninguna coincide') {
    return {
      messages: ['Perfecto. Para esta demo voy a registrar un motivo general y el equipo podrá ampliarlo luego.'],
      nextState: data.editReturnState === 'product_claim_summary' ? 'product_claim_summary' : 'product_claim_purchase_location',
      claimData: {
        ...data,
        reasonFormatted: 'Otros motivos',
        _reasonAlternatives: undefined,
        ...(data.editReturnState !== 'product_claim_summary' ? {} : {}),
      },
      ...(data.editReturnState === 'product_claim_summary'
        ? {
          messages: [
            'Perfecto. Para esta demo voy a registrar un motivo general.',
            'Dato actualizado. ✅ Este es el resumen actualizado:',
            formatProductSummary({ ...data, reasonFormatted: 'Otros motivos' }),
            '¿Querés confirmar esta información?',
          ],
          quickReplies: ['Confirmar reclamo', 'Editar datos'],
        }
        : {
          messages: [
            'Perfecto. Para esta demo voy a registrar un motivo general y el equipo podrá ampliarlo luego.',
            'Por último, indicame dónde realizaste la compra del producto.',
          ],
        }),
      claimData: { ...data, reasonFormatted: 'Otros motivos', _reasonAlternatives: undefined, editReturnState: undefined },
    };
  }
  // "No, quiero corregirlo"
  return {
    messages: ['Perfecto, contame nuevamente el motivo de tu reclamo con tus palabras.'],
    nextState: 'product_claim_reason',
    claimData: { ...data, reason: null, reasonFormatted: null, _reasonAlternatives: undefined },
  };
}

function handleProductReasonShowAlternatives(data: ClaimData): BotResponse {
  const alts = data._reasonAlternatives ?? [];
  if (alts.length === 0) {
    return {
      messages: ['No tengo otras opciones para sugerir. Contame nuevamente el motivo con tus palabras.'],
      nextState: 'product_claim_reason',
      claimData: { ...data, reason: null, reasonFormatted: null, _reasonAlternatives: undefined },
    };
  }
  const options = [...alts.map(a => a.name), 'Ninguna coincide'];
  return {
    messages: ['Estas son otras opciones que podrían corresponder:'],
    quickReplies: options,
    nextState: 'product_claim_reason_suggest',
    claimData: data,
  };
}

function handleProductReasonSuggest(input: string, data: ClaimData): BotResponse {
  if (input === 'Ninguna coincide') {
    const cleaned = { ...data, reasonFormatted: 'Otros motivos', _reasonAlternatives: undefined };
    if (data.editReturnState === 'product_claim_summary') {
      return returnToProductSummary(cleaned);
    }
    return {
      messages: [
        'Perfecto. Para esta demo voy a registrar un motivo general y el equipo podrá ampliarlo luego.',
        'Por último, indicame dónde realizaste la compra del producto.',
      ],
      nextState: 'product_claim_purchase_location',
      claimData: cleaned,
    };
  }
  // User selected one of the alternative reasons
  const cleaned = { ...data, reasonFormatted: input, _reasonAlternatives: undefined };
  if (data.editReturnState === 'product_claim_summary') {
    return returnToProductSummary(cleaned);
  }
  return {
    messages: [
      `Perfecto, motivo registrado: **${input}**. ✅`,
      'Por último, indicame dónde realizaste la compra del producto.',
    ],
    nextState: 'product_claim_purchase_location',
    claimData: cleaned,
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
    clientLine(d),
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
      messages: buildClaimClosure('reclamo sobre productos', num),
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
    messages: ['Gracias. Ahora contame brevemente el motivo de tu reclamo sobre facturación.'],
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
  if (data.editReturnState === 'billing_claim_summary') {
    return returnToBillingSummary(updated);
  }
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
    clientLine(d),
    `• **Fecha de factura:** ${d.invoiceDate ?? '(pendiente)'}`,
    `• **Número de factura:** ${d.invoiceNumber ?? '(pendiente)'}`,
    `• **Motivo:** ${d.reason ?? '(pendiente)'}`,
  ].join('\n');
}

function handleBillingSummary(input: string, data: ClaimData): BotResponse {
  if (input === 'Confirmar reclamo' || input.toLowerCase().includes('confirmar')) {
    const num = generateClaimNumber();
    return {
      messages: buildClaimClosure('reclamo sobre facturación', num),
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
        'Ahora contame brevemente el motivo de tu reclamo sobre la entrega.',
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
  const updated = { ...data, deliveryDate: input.trim() };
  if (data.editReturnState === 'delivery_claim_summary') {
    return returnToDeliverySummary(updated);
  }
  return {
    messages: ['Perfecto, fecha registrada. ✅', 'Ahora contame brevemente el motivo de tu reclamo sobre la entrega.'],
    nextState: 'delivery_claim_reason',
    claimData: updated,
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
  if (data.editReturnState === 'delivery_claim_summary') {
    return returnToDeliverySummary(updated);
  }
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
    clientLine(d),
    `• **Número de remito:** ${d.waybillNumber ?? '(pendiente)'}`,
    `• **Fecha de entrega:** ${d.deliveryDate ?? '(pendiente)'}`,
    `• **Motivo:** ${d.reason ?? '(pendiente)'}`,
  ].join('\n');
}

function handleDeliverySummary(input: string, data: ClaimData): BotResponse {
  if (input === 'Confirmar reclamo' || input.toLowerCase().includes('confirmar')) {
    const num = generateClaimNumber();
    return {
      messages: buildClaimClosure('reclamo sobre entrega', num),
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
      '30713322705',
      'Sí, es correcto',
      'Reclamo sobre productos',
      'Balanced perro adulto',
      'Sí, seleccionar producto',
      'L-2024-0892',
      '15/01/2025',
      '15/07/2025',
      'El producto vino con bichos adentro de la bolsa y olor rancio',
      'Sí, usar este motivo',
      'Puppis Palermo',
      'Confirmar reclamo',
    ],
  },
  {
    label: 'Reclamo de facturación',
    steps: [
      'Hola',
      'Realizar un reclamo',
      '20130631720',
      'Sí, es correcto',
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
      '27176522769',
      'Sí, es correcto',
      'Reclamo sobre entregas',
      'R-0001-00078234',
      '08/03/2026',
      'El pedido llegó incompleto, faltan 2 bultos de los 5 enviados.',
      'Confirmar reclamo',
    ],
  },
  {
    label: 'Consulta de precios',
    steps: [
      'Hola',
      'Consultar lista de precios',
      '30713322705',
      'Sí, es correcto',
    ],
  },
  {
    label: 'Cuenta corriente',
    steps: [
      'Hola',
      'Consultar cuenta corriente',
      '20132952125',
      'Sí, es correcto',
    ],
  },
  {
    label: 'Pedido de venta',
    steps: [
      'Hola',
      'Realizar un pedido de venta',
      '30713322705',
      'Sí, es correcto',
    ],
  },
];
