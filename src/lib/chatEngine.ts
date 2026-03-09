export type ConversationState =
  | 'initial'
  | 'main_menu'
  | 'claim_menu'
  | 'product_claim_product_name'
  | 'product_claim_lot_number'
  | 'product_claim_packaging_date'
  | 'product_claim_purchase_location'
  | 'product_claim_reason'
  | 'billing_claim_invoice_date'
  | 'billing_claim_invoice_number'
  | 'billing_claim_reason'
  | 'delivery_claim_waybill_number'
  | 'delivery_claim_reason'
  | 'awaiting_customer_id_for_price_list'
  | 'awaiting_customer_id_for_account_status'
  | 'awaiting_customer_id_for_sales_order'
  | 'completed_step';

let claimCounter = 45800;
function generateClaimNumber(): string {
  claimCounter += Math.floor(Math.random() * 5) + 1;
  return `REC-${claimCounter}`;
}

export interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

interface BotResponse {
  messages: string[];
  quickReplies?: string[];
  nextState: ConversationState;
}

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

export function getInitialBotResponse(): BotResponse {
  return {
    messages: [
      '¡Hola! Soy Thanos, el asistente virtual de Vitalcan. Estoy acá para ayudarte con reclamos, consultas y gestiones comerciales. Decime qué necesitás hacer y te voy guiando paso a paso.',
    ],
    quickReplies: MAIN_MENU_OPTIONS,
    nextState: 'main_menu',
  };
}

export function processUserInput(state: ConversationState, input: string): BotResponse {
  switch (state) {
    case 'initial':
      return getInitialBotResponse();

    case 'main_menu':
      return handleMainMenu(input);

    case 'claim_menu':
      return handleClaimMenu(input);

    case 'product_claim_product_name':
      return {
        messages: ['Por favor indicame el número de lote. Podés encontrarlo dentro del paquete o en el envase del producto.'],
        nextState: 'product_claim_lot_number',
      };

    case 'product_claim_lot_number':
      return {
        messages: ['Ahora indicame la fecha de envasado. También podés encontrarla dentro del paquete o en el envase.'],
        nextState: 'product_claim_packaging_date',
      };

    case 'product_claim_packaging_date':
      return {
        messages: ['Por último, decime dónde realizaste la compra.'],
        nextState: 'product_claim_purchase_location',
      };

    case 'product_claim_purchase_location':
      return {
        messages: ['Gracias. Ahora contame brevemente el motivo de tu reclamo. Si querés, podés adjuntar una imagen que nos ayude a entender mejor el problema. 📷'],
        nextState: 'product_claim_reason',
      };

    case 'product_claim_reason': {
      const claimNum = generateClaimNumber();
      return {
        messages: [
          `Perfecto. Tu reclamo sobre productos ya fue ingresado con el número **${claimNum}**. 📋`,
          'En breve, un asesor de Vitalcan se va a comunicar con vos para dar resolución al mismo. ¿Necesitás algo más?',
        ],
        quickReplies: ['Volver al menú principal', 'Finalizar'],
        nextState: 'completed_step',
      };
    }

    case 'billing_claim_invoice_date':
      return {
        messages: ['Ahora decime el número de factura, tal como figura en el comprobante.'],
        nextState: 'billing_claim_invoice_number',
      };

    case 'billing_claim_invoice_number':
      return {
        messages: ['Gracias. Ahora contame brevemente el motivo de tu reclamo. Si querés, podés adjuntar una imagen del comprobante. 📷'],
        nextState: 'billing_claim_reason',
      };

    case 'billing_claim_reason': {
      const claimNum = generateClaimNumber();
      return {
        messages: [
          `Perfecto. Tu reclamo sobre facturación ya fue ingresado con el número **${claimNum}**. 📋`,
          'En breve, un asesor de Vitalcan se va a comunicar con vos para dar resolución al mismo. ¿Necesitás algo más?',
        ],
        quickReplies: ['Volver al menú principal', 'Finalizar'],
        nextState: 'completed_step',
      };
    }

    case 'delivery_claim_waybill_number':
      return {
        messages: [
          'Perfecto. Ya registré la información inicial de tu reclamo sobre entrega. 📋',
          'Un representante de Vitalcan se va a comunicar con vos a la brevedad para darte seguimiento. ¿Necesitás algo más?',
        ],
        quickReplies: ['Volver al menú principal', 'Finalizar'],
        nextState: 'completed_step',
      };

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

    default:
      return getInitialBotResponse();
  }
}

function handleMainMenu(input: string): BotResponse {
  switch (input) {
    case 'Realizar un reclamo':
      return {
        messages: ['Perfecto, vamos a registrar tu reclamo. Indicame por favor sobre qué tipo de reclamo querés avanzar.'],
        quickReplies: CLAIM_OPTIONS,
        nextState: 'claim_menu',
      };
    case 'Consultar lista de precios':
      return {
        messages: ['Para continuar con tu consulta de lista de precios, por favor indicame tu número de cliente o tu CUIT.'],
        nextState: 'awaiting_customer_id_for_price_list',
      };
    case 'Consultar cuenta corriente':
      return {
        messages: ['Para continuar con tu consulta de cuenta corriente, por favor indicame tu número de cliente o tu CUIT.'],
        nextState: 'awaiting_customer_id_for_account_status',
      };
    case 'Realizar un pedido de venta':
      return {
        messages: ['Para continuar con tu pedido de venta, por favor indicame tu número de cliente o tu CUIT.'],
        nextState: 'awaiting_customer_id_for_sales_order',
      };
    default:
      return {
        messages: ['No entendí tu selección. Por favor elegí una de las opciones disponibles.'],
        quickReplies: MAIN_MENU_OPTIONS,
        nextState: 'main_menu',
      };
  }
}

function handleClaimMenu(input: string): BotResponse {
  switch (input) {
    case 'Reclamo sobre productos':
      return {
        messages: [
          'Entiendo. Vamos a avanzar con tu reclamo sobre productos.',
          '¿Qué producto querés reclamar?',
        ],
        nextState: 'product_claim_product_name',
      };
    case 'Reclamo sobre facturación':
      return {
        messages: [
          'Entiendo. Vamos a avanzar con tu reclamo sobre facturación.',
          'Indicame por favor la fecha de emisión de la factura.',
        ],
        nextState: 'billing_claim_invoice_date',
      };
    case 'Reclamo sobre entregas':
      return {
        messages: [
          'Entiendo. Vamos a avanzar con tu reclamo sobre entrega.',
          'Por favor indicame el número de remito, tal como figura en el comprobante.',
        ],
        nextState: 'delivery_claim_waybill_number',
      };
    default:
      return {
        messages: ['Por favor elegí una de las opciones de reclamo disponibles.'],
        quickReplies: CLAIM_OPTIONS,
        nextState: 'claim_menu',
      };
  }
}

export const DEMO_SCENARIOS = [
  { label: 'Reclamo de producto', steps: ['Hola', 'Realizar un reclamo', 'Reclamo sobre productos', 'Vitalcan V50 Adulto 20kg', 'L-2024-0892', '15/01/2025', 'Puppis Palermo'] },
  { label: 'Reclamo de facturación', steps: ['Hola', 'Realizar un reclamo', 'Reclamo sobre facturación', '03/02/2025', 'FAC-A-0001-00045892'] },
  { label: 'Reclamo de entrega', steps: ['Hola', 'Realizar un reclamo', 'Reclamo sobre entregas', 'R-0001-00078234'] },
  { label: 'Consulta de precios', steps: ['Hola', 'Consultar lista de precios', '20-30567890-4'] },
  { label: 'Cuenta corriente', steps: ['Hola', 'Consultar cuenta corriente', 'Cliente #4521'] },
  { label: 'Pedido de venta', steps: ['Hola', 'Realizar un pedido de venta', '20-27845632-1'] },
];
