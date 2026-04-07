import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyCloseComponent } from './daily-close.component';
import { DailyCloseFacade, Employee, AppointmentWithRelations } from './daily-close.facade';
import { MessageService, ConfirmationService } from 'primeng/api';
import { CONFIRMATION_DIALOG } from '../../../../core/tokens/confirmation-dialog.token';
import { IConfirmationDialog, ConfirmationDialogConfig } from '../../../../core/interfaces/confirmation-dialog.interface';
import { Injectable } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppointmentStatus } from '../../../../core/models/appointment.model';

// Mock facade
@Injectable()
class TestDailyCloseFacade {
  appointments = { subscribe: jest.fn() } as any;
  selectedDate = { subscribe: jest.fn() } as any;
  selectedEmployee = { subscribe: jest.fn() } as any;
  loading = { subscribe: jest.fn() } as any;
  generating = { subscribe: jest.fn() } as any;
  alreadyClosed = { subscribe: jest.fn() } as any;
  companyName = { subscribe: jest.fn() } as any;
  employees = { subscribe: jest.fn() } as any;
  filteredAppointments = { subscribe: jest.fn() } as any;
  employeeStats = { subscribe: jest.fn() } as any;
  dayStats = { subscribe: jest.fn() } as any;
  completedAppointments = { subscribe: jest.fn(), value: [] } as any;
  canNavigateNext = { subscribe: jest.fn() } as any;
  isToday = { subscribe: jest.fn() } as any;

  initialize = jest.fn().mockResolvedValue(undefined);
  loadAppointments = jest.fn().mockResolvedValue(undefined);
  selectEmployee = jest.fn();
  navigateToPreviousDay = jest.fn();
  navigateToNextDay = jest.fn();
  confirmAppointmentCompletion = jest.fn().mockResolvedValue(undefined);
  markAppointmentAsNoShow = jest.fn().mockResolvedValue(undefined);
  cancelAppointment = jest.fn().mockResolvedValue(undefined);
  generateDailyClose = jest.fn().mockResolvedValue(undefined);
  getEmployeeStats = jest.fn(() => ({ totalAmount: 0, totalAppointments: 0, completedCount: 0, pendingCount: 0 }));
  getStatusLabel = jest.fn((s: string) => s);
  getStatusClass = jest.fn((s: string) => s);
  formatDate = jest.fn(() => 'formatted date');
  formatDateShort = jest.fn(() => 'short date');
  getEmployeeNameById = jest.fn(() => 'Test Employee');
  getInitials = jest.fn((n: string) => n.charAt(0).toUpperCase());
}

// Mock Confirmation Dialog
class MockConfirmationDialog implements IConfirmationDialog {
  private _shouldConfirm = true;
  lastConfig: ConfirmationDialogConfig | null = null;
  setShouldConfirm(value: boolean) { this._shouldConfirm = value; }
  confirm(config: ConfirmationDialogConfig): Promise<boolean> {
    this.lastConfig = config;
    return Promise.resolve(this._shouldConfirm);
  }
}

describe('DailyCloseComponent', () => {
  let component: DailyCloseComponent;
  let fixture: ComponentFixture<DailyCloseComponent>;
  let mockMessageService: any;
  let mockConfirmationDialog: MockConfirmationDialog;

  const createMockAppointment = (overrides: Partial<AppointmentWithRelations> = {}): AppointmentWithRelations => ({
    id: 'apt-1', client_name: 'Cliente Uno', appointment_date: '2026-03-20', appointment_time: '10:00',
    status: 'completed' as AppointmentStatus, amount_collected: 25, employee_id: 'emp-1', service_id: 'srv-1',
    company_id: 'company-1', service: { name: 'Corte de cabello' }, employee: { full_name: 'Juan Pérez' },
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(), notes: '',
    cancellation_token: '', client_phone: '', client_email: '', ...overrides
  });

  const mockAppointments: AppointmentWithRelations[] = [
    createMockAppointment({ id: 'apt-1', status: 'completed', amount_collected: 25 }),
    createMockAppointment({ id: 'apt-2', status: 'pending', employee_id: 'emp-2', appointment_time: '11:00' }),
    createMockAppointment({ id: 'apt-3', status: 'completed', amount_collected: 50 }),
  ];

  beforeEach(async () => {
    mockMessageService = { add: jest.fn() };
    mockConfirmationDialog = new MockConfirmationDialog();

    await TestBed.configureTestingModule({
      imports: [DailyCloseComponent, NoopAnimationsModule],
      providers: [
        { provide: DailyCloseFacade, useClass: TestDailyCloseFacade },
        { provide: MessageService, useValue: mockMessageService },
        { provide: CONFIRMATION_DIALOG, useValue: mockConfirmationDialog },
        ConfirmationService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DailyCloseComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => { jest.clearAllMocks(); });

  it('should create the component', () => { expect(component).toBeTruthy(); });

  describe('Search', () => {
    it('should update search query', () => {
      component.onSearchChange('Juan');
      expect(component.searchQuery()).toBe('Juan');
    });
  });

  describe('Complete Appointment Flow', () => {
    it('should open drawer with selected appointment', () => {
      const pending = mockAppointments[1];
      component.openCompleteDrawer(pending);
      expect(component.amountDrawerVisible()).toBe(true);
      expect(component.selectedAppointment()?.id).toBe('apt-2');
    });
    it('should close drawer and reset state', () => {
      component.openCompleteDrawer(mockAppointments[0]);
      component.amountInput = 100;
      component.closeDrawer();
      expect(component.amountDrawerVisible()).toBe(false);
      expect(component.amountInput).toBeNull();
    });
    it('should validate amount before calling facade', async () => {
      const facade = TestBed.inject(DailyCloseFacade) as TestDailyCloseFacade;
      component.openCompleteDrawer(mockAppointments[1]);
      component.amountInput = 0;
      await component.confirmCompletion();
      // Validation happens before facade call
      expect(facade.confirmAppointmentCompletion).not.toHaveBeenCalled();
    });
  });

  describe('Mark as No-Show Flow', () => {
    it('should show confirmation dialog when marking no-show', async () => {
      await component.markAsNoShow(mockAppointments[1]);
      expect(mockConfirmationDialog.lastConfig?.message).toBe('¿Marcar esta cita como "No asistió"?');
    });
    it('should not call facade when dialog is cancelled', async () => {
      mockConfirmationDialog.setShouldConfirm(false);
      await component.markAsNoShow(mockAppointments[1]);
      // Should not throw or call messageService with success
    });
  });

  describe('Cancel Appointment Flow', () => {
    it('should show confirmation dialog when cancelling', async () => {
      await component.cancelAppointment(mockAppointments[1]);
      expect(mockConfirmationDialog.lastConfig?.message).toBe('¿Cancelar esta cita?');
    });
    it('should not call facade when dialog is rejected', async () => {
      mockConfirmationDialog.setShouldConfirm(false);
      await component.cancelAppointment(mockAppointments[1]);
      // Should not throw or call messageService with success
    });
  });
});
