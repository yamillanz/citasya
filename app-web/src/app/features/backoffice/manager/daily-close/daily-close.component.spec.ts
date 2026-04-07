import { ComponentFixture, TestBed, fakeAsync, flush, tick, waitForAsync } from '@angular/core/testing';
import { DailyCloseComponent } from './daily-close.component';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DailyCloseService } from '../../../../core/services/daily-close.service';
import { CompanyService } from '../../../../core/services/company.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { User } from '../../../../core/models/user.model';
import { Appointment } from '../../../../core/models/appointment.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('DailyCloseComponent', () => {
  let component: DailyCloseComponent;
  let fixture: ComponentFixture<DailyCloseComponent>;
  let mockAuthService: any;
  let mockAppointmentService: any;
  let mockDailyCloseService: any;
  let mockCompanyService: any;
  let mockMessageService: any;
  let mockConfirmationService: any;

  // Mock Data
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

  const createMockAppointment = (overrides: Partial<Appointment> = {}): Appointment => ({
    id: 'apt-1',
    client_name: 'Cliente Uno',
    appointment_date: '2026-03-20',
    appointment_time: '10:00',
    status: 'completed',
    amount_collected: 25,
    employee_id: 'emp-1',
    service_id: 'srv-1',
    company_id: 'company-1',
    service: { name: 'Corte de cabello' },
    employee: { full_name: 'Juan Pérez' },
    ...overrides
  });

  const mockAppointments: Appointment[] = [
    createMockAppointment({ id: 'apt-1', status: 'completed', amount_collected: 25, employee_id: 'emp-1', employee: { full_name: 'Juan Pérez' } }),
    createMockAppointment({ id: 'apt-2', status: 'completed', amount_collected: 50, employee_id: 'emp-2', appointment_time: '11:00', employee: { full_name: 'María García' }, service: { name: 'Tinte' } }),
    createMockAppointment({ id: 'apt-3', status: 'pending', employee_id: 'emp-1', appointment_time: '12:00', employee: { full_name: 'Juan Pérez' } }),
    createMockAppointment({ id: 'apt-4', status: 'no_show', employee_id: 'emp-3', appointment_time: '14:00', employee: { full_name: 'Pedro López' }, service: { name: 'Manicure' } })
  ];

  beforeEach(async () => {
    // Create fresh mocks for each test
    mockAuthService = { getCurrentUser: jest.fn() };
    mockAppointmentService = { getByDate: jest.fn(), updateStatus: jest.fn() };
    mockDailyCloseService = { checkIfClosed: jest.fn(), generateDailyClose: jest.fn() };
    mockCompanyService = { getById: jest.fn() };
    mockMessageService = { add: jest.fn() };
    mockConfirmationService = { confirm: jest.fn() };

    // Setup default mock returns
    mockAuthService.getCurrentUser.mockResolvedValue(mockUser);
    mockAppointmentService.getByDate.mockResolvedValue(mockAppointments);
    mockDailyCloseService.checkIfClosed.mockResolvedValue(false);
    mockCompanyService.getById.mockResolvedValue(mockCompany);
    mockAppointmentService.updateStatus.mockResolvedValue(undefined);
    mockDailyCloseService.generateDailyClose.mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [
        DailyCloseComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AppointmentService, useValue: mockAppointmentService },
        { provide: DailyCloseService, useValue: mockDailyCloseService },
        { provide: CompanyService, useValue: mockCompanyService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: ConfirmationService, useValue: mockConfirmationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DailyCloseComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to initialize component with fakeAsync
  const initComponent = fakeAsync(() => {
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
  });

  // Helper function to initialize component with waitForAsync
  const initComponentAsync = async () => {
    fixture.detectChanges();
    // Wait multiple times to ensure all async operations complete
    await fixture.whenStable();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    fixture.detectChanges();
  };

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.loading()).toBe(true);
      expect(component.appointments()).toEqual([]);
      expect(component.selectedEmployee()).toBeNull();
      expect(component.searchQuery()).toBe('');
      expect(component.alreadyClosed()).toBe(false);
    });

    it('should load user data and appointments on init', async () => {
      fixture.detectChanges();
      // Wait for ngOnInit to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();

      // Verify component state after initialization
      expect(component.companyId()).toBe('company-1');
      expect(component.companyName()).toBe('Peluquería Test');
      expect(component.appointments()).toHaveLength(4);
      expect(component.loading()).toBe(false);
    });

    it('should set loading to false even if user has no company', async () => {
      mockAuthService.getCurrentUser.mockResolvedValue({ ...mockUser, company_id: null });

      fixture.detectChanges();
      // Wait for ngOnInit to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();

      expect(component.loading()).toBe(false);
      expect(component.companyId()).toBeNull();
    });
  });

  describe('Employee List and Selection', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();
    });

    it('should extract unique employees from appointments', () => {
      const employees = component.employees();
      
      expect(employees).toHaveLength(3);
      expect(employees.map(e => e.id)).toContain('emp-1');
      expect(employees.map(e => e.id)).toContain('emp-2');
      expect(employees.map(e => e.id)).toContain('emp-3');
    });

    it('should select first employee by default after loading', () => {
      expect(component.selectedEmployee()).not.toBeNull();
    });

    it('should allow selecting a different employee', () => {
      const employees = component.employees();
      const secondEmployee = employees[1];
      
      component.selectEmployee(secondEmployee);
      
      expect(component.selectedEmployee()?.id).toBe(secondEmployee.id);
    });

    it('should filter employees by search query', () => {
      component.onSearchChange('Juan');
      
      const filtered = component.filteredEmployees();
      expect(filtered).toHaveLength(1);
      expect(filtered[0].full_name).toBe('Juan Pérez');
    });

    it('should return all employees when search query is empty', () => {
      component.onSearchChange('');
      
      expect(component.filteredEmployees()).toHaveLength(3);
    });

    it('should return empty array when no employees match search', () => {
      component.onSearchChange('NonExistent');
      
      expect(component.filteredEmployees()).toHaveLength(0);
    });

    it('should be case-insensitive when filtering employees', () => {
      component.onSearchChange('juan');
      
      expect(component.filteredEmployees()).toHaveLength(1);
    });
  });

  describe('Appointment Filtering by Employee', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();
    });

    it('should show appointments for selected employee only', () => {
      // emp-1 has 2 appointments (1 completed, 1 pending)
      const emp1 = component.employees().find(e => e.id === 'emp-1')!;
      component.selectEmployee(emp1);
      
      const appointments = component.appointmentsByEmployee();
      expect(appointments).toHaveLength(2);
      expect(appointments.every(a => a.employee_id === 'emp-1')).toBe(true);
    });

    it('should sort appointments by time', () => {
      const emp1 = component.employees().find(e => e.id === 'emp-1')!;
      component.selectEmployee(emp1);
      
      const appointments = component.appointmentsByEmployee();
      expect(appointments[0].appointment_time).toBe('10:00');
      expect(appointments[1].appointment_time).toBe('12:00');
    });

    it('should return empty array when no employee is selected', () => {
      component.selectedEmployee.set(null);
      
      expect(component.appointmentsByEmployee()).toHaveLength(0);
    });
  });

  describe('Statistics Calculation', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();
    });

    it('should calculate day statistics correctly', () => {
      const stats = component.dayStats();
      
      expect(stats.totalAppointments).toBe(4);
      expect(stats.completedCount).toBe(2);
      expect(stats.pendingCount).toBe(1);
      expect(stats.totalAmount).toBe(75); // 25 + 50
    });

    it('should calculate employee statistics correctly', () => {
      const emp1Stats = component.getEmployeeStats('emp-1');
      
      expect(emp1Stats.totalAppointments).toBe(2);
      expect(emp1Stats.completedCount).toBe(1);
      expect(emp1Stats.pendingCount).toBe(1);
      expect(emp1Stats.totalAmount).toBe(25);
    });

    it('should return default stats for unknown employee', () => {
      const stats = component.getEmployeeStats('unknown-emp');
      
      expect(stats.totalAppointments).toBe(0);
      expect(stats.totalAmount).toBe(0);
    });

    it('should filter completed appointments correctly', () => {
      const completed = component.completedAppointments();
      
      expect(completed).toHaveLength(2);
      expect(completed.every(a => a.status === 'completed')).toBe(true);
    });
  });

  describe('Date Navigation', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();
    });

    it('should navigate to previous day', async () => {
      const initialDate = new Date(component.selectedDate());
      
      component.navigateToPreviousDay();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newDate = component.selectedDate();
      expect(newDate.getDate()).toBe(initialDate.getDate() - 1);
    });

    it('should navigate to next day when allowed', async () => {
      // Set date to yesterday to allow next navigation
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      component.selectedDate.set(yesterday);
      
      const initialDate = new Date(component.selectedDate());
      
      component.navigateToNextDay();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const newDate = component.selectedDate();
      expect(newDate.getDate()).toBe(initialDate.getDate() + 1);
    });

    it('should not navigate to future dates', () => {
      component.selectedDate.set(new Date());
      
      component.navigateToNextDay();
      
      // Should still be today
      expect(component.selectedDate().toDateString()).toBe(new Date().toDateString());
    });

    it('should reload appointments when date changes', async () => {
      mockAppointmentService.getByDate.mockClear();
      
      component.onDateChange();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockAppointmentService.getByDate).toHaveBeenCalled();
    });

    it('should correctly format date for API queries', () => {
      // Create date with specific values
      const date = new Date(2026, 2, 20); // March 20, 2026 local time
      const formatted = component.formatDateForQuery(date);
      
      // Verify format is YYYY-MM-DD
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should correctly identify today', () => {
      component.selectedDate.set(new Date());
      expect(component.isToday()).toBe(true);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      component.selectedDate.set(yesterday);
      expect(component.isToday()).toBe(false);
    });
  });

  describe('Daily Close Status', () => {
    it('should check if day is already closed on load', async () => {
      mockDailyCloseService.checkIfClosed.mockResolvedValue(true);
      
      initComponent();
      
      expect(mockDailyCloseService.checkIfClosed).toHaveBeenCalledWith('company-1', expect.any(String));
      expect(component.alreadyClosed()).toBe(true);
    });

    it('should show warning when generating close with no completed appointments', async () => {
      mockAppointmentService.getByDate.mockResolvedValue([mockAppointments[2]]); // Only pending
      
      initComponent();
      
      // Clear previous calls
      mockMessageService.add.mockClear();
      
      component.generateClose();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay citas completadas para generar el cierre'
      });
    });

    it('should generate daily close successfully', async () => {
      initComponent();
      
      // Clear previous calls
      mockDailyCloseService.generateDailyClose.mockClear();
      mockMessageService.add.mockClear();
      
      component.generateClose();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockDailyCloseService.generateDailyClose).toHaveBeenCalledWith(
        'company-1',
        expect.any(String),
        expect.any(Array),
        'Peluquería Test'
      );
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cierre generado exitosamente. El PDF se ha descargado.'
      });
      expect(component.alreadyClosed()).toBe(true);
      expect(component.generating()).toBe(false);
    });

    it('should handle error when generating daily close', async () => {
      mockDailyCloseService.generateDailyClose.mockRejectedValue(new Error('PDF generation failed'));
      
      initComponent();
      
      // Clear previous calls
      mockMessageService.add.mockClear();
      
      component.generateClose();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'PDF generation failed'
      });
      expect(component.generating()).toBe(false);
    });
  });

  describe('Complete Appointment Flow', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();
    });

    it('should open drawer with selected appointment', () => {
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;
      
      component.openCompleteDrawer(pendingAppointment as any);
      
      expect(component.amountDrawerVisible()).toBe(true);
      expect(component.selectedAppointment()?.id).toBe(pendingAppointment.id);
      expect(component.amountInput).toBeNull();
    });

    it('should close drawer and reset state', () => {
      component.openCompleteDrawer(mockAppointments[2] as any);
      component.amountInput = 100;
      
      component.closeDrawer();
      
      expect(component.amountDrawerVisible()).toBe(false);
      expect(component.selectedAppointment()).toBeNull();
      expect(component.amountInput).toBeNull();
    });

    it('should validate amount is required when completing', async () => {
      component.openCompleteDrawer(mockAppointments[2] as any);
      component.amountInput = null;
      
      // Clear previous calls from initialization
      mockMessageService.add.mockClear();
      
      component.confirmCompletion();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'El monto debe ser mayor a 0'
      });
    });

    it('should validate amount is greater than 0', async () => {
      component.openCompleteDrawer(mockAppointments[2] as any);
      component.amountInput = 0;
      
      mockMessageService.add.mockClear();
      mockAppointmentService.updateStatus.mockClear();
      
      component.confirmCompletion();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockAppointmentService.updateStatus).not.toHaveBeenCalled();
    });

    it('should complete appointment successfully', async () => {
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;
      component.openCompleteDrawer(pendingAppointment as any);
      component.amountInput = 75;
      
      mockAppointmentService.updateStatus.mockClear();
      mockMessageService.add.mockClear();
      
      component.confirmCompletion();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockAppointmentService.updateStatus).toHaveBeenCalledWith(
        pendingAppointment.id,
        'completed',
        75
      );
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita completada exitosamente'
      });
      expect(component.amountDrawerVisible()).toBe(false);
    });

    it('should update local appointments state after completion', async () => {
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;
      component.openCompleteDrawer(pendingAppointment as any);
      component.amountInput = 75;
      
      mockAppointmentService.updateStatus.mockClear();
      
      component.confirmCompletion();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // The appointment should now be completed locally
      const updatedAppointment = component.appointments().find(a => a.id === pendingAppointment.id);
      expect(updatedAppointment?.status).toBe('completed');
      expect(updatedAppointment?.amount_collected).toBe(75);
    });

    it('should handle error when completing appointment', async () => {
      mockAppointmentService.updateStatus.mockRejectedValue(new Error('Update failed'));
      
      component.openCompleteDrawer(mockAppointments[2] as any);
      component.amountInput = 75;
      
      mockMessageService.add.mockClear();
      
      component.confirmCompletion();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Update failed'
      });
    });
  });

  describe('Mark as No-Show Flow', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();
    });

    it('should show confirmation dialog when marking no-show', () => {
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;
      
      component.markAsNoShow(pendingAppointment as any);
      
      expect(mockConfirmationService.confirm).toHaveBeenCalledWith(expect.objectContaining({
        message: '¿Marcar esta cita como "No asistió"?',
        header: 'Confirmar',
        icon: 'pi pi-exclamation-triangle'
      }));
    });

    it('should mark appointment as no-show on confirm', async () => {
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;
      
      // Simulate confirmation acceptance
      mockConfirmationService.confirm.mockImplementation(({ accept }: any) => accept());
      mockAppointmentService.updateStatus.mockClear();
      mockMessageService.add.mockClear();
      
      component.markAsNoShow(pendingAppointment as any);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockAppointmentService.updateStatus).toHaveBeenCalledWith(
        pendingAppointment.id,
        'no_show'
      );
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita marcada como no asistió'
      });
    });

    // TODO: Refactor component to return promises from markAsNoShow for better testability
    it.skip('should update local appointments state after no-show', async () => {
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;

      mockConfirmationService.confirm.mockImplementation(({ accept }: any) => accept());
      mockAppointmentService.updateStatus.mockClear();

      await component.markAsNoShow(pendingAppointment as any);
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedAppointment = component.appointments().find(a => a.id === pendingAppointment.id);
      expect(updatedAppointment?.status).toBe('no_show');
    });

    it('should handle error when marking no-show', async () => {
      mockAppointmentService.updateStatus.mockRejectedValue(new Error('Update failed'));

      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;
      mockConfirmationService.confirm.mockImplementation(({ accept }: any) => accept());

      mockMessageService.add.mockClear();

      await component.markAsNoShow(pendingAppointment as any);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Update failed'
      });
    });
  });

  describe('Cancel Appointment Flow', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();
    });

    it('should show confirmation dialog when cancelling', () => {
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;
      
      component.cancelAppointment(pendingAppointment as any);
      
      expect(mockConfirmationService.confirm).toHaveBeenCalledWith(expect.objectContaining({
        message: '¿Cancelar esta cita?',
        header: 'Confirmar',
        icon: 'pi pi-exclamation-triangle'
      }));
    });

    it('should cancel appointment on confirm', async () => {
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;
      
      mockConfirmationService.confirm.mockImplementation(({ accept }: any) => accept());
      mockAppointmentService.updateStatus.mockClear();
      mockMessageService.add.mockClear();
      
      component.cancelAppointment(pendingAppointment as any);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockAppointmentService.updateStatus).toHaveBeenCalledWith(
        pendingAppointment.id,
        'cancelled'
      );
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita cancelada'
      });
    });

    // TODO: Refactor component to return promises from cancelAppointment for better testability
    it.skip('should update local appointments state after cancellation', async () => {
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;

      mockConfirmationService.confirm.mockImplementation(({ accept }: any) => accept());
      mockAppointmentService.updateStatus.mockClear();

      await component.cancelAppointment(pendingAppointment as any);
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedAppointment = component.appointments().find(a => a.id === pendingAppointment.id);
      expect(updatedAppointment?.status).toBe('cancelled');
    });

    it('should handle error when cancelling appointment', async () => {
      mockAppointmentService.updateStatus.mockRejectedValue(new Error('Cancel failed'));
      
      const pendingAppointment = mockAppointments.find(a => a.status === 'pending')!;
      mockConfirmationService.confirm.mockImplementation(({ accept }: any) => accept());
      
      mockMessageService.add.mockClear();
      
      component.cancelAppointment(pendingAppointment as any);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Cancel failed'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle error loading appointments', async () => {
      mockAppointmentService.getByDate.mockRejectedValue(new Error('Network error'));
      
      initComponent();
      
      expect(mockMessageService.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudieron cargar las citas'
      });
      expect(component.loading()).toBe(false);
    });

    it('should handle error loading company name gracefully', async () => {
      mockCompanyService.getById.mockRejectedValue(new Error('Company not found'));
      
      initComponent();
      
      // Should still load appointments even if company fails
      expect(mockAppointmentService.getByDate).toHaveBeenCalled();
      expect(component.loading()).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    beforeEach(async () => {
      fixture.detectChanges();
      await new Promise(resolve => setTimeout(resolve, 100));
      fixture.detectChanges();
    });

    it('should return correct status labels', () => {
      expect(component.getStatusLabel('completed')).toBe('Completada');
      expect(component.getStatusLabel('pending')).toBe('Pendiente');
      expect(component.getStatusLabel('cancelled')).toBe('Cancelada');
      expect(component.getStatusLabel('no_show')).toBe('No asistió');
      expect(component.getStatusLabel('unknown')).toBe('unknown');
    });

    it('should return correct status class', () => {
      expect(component.getStatusClass('completed')).toBe('completed');
      expect(component.getStatusClass('pending')).toBe('pending');
    });

    it('should format date correctly', () => {
      const date = new Date('2026-03-20');
      const formatted = component.formatDate(date);
      
      expect(formatted).toContain('20');
      expect(formatted).toContain('marzo');
      expect(formatted).toContain('2026');
    });

    it('should format date short correctly', () => {
      // Use local date to match component behavior
      const date = new Date(2026, 2, 20); // March 20, 2026 local
      const formatted = component.formatDateShort(date);
      
      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should return employee name by ID', () => {
      const name = component.getEmployeeNameById('emp-1');
      expect(name).toBe('Juan Pérez');
    });

    it('should return initials from name', () => {
      expect(component.getInitials('Juan Pérez')).toBe('J');
      expect(component.getInitials('María')).toBe('M');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty appointments list', async () => {
      mockAppointmentService.getByDate.mockResolvedValue([]);
      
      initComponent();
      
      expect(component.employees()).toHaveLength(0);
      expect(component.dayStats().totalAppointments).toBe(0);
      expect(component.selectedEmployee()).toBeNull();
    });

    it('should handle appointments without employee data', async () => {
      const appointmentsWithoutEmployee = [
        createMockAppointment({
          id: 'apt-no-emp',
          employee: undefined,
          employee_id: 'emp-unknown'
        })
      ];
      mockAppointmentService.getByDate.mockResolvedValue(appointmentsWithoutEmployee);
      
      initComponent();
      
      // Check the employees() computed signal
      const employees = component.employees();
      expect(employees.length).toBeGreaterThan(0);
      expect(employees[0].full_name).toBe('Desconocido');
    });

    it('should correctly determine if can navigate to next day', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      component.selectedDate.set(today);
      expect(component.canNavigateNext()).toBe(false);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      component.selectedDate.set(yesterday);
      expect(component.canNavigateNext()).toBe(true);
    });
  });
});
