import { ComponentFixture, TestBed, NO_ERRORS_SCHEMA } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { AppointmentsComponent } from './appointments.component';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { UserService } from '../../../../core/services/user.service';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';

describe('AppointmentsComponent - Behavior Driven Tests', () => {
  let component: AppointmentsComponent;
  let fixture: ComponentFixture<AppointmentsComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let appointmentServiceMock: jest.Mocked<AppointmentService>;
  let userServiceMock: jest.Mocked<UserService>;
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

  const mockEmployees = [
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

  const mockAppointments = [
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
      service: { name: 'Corte de cabello' },
      employee: { full_name: 'Juan Pérez' }
    },
    {
      id: 'apt-2',
      client_name: 'Cliente Dos',
      client_phone: '555-222-2222',
      appointment_date: '2026-03-20',
      appointment_time: '11:00',
      status: 'completed' as const,
      amount_collected: 25,
      employee_id: 'emp-2',
      service_id: 'srv-2',
      company_id: 'company-1',
      service: { name: 'Tinte' },
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
      service: { name: 'Corte de cabello' },
      employee: { full_name: 'Juan Pérez' }
    }
  ];

  beforeEach(waitForAsync(async () => {
    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser)
    } as any;

    appointmentServiceMock = {
      getByCompany: jest.fn().mockResolvedValue(mockAppointments),
      updateStatus: jest.fn().mockResolvedValue(undefined)
    } as any;

    userServiceMock = {
      getByCompany: jest.fn().mockResolvedValue(mockEmployees)
    } as any;

    messageServiceMock = {
      add: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [AppointmentsComponent, FormsModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MessageService, useValue: messageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  }));

  describe('when manager views appointments', () => {
    it('should display page title', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Gestión de Citas');
    });

    it('should display filter options', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('Empleado');
      expect(compiled.textContent).toContain('Fecha');
      expect(compiled.textContent).toContain('Estado');
    });

    it('should display all appointments', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Cliente Uno');
      expect(compiled.textContent).toContain('Cliente Dos');
      expect(compiled.textContent).toContain('Cliente Tres');
    }));

    it('should display appointment times', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('10:00');
      expect(compiled.textContent).toContain('11:00');
      expect(compiled.textContent).toContain('14:00');
    }));

    it('should display appointment statuses', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Pendiente');
      expect(compiled.textContent).toContain('Completada');
      expect(compiled.textContent).toContain('Cancelada');
    }));

    it('should display service and employee for each appointment', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      expect(compiled.textContent).toContain('Corte de cabello');
      expect(compiled.textContent).toContain('Tinte');
      expect(compiled.textContent).toContain('Juan Pérez');
      expect(compiled.textContent).toContain('María García');
    }));

    it('should show amount collected for completed appointments', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain('25.00');
    }));
  });

  describe('when filtering appointments', () => {
    it('should filter by employee', async () => {
      component.ngOnInit();
      // tick replaced by await

      component.filterEmployee.set('emp-1');
      // tick replaced by await

      const filtered = component.filteredAppointments();
      expect(filtered.every(apt => apt.employee_id === 'emp-1')).toBe(true);
      expect(filtered.length).toBe(2);
    }));

    it('should filter by status', async () => {
      component.ngOnInit();
      // tick replaced by await

      component.filterStatus.set('completed');
      // tick replaced by await

      const filtered = component.filteredAppointments();
      expect(filtered.every(apt => apt.status === 'completed')).toBe(true);
      expect(filtered.length).toBe(1);
    }));

    it('should filter by date', async () => {
      component.ngOnInit();
      // tick replaced by await

      component.filterDate.set(new Date('2026-03-20'));
      // tick replaced by await

      const filtered = component.filteredAppointments();
      expect(filtered.every(apt => apt.appointment_date === '2026-03-20')).toBe(true);
      expect(filtered.length).toBe(2);
    }));

    it('should combine multiple filters', async () => {
      component.ngOnInit();
      // tick replaced by await

      component.filterEmployee.set('emp-1');
      component.filterStatus.set('pending');
      // tick replaced by await

      const filtered = component.filteredAppointments();
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('apt-1');
    }));
  });

  describe('when managing appointment status', () => {
    it('should show action buttons for pending appointments', async () => {
      component.ngOnInit();
      // tick replaced by await
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      
      // Should show complete, cancel, and no-show buttons
      expect(compiled.textContent).toContain('Completar');
      expect(compiled.textContent).toContain('Cancelar');
      expect(compiled.textContent).toContain('No asistió');
    }));

    it('should complete appointment with amount', fakeAsync(async () => {
      component.ngOnInit();
      // tick replaced by await

      const pendingAppointment = mockAppointments.find(apt => apt.status === 'pending')!;
      component.selectedAppointment.set(pendingAppointment);
      component.amountCollected.set(30);
      component.showStatusDialog.set(true);

      await component.updateStatus('completed');
      // tick replaced by await

      expect(appointmentServiceMock.updateStatus).toHaveBeenCalledWith(
        pendingAppointment.id,
        'completed',
        30
      );
    }));

    it('should cancel appointment without amount', fakeAsync(async () => {
      component.ngOnInit();
      // tick replaced by await

      const pendingAppointment = mockAppointments.find(apt => apt.status === 'pending')!;
      component.selectedAppointment.set(pendingAppointment);

      await component.updateStatus('cancelled');
      // tick replaced by await

      expect(appointmentServiceMock.updateStatus).toHaveBeenCalledWith(
        pendingAppointment.id,
        'cancelled',
        undefined
      );
    }));

    it('should show success message after status update', fakeAsync(async () => {
      component.ngOnInit();
      // tick replaced by await

      const pendingAppointment = mockAppointments.find(apt => apt.status === 'pending')!;
      component.selectedAppointment.set(pendingAppointment);

      await component.updateStatus('completed');
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: expect.stringContaining('completada')
      });
    }));

    it('should update local state after status change', fakeAsync(async () => {
      component.ngOnInit();
      // tick replaced by await

      const pendingAppointment = mockAppointments.find(apt => apt.status === 'pending')!;
      component.selectedAppointment.set(pendingAppointment);

      await component.updateStatus('completed');
      // tick replaced by await

      const updated = component.appointments().find(apt => apt.id === pendingAppointment.id);
      expect(updated?.status).toBe('completed');
    }));

    it('should show error when status update fails', fakeAsync(async () => {
      appointmentServiceMock.updateStatus = jest.fn().mockRejectedValue(new Error('Update failed'));
      
      component.ngOnInit();
      // tick replaced by await

      const pendingAppointment = mockAppointments.find(apt => apt.status === 'pending')!;
      component.selectedAppointment.set(pendingAppointment);

      await component.updateStatus('completed');
      // tick replaced by await

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el estado'
      });
    }));
  });

  describe('status helpers', () => {
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
});