import { ComponentFixture, TestBed, waitForAsync, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DailyCloseComponent } from './daily-close.component';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { DailyCloseService } from '../../../../core/services/daily-close.service';
import { CompanyService } from '../../../../core/services/company.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

describe('DailyCloseComponent - Behavior Driven Tests', () => {
  let component: DailyCloseComponent;
  let fixture: ComponentFixture<DailyCloseComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let appointmentServiceMock: jest.Mocked<AppointmentService>;
  let dailyCloseServiceMock: jest.Mocked<DailyCloseService>;
  let companyServiceMock: jest.Mocked<CompanyService>;
  let messageServiceMock: jest.Mocked<MessageService>;

  const mockUser = {
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

  const mockAppointments = [
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

  beforeEach(waitForAsync(async () => {
    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser)
    } as any;

    appointmentServiceMock = {
      getByDate: jest.fn().mockResolvedValue(mockAppointments)
    } as any;

    dailyCloseServiceMock = {
      generateDailyClose: jest.fn().mockResolvedValue(undefined),
      checkIfClosed: jest.fn().mockResolvedValue(false)
    } as any;

    companyServiceMock = {
      getById: jest.fn().mockResolvedValue(mockCompany)
    } as any;

    messageServiceMock = {
      add: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [DailyCloseComponent, FormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: DailyCloseService, useValue: dailyCloseServiceMock },
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: MessageService, useValue: messageServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DailyCloseComponent);
    component = fixture.componentInstance;
  }));

  describe('when manager views daily close', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should display page title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Cierre Diario');
    });

    it('should have date selector', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Seleccionar fecha');
    });

    it('should display summary statistics', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Total Citas');
      expect(compiled.textContent).toContain('Completadas');
      expect(compiled.textContent).toContain('Monto Total');
    });

    it('should calculate total appointments correctly', () => {
      expect(component.appointments().length).toBe(3);
    });

    it('should calculate completed appointments correctly', () => {
      expect(component.completedAppointments().length).toBe(2);
    });

    it('should calculate total amount correctly', () => {
      expect(component.totalAmount()).toBe(75);
    });
  });

  describe('when viewing appointments table', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should display appointments for selected date', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Cliente Uno');
      expect(compiled.textContent).toContain('Cliente Dos');
      expect(compiled.textContent).toContain('Cliente Tres');
    });

    it('should show appointment details', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('10:00');
      expect(compiled.textContent).toContain('Corte de cabello');
      expect(compiled.textContent).toContain('Juan Pérez');
    });
  });

  describe('when viewing employee breakdown', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      await fixture.whenStable();
    });

    it('should group appointments by employee', () => {
      const grouped = component.appointmentsByEmployee();
      expect(Object.keys(grouped).length).toBe(2);
    });

    it('should calculate totals per employee', () => {
      const emp1Total = component.getEmployeeTotal(
        mockAppointments.filter(apt => apt.employee_id === 'emp-1' && apt.status === 'completed')
      );
      expect(emp1Total).toBe(25);

      const emp2Total = component.getEmployeeTotal(
        mockAppointments.filter(apt => apt.employee_id === 'emp-2' && apt.status === 'completed')
      );
      expect(emp2Total).toBe(50);
    });
  });

  describe('when generating daily close', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should show generate button when not closed', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Generar Cierre');
    });

    it('should generate close with correct data', async () => {
      await component.generateClose();

      expect(dailyCloseServiceMock.generateDailyClose).toHaveBeenCalledWith(
        'company-1',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ id: 'apt-1' }),
          expect.objectContaining({ id: 'apt-2' })
        ]),
        'Peluquería Test'
      );
    });

    it('should show success message after generation', async () => {
      await component.generateClose();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: expect.stringContaining('PDF')
      });
    });

    it('should hide generate button after successful close', async () => {
      await component.generateClose();

      expect(component.alreadyClosed()).toBe(true);
    });

    it('should show warning when no completed appointments', async () => {
      appointmentServiceMock.getByDate = jest.fn().mockResolvedValue([
        { ...mockAppointments[2] }
      ]);
      
      await component.ngOnInit();
      await fixture.whenStable();

      await component.generateClose();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay citas completadas para generar el cierre'
      });
    });

    it('should show error when generation fails', async () => {
      dailyCloseServiceMock.generateDailyClose = jest.fn().mockRejectedValue(
        new Error('Generation failed')
      );

      await component.generateClose();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Generation failed'
      });
    });
  });

  describe('when daily close already exists', () => {
    beforeEach(() => {
      dailyCloseServiceMock.checkIfClosed = jest.fn().mockResolvedValue(true);
    });

    it('should show already closed alert', async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('ya fue generado');
    });

    it('should hide generate button', async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).not.toContain('Generar Cierre y Descargar PDF');
    });
  });

  describe('when changing date', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      await fixture.whenStable();
    });

    it('should reload appointments for new date', async () => {
      const newDate = new Date('2026-03-21');
      component.selectedDate.set(newDate);
      await component.onDateChange();

      expect(appointmentServiceMock.getByDate).toHaveBeenCalledWith(
        'company-1',
        '2026-03-21'
      );
    });

    it('should check if new date is already closed', async () => {
      const newDate = new Date('2026-03-21');
      component.selectedDate.set(newDate);
      await component.onDateChange();

      expect(dailyCloseServiceMock.checkIfClosed).toHaveBeenCalledWith(
        'company-1',
        '2026-03-21'
      );
    });
  });
});
