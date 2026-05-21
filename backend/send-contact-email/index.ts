import { createClient } from 'jsr:@supabase/supabase-js@2';

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const RATE_LIMIT_MAX = 3;

function buildContactEmailHtml(name: string, email: string, phone: string | undefined, message: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Nuevo mensaje de contacto</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FAF8F5;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" max-width="520" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;width:100%;background-color:#FFFFFF;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
        <tr>
          <td style="background-color:#9DC183;padding:24px 28px;text-align:center;">
            <div style="color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:0.5px;">Nuevo mensaje de contacto</div>
            <div style="color:rgba(255,255,255,0.9);font-size:13px;margin-top:4px;">HolaCitas</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;">
                  <span style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Nombre</span>
                  <div style="color:#2C3E50;font-size:15px;font-weight:600;margin-top:2px;">${name}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;">
                  <span style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Email</span>
                  <div style="color:#2C3E50;font-size:15px;font-weight:600;margin-top:2px;">${email}</div>
                </td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;">
                  <span style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Teléfono</span>
                  <div style="color:#2C3E50;font-size:15px;font-weight:600;margin-top:2px;">${phone}</div>
                </td>
              </tr>
              ` : ''}
            </table>
            <div style="margin-bottom:20px;">
              <div style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:8px;">Mensaje</div>
              <div style="background-color:#FAF8F5;border-radius:8px;padding:16px;color:#2C3E50;font-size:14px;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px;background-color:#FAF8F5;text-align:center;border-top:1px solid #eee;">
            <div style="color:#5D6D7E;font-size:12px;line-height:1.5;">
              <strong style="color:#2C3E50;">HolaCitas</strong><br>
              Gestión de citas simplificada
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function buildConfirmationEmailHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Hemos recibido tu mensaje</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FAF8F5;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" max-width="520" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;width:100%;background-color:#FFFFFF;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
        <tr>
          <td style="background-color:#9DC183;padding:24px 28px;text-align:center;">
            <div style="color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:0.5px;">¡Gracias por contactarnos!</div>
            <div style="color:rgba(255,255,255,0.9);font-size:13px;margin-top:4px;">HolaCitas</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <div style="font-size:15px;color:#2C3E50;line-height:1.6;margin-bottom:16px;">Hola <strong>${name}</strong>,</div>
            <div style="font-size:15px;color:#2C3E50;line-height:1.6;margin-bottom:16px;">Hemos recibido tu mensaje. Te responderemos lo antes posible.</div>
            <div style="background-color:#FAF8F5;border-radius:8px;padding:16px;color:#2C3E50;font-size:14px;line-height:1.6;">
              Gracias por contactar a <strong>HolaCitas</strong>.
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 28px;background-color:#FAF8F5;text-align:center;border-top:1px solid #eee;">
            <div style="color:#5D6D7E;font-size:12px;line-height:1.5;">
              <strong style="color:#2C3E50;">HolaCitas</strong><br>
              Gestión de citas simplificada
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Campos requeridos: name, email, message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const senderEmail = Deno.env.get('SENDER_EMAIL');
    const contactEmail = Deno.env.get('CONTACT_EMAIL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY no configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!senderEmail) {
      return new Response(
        JSON.stringify({ error: 'SENDER_EMAIL no configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!contactEmail) {
      return new Response(
        JSON.stringify({ error: 'CONTACT_EMAIL no configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

    const { count, error: countError } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .gte('created_at', windowStart);

    if (countError) {
      console.error('Rate limit check error:', countError);
    } else if (count && count >= RATE_LIMIT_MAX) {
      return new Response(
        JSON.stringify({ error: 'Demasiados mensajes. Intenta más tarde.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const emailBody = [
      `Nombre: ${name}`,
      `Email: ${email}`,
      phone ? `Teléfono: ${phone}` : null,
      ``,
      `Mensaje:`,
      message,
    ].filter(Boolean).join('\n');

    const responses: { type: string; ok: boolean; id?: string; error?: string }[] = [];

    // Email al negocio
    try {
      const html = buildContactEmailHtml(name, email, phone, message);
      const res1 = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [contactEmail],
          subject: `Nuevo mensaje de contacto: ${name}`,
          text: emailBody,
          html,
        }),
      });

      const data1 = await res1.json();
      if (res1.ok) {
        responses.push({ type: 'business', ok: true, id: data1.id });
      } else {
        responses.push({ type: 'business', ok: false, error: data1.message || 'Error desconocido' });
      }
    } catch (err: any) {
      responses.push({ type: 'business', ok: false, error: err.message });
    }

    // Email de confirmación al usuario
    try {
      const confirmText = [
        `Hola ${name},`,
        ``,
        `Hemos recibido tu mensaje. Te responderemos lo antes posible.`,
        ``,
        `Gracias por contactar a HolaCitas.`,
      ].join('\n');

      const html = buildConfirmationEmailHtml(name);

      const res2 = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [email],
          subject: 'Hemos recibido tu mensaje — HolaCitas',
          text: confirmText,
          html,
        }),
      });

      const data2 = await res2.json();
      if (res2.ok) {
        responses.push({ type: 'user', ok: true, id: data2.id });
      } else {
        responses.push({ type: 'user', ok: false, error: data2.message || 'Error desconocido' });
      }
    } catch (err: any) {
      responses.push({ type: 'user', ok: false, error: err.message });
    }

    const allOk = responses.every(r => r.ok);
    const status = allOk ? 200 : 207;

    return new Response(JSON.stringify({ success: allOk, responses }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
