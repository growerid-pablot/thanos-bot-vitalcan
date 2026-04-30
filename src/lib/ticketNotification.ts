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
  const clientName = d.personalName ?? 'No identificado';
  const motivo = d.reasonSubcategory ?? d.reasonCategory ?? 'Sin especificar';

  // Always send ALL properties even if empty
  const details: Record<string, string> = {
    'Tipo de usuario': d.userType === 'pdv' ? 'Punto de venta' : d.userType === 'consumer' ? 'Consumidor final' : '',
    'Distribuidor (PDV)': d.pdvDistributor ?? '',
    'Producto': d.product ?? '',
    'Lote': d.lot ?? '',
    'Fecha de envasado': d.packagingDate ?? '',
    'Fecha de vencimiento': d.expiryDate ?? '',
    'Categoría motivo': d.reasonCategory ?? '',
    'Subcategoría motivo': d.reasonSubcategory ?? '',
    'Descripción': d.reasonDetail ?? '',
    'Modalidad de compra': d.purchaseModality ?? '',
    'Lugar de compra': d.purchaseStore ?? '',
    'Vendedor Mercado Libre': d.mlSeller ?? '',
    'Nombre': d.personalName ?? '',
    'Email': d.personalEmail ?? '',
    'Teléfono': d.personalPhone ?? '',
    'Dirección': d.personalAddress ?? '',
    'Código postal': d.personalPostal ?? '',
    'Horario de contacto': d.personalReception ?? '',
  };

  try {
    const { error } = await supabase.functions.invoke('send-ticket-email', {
      body: {
        ticketNumber: ticket.ticketNumber,
        clientName,
        claimType: ticket.claimType,
        reason: motivo,
        priority: ticket.priority,
        createdAt,
        details,
      },
    });

    if (error) {
      console.error('[TicketNotification] Error enviando notificación:', error);
    } else {
      console.log(`[TicketNotification] Notificación enviada para ticket ${ticket.ticketNumber}`);
    }
  } catch (err) {
    console.error('[TicketNotification] Error inesperado:', err);
  }
}
