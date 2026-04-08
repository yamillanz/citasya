import { Service } from './service.model';

export type AppointmentStatus = 'pending' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  company_id: string;
  employee_id: string;
  service_id: string; // Deprecated: use services array instead
  services?: Service[]; // New: array of services
  client_name: string;
  client_phone: string;
  client_email?: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  amount_collected?: number;
  notes?: string;
  cancellation_token?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAppointmentDto {
  company_id: string;
  employee_id: string;
  service_ids: string[]; // Changed from single service_id to array
  client_name: string;
  client_phone: string;
  client_email?: string;
  appointment_date: string;
  appointment_time: string;
  notes?: string;
}

export interface UpdateAppointmentServicesDto {
  appointment_id: string;
  service_ids: string[];
}

// Helper functions
export function calculateTotalDuration(services: Service[]): number {
  return services.reduce((sum, service) => sum + service.duration_minutes, 0);
}

export function calculateTotalPrice(services: Service[]): number {
  return services.reduce((sum, service) => sum + (service.price || 0), 0);
}

export function formatServicesList(services: Service[]): string {
  return services.map(service => service.name).join(', ');
}
