import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { RescheduleAppointmentComponent } from './reschedule-appointment.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { EmailNotificationService } from '../../../core/services/email-notification.service';
import { PrimeNGConfirmationDialog } from '../../../core/services/primeng-confirmation-dialog.service';
import { AppointmentByToken } from './reschedule-appointment.component';

describe('RescheduleAppointmentComponent (Public)', () => {
  let fixture: ComponentFixture<RescheduleAppointmentComponent>;
  let component: RescheduleAppointmentComponent;
  let appointmentServiceMock: any;
  let emailNotificationServiceMock: any;
  let confirmationDialogMock: any;
  let routeToken: string | null;

  const mockAppointment: AppointmentByToken = {
    id: 'apt-1',
    company_id: 'company-1',
    employee_id: 'emp-1',
    client_name: 'Juan Pérez',
    appointment_date: '2026-03-20',
    appointment_time: '10:00:00',
    status: 'pending',
    company_name: 'Peluquería Juan',
    company_address: 'Calle 1',
    company_phone: '555-1234',
    employee_name: 'Ana Gómez',
    services: [
      { name: 'Corte', duration_minutes: 30, price: 25 },
      { name: 'Lavado', duration_minutes: 15, price: 5 }
    ],
    total_duration: 45
  };

  const load = async () => {
    await component.ngOnInit();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    routeToken = 'token-123';
    appointmentServiceMock = {
      getByToken: jest.fn().mockResolvedValue({ ...mockAppointment }),
      getAvailableSlots: jest.fn().mockResolvedValue(['09:00', '09:30', '10:00']),
      rescheduleByToken: jest.fn().mockResolvedValue({ ...mockAppointment, appointment_date: '2026-03-25', appointment_time: '15:00:00' })
    };
    emailNotificationServiceMock = { notify: jest.fn().mockResolvedValue(undefined) };
    confirmationDialogMock = { confirm: jest.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [FormsModule, RescheduleAppointmentComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: EmailNotificationService, useValue: emailNotificationServiceMock },
        { provide: PrimeNGConfirmationDialog, useValue: confirmationDialogMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (k: string) => k === 'token' ? routeToken : null } } } },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RescheduleAppointmentComponent);
    component = fixture.componentInstance;
  });

  describe('Carga por token', () => {
    it('debe llamar a getByToken con el token de la ruta y mostrar el resumen', async () => {
      await load();

      expect(appointmentServiceMock.getByToken).toHaveBeenCalledWith('token-123');
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Peluquería Juan');
      expect(el.textContent).toContain('Juan Pérez');
      expect(el.textContent).toContain('Ana Gómez');
      expect(el.textContent).toContain('Corte');
      expect(el.textContent).toContain('45 min');
      expect(el.textContent).not.toContain('Enlace inválido');
    });

    it('debe mostrar el estado de enlace inválido y sin selector para token desconocido', async () => {
      appointmentServiceMock.getByToken = jest.fn().mockResolvedValue(null);
      await load();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Enlace inválido o cita no encontrada');
      expect(el.querySelector('p-datepicker')).toBeNull();
      expect(el.querySelector('.time-slots-grid')).toBeNull();
    });

    it('debe mostrar el estado de enlace inválido si el RPC falla', async () => {
      appointmentServiceMock.getByToken = jest.fn().mockRejectedValue(new Error('DB error'));
      await load();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Enlace inválido o cita no encontrada');
      expect(el.querySelector('p-datepicker')).toBeNull();
    });

    it('debe mostrar el estado de enlace inválido si falta el token en la ruta', async () => {
      routeToken = null;
      await load();

      expect(appointmentServiceMock.getByToken).not.toHaveBeenCalled();
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Enlace inválido o cita no encontrada');
    });

    it('debe mostrar el resumen en solo lectura para una cita no pendiente', async () => {
      appointmentServiceMock.getByToken = jest.fn().mockResolvedValue({
        ...mockAppointment,
        status: 'completed'
      });
      await load();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Esta cita ya no se puede reprogramar');
      expect(el.textContent).toContain('Peluquería Juan');
      expect(el.querySelector('p-datepicker')).toBeNull();
      expect(el.querySelector('.time-slots-grid')).toBeNull();
    });
  });

  describe('Selección de fecha y slots', () => {
    it('debe cargar slots excluyendo la cita propia', async () => {
      await load();
      await component.onDateSelect(new Date(2026, 2, 25));

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith(
        'company-1',
        'emp-1',
        '2026-03-25',
        45,
        'apt-1'
      );
      expect(component.availableSlots()).toEqual(['09:00', '09:30', '10:00']);
    });

    it('debe resetear hora y slots al cambiar la fecha', async () => {
      await load();
      component.selectedTime.set('09:00');
      component.availableSlots.set(['09:00']);

      await component.onDateSelect(new Date(2026, 2, 26));

      expect(component.selectedTime()).toBe('');
      expect(component.availableSlots()).toEqual(['09:00', '09:30', '10:00']);
    });
  });

  describe('Confirmación', () => {
    beforeEach(async () => {
      await load();
      component.selectedDate.set(new Date(2026, 2, 25));
      component.availableSlots.set(['09:00', '09:30']);
      component.selectedTime.set('09:30');
    });

    it('debe llamar a rescheduleByToken con token, fecha y hora elegidos', async () => {
      await component.confirmReschedule();

      expect(confirmationDialogMock.confirm).toHaveBeenCalledWith(
        expect.objectContaining({ message: '¿Confirmar reprogramación?' })
      );
      expect(appointmentServiceMock.rescheduleByToken).toHaveBeenCalledWith('token-123', '2026-03-25', '09:30');
    });

    it('debe mostrar el estado de éxito con la nueva fecha y hora', async () => {
      await component.confirmReschedule();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Cita reprogramada');
      expect(el.textContent).toContain('25 de marzo de 2026');
      expect(el.textContent).toContain('09:30');
      expect(component.success()).toBe(true);
    });

    it('no debe reprogramar si el usuario rechaza la confirmación', async () => {
      confirmationDialogMock.confirm = jest.fn().mockResolvedValue(false);

      await component.confirmReschedule();

      expect(appointmentServiceMock.rescheduleByToken).not.toHaveBeenCalled();
      expect(component.success()).toBe(false);
    });

    it('debe notificar el evento rescheduled tras el éxito', async () => {
      await component.confirmReschedule();

      expect(emailNotificationServiceMock.notify).toHaveBeenCalledWith('apt-1', 'rescheduled');
    });

    it('debe mostrar el error y recargar slots si el RPC rechaza', async () => {
      appointmentServiceMock.rescheduleByToken = jest.fn()
        .mockRejectedValue(new Error('El horario ya no está disponible'));

      await component.confirmReschedule();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('El horario ya no está disponible');
      expect(component.success()).toBe(false);
      expect(component.selectedTime()).toBe('');
      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith(
        'company-1', 'emp-1', '2026-03-25', 45, 'apt-1'
      );
    });

    it('debe mantener el estado de éxito aunque el email falle', async () => {
      emailNotificationServiceMock.notify = jest.fn().mockRejectedValue(new Error('email down'));

      await component.confirmReschedule();

      expect(component.success()).toBe(true);
    });
  });
});
