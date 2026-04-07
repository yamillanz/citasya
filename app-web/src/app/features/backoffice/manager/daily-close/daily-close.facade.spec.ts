import { TestBed } from '@angular/core/testing';
import { DailyCloseFacade, Employee, AppointmentWithRelations } from './daily-close.facade';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DailyCloseService } from '../../../../core/services/daily-close.service';
import { CompanyService } from '../../../../core/services/company.service';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';
import { AppointmentStatus } from '../../../../core/models/appointment.model';

describe('DailyCloseFacade', () => {
  let facade: DailyCloseFacade;
  let mockAppointmentService: any;
  let mockDailyCloseService: any;
  let mockCompanyService: any;
  let mockAuthService: any;

  const mockUser: User = {
    id: 'user-1',
    email: 'manager@test.com',
    full_name: 'Manager Test',
    role: 'manager',
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

  const createMockAppointment = (overrides: Partial<AppointmentWithRelations> = {}): AppointmentWithRelations => ({
    id: 'apt-1',
    client_name: 'Cliente Uno',
    appointment_date: '2026-03-20',
    appointment_time: '10:00',
    status: 'completed' as AppointmentStatus,
    amount_collected: 25,
    employee_id: 'emp-1',
    service_id: 'srv-1',
    company_id: 'company-1',
    service: { name: 'Corte de cabello' },
    employee: { full_name: 'Juan Pérez' },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    notes: '',
    cancellation_token: '',
    client_phone: '',
    client_email: '',
    ...overrides
  });

  const mockAppointments: AppointmentWithRelations[] = [
    createMockAppointment({ id: 'apt-1', status: 'completed', amount_collected: 25, employee_id: 'emp-1', employee: { full_name: 'Juan Pérez' } }),
    createMockAppointment({ id: 'apt-2', status: 'completed', amount_collected: 50, employee_id: 'emp-2', appointment_time: '11:00', employee: { full_name: 'María García' }, service: { name: 'Tinte' } }),
    createMockAppointment({ id: 'apt-3', status: 'pending', employee_id: 'emp-1', appointment_time: '12:00', employee: { full_name: 'Juan Pérez' } }),
    createMockAppointment({ id: 'apt-4', status: 'no_show', employee_id: 'emp-3', appointment_time: '14:00', employee: { full_name: 'Pedro López' }, service: { name: 'Manicure' } })
  ];

  beforeEach(() => {
    mockAppointmentService = {
      getByDate: jest.fn(),
      updateStatus: jest.fn()
    };
    mockDailyCloseService = {
      checkIfClosed: jest.fn(),
      generateDailyClose: jest.fn()
    };
    mockCompanyService = {
      getById: jest.fn()
    };
    mockAuthService = {
      getCurrentUser: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        DailyCloseFacade,
        { provide: AppointmentService, useValue: mockAppointmentService },
        { provide: DailyCloseService, useValue: mockDailyCloseService },
        { provide: CompanyService, useValue: mockCompanyService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    facade = TestBed.inject(DailyCloseFacade);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should be created', () => {
      expect(facade).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(facade.loading()).toBe(false);
      expect(facade.appointments()).toEqual([]);
      expect(facade.selectedEmployee()).toBeNull();
      expect(facade.selectedDate()).toBeInstanceOf(Date);
      expect(facade.alreadyClosed()).toBe(false);
    });

    it('should load user data and appointments on initialize', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);

      await facade.initialize();

      expect(facade.companyId()).toBe('company-1');
      expect(facade.companyName()).toBe('Peluquería Test');
      expect(facade.appointments()).toHaveLength(4);
      expect(facade.loading()).toBe(false);
    });

    it('should set loading to false even if user has no company', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue({ ...mockUser, company_id: null });

      await facade.initialize();

      expect(facade.loading()).toBe(false);
      expect(facade.companyId()).toBeNull();
    });

    it('should handle error loading company name gracefully', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockRejectedValue(new Error('Company not found'));
      mockAppointmentService.getByDate.mockResolvedValue([]);

      await facade.initialize();

      expect(facade.companyName()).toBe('');
      expect(facade.loading()).toBe(false);
    });
  });

  describe('Appointments Loading', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);
    });

    it('should load appointments for selected date', async () => {
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);

      await facade.initialize();

      expect(mockAppointmentService.getByDate).toHaveBeenCalledWith('company-1', expect.any(String));
      expect(facade.appointments()).toHaveLength(4);
    });

    it('should check if day is already closed', async () => {
      mockDailyCloseService.checkIfClosed.mockResolvedValue(true);
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);

      await facade.initialize();

      expect(mockDailyCloseService.checkIfClosed).toHaveBeenCalledWith('company-1', expect.any(String));
      expect(facade.alreadyClosed()).toBe(true);
    });

    it('should select first employee by default after loading', async () => {
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);

      await facade.initialize();

      expect(facade.selectedEmployee()).not.toBeNull();
    });

    it('should handle error loading appointments', async () => {
      mockAppointmentService.getByDate.mockRejectedValue(new Error('Network error'));

      await expect(facade.initialize()).rejects.toThrow('Network error');
      expect(facade.loading()).toBe(false);
    });

    it('should not load appointments without company id', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue({ ...mockUser, company_id: null });

      await facade.initialize();

      expect(mockAppointmentService.getByDate).not.toHaveBeenCalled();
    });
  });

  describe('Employee Management', () => {
    beforeEach(async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);
      await facade.initialize();
    });

    it('should extract unique employees from appointments', () => {
      const employees = facade.employees();

      expect(employees).toHaveLength(3);
      expect(employees.map(e => e.id)).toContain('emp-1');
      expect(employees.map(e => e.id)).toContain('emp-2');
      expect(employees.map(e => e.id)).toContain('emp-3');
    });

    it('should allow selecting an employee', () => {
      const employee: Employee = { id: 'emp-2', full_name: 'María García' };

      facade.selectEmployee(employee);

      expect(facade.selectedEmployee()?.id).toBe('emp-2');
    });

    it('should allow deselecting an employee', () => {
      facade.selectEmployee(null);

      expect(facade.selectedEmployee()).toBeNull();
    });

    it('should filter appointments by selected employee', () => {
      const emp1 = facade.employees().find(e => e.id === 'emp-1')!;
      facade.selectEmployee(emp1);

      const appointments = facade.filteredAppointments();
      expect(appointments).toHaveLength(2);
      expect(appointments.every(a => a.employee_id === 'emp-1')).toBe(true);
    });

    it('should sort appointments by time', () => {
      const emp1 = facade.employees().find(e => e.id === 'emp-1')!;
      facade.selectEmployee(emp1);

      const appointments = facade.filteredAppointments();
      expect(appointments[0].appointment_time).toBe('10:00');
      expect(appointments[1].appointment_time).toBe('12:00');
    });

    it('should return empty array when no employee selected', () => {
      facade.selectEmployee(null);

      expect(facade.filteredAppointments()).toHaveLength(0);
    });
  });

  describe('Statistics Calculation', () => {
    beforeEach(async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);
      await facade.initialize();
    });

    it('should calculate day statistics correctly', () => {
      const stats = facade.dayStats();

      expect(stats.totalAppointments).toBe(4);
      expect(stats.completedCount).toBe(2);
      expect(stats.pendingCount).toBe(1);
      expect(stats.totalAmount).toBe(75); // 25 + 50
    });

    it('should calculate employee statistics correctly', () => {
      const emp1Stats = facade.getEmployeeStats('emp-1');

      expect(emp1Stats.totalAppointments).toBe(2);
      expect(emp1Stats.completedCount).toBe(1);
      expect(emp1Stats.pendingCount).toBe(1);
      expect(emp1Stats.totalAmount).toBe(25);
    });

    it('should return default stats for unknown employee', () => {
      const stats = facade.getEmployeeStats('unknown-emp');

      expect(stats.totalAppointments).toBe(0);
      expect(stats.totalAmount).toBe(0);
      expect(stats.completedCount).toBe(0);
      expect(stats.pendingCount).toBe(0);
    });

    it('should filter completed appointments correctly', () => {
      const completed = facade.completedAppointments();

      expect(completed).toHaveLength(2);
      expect(completed.every(a => a.status === 'completed')).toBe(true);
    });
  });

  describe('Date Navigation', () => {
    beforeEach(async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);
      await facade.initialize();
    });

    it('should navigate to previous day', () => {
      const initialDate = new Date(facade.selectedDate());

      facade.navigateToPreviousDay();

      const newDate = facade.selectedDate();
      expect(newDate.getDate()).toBe(initialDate.getDate() - 1);
    });

    it('should navigate to next day when allowed', async () => {
      // Set date to yesterday to allow next navigation
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Reload with yesterday's date
      mockAppointmentService.getByDate.mockClear();
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);
      
      facade.onDateChange(yesterday);
      await facade.loadAppointments();

      const initialDate = new Date(facade.selectedDate());

      facade.navigateToNextDay();

      const newDate = facade.selectedDate();
      expect(newDate.getDate()).toBe(initialDate.getDate() + 1);
    });

    it('should not navigate to future dates', () => {
      facade.onDateChange(new Date());

      facade.navigateToNextDay();

      // Should still be today
      expect(facade.selectedDate().toDateString()).toBe(new Date().toDateString());
    });

    it('should reload appointments when date changes', async () => {
      mockAppointmentService.getByDate.mockClear();
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);

      await facade.loadAppointments();

      expect(mockAppointmentService.getByDate).toHaveBeenCalled();
    });

    it('should correctly identify today', () => {
      facade.onDateChange(new Date());
      expect(facade.isToday()).toBe(true);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      facade.onDateChange(yesterday);
      expect(facade.isToday()).toBe(false);
    });

    it('should correctly determine if can navigate to next day', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      facade.onDateChange(today);
      expect(facade.canNavigateNext()).toBe(false);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      facade.onDateChange(yesterday);
      expect(facade.canNavigateNext()).toBe(true);
    });
  });

  describe('Appointment Actions', () => {
    beforeEach(async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);
      await facade.initialize();
    });

    describe('Complete Appointment', () => {
      it('should complete appointment with amount', async () => {
        mockAppointmentService.updateStatus.mockResolvedValue(undefined);

        await facade.confirmAppointmentCompletion('apt-3', 75);

        expect(mockAppointmentService.updateStatus).toHaveBeenCalledWith('apt-3', 'completed', 75);
      });

      it('should throw error if amount is invalid', async () => {
        await expect(facade.confirmAppointmentCompletion('apt-3', 0))
          .rejects.toThrow('El monto debe ser mayor a 0');
        await expect(facade.confirmAppointmentCompletion('apt-3', -10))
          .rejects.toThrow('El monto debe ser mayor a 0');
      });

      it('should update local appointments state after completion', async () => {
        mockAppointmentService.updateStatus.mockResolvedValue(undefined);

        await facade.confirmAppointmentCompletion('apt-3', 75);

        const updatedAppointment = facade.appointments().find(a => a.id === 'apt-3');
        expect(updatedAppointment?.status).toBe('completed');
        expect(updatedAppointment?.amount_collected).toBe(75);
      });

      it('should propagate error from service', async () => {
        mockAppointmentService.updateStatus.mockRejectedValue(new Error('Update failed'));

        await expect(facade.confirmAppointmentCompletion('apt-3', 75))
          .rejects.toThrow('Update failed');
      });
    });

    describe('Mark as No-Show', () => {
      it('should mark appointment as no-show', async () => {
        mockAppointmentService.updateStatus.mockResolvedValue(undefined);

        await facade.markAppointmentAsNoShow('apt-3');

        expect(mockAppointmentService.updateStatus).toHaveBeenCalledWith('apt-3', 'no_show');
      });

      it('should update local appointments state after no-show', async () => {
        mockAppointmentService.updateStatus.mockResolvedValue(undefined);

        await facade.markAppointmentAsNoShow('apt-3');

        const updatedAppointment = facade.appointments().find(a => a.id === 'apt-3');
        expect(updatedAppointment?.status).toBe('no_show');
      });

      it('should propagate error from service', async () => {
        mockAppointmentService.updateStatus.mockRejectedValue(new Error('Update failed'));

        await expect(facade.markAppointmentAsNoShow('apt-3'))
          .rejects.toThrow('Update failed');
      });
    });

    describe('Cancel Appointment', () => {
      it('should cancel appointment', async () => {
        mockAppointmentService.updateStatus.mockResolvedValue(undefined);

        await facade.cancelAppointment('apt-3');

        expect(mockAppointmentService.updateStatus).toHaveBeenCalledWith('apt-3', 'cancelled');
      });

      it('should update local appointments state after cancellation', async () => {
        mockAppointmentService.updateStatus.mockResolvedValue(undefined);

        await facade.cancelAppointment('apt-3');

        const updatedAppointment = facade.appointments().find(a => a.id === 'apt-3');
        expect(updatedAppointment?.status).toBe('cancelled');
      });

      it('should propagate error from service', async () => {
        mockAppointmentService.updateStatus.mockRejectedValue(new Error('Cancel failed'));

        await expect(facade.cancelAppointment('apt-3'))
          .rejects.toThrow('Cancel failed');
      });
    });
  });

  describe('Generate Daily Close', () => {
    beforeEach(async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);
      await facade.initialize();
    });

    it('should throw error if no completed appointments', async () => {
      // Replace appointments with only pending
      mockAppointmentService.getByDate.mockResolvedValue([mockAppointments[2]]);
      await facade.loadAppointments();

      await expect(facade.generateDailyClose())
        .rejects.toThrow('No hay citas completadas para generar el cierre');
    });

    it('should generate daily close successfully', async () => {
      mockDailyCloseService.generateDailyClose.mockResolvedValue(undefined);

      await facade.generateDailyClose();

      expect(mockDailyCloseService.generateDailyClose).toHaveBeenCalledWith(
        'company-1',
        expect.any(String),
        expect.arrayContaining([expect.objectContaining({ status: 'completed' })]),
        'Peluquería Test'
      );
      expect(facade.alreadyClosed()).toBe(true);
    });

    it('should set generating state during generation', async () => {
      mockDailyCloseService.generateDailyClose.mockImplementation(() => {
        expect(facade.generating()).toBe(true);
        return Promise.resolve();
      });

      await facade.generateDailyClose();

      expect(facade.generating()).toBe(false);
    });

    it('should propagate error from service', async () => {
      mockDailyCloseService.generateDailyClose.mockRejectedValue(new Error('PDF generation failed'));

      await expect(facade.generateDailyClose())
        .rejects.toThrow('PDF generation failed');
      expect(facade.generating()).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    beforeEach(async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);
      await facade.initialize();
    });

    it('should return correct status labels', () => {
      expect(facade.getStatusLabel('completed')).toBe('Completada');
      expect(facade.getStatusLabel('pending')).toBe('Pendiente');
      expect(facade.getStatusLabel('cancelled')).toBe('Cancelada');
      expect(facade.getStatusLabel('no_show')).toBe('No asistió');
      expect(facade.getStatusLabel('unknown')).toBe('unknown');
    });

    it('should return correct status class', () => {
      expect(facade.getStatusClass('completed')).toBe('completed');
      expect(facade.getStatusClass('pending')).toBe('pending');
    });

    it('should format date correctly', () => {
      const date = new Date('2026-03-20');
      const formatted = facade.formatDate(date);

      expect(formatted).toContain('20');
      expect(formatted).toContain('marzo');
      expect(formatted).toContain('2026');
    });

    it('should format date short correctly', () => {
      const date = new Date(2026, 2, 20);
      const formatted = facade.formatDateShort(date);

      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format date for query correctly', () => {
      const date = new Date(2026, 2, 20); // March 20, 2026
      const formatted = facade.formatDateForQuery(date);

      expect(formatted).toBe('2026-03-20');
    });

    it('should return employee name by ID', () => {
      const name = facade.getEmployeeNameById('emp-1');
      expect(name).toBe('Juan Pérez');
    });

    it('should return unknown for non-existent employee', () => {
      const name = facade.getEmployeeNameById('unknown-emp');
      expect(name).toBe('Desconocido');
    });

    it('should return initials from name', () => {
      expect(facade.getInitials('Juan Pérez')).toBe('J');
      expect(facade.getInitials('María')).toBe('M');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty appointments list', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue([]);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);

      await facade.initialize();

      expect(facade.employees()).toHaveLength(0);
      expect(facade.dayStats().totalAppointments).toBe(0);
      expect(facade.selectedEmployee()).toBeNull();
    });

    it('should handle appointments without employee data', async () => {
      const appointmentsWithoutEmployee = [
        createMockAppointment({
          id: 'apt-no-emp',
          employee: undefined,
          employee_id: 'emp-unknown'
        })
      ];

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(appointmentsWithoutEmployee);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);

      await facade.initialize();

      const employees = facade.employees();
      expect(employees.length).toBeGreaterThan(0);
      expect(employees[0].full_name).toBe('Desconocido');
    });

    it('should handle appointments with zero amount collected', async () => {
      const appointmentsWithZeroAmount = [
        createMockAppointment({ id: 'apt-zero', amount_collected: 0, status: 'completed' })
      ];

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(appointmentsWithZeroAmount);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);

      await facade.initialize();

      expect(facade.dayStats().totalAmount).toBe(0);
    });

    it('should handle undefined amount_collected', async () => {
      const appointmentsWithUndefinedAmount = [
        createMockAppointment({ id: 'apt-undef', amount_collected: undefined, status: 'completed' })
      ];

      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
      mockCompanyService.getById.mockResolvedValue(mockCompany);
      mockAppointmentService.getByDate.mockResolvedValue(appointmentsWithUndefinedAmount);
      mockDailyCloseService.checkIfClosed.mockResolvedValue(false);

      await facade.initialize();

      expect(facade.dayStats().totalAmount).toBe(0);
    });
  });
});
