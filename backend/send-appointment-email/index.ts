import { createClient } from 'jsr:@supabase/supabase-js@2';

type EventType = 'created' | 'cancelled' | 'no_show';

interface AppointmentData {
  id: string;
  client_name: string;
  client_email: string | null;
  client_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  notes: string | null;
  cancellation_token: string | null;
  company: { name: string; address: string | null; phone: string | null };
  employee: { full_name: string; email: string };
  services: { name: string; duration_minutes: number; price: number | null }[];
}

const STATUS_LABELS: Record<EventType, string> = {
  created: 'CONFIRMADA',
  cancelled: 'CANCELADA',
  'no_show': 'NO ASISTIÓ',
};

const STATUS_COLORS: Record<EventType, string> = {
  created: '#9DC183',
  cancelled: '#E74C3C',
  'no_show': '#F39C12',
};

function buildSubject(eventType: EventType, clientName: string): string {
  return `${STATUS_LABELS[eventType]}: ${clientName}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function buildEmailText(eventType: EventType, data: AppointmentData): string {
  const servicesText = data.services.map(s => `- ${s.name} (${s.duration_minutes} min${s.price ? `, $${s.price}` : ''})`).join('\n');
  const totalDuration = data.services.reduce((sum, s) => sum + s.duration_minutes, 0);

  const lines: string[] = [];

  if (eventType === 'created') {
    lines.push(`Tu cita ha sido confirmada en ${data.company.name}.`);
  } else if (eventType === 'cancelled') {
    lines.push(`Tu cita ha sido cancelada en ${data.company.name}.`);
  } else {
    lines.push(`El cliente no asistió a la cita en ${data.company.name}.`);
  }

  lines.push('');
  lines.push(`Cliente: ${data.client_name}`);
  lines.push(`Empleado: ${data.employee.full_name}`);
  lines.push(`Fecha: ${formatDate(data.appointment_date)}`);
  lines.push(`Hora: ${data.appointment_time} (${totalDuration} min)`);
  lines.push('');
  lines.push('Servicios:');
  lines.push(servicesText);

  if (data.company.address || data.company.phone) {
    lines.push('');
    lines.push('Negocio:');
    if (data.company.address) lines.push(`Dirección: ${data.company.address}`);
    if (data.company.phone) lines.push(`Teléfono: ${data.company.phone}`);
  }

  return lines.join('\n');
}

function buildEmailHtml(eventType: EventType, data: AppointmentData): string {
  const servicesHtml = data.services.map(s => {
    const priceText = s.price ? `, $${s.price}` : '';
    return `<tr><td style="padding:6px 0;border-bottom:1px solid #eee;">• ${s.name}</td><td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;color:#5D6D7E;font-size:13px;">${s.duration_minutes} min${priceText}</td></tr>`;
  }).join('');
  const totalDuration = data.services.reduce((sum, s) => sum + s.duration_minutes, 0);

  const color = STATUS_COLORS[eventType];
  const statusText = STATUS_LABELS[eventType];

  let headline = '';
  if (eventType === 'created') {
    headline = `Tu cita ha sido <strong>confirmada</strong> en <strong>${data.company.name}</strong>`;
  } else if (eventType === 'cancelled') {
    headline = `Tu cita ha sido <strong>cancelada</strong> en <strong>${data.company.name}</strong>`;
  } else {
    headline = `El cliente <strong>no asistió</strong> a la cita en <strong>${data.company.name}</strong>`;
  }

  const companyInfo = [];
  if (data.company.address) companyInfo.push(`<div style="margin-top:4px;">📍 ${data.company.address}</div>`);
  if (data.company.phone) companyInfo.push(`<div style="margin-top:4px;">📞 ${data.company.phone}</div>`);

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${statusText}: ${data.client_name}</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF8F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#FAF8F5;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table role="presentation" width="100%" max-width="520" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;width:100%;background-color:#FFFFFF;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background-color:${color};padding:24px 28px;text-align:center;">
            <div style="color:#FFFFFF;font-size:22px;font-weight:700;letter-spacing:0.5px;">${statusText}</div>
            <div style="color:rgba(255,255,255,0.9);font-size:13px;margin-top:4px;">${data.company.name}</div>
          </td>
        </tr>
        
        <!-- Body -->
        <tr>
          <td style="padding:28px;">
            <div style="font-size:15px;color:#2C3E50;line-height:1.6;margin-bottom:24px;">${headline}</div>
            
            <!-- Details -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:20px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;">
                  <span style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Cliente</span>
                  <div style="color:#2C3E50;font-size:15px;font-weight:600;margin-top:2px;">${data.client_name}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;">
                  <span style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Empleado</span>
                  <div style="color:#2C3E50;font-size:15px;font-weight:600;margin-top:2px;">${data.employee.full_name}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;">
                  <span style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Fecha</span>
                  <div style="color:#2C3E50;font-size:15px;font-weight:600;margin-top:2px;">${formatDate(data.appointment_date)}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F0F0F0;">
                  <span style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Hora</span>
                  <div style="color:#2C3E50;font-size:15px;font-weight:600;margin-top:2px;">${data.appointment_time} <span style="color:#5D6D7E;font-weight:400;">(${totalDuration} min)</span></div>
                </td>
              </tr>
            </table>
            
            <!-- Services -->
            <div style="margin-bottom:20px;">
              <div style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:8px;">Servicios</div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${servicesHtml}
              </table>
            </div>
            
            <!-- Company info -->
            ${companyInfo.length > 0 ? `
            <div style="background-color:#FAF8F5;border-radius:8px;padding:16px;margin-top:16px;">
              <div style="color:#5D6D7E;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;margin-bottom:8px;">Negocio</div>
              <div style="color:#2C3E50;font-size:14px;line-height:1.5;">
                ${companyInfo.join('')}
              </div>
            </div>
            ` : ''}
          </td>
        </tr>
        
        <!-- Footer -->
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

function buildClientEmail(eventType: EventType, data: AppointmentData, appUrl: string): { subject: string; text: string; html: string } {
  const text = buildEmailText(eventType, data);
  let fullText = text;
  const html = buildEmailHtml(eventType, data);

  if (eventType === 'created' && data.cancellation_token) {
    fullText += `\n\n---\n¿Necesitas cancelar? Haz clic aquí:\n${appUrl}/cancelar/${data.cancellation_token}`;
  }

  return { subject: buildSubject(eventType, data.client_name), text: fullText, html };
}

function buildEmployeeEmail(eventType: EventType, data: AppointmentData): { subject: string; text: string; html: string } {
  const prefix = eventType === 'created'
    ? 'Nueva cita agendada'
    : eventType === 'cancelled'
    ? 'Cita cancelada'
    : 'Cliente no asistió';

  const text = `${prefix}\n\n${buildEmailText(eventType, data)}`;
  const html = buildEmailHtml(eventType, data);

  return { subject: buildSubject(eventType, data.client_name), text, html };
}

function buildManagerEmail(eventType: EventType, data: AppointmentData): { subject: string; text: string; html: string } {
  const prefix = eventType === 'created'
    ? 'Nueva cita agendada'
    : 'Cita cancelada';

  const text = `${prefix} para ${data.employee.full_name}\n\n${buildEmailText(eventType, data)}`;
  const html = buildEmailHtml(eventType, data);

  return { subject: buildSubject(eventType, data.client_name), text, html };
}

async function sendEmail(
  resendKey: string,
  senderEmail: string,
  to: string,
  subject: string,
  text: string,
  html: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: senderEmail, to: [to], subject, text, html }),
    });

    const data = await res.json();
    if (res.ok) return { ok: true, id: data.id };
    return { ok: false, error: data.message || 'Error desconocido' };
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
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
    const { appointment_id, event_type } = body;

    if (!appointment_id || !event_type) {
      return new Response(JSON.stringify({ error: 'appointment_id y event_type requeridos' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!['created', 'cancelled', 'no_show'].includes(event_type)) {
      return new Response(JSON.stringify({ error: 'event_type inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');
    const senderEmail = Deno.env.get('SENDER_EMAIL');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const appUrl = Deno.env.get('APP_URL') || 'https://holacitas.app';

    if (!resendKey || !senderEmail || !supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Variables de entorno no configuradas' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: apt, error: aptError } = await supabase
      .from('appointments')
      .select(`
        *,
        company:company_id (name, address, phone),
        employee:employee_id (full_name, email)
      `)
      .eq('id', appointment_id)
      .single();

    if (aptError || !apt) {
      return new Response(JSON.stringify({ error: 'Cita no encontrada' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: aptServices, error: svcError } = await supabase
      .from('appointment_services')
      .select('service:services(name, duration_minutes, price)')
      .eq('appointment_id', appointment_id);

    if (svcError) {
      return new Response(JSON.stringify({ error: 'Error al obtener servicios' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: managers } = await supabase
      .from('profiles')
      .select('email')
      .eq('company_id', apt.company_id)
      .eq('role', 'manager')
      .eq('is_active', true);

    const appointmentData: AppointmentData = {
      id: apt.id,
      client_name: apt.client_name,
      client_email: apt.client_email,
      client_phone: apt.client_phone,
      appointment_date: apt.appointment_date,
      appointment_time: apt.appointment_time.substring(0, 5),
      status: apt.status,
      notes: apt.notes,
      cancellation_token: apt.cancellation_token,
      company: {
        name: apt.company?.name || '',
        address: apt.company?.address || null,
        phone: apt.company?.phone || null,
      },
      employee: {
        full_name: apt.employee?.full_name || '',
        email: apt.employee?.email || '',
      },
      services: (aptServices || []).map((s: any) => ({
        name: s.service?.name || '',
        duration_minutes: s.service?.duration_minutes || 0,
        price: s.service?.price || null,
      })),
    };

    const evt = event_type as EventType;
    const responses: { to: string; role: string; ok: boolean; id?: string; error?: string }[] = [];

    // Email al cliente
    if (evt !== 'no_show' && appointmentData.client_email) {
      const clientEmail = buildClientEmail(evt, appointmentData, appUrl);
      const r = await sendEmail(resendKey, senderEmail, appointmentData.client_email, clientEmail.subject, clientEmail.text, clientEmail.html);
      responses.push({ to: appointmentData.client_email, role: 'client', ...r });
    }

    // Email al empleado
    if (appointmentData.employee.email) {
      const empEmail = buildEmployeeEmail(evt, appointmentData);
      const r = await sendEmail(resendKey, senderEmail, appointmentData.employee.email, empEmail.subject, empEmail.text, empEmail.html);
      responses.push({ to: appointmentData.employee.email, role: 'employee', ...r });
    }

    // Email a managers (solo created y cancelled)
    if (evt !== 'no_show' && managers) {
      for (const m of managers) {
        if (m.email) {
          const mgrEmail = buildManagerEmail(evt, appointmentData);
          const r = await sendEmail(resendKey, senderEmail, m.email, mgrEmail.subject, mgrEmail.text, mgrEmail.html);
          responses.push({ to: m.email, role: 'manager', ...r });
        }
      }
    }

    const allOk = responses.every(r => r.ok);
    return new Response(JSON.stringify({ success: allOk, responses }), {
      status: allOk ? 200 : 207,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Error interno' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
