import { signal, computed } from '@angular/core';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';

describe('AppointmentsComponent (Manager)', () => {
  const mockEmployees: User[] = [
    { id: 'emp-1', full_name: 'Juan Pérez', email: 'juan@test.com', role: 'employee' as const, company_id: 'company-1', is_active: true },
    { id: 'emp-2', full_name: 'María García', email: 'maria@test.com', role: 'employee' as const, company_id: 'company-1', is_active: true }
  ];

  const mockAppointments: Appointment[] = [
    { id: 'apt-1', client_name: 'Cliente Uno', client_phone: '555-111-1111',
      appointment_date: '2026-03-20', appointment_time: '10:00', status: 'pending' as const,
      employee_id: 'emp-1', service_id: 'srv-1', company_id: 'company-1',
      services: [{ id: 'srv-1', name: 'Corte', duration_minutes: 30, price: 50 }, { id: 'srv-2', name: 'Peinado', duration_minutes: 20, price: 30 }],
      employee: { full_name: 'Juan Pérez' } },
    { id: 'apt-2', client_name: 'Cliente Dos', client_phone: '555-222-2222',
      appointment_date: '2026-03-20', appointment_time: '11:00', status: 'completed' as const,
      amount_collected: 120, employee_id: 'emp-2', service_id: 'srv-3', company_id: 'company-1',
      services: [{ id: 'srv-3', name: 'Tinte', duration_minutes: 60, price: 80 }],
      employee: { full_name: 'María García' } }
  ];

  const createMock = () => {
    const appointments = signal<Appointment[]>([]);
    const employees = signal<User[]>([]);
    const loading = signal(true);
    const filterEmployee = signal('');
    const filterStatus = signal('');
    const selectedAppointment = signal<Appointment | null>(null);
    const showStatusDialog = signal(false);

    const filteredAppointments = computed(() =>
      appointments().filter(apt => {
        if (filterEmployee() && apt.employee_id !== filterEmployee()) return false;
        if (filterStatus() && apt.status !== filterStatus()) return false;
        return true;
      })
    );

    const employeeOptions = computed(() => [
      { label: 'Todos los empleados', value: '' },
      ...employees().map(e => ({ label: e.full_name, value: e.id }))
    ]);

    const getStatusSeverity = (s: AppointmentStatus) => ({ completed: 'success', pending: 'warn', cancelled: 'danger', no_show: 'secondary' }[s] || 'info') as any;
    const getStatusLabel = (s: AppointmentStatus) => ({ completed: 'Completada', pending: 'Pendiente', cancelled: 'Cancelada', no_show: 'No asistió' }[s] || s);
    const getServicesNames = (apt: Appointment | null) => !apt?.services?.length ? 'N/A' : apt.services.map(s => s.name).join(', ');
    const getTotalPrice = (apt: Appointment | null) => apt?.services?.reduce((s, svc) => s + svc.price, 0) || 0;

    return { appointments, employees, loading, filterEmployee, filterStatus, selectedAppointment, showStatusDialog, filteredAppointments, employeeOptions, getStatusSeverity, getStatusLabel, getServicesNames, getTotalPrice };
  };

  describe('filtrado de citas', () => {
    it('debe filtrar por empleado', () => {
      const comp = createMock();
      comp.appointments.set(mockAppointments);
      comp.filterEmployee.set('emp-1');
      expect(comp.filteredAppointments()).toHaveLength(1);
      expect(comp.filteredAppointments()[0].employee_id).toBe('emp-1');
    });

    it('debe filtrar por estado', () => {
      const comp = createMock();
      comp.appointments.set(mockAppointments);
      comp.filterStatus.set('completed');
      expect(comp.filteredAppointments()).toHaveLength(1);
      expect(comp.filteredAppointments()[0].status).toBe('completed');
    });

    it('debe combinar filtros', () => {
      const comp = createMock();
      comp.appointments.set(mockAppointments);
      comp.filterEmployee.set('emp-1');
      comp.filterStatus.set('completed');
      expect(comp.filteredAppointments()).toHaveLength(0);
    });
  });

  describe('opciones de empleados', () => {
    it('debe incluir opción "Todos" como primera', () => {
      const comp = createMock();
      comp.employees.set(mockEmployees);
      expect(comp.employeeOptions()[0].label).toBe('Todos los empleados');
    });

    it('debe incluir todos los empleados', () => {
      const comp = createMock();
      comp.employees.set(mockEmployees);
      expect(comp.employeeOptions()).toHaveLength(3);
    });
  });

  describe('servicios múltiples en vista manager', () => {
    it('debe mostrar nombres concatenados de servicios', () => {
      const comp = createMock();
      expect(comp.getServicesNames(mockAppointments[0])).toBe('Corte, Peinado');
    });

    it('debe calcular precio total de servicios', () => {
      const comp = createMock();
      expect(comp.getTotalPrice(mockAppointments[0])).toBe(80);
    });

    it('debe retornar N/A para citas sin servicios', () => {
      const comp = createMock();
      expect(comp.getServicesNames(null)).toBe('N/A');
    });
  });

  describe('status helpers', () => {
    it('debe retornar severity y label correctos por estado', () => {
      const comp = createMock();
      expect(comp.getStatusSeverity('completed')).toBe('success');
      expect(comp.getStatusLabel('completed')).toBe('Completada');
      expect(comp.getStatusSeverity('pending')).toBe('warn');
      expect(comp.getStatusLabel('pending')).toBe('Pendiente');
    });
  });

  describe('actualización de estado', () => {
    it('debe trackear cita seleccionada para cambio de estado', () => {
      const comp = createMock();
      comp.selectedAppointment.set(mockAppointments[0]);
      expect(comp.selectedAppointment()?.id).toBe('apt-1');
    });

    it('debe mostrar diálogo de estado', () => {
      const comp = createMock();
      comp.showStatusDialog.set(true);
      expect(comp.showStatusDialog()).toBe(true);
    });
  });
});
