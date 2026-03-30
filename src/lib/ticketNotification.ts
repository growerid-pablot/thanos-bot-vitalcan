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

  // Build details – always send all properties even if empty
  const details: Record<string, string> = {
    'CUIT': d.clientCuit ?? '',
    'Producto': d.product ?? '',
    'Lote': d.lot ?? '',
    'Fecha de envasado': d.packagingDate ?? '',
    'Fecha de vencimiento': d.expiryDate ?? '',
    'Descripción': d.reason ?? '',
    'Lugar de compra': d.purchaseLocation ?? '',
    'Número de factura': d.invoiceNumber ?? '',
    'Fecha de factura': d.invoiceDate ?? '',
    'Número de remito': d.waybillNumber ?? '',
    'Fecha de entrega': d.deliveryDate ?? '',
  };

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
