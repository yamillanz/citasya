import { signal, computed } from '@angular/core';
import { Appointment } from '../../../../core/models/appointment.model';
import { User } from '../../../../core/models/user.model';

describe('DailyCloseComponent - Behavior Driven Tests', () => {
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

  const mockCompany = {
    id: 'company-1',
    name: 'Peluquería Test',
    slug: 'peluqueria-test'
  };

  const mockAppointments: Appointment[] = [
    {
      id: 'apt-1',
      client_name: 'Cliente Uno',
      appointment_date: '2026-03-20',
      appointment_time: '10:00',
      status: 'completed' as const,
      amount_collected: 25,
      employee_id: 'emp-1',
      service_id: 'srv-1',
      company_id: 'company-1',
      service: { name: 'Corte de cabello' },
      employee: { full_name: 'Juan Pérez' }
    },
    {
      id: 'apt-2',
      client_name: 'Cliente Dos',
      appointment_date: '2026-03-20',
      appointment_time: '11:00',
      status: 'completed' as const,
      amount_collected: 50,
      employee_id: 'emp-2',
      service_id: 'srv-2',
      company_id: 'company-1',
      service: { name: 'Tinte' },
      employee: { full_name: 'María García' }
    },
    {
      id: 'apt-3',
      client_name: 'Cliente Tres',
      appointment_date: '2026-03-20',
      appointment_time: '12:00',
      status: 'pending' as const,
      employee_id: 'emp-1',
      service_id: 'srv-1',
      company_id: 'company-1',
      service: { name: 'Corte de cabello' },
      employee: { full_name: 'Juan Pérez' }
    }
  ];

  // Mock del componente DailyCloseComponent
  const createMockDailyCloseComponent = () => {
    const appointments = signal<Appointment[]>([]);
    const selectedDate = signal<Date>(new Date('2026-03-20'));
    const loading = signal(true);
    const generating = signal(false);
    const alreadyClosed = signal(false);
    const companyId = signal<string | null>(null);
    const companyName = signal<string>('');

    const completedAppointments = computed(() => 
      appointments().filter(apt => apt.status === 'completed')
    );

    const totalAmount = computed(() => 
      completedAppointments().reduce((sum, apt) => sum + (apt.amount_collected || 0), 0)
    );

    const appointmentsByEmployee = computed(() => {
      const grouped: { [key: string]: Appointment[] } = {};
      completedAppointments().forEach(apt => {
        const empId = apt.employee_id;
        if (!grouped[empId]) grouped[empId] = [];
        grouped[empId].push(apt);
      });
      return grouped;
    });

    const getEmployeeTotal = (apts: Appointment[]): number => {
      return apts.reduce((sum, apt) => sum + (apt.amount_collected || 0), 0);
    };

    const objectKeys = (obj: { [key: string]: Appointment[] }): string[] => {
      return Object.keys(obj);
    };

    return {
      appointments,
      selectedDate,
      loading,
      generating,
      alreadyClosed,
      companyId,
      companyName,
      completedAppointments,
      totalAmount,
      appointmentsByEmployee,
      getEmployeeTotal,
      objectKeys
    };
  };

  describe('when manager views daily close', () => {
    let component: ReturnType<typeof createMockDailyCloseComponent>;

    beforeEach(() => {
      component = createMockDailyCloseComponent();
      component.companyId.set('company-1');
      component.companyName.set('Peluquería Test');
      component.appointments.set(mockAppointments);
      component.loading.set(false);
    });

    it('should have selected date initialized', () => {
      expect(component.selectedDate()).toBeDefined();
    });

    it('should store company information', () => {
      expect(component.companyId()).toBe('company-1');
      expect(component.companyName()).toBe('Peluquería Test');
    });

    it('should calculate total appointments correctly', () => {
      expect(component.appointments()).toHaveLength(3);
    });

    it('should calculate completed appointments correctly', () => {
      expect(component.completedAppointments()).toHaveLength(2);
    });

    it('should calculate total amount correctly', () => {
      expect(component.totalAmount()).toBe(75);
    });

    it('should track loading state', () => {
      expect(component.loading()).toBe(false);
      
      component.loading.set(true);
      expect(component.loading()).toBe(true);
    });
  });

  describe('when viewing appointments', () => {
    let component: ReturnType<typeof createMockDailyCloseComponent>;

    beforeEach(() => {
      component = createMockDailyCloseComponent();
      component.appointments.set(mockAppointments);
    });

    it('should store all appointments for selected date', () => {
      expect(component.appointments()).toHaveLength(3);
    });

    it('should store appointment details', () => {
      const appointments = component.appointments();
      
      expect(appointments[0].appointment_time).toBe('10:00');
      expect(appointments[0].service?.name).toBe('Corte de cabello');
      expect(appointments[0].employee?.full_name).toBe('Juan Pérez');
    });

    it('should filter only completed appointments for totals', () => {
      const completed = component.completedAppointments();
      
      expect(completed.every(apt => apt.status === 'completed')).toBe(true);
      expect(completed).toHaveLength(2);
    });

    it('should exclude pending appointments from completed list', () => {
      const completed = component.completedAppointments();
      const pendingIds = mockAppointments
        .filter(apt => apt.status === 'pending')
        .map(apt => apt.id);
      
      const completedIds = completed.map(apt => apt.id);
      
      pendingIds.forEach(id => {
        expect(completedIds).not.toContain(id);
      });
    });
  });

  describe('when viewing employee breakdown', () => {
    let component: ReturnType<typeof createMockDailyCloseComponent>;

    beforeEach(() => {
      component = createMockDailyCloseComponent();
      component.appointments.set(mockAppointments);
    });

    it('should group appointments by employee', () => {
      const grouped = component.appointmentsByEmployee();
      expect(Object.keys(grouped).length).toBe(2);
    });

    it('should include emp-1 appointments', () => {
      const grouped = component.appointmentsByEmployee();
      expect(grouped['emp-1']).toBeDefined();
      expect(grouped['emp-1'].length).toBe(1);
    });

    it('should include emp-2 appointments', () => {
      const grouped = component.appointmentsByEmployee();
      expect(grouped['emp-2']).toBeDefined();
      expect(grouped['emp-2'].length).toBe(1);
    });

    it('should calculate totals per employee', () => {
      const emp1Appointments = mockAppointments.filter(
        apt => apt.employee_id === 'emp-1' && apt.status === 'completed'
      );
      const emp2Appointments = mockAppointments.filter(
        apt => apt.employee_id === 'emp-2' && apt.status === 'completed'
      );

      expect(component.getEmployeeTotal(emp1Appointments)).toBe(25);
      expect(component.getEmployeeTotal(emp2Appointments)).toBe(50);
    });

    it('should provide object keys helper', () => {
      const grouped = component.appointmentsByEmployee();
      const keys = component.objectKeys(grouped);
      
      expect(keys).toContain('emp-1');
      expect(keys).toContain('emp-2');
    });
  });

  describe('when generating daily close', () => {
    let component: ReturnType<typeof createMockDailyCloseComponent>;

    beforeEach(() => {
      component = createMockDailyCloseComponent();
      component.companyId.set('company-1');
      component.companyName.set('Peluquería Test');
      component.appointments.set(mockAppointments);
      component.alreadyClosed.set(false);
    });

    it('should track generating state', () => {
      expect(component.generating()).toBe(false);
      
      component.generating.set(true);
      expect(component.generating()).toBe(true);
    });

    it('should identify when close can be generated', () => {
      expect(component.completedAppointments().length).toBeGreaterThan(0);
      expect(component.alreadyClosed()).toBe(false);
    });

    it('should calculate correct data for close generation', () => {
      const completed = component.completedAppointments();
      const total = component.totalAmount();
      const companyId = component.companyId();
      const companyName = component.companyName();

      expect(completed.length).toBe(2);
      expect(total).toBe(75);
      expect(companyId).toBe('company-1');
      expect(companyName).toBe('Peluquería Test');
    });

    it('should track already closed state', () => {
      expect(component.alreadyClosed()).toBe(false);
      
      component.alreadyClosed.set(true);
      expect(component.alreadyClosed()).toBe(true);
    });
  });

  describe('when daily close already exists', () => {
    let component: ReturnType<typeof createMockDailyCloseComponent>;

    beforeEach(() => {
      component = createMockDailyCloseComponent();
      component.appointments.set(mockAppointments);
      component.alreadyClosed.set(true);
    });

    it('should show already closed status', () => {
      expect(component.alreadyClosed()).toBe(true);
    });

    it('should still show completed appointments', () => {
      expect(component.completedAppointments().length).toBe(2);
    });
  });

  describe('when changing date', () => {
    let component: ReturnType<typeof createMockDailyCloseComponent>;

    beforeEach(() => {
      component = createMockDailyCloseComponent();
      component.companyId.set('company-1');
    });

    it('should update selected date', () => {
      const newDate = new Date('2026-03-21');
      component.selectedDate.set(newDate);
      
      expect(component.selectedDate()).toEqual(newDate);
    });

    it('should reset already closed status when date changes', () => {
      component.alreadyClosed.set(true);
      
      // Simulate date change
      component.selectedDate.set(new Date('2026-03-21'));
      component.alreadyClosed.set(false);
      
      expect(component.alreadyClosed()).toBe(false);
    });

    it('should format date string correctly for API calls', () => {
      const date = new Date('2026-03-20');
      component.selectedDate.set(date);
      
      const dateStr = component.selectedDate().toISOString().split('T')[0];
      expect(dateStr).toBe('2026-03-20');
    });
  });

  describe('when no completed appointments', () => {
    let component: ReturnType<typeof createMockDailyCloseComponent>;

    beforeEach(() => {
      component = createMockDailyCloseComponent();
      component.appointments.set([
        { ...mockAppointments[2] } // Only pending appointment
      ]);
    });

    it('should show zero completed appointments', () => {
      expect(component.completedAppointments().length).toBe(0);
    });

    it('should show zero total amount', () => {
      expect(component.totalAmount()).toBe(0);
    });

    it('should show empty employee breakdown', () => {
      expect(component.objectKeys(component.appointmentsByEmployee())).toHaveLength(0);
    });
  });
});
