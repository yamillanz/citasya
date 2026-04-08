export interface AppointmentService {
  appointment_id: string;
  service_id: string;
  created_at: string;
}

export interface CreateAppointmentServiceDto {
  appointment_id: string;
  service_id: string;
}