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

function buildSubject(eventType: EventType, clientName: string): string {
  return `${STATUS_LABELS[eventType]}: ${clientName}`;
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function buildEmailBody(eventType: EventType, data: AppointmentData): string {
  const servicesText = data.services.map(s => `- ${s.name} (${s.duration_minutes} min${s.price ? `, $${s.price}` : ''})`).join('\n');
  const totalDuration = data.services.reduce((sum, s) => sum + s.duration_minutes, 0);

  const lines: string[] = [];

  if (eventType === 'created') {
    lines.push(`Tu cita ha sido **confirmada** en ${data.company.name}.`);
  } else if (eventType === 'cancelled') {
    lines.push(`Tu cita ha sido **cancelada** en ${data.company.name}.`);
  } else {
    lines.push(`El cliente **no asistió** a la cita en ${data.company.name}.`);
  }

  lines.push('');
  lines.push(`**Cliente:** ${data.client_name}`);
  lines.push(`**Empleado:** ${data.employee.full_name}`);
  lines.push(`**Fecha:** ${formatDate(data.appointment_date)}`);
  lines.push(`**Hora:** ${data.appointment_time} (${totalDuration} min)`);
  lines.push('');
  lines.push('**Servicios:**');
  lines.push(servicesText);

  if (data.company.address || data.company.phone) {
    lines.push('');
    lines.push('**Negocio:**');
    if (data.company.address) lines.push(`Dirección: ${data.company.address}`);
    if (data.company.phone) lines.push(`Teléfono: ${data.company.phone}`);
  }

  return lines.join('\n');
}

function buildClientEmail(eventType: EventType, data: AppointmentData, appUrl: string): { subject: string; text: string } {
  let text = buildEmailBody(eventType, data);

  if (eventType === 'created' && data.cancellation_token) {
    text += `\n\n---\n¿Necesitas cancelar? Haz clic aquí:\n${appUrl}/cancelar/${data.cancellation_token}`;
  }

  return { subject: buildSubject(eventType, data.client_name), text };
}

function buildEmployeeEmail(eventType: EventType, data: AppointmentData): { subject: string; text: string } {
  const prefix = eventType === 'created'
    ? 'Nueva cita agendada'
    : eventType === 'cancelled'
    ? 'Cita cancelada'
    : 'Cliente no asistió';

  let text = `**${prefix}**\n\n${buildEmailBody(eventType, data)}`;
  return { subject: buildSubject(eventType, data.client_name), text };
}

function buildManagerEmail(eventType: EventType, data: AppointmentData): { subject: string; text: string } {
  const prefix = eventType === 'created'
    ? 'Nueva cita agendada'
    : 'Cita cancelada';

  let text = `**${prefix}** para ${data.employee.full_name}\n\n${buildEmailBody(eventType, data)}`;
  return { subject: buildSubject(eventType, data.client_name), text };
}

async function sendEmail(
  resendKey: string,
  senderEmail: string,
  to: string,
  subject: string,
  text: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: senderEmail, to: [to], subject, text }),
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
      const r = await sendEmail(resendKey, senderEmail, appointmentData.client_email, clientEmail.subject, clientEmail.text);
      responses.push({ to: appointmentData.client_email, role: 'client', ...r });
    }

    // Email al empleado
    if (appointmentData.employee.email) {
      const empEmail = buildEmployeeEmail(evt, appointmentData);
      const r = await sendEmail(resendKey, senderEmail, appointmentData.employee.email, empEmail.subject, empEmail.text);
      responses.push({ to: appointmentData.employee.email, role: 'employee', ...r });
    }

    // Email a managers (solo created y cancelled)
    if (evt !== 'no_show' && managers) {
      for (const m of managers) {
        if (m.email) {
          const mgrEmail = buildManagerEmail(evt, appointmentData);
          const r = await sendEmail(resendKey, senderEmail, m.email, mgrEmail.subject, mgrEmail.text);
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
