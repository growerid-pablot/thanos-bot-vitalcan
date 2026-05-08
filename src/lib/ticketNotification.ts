import { supabase } from "@/integrations/supabase/client";
import type { ClaimData, ProductItem } from "./chatEngine";

export interface TicketInfo {
  ticketNumber: string;
  claimType: string;
  priority: string;
  claimData: ClaimData;
}

function formatProductBlock(item: ProductItem, idx: number): string {
  const lines = [
    `── Producto ${idx + 1}: ${item.product}`,
    `   Lote: ${item.lot ?? "(no informado)"}`,
    `   Fecha de envasado: ${item.packagingDate ?? "(no informada)"}`,
    `   Fecha de vencimiento: ${item.expiryDate ?? "(no informada)"}`,
    `   Categoría: ${item.reasonCategory ?? "(no informada)"}`,
    `   Motivo: ${item.reasonSubcategory ?? "(no informado)"}`,
    `   Descripción: ${item.reasonDetail ?? "(no informada)"}`,
  ];
  return lines.join("\n");
}

export async function sendTicketNotification(ticket: TicketInfo): Promise<void> {
  const now = new Date();
  const createdAt = now.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const d = ticket.claimData;
  const clientName = d.personalName ?? "No identificado";

  // Motivo: si hay múltiples productos, listar todos los motivos
  const allProducts = d.products ?? [];
  const motivo =
    allProducts.length > 0
      ? allProducts.map((p) => p.reasonSubcategory ?? p.reasonCategory ?? "Sin especificar").join(" / ")
      : (d.reasonSubcategory ?? d.reasonCategory ?? "Sin especificar");

  // Bloque de productos
  const productosTexto =
    allProducts.length > 0
      ? allProducts.map((p, i) => formatProductBlock(p, i)).join("\n\n")
      : [
          `── Producto 1: ${d.product ?? "(no informado)"}`,
          `   Lote: ${d.lot ?? "(no informado)"}`,
          `   Fecha de envasado: ${d.packagingDate ?? "(no informada)"}`,
          `   Fecha de vencimiento: ${d.expiryDate ?? "(no informada)"}`,
          `   Categoría: ${d.reasonCategory ?? "(no informada)"}`,
          `   Motivo: ${d.reasonSubcategory ?? "(no informado)"}`,
          `   Descripción: ${d.reasonDetail ?? "(no informada)"}`,
        ].join("\n");

  // Tipo de usuario
  const tipoUsuario = d.userType === "pdv" ? "Punto de venta" : d.userType === "consumer" ? "Consumidor final" : "";

  // Modalidad
  const modalidad =
    d.purchaseModality === "virtual" ? "Virtual" : d.purchaseModality === "presencial" ? "Presencial" : "";

  // Canal de compra
  const lugarCompra =
    d.purchaseModality === "virtual" && d.mlSeller
      ? `${d.purchaseStore ?? "Mercado Libre"} — Vendedor: ${d.mlSeller}`
      : (d.purchaseStore ?? "");

  const details: Record<string, string> = {
    // Identificación
    "Tipo de usuario": tipoUsuario,
    "Distribuidor (PDV)": d.pdvDistributor ?? "",
    "Localidad del distribuidor": d.pdvLocation ?? "",
    "Provincia del distribuidor": d.pdvProvince ?? "",

    // Productos reclamados
    [`Productos reclamados (${allProducts.length > 0 ? allProducts.length : 1})`]: productosTexto,

    // Compra
    "Modalidad de compra": modalidad,
    "Lugar / canal de compra": lugarCompra,

    // Datos personales
    Nombre: d.personalName ?? "",
    Email: d.personalEmail ?? "",
  };

  // Limpiar campos vacíos para no enviar ruido
  const cleanDetails: Record<string, string> = {};
  for (const [key, value] of Object.entries(details)) {
    if (value && value.trim() !== "") {
      cleanDetails[key] = value;
    }
  }

  try {
    const { error } = await supabase.functions.invoke("send-ticket-email", {
      body: {
        ticketNumber: ticket.ticketNumber,
        clientName,
        claimType: ticket.claimType,
        reason: motivo,
        priority: ticket.priority,
        createdAt,
        details: cleanDetails,
      },
    });

    if (error) {
      console.error("[TicketNotification] Error enviando notificación:", error);
    } else {
      console.log(`[TicketNotification] Notificación enviada para ticket ${ticket.ticketNumber}`);
    }
  } catch (err) {
    console.error("[TicketNotification] Error inesperado:", err);
  }
}
