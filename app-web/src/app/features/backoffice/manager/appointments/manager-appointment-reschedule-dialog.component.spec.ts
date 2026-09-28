import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MessageService } from 'primeng/api';
import { ManagerAppointmentRescheduleDialogComponent } from './manager-appointment-reschedule-dialog.component';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { Appointment } from '../../../../core/models/appointment.model';

describe('ManagerAppointmentRescheduleDialogComponent', () => {
  let component: ManagerAppointmentRescheduleDialogComponent;
  let fixture: ComponentFixture<ManagerAppointmentRescheduleDialogComponent>;
  let appointmentServiceMock: any;
  let messageServiceMock: any;

  const mockAppointment: Appointment = {
    id: 'apt-1',
    company_id: 'co-1',
    employee_id: 'emp-1',
    service_id: 'svc-1',
    client_name: 'Juan Pérez',
    client_phone: '555-1234',
    appointment_date: '2026-03-20',
    appointment_time: '10:00:00',
    status: 'pending',
    is_paid: false,
    created_at: '2026-03-19T10:00:00Z',
    updated_at: '2026-03-19T10:00:00Z',
    services: [
      { id: 'svc-1', name: 'Corte', duration_minutes: 30, price: 25, company_id: 'co-1', commission_percentage: 0, is_active: true, created_at: '2026-01-01T00:00:00Z' }
    ]
  };

  const mockSlots = ['09:00', '10:00', '15:00'];

  beforeEach(async () => {
    appointmentServiceMock = {
      getAvailableSlots: jest.fn().mockResolvedValue(mockSlots),
      reschedule: jest.fn().mockResolvedValue({ ...mockAppointment, appointment_date: '2026-03-25', appointment_time: '15:00:00' })
    };
    messageServiceMock = { add: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [ManagerAppointmentRescheduleDialogComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerAppointmentRescheduleDialogComponent);
    component = fixture.componentInstance;
  });

  describe('totalDuration', () => {
    it('debe calcular la duración total de los servicios de la cita', () => {
      fixture.componentRef.setInput('appointment', mockAppointment);
      expect(component.totalDuration()).toBe(30);
    });

    it('debe ser 0 sin servicios', () => {
      fixture.componentRef.setInput('appointment', { ...mockAppointment, services: [] });
      expect(component.totalDuration()).toBe(0);
    });
  });

  describe('apertura del diálogo (effect)', () => {
    const open = async () => {
      fixture.componentRef.setInput('appointment', mockAppointment);
      fixture.componentRef.setInput('visible', true);
      fixture.detectChanges();
      await fixture.whenStable();
    };

    it('debe prefill la fecha y hora actual de la cita al abrirse', async () => {
      await open();

      expect(component.selectedDate()).toEqual(new Date(2026, 2, 20));
      expect(component.selectedTime()).toBe('10:00');
      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith(
        'co-1', 'emp-1', '2026-03-20', 30, 'apt-1'
      );
    });

    it('debe cargar slots excluyendo la cita propia', async () => {
      await open();

      expect(component.availableSlots()).toEqual(mockSlots);
      expect(component.availableSlots()).toContain('10:00');
    });
  });

  describe('onDateSelect', () => {
    it('debe resetear hora y cargar slots para la nueva fecha', async () => {
      fixture.componentRef.setInput('appointment', mockAppointment);
      component.selectedTime.set('10:00');

      await component.onDateSelect(new Date(2026, 2, 25));

      expect(component.selectedDate()).toEqual(new Date(2026, 2, 25));
      expect(component.selectedTime()).toBe('');
      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith(
        'co-1', 'emp-1', '2026-03-25', 30, 'apt-1'
      );
      expect(component.availableSlots()).toEqual(mockSlots);
    });
  });

  describe('submit', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('appointment', mockAppointment);
      component.selectedDate.set(new Date(2026, 2, 25));
      component.selectedTime.set('15:00');
    });

    it('debe llamar a AppointmentService.reschedule con id, fecha y hora', async () => {
      await component.submit();

      expect(appointmentServiceMock.reschedule).toHaveBeenCalledWith('apt-1', '2026-03-25', '15:00');
    });

    it('debe mostrar toast de éxito y emitir onRescheduled', async () => {
      const spy = jest.spyOn(component.onRescheduled, 'emit');

      await component.submit();

      expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'success',
        detail: 'Cita reprogramada correctamente'
      }));
      expect(spy).toHaveBeenCalled();
    });

    it('debe mostrar error toast y no emitir si reschedule rechaza', async () => {
      const spy = jest.spyOn(component.onRescheduled, 'emit');
      appointmentServiceMock.reschedule = jest.fn().mockRejectedValue(new Error('El horario ya no está disponible'));

      await component.submit();

      expect(messageServiceMock.add).toHaveBeenCalledWith(expect.objectContaining({
        severity: 'error',
        detail: 'El horario ya no está disponible'
      }));
      expect(spy).not.toHaveBeenCalled();
    });

    it('no debe submittear sin fecha u hora', async () => {
      component.selectedDate.set(null);

      await component.submit();

      expect(appointmentServiceMock.reschedule).not.toHaveBeenCalled();
    });

    it('debe setear submitting a false incluso si falla', async () => {
      appointmentServiceMock.reschedule = jest.fn().mockRejectedValue(new Error('fail'));

      await component.submit();

      expect(component.submitting()).toBe(false);
    });
  });

  describe('close', () => {
    it('debe resetear estado y emitir onClose', () => {
      const spy = jest.spyOn(component.onClose, 'emit');
      component.selectedDate.set(new Date(2026, 2, 25));
      component.selectedTime.set('15:00');
      component.availableSlots.set(mockSlots);

      component.close();

      expect(component.selectedDate()).toBeNull();
      expect(component.selectedTime()).toBe('');
      expect(component.availableSlots()).toEqual([]);
      expect(spy).toHaveBeenCalled();
    });
  });
});
