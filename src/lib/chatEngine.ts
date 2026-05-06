import { detectHealthUrgency } from "./healthUrgency";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConversationState =
  | "initial"
  | "main_menu"
  // Identificación tipo de usuario
  | "awaiting_user_type"
  | "distributor_redirect"
  | "awaiting_pdv_or_consumer"
  // Opciones principales
  | "purchase_info"
  | "purchase_user_type"
  | "purchase_location"
  | "purchase_province"
  | "consultation_info"
  // Reclamo — tipo de usuario
  | "claim_user_confirmed"
  // Reclamo — producto
  | "claim_product_name"
  | "claim_product_confirm"
  | "claim_product_select"
  | "claim_lot_number"
  | "claim_lot_missing"
  | "claim_packaging_date"
  | "claim_packaging_missing"
  | "claim_expiry_date"
  | "claim_expiry_missing"
  // Reclamo — motivo agrupado
  | "claim_reason_category"
  | "claim_reason_subcategory"
  | "claim_reason_detail"
  | "claim_health_alert"
  // Reclamo — compra
  | "claim_purchase_modality"
  | "claim_purchase_store"
  | "claim_purchase_ml_seller"
  // Reclamo — imágenes
  | "claim_images_info"
  // Reclamo — datos personales
  | "claim_personal_name"
  | "claim_personal_email"
  | "claim_personal_phone"
  | "claim_personal_address"
  | "claim_personal_postal"
  | "claim_personal_reception"
  // Reclamo — PDV datos adicionales
  | "claim_pdv_distributor"
  // Resumen y cierre
  | "claim_summary"
  | "claim_edit_select"
  | "completed_step";

export interface ClaimData {
  // Tipo de usuario
  userType?: "consumer" | "pdv" | null;
  // PDV
  pdvDistributor?: string | null;
  // Producto
  product?: string | null;
  _productCandidates?: string[];
  // Lote y fechas
  lot?: string | null;
  packagingDate?: string | null;
  expiryDate?: string | null;
  // Motivo
  reasonCategory?: string | null;
  reasonSubcategory?: string | null;
  reasonDetail?: string | null;
  // Compra
  purchaseModality?: "presencial" | "virtual" | null;
  purchaseStore?: string | null;
  mlSeller?: string | null;
  // Datos personales
  personalName?: string | null;
  personalEmail?: string | null;
  personalPhone?: string | null;
  personalAddress?: string | null;
  personalPostal?: string | null;
  personalReception?: string | null;
  // Control de edición
  editReturnState?: ConversationState;
}

export interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  quickReplies?: string[];
}

export interface TicketInfo {
  ticketNumber: string;
  claimType: string;
  priority: string;
}

export interface BotResponse {
  messages: string[];
  quickReplies?: string[];
  nextState: ConversationState;
  claimData?: ClaimData;
  ticketInfo?: TicketInfo;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let messageCounter = 0;
export function createMessage(sender: "user" | "bot", text: string, quickReplies?: string[]): Message {
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

function isValidDate(v: string): boolean {
  const m = v.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (!m) return false;
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 2000 || year > 2030) return false;
  return true;
}

// Lote: 1 letra + 5 números (ej: A12345)
function isValidLot(v: string): boolean {
  return /^[a-zA-Z]\d{5}$/.test(v.trim());
}

function isMissingDataResponse(input: string): boolean {
  const lower = input.toLowerCase();
  const patterns = [
    "no lo tengo",
    "no tengo",
    "no encuentro",
    "no lo veo",
    "no dispongo",
    "no sé",
    "no se",
    "no lo sé",
    "no recuerdo",
    "no me acuerdo",
    "no lo recuerdo",
  ];
  return patterns.some((p) => lower.includes(p));
}

// ─── Motivos agrupados ────────────────────────────────────────────────────────

const REASON_CATEGORIES = ["Problemas de envase", "Contenido / calidad del producto", "Salud de mi mascota"];

const REASON_SUBCATEGORIES: Record<string, string[]> = {
  "Problemas de envase": [
    "Bolsa rota o mal sellada",
    "Bolsa con sticker sin lata",
    "Falta rótulo (lote/vencimiento/elaboración)",
    "Menos kilos de los indicados",
    "Envase lata dañado",
    "Envase pouch dañado",
  ],
  "Contenido / calidad del producto": [
    "Presencia de bichos",
    "Hongos / moho",
    "Mal olor",
    "Material extraño / objetos",
    "Problema con las croquetas",
    "Palatabilidad (mascota no lo acepta)",
  ],
  "Salud de mi mascota": [
    "Gastroenteritis / diarrea / vómitos",
    "Problemas de piel y pelo",
    "Problemas urinarios",
    "Otro problema de salud",
  ],
};

// ─── Menus principales ───────────────────────────────────────────────────────

const MAIN_MENU_OPTIONS = ["Hacer un reclamo", "Quiero comprar", "Tengo una consulta"];

// ─── Cierre de ticket ────────────────────────────────────────────────────────

function buildClaimClosure(num: string, priority: string): string[] {
  const base = `Tu reclamo fue registrado con el número **${num}**. Un asesor del área de Calidad se va a comunicar con vos para continuar el seguimiento. 📋`;
  if (priority === "Urgente") {
    return [
      `⚠️ Tu reclamo fue marcado como **prioritario** y registrado con el número **${num}**. Un asesor va a comunicarse con vos a la brevedad. 🩺`,
      "_En esta versión demo la carga se simula localmente._",
    ];
  }
  return [
    base,
    "_En esta versión demo la carga se simula localmente, pero en una implementación real el ticket quedaría registrado en el sistema ODU._",
  ];
}

// ─── Resumen del reclamo ─────────────────────────────────────────────────────

function formatClaimSummary(d: ClaimData): string {
  const tipo = d.userType === "pdv" ? "Punto de venta" : "Consumidor final";
  const modality =
    d.purchaseModality === "virtual" ? "Virtual" : d.purchaseModality === "presencial" ? "Presencial" : "(pendiente)";
  const store =
    d.purchaseModality === "virtual" && d.mlSeller
      ? `${d.purchaseStore ?? "Mercado Libre"} — Vendedor: ${d.mlSeller}`
      : (d.purchaseStore ?? "(pendiente)");

  const lines = [`📋 **Resumen del reclamo**`, `• **Tipo:** ${tipo}`];

  if (d.userType === "pdv" && d.pdvDistributor) {
    lines.push(`• **Distribuidor:** ${d.pdvDistributor}`);
  }

  const restantes = [
    `• **Producto:** ${d.product ?? "(pendiente)"}`,
    `• **Lote:** ${d.lot ?? "(pendiente)"}`,
    `• **Fecha de envasado:** ${d.packagingDate ?? "(pendiente)"}`,
    `• **Fecha de vencimiento:** ${d.expiryDate ?? "(pendiente)"}`,
    `• **Motivo:** ${d.reasonSubcategory ?? d.reasonCategory ?? "(pendiente)"}`,
    d.reasonDetail ? `• **Descripción:** ${d.reasonDetail}` : "",
    `• **Modalidad de compra:** ${modality}`,
    `• **Local / canal de compra:** ${store}`,
    `• **Nombre:** ${d.personalName ?? "(pendiente)"}`,
    `• **Email:** ${d.personalEmail ?? "(pendiente)"}`,
    `• **Teléfono:** ${d.personalPhone ?? "(pendiente)"}`,
    `• **Dirección:** ${d.personalAddress ?? "(pendiente)"}`,
    `• **Código postal:** ${d.personalPostal ?? "(pendiente)"}`,
    `• **Horario de recepción:** ${d.personalReception ?? "(pendiente)"}`,
  ].filter(Boolean);
  lines.push(...restantes);

  return lines.join("\n");
}

// ─── Búsqueda de producto simple ─────────────────────────────────────────────
// Importamos el matcher existente si está disponible, si no usamos fallback básico
let _findTopProductMatches: ((q: string, n: number) => { name: string }[]) | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require("./productMatching");
  _findTopProductMatches = mod.findTopProductMatches;
} catch {
  _findTopProductMatches = null;
}

function searchProducts(query: string): { name: string }[] {
  if (_findTopProductMatches) return _findTopProductMatches(query, 5);
  return [];
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export function getInitialBotResponse(): BotResponse {
  return {
    messages: ["¡Hola! Soy **Biti**, el asistente virtual de Vitalcán. 🐾, ¿En qué puedo ayudarte hoy?"],
    quickReplies: MAIN_MENU_OPTIONS,
    nextState: "main_menu",
  };
}

export function processUserInput(state: ConversationState, input: string, claimData?: ClaimData): BotResponse {
  const data = claimData ?? {};

  switch (state) {
    case "initial":
      return getInitialBotResponse();

    case "main_menu":
      return handleMainMenu(input);

    // ── Identificación de tipo de usuario ──────────────────────────────────
    case "awaiting_user_type":
      return handleUserType(input, data);

    case "distributor_redirect":
      return handleDistributorRedirect(input);

    case "awaiting_pdv_or_consumer":
      return handlePdvOrConsumer(input, data);

    // ── Opciones: compra y consulta ────────────────────────────────────────
    case "purchase_user_type":
      return handlePurchaseUserType(input);

    case "purchase_info":
      return handlePurchaseInfo(input);

    case "purchase_location":
      return handlePurchaseLocation(input);

    case "purchase_province":
      return handlePurchaseProvince(input);

    case "consultation_info":
      return handleConsultationInfo(input);

    // ── Reclamo: producto ─────────────────────────────────────────────────
    case "claim_user_confirmed":
      // Estado legacy: re-encaminamos al inicio del flujo de reclamo.
      return startClaimFlow(data);

    case "claim_product_name":
      return handleProductName(input, data);

    case "claim_product_confirm":
      return handleProductConfirm(input, data);

    case "claim_product_select":
      return handleProductSelect(input, data);

    case "claim_lot_number":
      return handleLotNumber(input, data);

    case "claim_lot_missing":
      return handleLotMissing(input, data);

    case "claim_packaging_date":
      return handlePackagingDate(input, data);

    case "claim_packaging_missing":
      return handlePackagingMissing(input, data);

    case "claim_expiry_date":
      return handleExpiryDate(input, data);

    case "claim_expiry_missing":
      return handleExpiryMissing(input, data);

    // ── Reclamo: motivo ────────────────────────────────────────────────────
    case "claim_reason_category":
      return handleReasonCategory(input, data);

    case "claim_reason_subcategory":
      return handleReasonSubcategory(input, data);

    case "claim_reason_detail":
      return handleReasonDetail(input, data);

    case "claim_health_alert":
      return handleHealthAlert(input, data);

    // ── Reclamo: compra ────────────────────────────────────────────────────
    case "claim_purchase_modality":
      return handlePurchaseModality(input, data);

    case "claim_purchase_store":
      return handlePurchaseStore(input, data);

    case "claim_purchase_ml_seller":
      return handleMlSeller(input, data);

    // ── Reclamo: imágenes ─────────────────────────────────────────────────
    case "claim_images_info":
      return handleImagesInfo(input, data);

    // ── Reclamo: datos personales ─────────────────────────────────────────
    case "claim_personal_name":
      return handlePersonalName(input, data);

    case "claim_personal_email":
      return handlePersonalEmail(input, data);

    case "claim_personal_phone":
      return handlePersonalPhone(input, data);

    case "claim_personal_address":
      return handlePersonalAddress(input, data);

    case "claim_personal_postal":
      return handlePersonalPostal(input, data);

    case "claim_personal_reception":
      return handlePersonalReception(input, data);

    // ── PDV: distribuidor ─────────────────────────────────────────────────
    case "claim_pdv_distributor":
      return handlePdvDistributor(input, data);

    // ── Resumen y cierre ──────────────────────────────────────────────────
    case "claim_summary":
      return handleClaimSummary(input, data);

    case "claim_edit_select":
      return handleClaimEditSelect(input, data);

    case "completed_step":
      return handleCompletedStep(input);

    default:
      return getInitialBotResponse();
  }
}

// ─── Menú principal ──────────────────────────────────────────────────────────

function handleMainMenu(input: string): BotResponse {
  switch (input) {
    case "Hacer un reclamo":
      return {
        messages: [
          "Perfecto. Antes de continuar, necesito saber cómo nos conociste.",
          "¿Comprás directamente a Vitalcán?",
        ],
        quickReplies: [
          "Sí, soy cliente directo / distribuidor",
          "No, compro en una veterinaria o pet shop",
          "No, compro en supermercado u otro comercio",
        ],
        nextState: "awaiting_user_type",
        claimData: {},
      };
    case "Quiero comprar":
      return {
        messages: [
          "¡Genial! Para conectarte con un representante comercial, primero contame: ¿sos consumidor final o punto de venta?",
        ],
        quickReplies: ["Consumidor final", "Punto de venta"],
        nextState: "purchase_user_type",
        claimData: {},
      };
    case "Tengo una consulta":
      return {
        messages: [
          "Con gusto te ayudo. Contame brevemente tu consulta y un asesor te va a responder a la brevedad.",
          "¿Cuál es tu consulta?",
        ],
        nextState: "consultation_info",
        claimData: {},
      };
    default:
      return {
        messages: ["¿En qué puedo ayudarte?"],
        quickReplies: MAIN_MENU_OPTIONS,
        nextState: "main_menu",
      };
  }
}

// ─── Identificación tipo de usuario ─────────────────────────────────────────

function handleUserType(input: string, data: ClaimData): BotResponse {
  if (input === "Sí, soy cliente directo / distribuidor") {
    return {
      messages: [
        "Entendido. Los clientes directos y distribuidores deben gestionar sus reclamos a través del **portal de clientes oficial**.",
        "👉 Por favor ingresá a tu portal para registrar tu reclamo allí. Si tenés problemas para acceder, contactá a tu representante comercial.",
        "¿Puedo ayudarte con algo más?",
      ],
      quickReplies: ["Volver al menú principal", "Quiero comprar", "Tengo una consulta"],
      nextState: "distributor_redirect",
      claimData: { ...data, userType: null },
    };
  }

  // Punto de venta o consumidor final
  const isPdv =
    input === "No, compro en una veterinaria o pet shop" ||
    input.toLowerCase().includes("veterinaria") ||
    input.toLowerCase().includes("pet shop") ||
    input.toLowerCase().includes("punto de venta");

  if (isPdv) {
    return {
      messages: [
        "Perfecto. ¿Sos vos quien sufrió el inconveniente o estás reportando el reclamo en nombre de un cliente?",
      ],
      quickReplies: ["Soy el punto de venta y quiero hacer el reclamo yo", "Soy consumidor final"],
      nextState: "awaiting_pdv_or_consumer",
      claimData: { ...data },
    };
  }

  // Consumidor final (supermercado u otro)
  return startClaimFlow({ ...data, userType: "consumer" });
}

function handleDistributorRedirect(input: string): BotResponse {
  if (input === "Volver al menú principal") {
    return {
      messages: ["¡Por supuesto! ¿En qué más puedo ayudarte?"],
      quickReplies: MAIN_MENU_OPTIONS,
      nextState: "main_menu",
    };
  }
  return handleMainMenu(input);
}

function handlePdvOrConsumer(input: string, data: ClaimData): BotResponse {
  if (input === "Soy el punto de venta y quiero hacer el reclamo yo") {
    return {
      messages: [
        "Entendido. ¿A qué distribuidor le comprás el producto?",
        'Si comprás directamente a Vitalcán en el AMBA, indicá "Compra directa Vitalcán".',
      ],
      nextState: "claim_pdv_distributor",
      claimData: { ...data, userType: "pdv" },
    };
  }
  // Consumidor final
  return startClaimFlow({ ...data, userType: "consumer" });
}

function handlePdvDistributor(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return {
      messages: ["¿Podrías indicarme el nombre del distribuidor o proveedor?"],
      nextState: "claim_pdv_distributor",
      claimData: data,
    };
  }
  const updated = { ...data, pdvDistributor: trimmed };
  return startClaimFlow(updated);
}

function startClaimFlow(data: ClaimData): BotResponse {
  return {
    messages: ["Vamos a registrar tu reclamo paso a paso. 📋", "Para comenzar, indicame el nombre del producto."],
    nextState: "claim_product_name",
    claimData: data,
  };
}

// ─── Compra / Consulta ────────────────────────────────────────────────────────

// DESPUÉS
function handlePurchaseInfo(input: string): BotResponse {
  if (input === "Volver al menú principal") {
    return { messages: ["¿En qué más puedo ayudarte?"], quickReplies: MAIN_MENU_OPTIONS, nextState: "main_menu" };
  }
  return handleMainMenu(input);
}

function handlePurchaseUserType(input: string): BotResponse {
  // Sin importar la opción elegida, pasamos directo a pedir localidad
  return {
    messages: ["¿En qué localidad estás ubicado?"],
    nextState: "purchase_location",
  };
}

function handlePurchaseLocation(input: string): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return {
      messages: ["¿Podés indicarme tu localidad?"],
      nextState: "purchase_location",
    };
  }
  return {
    messages: ["¿Y en qué provincia?"],
    nextState: "purchase_province",
  };
}

function handlePurchaseProvince(input: string): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return {
      messages: ["¿Podés indicarme tu provincia?"],
      nextState: "purchase_province",
    };
  }
  return {
    messages: ["¡Muchas gracias! A la brevedad será contactado por un representante comercial. 😊"],
    quickReplies: ["Volver al menú principal", "Finalizar"],
    nextState: "completed_step",
  };
}

function handleConsultationInfo(input: string): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 5) {
    return {
      messages: ["¿Podrías contarme un poco más sobre tu consulta?"],
      nextState: "consultation_info",
    };
  }
  const num = generateClaimNumber();
  return {
    messages: [
      `Gracias. Tu consulta fue registrada con el número **${num}**. Un asesor te va a responder a la brevedad. 😊`,
    ],
    quickReplies: ["Volver al menú principal", "Hacer un reclamo", "Finalizar"],
    nextState: "completed_step",
    ticketInfo: { ticketNumber: num, claimType: "consulta", priority: "Normal" },
  };
}

// ─── Producto ─────────────────────────────────────────────────────────────────

function handleProductName(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 3) {
    return {
      messages: ["El nombre parece muy corto. ¿Podés indicarme el nombre completo tal como figura en el envase?"],
      nextState: "claim_product_name",
      claimData: data,
    };
  }

  const results = searchProducts(trimmed);

  if (results.length === 0) {
    return {
      messages: [`No encontré el producto en la base de datos. ¿Querés continuar con: **"${trimmed}"**?`],
      quickReplies: ["Sí, continuar con ese producto", "No, escribirlo de nuevo"],
      nextState: "claim_product_confirm",
      claimData: { ...data, product: trimmed },
    };
  }

  if (results.length === 1) {
    return {
      messages: [`Encontré este producto: **${results[0].name}**. ¿Es el correcto?`],
      quickReplies: ["Sí, es ese", "No, buscar otro"],
      nextState: "claim_product_confirm",
      claimData: { ...data, product: results[0].name },
    };
  }

  const options = [...results.slice(0, 5).map((p) => p.name), "Ninguno de estos"];
  return {
    messages: ["Encontré varios productos. Seleccioná el que corresponda:"],
    quickReplies: options,
    nextState: "claim_product_select",
    claimData: { ...data, _productCandidates: results.slice(0, 5).map((p) => p.name) },
  };
}

function handleProductConfirm(input: string, data: ClaimData): BotResponse {
  const isYes =
    input.toLowerCase().includes("sí") || input.toLowerCase().includes("si") || input.includes("continuar con ese");
  if (isYes) {
    if (data.editReturnState === "claim_summary") return returnToSummary(data);
    return askLotNumber(data);
  }
  return {
    messages: ["Indicame nuevamente el nombre del producto tal como figura en el envase."],
    nextState: "claim_product_name",
    claimData: { ...data, product: null },
  };
}

function handleProductSelect(input: string, data: ClaimData): BotResponse {
  if (input === "Ninguno de estos") {
    return {
      messages: ["Indicame nuevamente el nombre del producto tal como figura en el envase."],
      nextState: "claim_product_name",
      claimData: { ...data, product: null, _productCandidates: undefined },
    };
  }
  // Validar que la opción seleccionada sea uno de los candidatos ofrecidos
  const candidates = data._productCandidates ?? [];
  if (!candidates.includes(input)) {
    return {
      messages: ["Por favor seleccioná uno de los productos sugeridos:"],
      quickReplies: [...candidates, "Ninguno de estos"],
      nextState: "claim_product_select",
      claimData: data,
    };
  }
  const updated = { ...data, product: input, _productCandidates: undefined };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return askLotNumber(updated);
}

function askLotNumber(data: ClaimData): BotResponse {
  return {
    messages: [
      `Producto registrado: **${data.product}**. ✅`,
      "Ahora indicame el **número de lote**. El formato es: **1 letra seguida de 5 números** (ej: A12345). Lo encontrás impreso en el envase.",
    ],
    nextState: "claim_lot_number",
    claimData: data,
  };
}

// ─── Lote ─────────────────────────────────────────────────────────────────────

function handleLotNumber(input: string, data: ClaimData): BotResponse {
  if (isMissingDataResponse(input)) {
    return {
      messages: [
        "No hay problema. Si lo encontrás después podemos incorporarlo. ¿Querés buscarlo o seguimos sin ese dato?",
      ],
      quickReplies: ["Lo busco y continúo", "Seguir sin ese dato"],
      nextState: "claim_lot_missing",
      claimData: data,
    };
  }
  const trimmed = input.trim().toUpperCase();
  if (!isValidLot(trimmed)) {
    return {
      messages: [
        "El formato del lote no es correcto. Debe ser **1 letra seguida de 5 números** (ej: A12345).",
        "Por favor, ingresalo tal como figura en el envase.",
      ],
      nextState: "claim_lot_number",
      claimData: data,
    };
  }
  const updated = { ...data, lot: trimmed };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return {
    messages: [`Lote **${trimmed}** registrado. ✅`, "Ahora indicame la **fecha de envasado** (formato DD/MM/AAAA)."],
    nextState: "claim_packaging_date",
    claimData: updated,
  };
}

function handleLotMissing(input: string, data: ClaimData): BotResponse {
  if (input === "Lo busco y continúo") {
    return { messages: ["Dale, cuando lo tengas escribilo acá. 👍"], nextState: "claim_lot_number", claimData: data };
  }
  return {
    messages: ["Entendido. Seguimos sin el lote.", "Indicame la **fecha de envasado** (formato DD/MM/AAAA)."],
    nextState: "claim_packaging_date",
    claimData: { ...data, lot: "(pendiente)" },
  };
}

// ─── Fecha de envasado ────────────────────────────────────────────────────────

function handlePackagingDate(input: string, data: ClaimData): BotResponse {
  if (isMissingDataResponse(input)) {
    return {
      messages: ["No hay problema. ¿La buscás o seguimos sin ese dato?"],
      quickReplies: ["La busco y continúo", "Seguir sin ese dato"],
      nextState: "claim_packaging_missing",
      claimData: data,
    };
  }
  if (!isValidDate(input)) {
    return {
      messages: ["La fecha debe tener formato DD/MM/AAAA. Por ejemplo: **15/03/2026**. Ingresala nuevamente."],
      nextState: "claim_packaging_date",
      claimData: data,
    };
  }
  const updated = { ...data, packagingDate: input.trim() };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return {
    messages: [
      `Fecha de envasado: **${input.trim()}**. ✅`,
      "Ahora indicame la **fecha de vencimiento** (formato DD/MM/AAAA).",
    ],
    nextState: "claim_expiry_date",
    claimData: updated,
  };
}

function handlePackagingMissing(input: string, data: ClaimData): BotResponse {
  if (input === "La busco y continúo") {
    return {
      messages: ["Dale, cuando la tengas escribila acá. 👍"],
      nextState: "claim_packaging_date",
      claimData: data,
    };
  }
  return {
    messages: [
      "Entendido. Seguimos sin la fecha de envasado.",
      "Indicame la **fecha de vencimiento** (formato DD/MM/AAAA).",
    ],
    nextState: "claim_expiry_date",
    claimData: { ...data, packagingDate: "(pendiente)" },
  };
}

// ─── Fecha de vencimiento ─────────────────────────────────────────────────────

function handleExpiryDate(input: string, data: ClaimData): BotResponse {
  if (isMissingDataResponse(input)) {
    return {
      messages: ["No hay problema. ¿La buscás o seguimos?"],
      quickReplies: ["La busco y continúo", "Seguir sin ese dato"],
      nextState: "claim_expiry_missing",
      claimData: data,
    };
  }
  if (!isValidDate(input)) {
    return {
      messages: ["La fecha debe tener formato DD/MM/AAAA. Por ejemplo: **20/11/2026**. Ingresala nuevamente."],
      nextState: "claim_expiry_date",
      claimData: data,
    };
  }
  const updated = { ...data, expiryDate: input.trim() };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return {
    messages: [
      `Fecha de vencimiento: **${input.trim()}**. ✅`,
      "¿Cuál es el motivo de tu reclamo? Seleccioná la categoría que mejor describe el problema:",
    ],
    quickReplies: REASON_CATEGORIES,
    nextState: "claim_reason_category",
    claimData: updated,
  };
}

function handleExpiryMissing(input: string, data: ClaimData): BotResponse {
  if (input === "La busco y continúo") {
    return { messages: ["Dale, cuando la tengas escribila acá. 👍"], nextState: "claim_expiry_date", claimData: data };
  }
  return {
    messages: ["Entendido. ¿Cuál es el motivo de tu reclamo? Seleccioná la categoría:"],
    quickReplies: REASON_CATEGORIES,
    nextState: "claim_reason_category",
    claimData: { ...data, expiryDate: "(pendiente)" },
  };
}

// ─── Motivo ───────────────────────────────────────────────────────────────────

function handleReasonCategory(input: string, data: ClaimData): BotResponse {
  const subs = REASON_SUBCATEGORIES[input];
  if (!subs) {
    return {
      messages: ["Por favor seleccioná una de las categorías disponibles."],
      quickReplies: REASON_CATEGORIES,
      nextState: "claim_reason_category",
      claimData: data,
    };
  }

  // Salud: alerta urgente directa
  if (input === "Salud de mi mascota") {
    return {
      messages: [
        "⚠️ Detecté que tu reclamo está relacionado con la **salud de tu mascota**.",
        "Seleccioná el problema específico:",
      ],
      quickReplies: [...subs, "Volver a categorías"],
      nextState: "claim_health_alert",
      claimData: { ...data, reasonCategory: input },
    };
  }

  return {
    messages: ["Seleccioná el problema específico:"],
    quickReplies: [...subs, "Otra razón"],
    nextState: "claim_reason_subcategory",
    claimData: { ...data, reasonCategory: input },
  };
}

function handleReasonSubcategory(input: string, data: ClaimData): BotResponse {
  if (input === "Otra razón") {
    return {
      messages: ["Contame brevemente qué ocurrió con el producto:"],
      nextState: "claim_reason_detail",
      claimData: { ...data, reasonSubcategory: "Otro motivo" },
    };
  }
  const updated = { ...data, reasonSubcategory: input };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return {
    messages: [`Motivo: **${input}**. ✅`, "Describí brevemente qué ocurrió con el producto (podés ser breve):"],
    nextState: "claim_reason_detail",
    claimData: updated,
  };
}

function handleReasonDetail(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 5) {
    return {
      messages: ["¿Podés contarme un poco más sobre qué ocurrió?"],
      nextState: "claim_reason_detail",
      claimData: data,
    };
  }

  // Detección de urgencia de salud en descripción libre
  if (!data.reasonCategory?.includes("Salud") && detectHealthUrgency(trimmed)) {
    return {
      messages: [
        "⚠️ Detecté que tu descripción podría estar relacionada con la **salud de tu mascota**.",
        "¿Querés que marquemos esta gestión como prioritaria para que un asesor te contacte a la brevedad?",
      ],
      quickReplies: ["Sí, marcar como urgente", "No, continuar con el reclamo normal"],
      nextState: "claim_health_alert",
      claimData: { ...data, reasonDetail: trimmed },
    };
  }

  const updated = { ...data, reasonDetail: trimmed };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return askPurchaseModality(updated);
}

function handleHealthAlert(input: string, data: ClaimData): BotResponse {
  if (input === "Volver a categorías") {
    return {
      messages: ["Seleccioná la categoría del problema:"],
      quickReplies: REASON_CATEGORIES,
      nextState: "claim_reason_category",
      claimData: { ...data, reasonCategory: null },
    };
  }

  const isUrgent =
    input === "Sí, marcar como urgente" ||
    Object.values(REASON_SUBCATEGORIES["Salud de mi mascota"] ?? []).includes(input);

  if (isUrgent) {
    const subcat = Object.values(REASON_SUBCATEGORIES["Salud de mi mascota"] ?? []).includes(input)
      ? input
      : data.reasonSubcategory;
    const updatedData = { ...data, reasonSubcategory: subcat };

    // Si tiene datos personales previos no pedimos de nuevo — saltamos a resumen de urgente
    const num = generateClaimNumber();
    return {
      messages: buildClaimClosure(num, "Urgente"),
      quickReplies: ["Volver al menú principal", "Finalizar"],
      nextState: "completed_step",
      claimData: updatedData,
      ticketInfo: { ticketNumber: num, claimType: "reclamo salud mascota", priority: "Urgente" },
    };
  }

  // No urgente — continuar flujo normal
  return askPurchaseModality(data);
}

// ─── Modalidad de compra ──────────────────────────────────────────────────────

function askPurchaseModality(data: ClaimData): BotResponse {
  return {
    messages: ["¿Cómo realizaste la compra del producto?"],
    quickReplies: ["Presencial (local físico)", "Virtual (online)"],
    nextState: "claim_purchase_modality",
    claimData: data,
  };
}

function handlePurchaseModality(input: string, data: ClaimData): BotResponse {
  const isVirtual = input.toLowerCase().includes("virtual") || input.toLowerCase().includes("online");
  const modality = isVirtual ? "virtual" : "presencial";
  const updated = { ...data, purchaseModality: modality as "virtual" | "presencial" };

  if (isVirtual) {
    return {
      messages: ["¿En qué plataforma o sitio realizaste la compra?"],
      quickReplies: ["Mercado Libre", "Tienda oficial Vitalcán", "Otro sitio web"],
      nextState: "claim_purchase_store",
      claimData: updated,
    };
  }

  return {
    messages: ["¿En qué local o comercio lo compraste? (nombre del negocio o cadena)"],
    nextState: "claim_purchase_store",
    claimData: updated,
  };
}

function handlePurchaseStore(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return {
      messages: ["¿Podés indicarme el nombre del comercio o plataforma?"],
      nextState: "claim_purchase_store",
      claimData: data,
    };
  }
  const updated = { ...data, purchaseStore: trimmed };

  // Si compró en Mercado Libre, pedir nombre del vendedor
  if (trimmed.toLowerCase().includes("mercado libre") || trimmed.toLowerCase().includes("meli")) {
    return {
      messages: ["¿Cuál es el nombre del vendedor en Mercado Libre?", "(Lo encontrás en el detalle de tu compra)"],
      nextState: "claim_purchase_ml_seller",
      claimData: updated,
    };
  }

  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return askImagesInfo(updated);
}

function handleMlSeller(input: string, data: ClaimData): BotResponse {
  const updated = { ...data, mlSeller: input.trim() || "(no indicado)" };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return askImagesInfo(updated);
}

// ─── Imágenes ─────────────────────────────────────────────────────────────────

function askImagesInfo(data: ClaimData): BotResponse {
  return {
    messages: [
      "📸 Para procesar tu reclamo necesitamos que nos envíes las siguientes fotos:",
      "1️⃣ **Frente de la bolsa** (donde se ve el producto y la marca)\n2️⃣ **Rótulo** (donde figuran el lote, fecha de envasado y vencimiento)\n3️⃣ **Contenido del producto** (foto del interior de la bolsa)",
      "_En esta demo no es necesario adjuntarlas, pero en la implementación real deberás subirlas en este paso._",
      'Cuando estés listo, escribí **"listo"** o hacé clic en continuar para seguir con tus datos personales.',
    ],
    quickReplies: ["Continuar"],
    nextState: "claim_images_info",
    claimData: data,
  };
}

function handleImagesInfo(input: string, data: ClaimData): BotResponse {
  return {
    messages: [
      "Perfecto. ✅ Ahora necesito tus datos para poder contactarte y gestionar la reposición del producto.",
      "¿Cuál es tu nombre y apellido?",
    ],
    nextState: "claim_personal_name",
    claimData: data,
  };
}

// ─── Datos personales ─────────────────────────────────────────────────────────

function handlePersonalName(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 3) {
    return { messages: ["¿Podés indicarme tu nombre completo?"], nextState: "claim_personal_name", claimData: data };
  }
  const updated = { ...data, personalName: trimmed };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return {
    messages: [`Gracias, **${trimmed}**. ¿Cuál es tu dirección de email?`],
    nextState: "claim_personal_email",
    claimData: updated,
  };
}

function handlePersonalEmail(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  if (!emailOk) {
    return {
      messages: ["El email no parece válido. Por favor ingresalo nuevamente (ej: nombre@correo.com)."],
      nextState: "claim_personal_email",
      claimData: data,
    };
  }
  const updated = { ...data, personalEmail: trimmed };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return {
    messages: ["¿Cuál es tu número de teléfono (con código de área)?"],
    nextState: "claim_personal_phone",
    claimData: updated,
  };
}

function handlePersonalPhone(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 7) {
    return {
      messages: ["El teléfono parece incompleto. Ingresalo con código de área (ej: 11 4567-8901)."],
      nextState: "claim_personal_phone",
      claimData: data,
    };
  }
  const updated = { ...data, personalPhone: trimmed };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return {
    messages: ["¿Cuál es tu dirección particular (calle y número)?"],
    nextState: "claim_personal_address",
    claimData: updated,
  };
}

function handlePersonalAddress(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 5) {
    return {
      messages: ["¿Podés indicarme tu dirección completa (calle y número)?"],
      nextState: "claim_personal_address",
      claimData: data,
    };
  }
  const updated = { ...data, personalAddress: trimmed };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return { messages: ["¿Cuál es tu código postal?"], nextState: "claim_personal_postal", claimData: updated };
}

function handlePersonalPostal(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 3) {
    return { messages: ["¿Podés indicarme tu código postal?"], nextState: "claim_personal_postal", claimData: data };
  }
  const updated = { ...data, personalPostal: trimmed };
  if (data.editReturnState === "claim_summary") return returnToSummary(updated);
  return {
    messages: [
      "Por último, ¿cuál es tu horario preferido para que nos contactemos con vos? (ej: mañanas, tardes, de 9 a 17hs)",
    ],
    nextState: "claim_personal_reception",
    claimData: updated,
  };
}

function handlePersonalReception(input: string, data: ClaimData): BotResponse {
  const trimmed = input.trim();
  if (trimmed.length < 2) {
    return {
      messages: ["¿Podés indicarme tu horario preferido de contacto?"],
      nextState: "claim_personal_reception",
      claimData: data,
    };
  }
  const updated = { ...data, personalReception: trimmed };
  return {
    messages: [
      "Perfecto. Este es el resumen de tu reclamo:",
      formatClaimSummary(updated),
      "¿Querés confirmar o editar algún dato?",
    ],
    quickReplies: ["Confirmar reclamo", "Editar datos"],
    nextState: "claim_summary",
    claimData: updated,
  };
}

// ─── Resumen y confirmación ───────────────────────────────────────────────────

function returnToSummary(data: ClaimData): BotResponse {
  const cleaned = { ...data, editReturnState: undefined };
  return {
    messages: [
      "Dato actualizado. ✅ Resumen actualizado:",
      formatClaimSummary(cleaned),
      "¿Confirmás o editás algo más?",
    ],
    quickReplies: ["Confirmar reclamo", "Editar datos"],
    nextState: "claim_summary",
    claimData: cleaned,
  };
}

function handleClaimSummary(input: string, data: ClaimData): BotResponse {
  if (input === "Confirmar reclamo" || input.toLowerCase().includes("confirmar")) {
    const num = generateClaimNumber();
    return {
      messages: buildClaimClosure(num, "Normal"),
      quickReplies: ["Volver al menú principal", "Finalizar"],
      nextState: "completed_step",
      claimData: data,
      ticketInfo: { ticketNumber: num, claimType: "reclamo de producto", priority: "Normal" },
    };
  }
  if (input === "Editar datos" || input.toLowerCase().includes("editar")) {
    return {
      messages: ["¿Qué dato querés corregir?"],
      quickReplies: [
        "Producto",
        "Lote",
        "Fecha de envasado",
        "Fecha de vencimiento",
        "Motivo",
        "Modalidad de compra",
        "Local de compra",
        "Nombre",
        "Email",
        "Teléfono",
        "Dirección",
        "Código postal",
        "Horario",
      ],
      nextState: "claim_edit_select",
      claimData: data,
    };
  }
  return {
    messages: ["Por favor seleccioná una opción."],
    quickReplies: ["Confirmar reclamo", "Editar datos"],
    nextState: "claim_summary",
    claimData: data,
  };
}

function handleClaimEditSelect(input: string, data: ClaimData): BotResponse {
  const map: Record<string, { msg: string; state: ConversationState; clear: Partial<ClaimData> }> = {
    Producto: {
      msg: "Indicame el nombre correcto del producto.",
      state: "claim_product_name",
      clear: { product: null },
    },
    Lote: {
      msg: "Indicame el número de lote correcto (formato: 1 letra + 5 números, ej: A12345).",
      state: "claim_lot_number",
      clear: { lot: null },
    },
    "Fecha de envasado": {
      msg: "Indicame la fecha de envasado correcta (DD/MM/AAAA).",
      state: "claim_packaging_date",
      clear: { packagingDate: null },
    },
    "Fecha de vencimiento": {
      msg: "Indicame la fecha de vencimiento correcta (DD/MM/AAAA).",
      state: "claim_expiry_date",
      clear: { expiryDate: null },
    },
    Motivo: {
      msg: "Seleccioná la categoría del motivo:",
      state: "claim_reason_category",
      clear: { reasonCategory: null, reasonSubcategory: null, reasonDetail: null },
    },
    "Modalidad de compra": {
      msg: "¿Cómo realizaste la compra?",
      state: "claim_purchase_modality",
      clear: { purchaseModality: null, purchaseStore: null, mlSeller: null },
    },
    "Local de compra": {
      msg: "¿En qué local o plataforma compraste el producto?",
      state: "claim_purchase_store",
      clear: { purchaseStore: null, mlSeller: null },
    },
    Nombre: { msg: "¿Cuál es tu nombre y apellido?", state: "claim_personal_name", clear: { personalName: null } },
    Email: { msg: "¿Cuál es tu email?", state: "claim_personal_email", clear: { personalEmail: null } },
    Teléfono: { msg: "¿Cuál es tu teléfono?", state: "claim_personal_phone", clear: { personalPhone: null } },
    Dirección: { msg: "¿Cuál es tu dirección?", state: "claim_personal_address", clear: { personalAddress: null } },
    "Código postal": {
      msg: "¿Cuál es tu código postal?",
      state: "claim_personal_postal",
      clear: { personalPostal: null },
    },
    Horario: {
      msg: "¿Cuál es tu horario preferido de contacto?",
      state: "claim_personal_reception",
      clear: { personalReception: null },
    },
  };

  const entry = map[input];
  if (entry) {
    const msgs: string[] = [entry.msg];
    // Si el campo es motivo, agregar quick replies de categorías
    const qr =
      input === "Motivo"
        ? REASON_CATEGORIES
        : input === "Modalidad de compra"
          ? ["Presencial (local físico)", "Virtual (online)"]
          : undefined;
    return {
      messages: msgs,
      quickReplies: qr,
      nextState: entry.state,
      claimData: { ...data, ...entry.clear, editReturnState: "claim_summary" },
    };
  }

  return {
    messages: ["Por favor seleccioná uno de los campos a editar."],
    quickReplies: [
      "Producto",
      "Lote",
      "Fecha de envasado",
      "Fecha de vencimiento",
      "Motivo",
      "Modalidad de compra",
      "Local de compra",
      "Nombre",
      "Email",
      "Teléfono",
      "Dirección",
      "Código postal",
      "Horario",
    ],
    nextState: "claim_edit_select",
    claimData: data,
  };
}

// ─── Completed step ──────────────────────────────────────────────────────────

function handleCompletedStep(input: string): BotResponse {
  if (input === "Volver al menú principal") {
    return {
      messages: ["¡Por supuesto! ¿En qué más puedo ayudarte?"],
      quickReplies: MAIN_MENU_OPTIONS,
      nextState: "main_menu",
    };
  }
  return {
    messages: ["¡Gracias por usar Biti! Si necesitás algo más, no dudes en escribirme. 🐾"],
    nextState: "completed_step",
  };
}

// ─── Demo scenarios ──────────────────────────────────────────────────────────

export const DEMO_SCENARIOS = [
  {
    label: "Reclamo consumidor final",
    steps: [
      "Hola",
      "Hacer un reclamo",
      "No, compro en supermercado u otro comercio",
      "Balanced perro adulto",
      "Balanced Perro Adulto Raza Grande x 20 Kg",
      "A12345",
      "10/01/2026",
      "10/07/2026",
      "Contenido / calidad del producto",
      "Presencia de bichos",
      "Encontré bichos dentro de la bolsa al abrirla",
      "Presencial (local físico)",
      "Jumbo Palermo",
      "Continuar",
      "Juan Pérez",
      "juan@email.com",
      "11 4567-8901",
      "Av. Corrientes 1234",
      "1043",
      "Mañanas de 9 a 13hs",
      "Confirmar reclamo",
    ],
  },
  {
    label: "Reclamo punto de venta",
    steps: [
      "Hola",
      "Hacer un reclamo",
      "No, compro en una veterinaria o pet shop",
      "Soy el punto de venta y quiero hacer el reclamo yo",
      "Distribuidora Norte SRL",
      "Hop Gato Adulto",
      "Hop! Gato Adulto x 15 Kg",
      "B98765",
      "05/02/2026",
      "05/08/2026",
      "Problemas de envase",
      "Bolsa rota o mal sellada",
      "Varias bolsas llegaron rotas en el pallet",
      "Presencial (local físico)",
      "Distribuidora Norte",
      "Continuar",
      "María López",
      "maria@petshop.com",
      "11 5678-9012",
      "Av. San Martín 456",
      "1416",
      "Tardes de 14 a 18hs",
      "Confirmar reclamo",
    ],
  },
  {
    label: "Reclamo compra Mercado Libre",
    steps: [
      "Hola",
      "Hacer un reclamo",
      "No, compro en supermercado u otro comercio",
      "Premium gato adulto 15kg",
      "Premium Gato Adulto x 15 Kg",
      "C54321",
      "20/03/2026",
      "20/09/2026",
      "Contenido / calidad del producto",
      "Mal olor",
      "El producto tiene un olor raro, diferente a lo normal",
      "Virtual (online)",
      "Mercado Libre",
      "tienda_oficial_vitalcan",
      "Continuar",
      "Carlos García",
      "carlos@gmail.com",
      "11 6789-0123",
      "Gurruchaga 789",
      "1414",
      "Cualquier horario",
      "Confirmar reclamo",
    ],
  },
  {
    label: "Distribuidor redirigido",
    steps: ["Hola", "Hacer un reclamo", "Sí, soy cliente directo / distribuidor"],
  },
  {
    label: "Consulta",
    steps: ["Hola", "Tengo una consulta", "Quisiera saber qué productos tienen disponibles para gatos senior"],
  },
];
