import { Service } from './service.model';
import { AppointmentStatus } from './appointment.model';

export interface WeeklySummaryRow {
  employee_id: string;
  employee_name: string;
  total_appointments: number;
  total_amount: number;
  total_commission: number;
}

export interface WeeklyDetailRow {
  appointment_date: string;
  appointment_time: string;
  client_name: string;
  services: Service[];
  amount_collected: number;
  status: AppointmentStatus;
  commission: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export function calculateAppointmentCommission(amountCollected: number, services: Service[]): number {
  if (!amountCollected || services.length === 0) return 0;

  const totalPrice = services.reduce((sum, s) => sum + (s.price || 0), 0);
  if (totalPrice === 0) return 0;

  return services.reduce((commission, service) => {
    const proportion = (service.price || 0) / totalPrice;
    const serviceCommission = amountCollected * proportion * (service.commission_percentage / 100);
    return commission + serviceCommission;
  }, 0);
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfWeek(date: Date): Date {
  const start = getStartOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'completed': 'Completada',
    'pending': 'Pendiente',
    'cancelled': 'Cancelada',
    'no_show': 'No asistió'
  };
  return labels[status] || status;
}

export function getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined {
  switch (status) {
    case 'completed': return 'success';
    case 'pending': return 'warn';
    case 'cancelled': return 'danger';
    case 'no_show': return 'secondary';
    default: return 'info';
  }
}