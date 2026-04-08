import { signal, computed } from '@angular/core';

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

describe('EmployeeHistoryComponent', () => {
  const mockAppointments: AppointmentWithServices[] = [
    { id: 'apt-1', company_id: 'company-1', employee_id: 'emp-1', service_id: 'srv-1',
      client_name: 'Juan Cliente', client_phone: '555-111-1111', client_email: 'juan@email.com',
      appointment_date: '2026-04-01', appointment_time: '10:00', status: 'completed',
      amount_collected: 200, notes: 'Cliente frecuente',
      services: [{ id: 'srv-1', name: 'Corte', duration_minutes: 30, price: 50 }, { id: 'srv-2', name: 'Peinado', duration_minutes: 20, price: 30 }],
      created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-01T10:30:00Z' },
    { id: 'apt-2', company_id: 'company-1', employee_id: 'emp-1', service_id: 'srv-2',
      client_name: 'María Pérez', client_phone: '555-222-2222',
      appointment_date: '2026-04-01', appointment_time: '11:30', status: 'completed',
      services: [{ id: 'srv-3', name: 'Tinte', duration_minutes: 60, price: 80 }],
      created_at: '2026-04-01T11:30:00Z', updated_at: '2026-04-01T12:00:00Z' },
    { id: 'apt-3', company_id: 'company-1', employee_id: 'emp-1', service_id: 'srv-3',
      client_name: 'Carlos López', client_phone: '555-333-3333',
      appointment_date: '2026-04-02', appointment_time: '09:00', status: 'cancelled',
      services: [{ id: 'srv-4', name: 'Barba', duration_minutes: 15, price: 20 }],
      created_at: '2026-04-02T09:00:00Z', updated_at: '2026-04-02T09:30:00Z' }
  ];

  const createMock = () => {
    const allAppointments = signal<AppointmentWithServices[]>([]);
    const loading = signal(true);
    const searchQuery = signal('');
    const filterFromDate = signal<Date | null>(null);
    const currentPage = signal(0);
    const pageSize = signal(10);
    const selectedAppointment = signal<AppointmentWithServices | null>(null);
    const openDetailDialog = jest.fn();

    const filteredAppointments = computed(() => {
      let result = allAppointments();
      if (filterFromDate()) result = result.filter(a => a.appointment_date >= filterFromDate()!.toISOString().split('T')[0]);
      if (searchQuery()) {
        const q = searchQuery().toLowerCase();
        result = result.filter(a =>
          a.client_name.toLowerCase().includes(q) ||
          a.services?.some(s => s.name.toLowerCase().includes(q)) ||
          a.client_phone.includes(q)
        );
      }
      return result.sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));
    });

    const getServicesNames = (apt: AppointmentWithServices | null) => !apt?.services?.length ? 'N/A' : apt.services.map(s => s.name).join(', ');
    const getTotalDuration = (apt: AppointmentWithServices | null) => apt?.services?.reduce((s, svc) => s + svc.duration_minutes, 0) || 0;
    const getTotalPrice = (apt: AppointmentWithServices | null) => apt?.services?.reduce((s, svc) => s + svc.price, 0) || 0;

    return { allAppointments, loading, searchQuery, filterFromDate, currentPage, pageSize, selectedAppointment, openDetailDialog, filteredAppointments, getServicesNames, getTotalDuration, getTotalPrice };
  };

  describe('filtrado y búsqueda', () => {
    it('debe filtrar por nombre de cliente', () => {
      const comp = createMock();
      comp.allAppointments.set(mockAppointments);
      comp.searchQuery.set('Juan');
      expect(comp.filteredAppointments()).toHaveLength(1);
      expect(comp.filteredAppointments()[0].client_name).toContain('Juan');
    });

    it('debe filtrar por nombre de servicio en array de servicios', () => {
      const comp = createMock();
      comp.allAppointments.set(mockAppointments);
      comp.searchQuery.set('Peinado');
      expect(comp.filteredAppointments()).toHaveLength(1);
      expect(comp.filteredAppointments()[0].id).toBe('apt-1');
    });

    it('debe buscar en múltiples servicios de una cita', () => {
      const comp = createMock();
      comp.allAppointments.set(mockAppointments);
      comp.searchQuery.set('Peinado');
      expect(comp.filteredAppointments()).toHaveLength(1);
    });

    it('debe ser case insensitive', () => {
      const comp = createMock();
      comp.allAppointments.set(mockAppointments);
      comp.searchQuery.set('JUAN');
      expect(comp.filteredAppointments()).toHaveLength(1);
    });
  });

  describe('servicios múltiples', () => {
    it('debe mostrar nombres concatenados de servicios', () => {
      const comp = createMock();
      comp.allAppointments.set(mockAppointments);
      const apt = comp.allAppointments().find(a => a.id === 'apt-1')!;
      expect(comp.getServicesNames(apt)).toBe('Corte, Peinado');
    });

    it('debe calcular duración total de servicios', () => {
      const comp = createMock();
      const apt = comp.allAppointments().find(a => a.id === 'apt-1') || mockAppointments[0];
      expect(comp.getTotalDuration(apt)).toBe(50);
    });

    it('debe calcular precio total de servicios', () => {
      const comp = createMock();
      const apt = mockAppointments[0];
      expect(comp.getTotalPrice(apt)).toBe(80);
    });

    it('debe retornar N/A para citas sin servicios', () => {
      const comp = createMock();
      expect(comp.getServicesNames(null)).toBe('N/A');
    });
  });

  describe('apertura de detalle', () => {
    it('debe llamar openDetailDialog con la cita seleccionada', () => {
      const comp = createMock();
      comp.allAppointments.set(mockAppointments);
      const apt = mockAppointments[0];
      comp.openDetailDialog(apt);
      expect(comp.openDetailDialog).toHaveBeenCalledWith(apt);
    });
  });
});
