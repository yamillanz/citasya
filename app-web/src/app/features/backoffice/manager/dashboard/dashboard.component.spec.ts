import { ComponentFixture, TestBed, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, flush, waitForAsync, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('DashboardComponent - Behavior Driven Tests', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let appointmentServiceMock: jest.Mocked<AppointmentService>;

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

  const mockAppointments = [
    {
      id: 'apt-1',
      client_name: 'Cliente Uno',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '10:00',
      status: 'pending' as const,
      employee_id: 'emp-1',
      service_id: 'srv-1',
      company_id: 'company-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service: { name: 'Corte de cabello' },
      employee: { full_name: 'Juan Pérez' }
    },
    {
      id: 'apt-2',
      client_name: 'Cliente Dos',
      appointment_date: new Date().toISOString().split('T')[0],
      appointment_time: '11:00',
      status: 'completed' as const,
      employee_id: 'emp-2',
      service_id: 'srv-2',
      company_id: 'company-1',
      amount_collected: 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      service: { name: 'Tinte' },
      employee: { full_name: 'María García' }
    }
  ];

  beforeEach(waitForAsync(async () => {
    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser),
      signOut: jest.fn().mockResolvedValue(undefined)
    } as any;

    appointmentServiceMock = {
      getByDate: jest.fn().mockResolvedValue(mockAppointments)
    } as any;

    await TestBed.configureTestingModule({
      imports: [DashboardComponent, RouterTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: AppointmentService, useValue: appointmentServiceMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  }));

  describe('when manager visits the dashboard', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should display welcome message with manager name', () => {
      // Behavior: Manager sees personalized welcome
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Manager');
      expect(compiled.textContent).toContain('Buenos días');
    });

    it('should show statistics for today appointments', () => {
      // Behavior: Manager can see key metrics at a glance
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Should show total appointments count
      expect(compiled.textContent).toContain('2'); // Total appointments
      
      // Should show statistics labels
      expect(compiled.textContent).toContain('Citas Hoy');
      expect(compiled.textContent).toContain('Completadas');
      expect(compiled.textContent).toContain('Pendientes');
    });

    it('should display quick action navigation cards', () => {
      // Behavior: Manager can quickly navigate to main sections
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Should show quick action buttons
      expect(compiled.textContent).toContain('Empleados');
      expect(compiled.textContent).toContain('Servicios');
      expect(compiled.textContent).toContain('Citas');
      expect(compiled.textContent).toContain('Cierre Diario');
    });
  });

  describe('when manager views today appointments', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should display list of appointments for today', () => {
      // Behavior: Manager sees all scheduled appointments for the day
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Should show appointment times
      expect(compiled.textContent).toContain('10:00');
      expect(compiled.textContent).toContain('11:00');
      
      // Should show client names
      expect(compiled.textContent).toContain('Cliente Uno');
      expect(compiled.textContent).toContain('Cliente Dos');
    });

    it('should display appointment status with visual indicators', () => {
      // Behavior: Manager can quickly identify appointment status
      const compiled = fixture.nativeElement as HTMLElement;
      
      // Should show status labels
      expect(compiled.textContent).toContain('Pendiente');
      expect(compiled.textContent).toContain('Completada');
    });

    it('should show service information for each appointment', () => {
      // Behavior: Manager knows what service is scheduled
      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Corte de cabello');
      expect(compiled.textContent).toContain('Tinte');
    });
  });

  describe('when there are no appointments today', () => {
    beforeEach(() => {
      appointmentServiceMock.getByDate = jest.fn().mockResolvedValue([]);
    });

    it('should show empty state message', async () => {
      // Behavior: Manager sees clear message when no appointments
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('No hay citas programadas');
    });

    it('should display zero in statistics', async () => {
      // Behavior: Statistics reflect zero appointments
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.totalToday()).toBe(0);
      expect(component.completedToday()).toBe(0);
      expect(component.pendingToday()).toBe(0);
    });
  });

  describe('when manager clicks quick actions', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should navigate to employees section when clicking Empleados', () => {
      // Behavior: Clicking quick action navigates to correct section
      const compiled = fixture.nativeElement as HTMLElement;
      const employeesLink = compiled.querySelector('a[href="/bo/employees"]');
      
      expect(employeesLink).toBeTruthy();
      expect(employeesLink?.textContent).toContain('Empleados');
    });

    it('should navigate to services section when clicking Servicios', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      const servicesLink = compiled.querySelector('a[href="/bo/services"]');
      
      expect(servicesLink).toBeTruthy();
      expect(servicesLink?.textContent).toContain('Servicios');
    });
  });

  describe('status helper methods', () => {
    it('should return correct severity for each status', () => {
      // Behavior: Different statuses have appropriate visual styling
      expect(component.getStatusSeverity('completed')).toBe('success');
      expect(component.getStatusSeverity('pending')).toBe('warn');
      expect(component.getStatusSeverity('cancelled')).toBe('danger');
      expect(component.getStatusSeverity('no_show')).toBe('secondary');
    });

    it('should return correct label for each status', () => {
      // Behavior: Status labels are displayed in user language
      expect(component.getStatusLabel('completed')).toBe('Completada');
      expect(component.getStatusLabel('pending')).toBe('Pendiente');
      expect(component.getStatusLabel('cancelled')).toBe('Cancelada');
      expect(component.getStatusLabel('no_show')).toBe('No asistió');
    });
  });
});