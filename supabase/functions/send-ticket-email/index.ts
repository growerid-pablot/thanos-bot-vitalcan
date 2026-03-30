import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TicketEmailPayload {
  ticketNumber: string;
  clientName: string;
  claimType: string;
  reason: string;
  priority: string;
  createdAt: string;
  details: Record<string, string>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: TicketEmailPayload = await req.json();
    const {
      ticketNumber,
      clientName,
      claimType,
      reason,
      priority,
      createdAt,
      details,
    } = payload;

    // Build details rows
    const detailRows = Object.entries(details)
      .filter(([, v]) => v && v !== "(pendiente)")
      .map(
        ([k, v]) =>
          `<tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">${k}</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#4b5563;">${v}</td></tr>`
      )
      .join("");

    const htmlBody = `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f9fafb;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
    <div style="background:#1e40af;color:#ffffff;padding:20px 24px;">
      <h1 style="margin:0;font-size:20px;">🎫 Nuevo ticket creado - ${ticketNumber}</h1>
    </div>
    <div style="padding:24px;">
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Número de ticket</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#4b5563;">${ticketNumber}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Cliente</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#4b5563;">${clientName}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Tipo de reclamo</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#4b5563;">${claimType}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Motivo</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#4b5563;">${reason}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Prioridad</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#4b5563;">${priority}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #e5e7eb;font-weight:600;color:#374151;">Fecha y hora</td><td style="padding:8px 12px;border:1px solid #e5e7eb;color:#4b5563;">${createdAt}</td></tr>
        ${detailRows}
      </table>
      <p style="color:#6b7280;font-size:13px;margin-top:24px;">Este correo fue generado automáticamente por el chatbot Thanos - VitalCan Demo.</p>
    </div>
  </div>
</body>
</html>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Thanos Bot <onboarding@resend.dev>",
        to: ["pablot@growerid.com.ar"],
        subject: `Nuevo ticket creado - ${ticketNumber}`,
        html: htmlBody,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend API error:", JSON.stringify(resendData));
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: resendRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", resendData.id);
    return new Response(
      JSON.stringify({ success: true, emailId: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-ticket-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
