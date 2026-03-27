import { supabase } from '@/integrations/supabase/client';
import type { ClaimData } from './chatEngine';

export interface TicketInfo {
  ticketNumber: string;
  claimType: string;
  priority: string;
  claimData: ClaimData;
}

export async function sendTicketNotification(ticket: TicketInfo): Promise<void> {
  const now = new Date();
  const createdAt = now.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const d = ticket.claimData;
  const clientName = d.clientIsNew
    ? 'Cliente nuevo'
    : d.clientName ?? 'No identificado';

  // Build extra details based on claim type
  const details: Record<string, string> = {};
  if (d.clientCuit) details['CUIT'] = d.clientCuit;

  if (ticket.claimType.includes('producto')) {
    if (d.product) details['Producto'] = d.product;
    if (d.lot) details['Lote'] = d.lot;
    if (d.packagingDate) details['Fecha de envasado'] = d.packagingDate;
    if (d.expiryDate) details['Fecha de vencimiento'] = d.expiryDate;
    if (d.purchaseLocation) details['Lugar de compra'] = d.purchaseLocation;
  } else if (ticket.claimType.includes('facturación')) {
    if (d.invoiceNumber) details['Número de factura'] = d.invoiceNumber;
    if (d.invoiceDate) details['Fecha de factura'] = d.invoiceDate;
  } else if (ticket.claimType.includes('entrega')) {
    if (d.waybillNumber) details['Número de remito'] = d.waybillNumber;
    if (d.deliveryDate) details['Fecha de entrega'] = d.deliveryDate;
  }

  try {
    const { error } = await supabase.functions.invoke('send-ticket-email', {
      body: {
        ticketNumber: ticket.ticketNumber,
        clientName,
        claimType: ticket.claimType,
        reason: d.reasonFormatted ?? d.reason ?? 'Sin especificar',
        priority: ticket.priority,
        createdAt,
        details,
      },
    });

    if (error) {
      console.error('[TicketNotification] Error enviando email:', error);
    } else {
      console.log(`[TicketNotification] Email enviado para ticket ${ticket.ticketNumber}`);
    }
  } catch (err) {
    console.error('[TicketNotification] Error inesperado:', err);
  }
}
