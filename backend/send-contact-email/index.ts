import { createClient } from 'jsr:@supabase/supabase-js@2';

const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const RATE_LIMIT_MAX = 3;

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
      const confirmBody = [
        `Hola ${name},`,
        ``,
        `Hemos recibido tu mensaje. Te responderemos lo antes posible.`,
        ``,
        `Gracias por contactar a CitasYa.`,
      ].join('\n');

      const res2 = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [email],
          subject: 'Hemos recibido tu mensaje — CitasYa',
          text: confirmBody,
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
