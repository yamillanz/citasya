import { signal, computed } from '@angular/core';
import { Appointment, AppointmentStatus } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';

describe('AppointmentsComponent - Behavior Driven Tests', () => {
  const mockUser: User = {
    id: 'user-1',
    email: 'manager@test.com',
    full_name: 'Manager Test',
    role: 'manager' as const,
    company_id: 'company-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockEmployees: User[] = [
    {
      id: 'emp-1',
      full_name: 'Juan Pérez',
      email: 'juan@test.com',
      role: 'employee' as const,
      company_id: 'company-1',
      is_active: true
    },
    {
      id: 'emp-2',
      full_name: 'María García',
      email: 'maria@test.com',
      role: 'employee' as const,
      company_id: 'company-1',
      is_active: true
    }
  ];

  const mockAppointments: Appointment[] = [
    {
      id: 'apt-1',
      client_name: 'Cliente Uno',
      client_phone: '555-111-1111',
      appointment_date: '2026-03-20',
      appointment_time: '10:00',
      status: 'pending' as const,
      employee_id: 'emp-1',
      service_id: 'srv-1',
      company_id: 'company-1',
      services: [
        { id: 'srv-1', name: 'Corte de cabello', duration_minutes: 30, price: 50 },
        { id: 'srv-2', name: 'Peinado', duration_minutes: 20, price: 30 }
      ],
      employee: { full_name: 'Juan Pérez' }
    },
    {
      id: 'apt-2',
      client_name: 'Cliente Dos',
      client_phone: '555-222-2222',
      appointment_date: '2026-03-20',
      appointment_time: '11:00',
      status: 'completed' as const,
      amount_collected: 120,
      employee_id: 'emp-2',
      service_id: 'srv-3',
      company_id: 'company-1',
      services: [
        { id: 'srv-3', name: 'Tinte', duration_minutes: 60, price: 80 },
        { id: 'srv-4', name: 'Tratamiento capilar', duration_minutes: 30, price: 40 }
      ],
      employee: { full_name: 'María García' }
    },
    {
      id: 'apt-3',
      client_name: 'Cliente Tres',
      client_phone: '555-333-3333',
      appointment_date: '2026-03-21',
      appointment_time: '14:00',
      status: 'cancelled' as const,
      employee_id: 'emp-1',
      service_id: 'srv-1',
      company_id: 'company-1',
      services: [
        { id: 'srv-1', name: 'Corte de cabello', duration_minutes: 30, price: 50 }
      ],
      employee: { full_name: 'Juan Pérez' }
    }
  ];

  // Mock del componente AppointmentsComponent
  const createMockAppointmentsComponent = () => {
    const appointments = signal<Appointment[]>([]);
    const employees = signal<User[]>([]);
    const loading = signal(true);
    const companyId = signal<string | null>(null);

    // Filters
    const filterEmployee = signal<string>('');
    const filterDate = signal<Date | null>(null);
    const filterStatus = signal<string>('');

    // Status update dialog
    const showStatusDialog = signal(false);
    const selectedAppointment = signal<Appointment | null>(null);
    const amountCollected = signal<number>(0);

    const statusOptions = [
      { label: 'Todos los estados', value: '' },
      { label: 'Pendiente', value: 'pending' },
      { label: 'Completada', value: 'completed' },
      { label: 'Cancelada', value: 'cancelled' },
      { label: 'No asistió', value: 'no_show' }
    ];

    const employeeOptions = computed(() => [
      { label: 'Todos los empleados', value: '' },
      ...employees().map(emp => ({
        label: emp.full_name,
        value: emp.id
      }))
    ]);

    const filteredAppointments = computed(() => {
      return appointments().filter(apt => {
        if (filterEmployee() && apt.employee_id !== filterEmployee()) return false;
        if (filterStatus() && apt.status !== filterStatus()) return false;
        if (filterDate()) {
          const filterDateStr = filterDate()!.toISOString().split('T')[0];
          if (apt.appointment_date !== filterDateStr) return false;
        }
        return true;
      });
    });

    const getStatusSeverity = (status: AppointmentStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined => {
      switch (status) {
        case 'completed': return 'success';
        case 'pending': return 'warn';
        case 'cancelled': return 'danger';
        case 'no_show': return 'secondary';
        default: return 'info';
      }
    };

    const getStatusLabel = (status: AppointmentStatus): string => {
      const labels: { [key in AppointmentStatus]: string } = {
        'completed': 'Completada',
        'pending': 'Pendiente',
        'cancelled': 'Cancelada',
        'no_show': 'No asistió'
      };
      return labels[status] || status;
    };

    const getServicesNames = (apt: Appointment | null): string => {
      if (!apt?.services || apt.services.length === 0) return 'N/A';
      return apt.services.map(s => s.name).join(', ');
    };

    const getTotalDuration = (apt: Appointment | null): number => {
      if (!apt?.services) return 0;
      return apt.services.reduce((sum, s) => sum + s.duration_minutes, 0);
    };

    const getTotalPrice = (apt: Appointment | null): number => {
      if (!apt?.services) return 0;
      return apt.services.reduce((sum, s) => sum + s.price, 0);
    };

    const formatDate = (dateStr: string): string => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    };

    return {
      appointments,
      employees,
      loading,
      companyId,
      filterEmployee,
      filterDate,
      filterStatus,
      showStatusDialog,
      selectedAppointment,
      amountCollected,
      statusOptions,
      employeeOptions,
      filteredAppointments,
      getStatusSeverity,
      getStatusLabel,
      formatDate,
      getServicesNames,
      getTotalDuration,
      getTotalPrice
    };
  };

  describe('when manager views appointments', () => {
    let component: ReturnType<typeof createMockAppointmentsComponent>;

    beforeEach(() => {
      component = createMockAppointmentsComponent();
      component.appointments.set(mockAppointments);
      component.employees.set(mockEmployees);
      component.loading.set(false);
    });

    it('should store all appointments', () => {
      expect(component.appointments()).toHaveLength(3);
    });

    it('should store all employees', () => {
      expect(component.employees()).toHaveLength(2);
    });

    it('should store client names correctly', () => {
      const names = component.appointments().map(apt => apt.client_name);
      expect(names).toContain('Cliente Uno');
      expect(names).toContain('Cliente Dos');
      expect(names).toContain('Cliente Tres');
    });

    it('should store appointment times correctly', () => {
      const times = component.appointments().map(apt => apt.appointment_time);
      expect(times).toContain('10:00');
      expect(times).toContain('11:00');
      expect(times).toContain('14:00');
    });

    it('should store appointment statuses correctly', () => {
      const statuses = component.appointments().map(apt => apt.status);
      expect(statuses).toContain('pending');
      expect(statuses).toContain('completed');
      expect(statuses).toContain('cancelled');
    });

    it('should store services and employee data for each appointment', () => {
      const allServiceNames = component.appointments().flatMap(apt => 
        apt.services?.map(s => s.name) || []
      );
      const employeeNames = component.appointments().map(apt => apt.employee?.full_name);

      expect(allServiceNames).toContain('Corte de cabello');
      expect(allServiceNames).toContain('Peinado');
      expect(allServiceNames).toContain('Tinte');
      expect(allServiceNames).toContain('Tratamiento capilar');
      expect(employeeNames).toContain('Juan Pérez');
      expect(employeeNames).toContain('María García');
    });

    it('should track amount collected for completed appointments', () => {
      const completed = component.appointments().find(apt => apt.status === 'completed');
      expect(completed?.amount_collected).toBe(120);
    });
  });

  describe('when filtering appointments', () => {
    let component: ReturnType<typeof createMockAppointmentsComponent>;

    beforeEach(() => {
      component = createMockAppointmentsComponent();
      component.appointments.set(mockAppointments);
    });

    it('should filter by employee', () => {
      component.filterEmployee.set('emp-1');

      const filtered = component.filteredAppointments();
      expect(filtered.every(apt => apt.employee_id === 'emp-1')).toBe(true);
      expect(filtered.length).toBe(2);
    });

    it('should filter by status', () => {
      component.filterStatus.set('completed');

      const filtered = component.filteredAppointments();
      expect(filtered.every(apt => apt.status === 'completed')).toBe(true);
      expect(filtered.length).toBe(1);
    });

    it('should filter by date', () => {
      component.filterDate.set(new Date('2026-03-20'));

      const filtered = component.filteredAppointments();
      expect(filtered.every(apt => apt.appointment_date === '2026-03-20')).toBe(true);
      expect(filtered.length).toBe(2);
    });

    it('should combine multiple filters', () => {
      component.filterEmployee.set('emp-1');
      component.filterStatus.set('pending');

      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('apt-1');
    });
  });

  describe('when managing appointment status', () => {
    let component: ReturnType<typeof createMockAppointmentsComponent>;

    beforeEach(() => {
      component = createMockAppointmentsComponent();
      component.appointments.set([...mockAppointments]);
    });

    it('should track selected appointment for status update', () => {
      const appointment = mockAppointments[0];
      component.selectedAppointment.set(appointment);
      
      expect(component.selectedAppointment()?.id).toBe('apt-1');
    });

    it('should track amount to collect for completion', () => {
      component.amountCollected.set(30);
      
      expect(component.amountCollected()).toBe(30);
    });

    it('should update appointment status in local state', () => {
      const updatedAppointments = component.appointments().map(apt => 
        apt.id === 'apt-1' 
          ? { ...apt, status: 'completed' as const, amount_collected: 30 }
          : apt
      );
      component.appointments.set(updatedAppointments);

      const updated = component.appointments().find(apt => apt.id === 'apt-1');
      expect(updated?.status).toBe('completed');
      expect(updated?.amount_collected).toBe(30);
    });
  });

  describe('status helpers', () => {
    let component: ReturnType<typeof createMockAppointmentsComponent>;

    beforeEach(() => {
      component = createMockAppointmentsComponent();
    });

    it('should return correct severity for each status', () => {
      expect(component.getStatusSeverity('completed')).toBe('success');
      expect(component.getStatusSeverity('pending')).toBe('warn');
      expect(component.getStatusSeverity('cancelled')).toBe('danger');
      expect(component.getStatusSeverity('no_show')).toBe('secondary');
    });

    it('should return correct label for each status', () => {
      expect(component.getStatusLabel('completed')).toBe('Completada');
      expect(component.getStatusLabel('pending')).toBe('Pendiente');
      expect(component.getStatusLabel('cancelled')).toBe('Cancelada');
      expect(component.getStatusLabel('no_show')).toBe('No asistió');
    });

    it('should format date correctly', () => {
      const formatted = component.formatDate('2026-03-20');
      expect(formatted).toContain('20');
      expect(formatted).toContain('mar');
    });
  });

  describe('employee options', () => {
    let component: ReturnType<typeof createMockAppointmentsComponent>;

    beforeEach(() => {
      component = createMockAppointmentsComponent();
      component.employees.set(mockEmployees);
    });

    it('should include "Todos los empleados" as first option', () => {
      const options = component.employeeOptions();
      expect(options[0].label).toBe('Todos los empleados');
      expect(options[0].value).toBe('');
    });

    it('should include all employees in options', () => {
      const options = component.employeeOptions();
      expect(options).toHaveLength(3); // Including default option
      expect(options[1].label).toBe('Juan Pérez');
      expect(options[2].label).toBe('María García');
    });
  });

  describe('multi-service display in manager view', () => {
    let component: ReturnType<typeof createMockAppointmentsComponent>;

    beforeEach(() => {
      component = createMockAppointmentsComponent();
      component.appointments.set(mockAppointments);
      component.employees.set(mockEmployees);
      component.loading.set(false);
    });

    it('should display comma-separated service names for multi-service appointment', () => {
      const apt = mockAppointments.find(a => a.id === 'apt-1')!; // Corte + Peinado
      const names = component.getServicesNames(apt);
      expect(names).toBe('Corte de cabello, Peinado');
    });

    it('should display single service name correctly', () => {
      const apt = mockAppointments.find(a => a.id === 'apt-3')!; // Corte only
      const names = component.getServicesNames(apt);
      expect(names).toBe('Corte de cabello');
    });

    it('should calculate total duration for multi-service appointment', () => {
      const apt = mockAppointments.find(a => a.id === 'apt-1')!; // 30 + 20 = 50
      expect(component.getTotalDuration(apt)).toBe(50);
    });

    it('should calculate total price for multi-service appointment', () => {
      const apt = mockAppointments.find(a => a.id === 'apt-1')!; // 50 + 30 = 80
      expect(component.getTotalPrice(apt)).toBe(80);
    });

    it('should handle appointment without services array', () => {
      expect(component.getServicesNames(null)).toBe('N/A');
      expect(component.getTotalDuration(null)).toBe(0);
      expect(component.getTotalPrice(null)).toBe(0);
    });

    it('should calculate combined totals across all appointments', () => {
      const totalRevenue = component.appointments()
        .filter(apt => apt.status === 'completed')
        .reduce((sum, apt) => sum + component.getTotalPrice(apt), 0);
      expect(totalRevenue).toBe(120); // apt-2: 80 + 40
    });
  });
});
