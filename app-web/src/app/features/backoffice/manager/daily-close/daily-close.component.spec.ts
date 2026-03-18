import { ComponentFixture, TestBed, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
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
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DailyCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }));

  describe('when manager views daily close', () => {
    it('should display page title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Cierre Diario');
    });

    it('should have date selector', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Seleccionar fecha');
    });

    it('should display summary statistics', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Total Citas');
      expect(compiled.textContent).toContain('Completadas');
      expect(compiled.textContent).toContain('Monto Total');
    }));

    it('should calculate total appointments correctly', async () => {
      component.ngOnInit();
      // tick replaced by await

      expect(component.appointments().length).toBe(3);
    }));

    it('should calculate completed appointments correctly', async () => {
      component.ngOnInit();
      // tick replaced by await

      expect(component.completedAppointments().length).toBe(2);
    }));

    it('should calculate total amount correctly', async () => {
      component.ngOnInit();
      // tick replaced by await

      expect(component.totalAmount()).toBe(75); // 25 + 50
    }));
  });

  describe('when viewing appointments table', () => {
    it('should display appointments for selected date', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Cliente Uno');
      expect(compiled.textContent).toContain('Cliente Dos');
      expect(compiled.textContent).toContain('Cliente Tres');
    }));

    it('should show appointment details', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('10:00');
      expect(compiled.textContent).toContain('Corte de cabello');
      expect(compiled.textContent).toContain('Juan Pérez');
    }));
  });

  describe('when viewing employee breakdown', () => {
    it('should group appointments by employee', async () => {
      component.ngOnInit();
      // tick replaced by await

      const grouped = component.appointmentsByEmployee();
      expect(Object.keys(grouped).length).toBe(2); // emp-1 and emp-2
    }));

    it('should calculate totals per employee', async () => {
      component.ngOnInit();
      // tick replaced by await

      const emp1Total = component.getEmployeeTotal(
        mockAppointments.filter(apt => apt.employee_id === 'emp-1' && apt.status === 'completed')
      );
      expect(emp1Total).toBe(25);

      const emp2Total = component.getEmployeeTotal(
        mockAppointments.filter(apt => apt.employee_id === 'emp-2' && apt.status === 'completed')
      );
      expect(emp2Total).toBe(50);
    }));
  });

  describe('when generating daily close', () => {
    it('should show generate button when not closed', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Generar Cierre');
    }));

    it('should generate close with correct data', fakeAsync(async () => {
      component.ngOnInit();
      // tick replaced by await

      await component.generateClose();
      // tick replaced by await

      expect(dailyCloseServiceMock.generateDailyClose).toHaveBeenCalledWith(
        'company-1',
        expect.any(String),
        expect.arrayContaining([
          expect.objectContaining({ id: 'apt-1' }),
          expect.objectContaining({ id: 'apt-2' })
        ]),
        'Peluquería Test'
      );
    }));

    it('should show success message after generation', fakeAsync(async () => {
      component.ngOnInit();
      // tick replaced by await

      await component.generateClose();
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: expect.stringContaining('PDF')
      });
    }));

    it('should hide generate button after successful close', fakeAsync(async () => {
      component.ngOnInit();
      // tick replaced by await

      await component.generateClose();
      // tick replaced by await

      expect(component.alreadyClosed()).toBe(true);
    }));

    it('should show warning when no completed appointments', fakeAsync(async () => {
      appointmentServiceMock.getByDate = jest.fn().mockResolvedValue([
        { ...mockAppointments[2] } // Only pending appointment
      ]);
      
      component.ngOnInit();
      // tick replaced by await

      await component.generateClose();
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Advertencia',
        detail: 'No hay citas completadas para generar el cierre'
      });
    }));

    it('should show error when generation fails', fakeAsync(async () => {
      dailyCloseServiceMock.generateDailyClose = jest.fn().mockRejectedValue(
        new Error('Generation failed')
      );
      
      component.ngOnInit();
      // tick replaced by await

      await component.generateClose();
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'Generation failed'
      });
    }));
  });

  describe('when daily close already exists', () => {
    beforeEach(() => {
      dailyCloseServiceMock.checkIfClosed = jest.fn().mockResolvedValue(true);
    });

    it('should show already closed alert', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('ya fue generado');
    }));

    it('should hide generate button', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).not.toContain('Generar Cierre y Descargar PDF');
    }));
  });

  describe('when changing date', () => {
    it('should reload appointments for new date', async () => {
      component.ngOnInit();
      // tick replaced by await

      const newDate = new Date('2026-03-21');
      component.selectedDate.set(newDate);
      component.onDateChange();
      // tick replaced by await

      expect(appointmentServiceMock.getByDate).toHaveBeenCalledWith(
        'company-1',
        '2026-03-21'
      );
    }));

    it('should check if new date is already closed', async () => {
      component.ngOnInit();
      // tick replaced by await

      const newDate = new Date('2026-03-21');
      component.selectedDate.set(newDate);
      component.onDateChange();
      // tick replaced by await

      expect(dailyCloseServiceMock.checkIfClosed).toHaveBeenCalledWith(
        'company-1',
        '2026-03-21'
      );
    }));
  });
});