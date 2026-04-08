import { signal } from '@angular/core';

interface AppointmentService {
  id: string; name: string; duration_minutes: number; price: number;
}

interface AppointmentWithServices {
  id: string; company_id: string; employee_id: string; service_id: string;
  client_name: string; client_phone: string; client_email?: string;
  appointment_date: string; appointment_time: string; status: string;
  amount_collected?: number; notes?: string; services?: AppointmentService[];
  created_at: string; updated_at: string;
}

describe('AppointmentDetailDialogComponent', () => {
  const multiServiceAppointment: AppointmentWithServices = {
    id: 'apt-1', company_id: 'company-1', employee_id: 'emp-1', service_id: 'srv-1',
    client_name: 'Juan Cliente', client_phone: '555-111-1111', client_email: 'juan@email.com',
    appointment_date: '2026-04-01', appointment_time: '10:30', status: 'completed',
    amount_collected: 150, notes: 'Cliente frecuente',
    services: [
      { id: 'srv-1', name: 'Corte premium', duration_minutes: 30, price: 50 },
      { id: 'srv-2', name: 'Peinado', duration_minutes: 20, price: 30 }
    ],
    created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-01T10:30:00Z'
  };

  const pendingAppointment: AppointmentWithServices = {
    id: 'apt-2', company_id: 'company-1', employee_id: 'emp-1', service_id: 'srv-2',
    client_name: 'María', client_phone: '555-222-2222',
    appointment_date: '2026-04-02', appointment_time: '14:00', status: 'pending',
    services: [{ id: 'srv-2', name: 'Tinte', duration_minutes: 60, price: 80 }],
    created_at: '2026-04-02T14:00:00Z', updated_at: '2026-04-02T14:30:00Z'
  };

  const cancelledAppointment: AppointmentWithServices = {
    id: 'apt-3', company_id: 'company-1', employee_id: 'emp-1', service_id: 'srv-3',
    client_name: 'Carlos', client_phone: '555-333-3333',
    appointment_date: '2026-04-03', appointment_time: '09:00', status: 'cancelled',
    services: [{ id: 'srv-3', name: 'Barba', duration_minutes: 15, price: 20 }],
    created_at: '2026-04-03T09:00:00Z', updated_at: '2026-04-03T09:30:00Z'
  };

  const createMock = () => {
    const appointment = signal<AppointmentWithServices | null>(null);
    const visible = signal(false);
    const currentIndex = signal(0);
    const totalCount = signal(0);
    const hasPrevious = signal(false);
    const hasNext = signal(false);
    const onClose = jest.fn();
    const onPrevious = jest.fn();
    const onNext = jest.fn();

    const getStatusLabel = (s: string) => ({ completed: 'Completada', pending: 'Pendiente', cancelled: 'Cancelada', no_show: 'No asistió' }[s] || s);
    const getStatusSeverity = (s: string) => ({ completed: 'success', pending: 'warn', cancelled: 'danger', no_show: 'secondary' }[s] || 'info') as any;
    const getServicesNames = (apt: AppointmentWithServices | null) => !apt?.services?.length ? 'N/A' : apt.services.map(s => s.name).join(', ');
    const getTotalDuration = (apt: AppointmentWithServices | null) => apt?.services?.reduce((s, svc) => s + svc.duration_minutes, 0) || 0;
    const getTotalPrice = (apt: AppointmentWithServices | null) => apt?.services?.reduce((s, svc) => s + svc.price, 0) || 0;
    const canEditServices = (apt: AppointmentWithServices | null) => apt?.status === 'pending';

    return { appointment, visible, currentIndex, totalCount, hasPrevious, hasNext, onClose, onPrevious, onNext, getStatusLabel, getStatusSeverity, getServicesNames, getTotalDuration, getTotalPrice, canEditServices };
  };

  describe('navegación entre citas', () => {
    it('debe llamar onClose al cerrar', () => {
      const comp = createMock();
      comp.onClose();
      expect(comp.onClose).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onPrevious al navegar atrás', () => {
      const comp = createMock();
      comp.hasPrevious.set(true);
      comp.onPrevious();
      expect(comp.onPrevious).toHaveBeenCalledTimes(1);
    });

    it('debe llamar onNext al navegar adelante', () => {
      const comp = createMock();
      comp.hasNext.set(true);
      comp.onNext();
      expect(comp.onNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('servicios múltiples', () => {
    it('debe mostrar nombres de todos los servicios concatenados', () => {
      const comp = createMock();
      comp.appointment.set(multiServiceAppointment);
      expect(comp.getServicesNames(comp.appointment())).toBe('Corte premium, Peinado');
    });

    it('debe calcular duración total de todos los servicios', () => {
      const comp = createMock();
      comp.appointment.set(multiServiceAppointment);
      expect(comp.getTotalDuration(comp.appointment())).toBe(50);
    });

    it('debe calcular precio total de todos los servicios', () => {
      const comp = createMock();
      comp.appointment.set(multiServiceAppointment);
      expect(comp.getTotalPrice(comp.appointment())).toBe(80);
    });

    it('debe retornar N/A si no hay servicios', () => {
      const comp = createMock();
      expect(comp.getServicesNames(null)).toBe('N/A');
      expect(comp.getTotalDuration(null)).toBe(0);
      expect(comp.getTotalPrice(null)).toBe(0);
    });
  });

  describe('edición de servicios', () => {
    it('debe permitir editar solo citas pendientes', () => {
      const comp = createMock();
      expect(comp.canEditServices(pendingAppointment)).toBe(true);
    });

    it('debe bloquear edición en citas completadas', () => {
      const comp = createMock();
      expect(comp.canEditServices(multiServiceAppointment)).toBe(false);
    });

    it('debe bloquear edición en citas canceladas', () => {
      const comp = createMock();
      expect(comp.canEditServices(cancelledAppointment)).toBe(false);
    });
  });

  describe('status helpers', () => {
    it('debe retornar severity correcto por cada estado', () => {
      const comp = createMock();
      expect(comp.getStatusSeverity('completed')).toBe('success');
      expect(comp.getStatusSeverity('pending')).toBe('warn');
      expect(comp.getStatusSeverity('cancelled')).toBe('danger');
    });

    it('debe retornar label correcto por cada estado', () => {
      const comp = createMock();
      expect(comp.getStatusLabel('completed')).toBe('Completada');
      expect(comp.getStatusLabel('pending')).toBe('Pendiente');
    });
  });
});
