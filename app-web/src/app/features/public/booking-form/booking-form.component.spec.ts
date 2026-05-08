import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingFormComponent } from './booking-form.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { EmailNotificationService } from '../../../core/services/email-notification.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let appointmentServiceMock: jest.Mocked<AppointmentService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;
  let emailNotificationMock: jest.Mocked<EmailNotificationService>;
  let activatedRouteMock: any;

  const mockCompany = { id: 'company-1', name: 'Peluquería Juan', slug: 'peluqueria-juan' };
  const mockEmployee = { id: 'employee-1', full_name: 'Juan Pérez' };
  const mockServices = [
    { id: 'service-1', name: 'Corte de cabello', duration_minutes: 30, price: 25 },
    { id: 'service-2', name: 'Tinte', duration_minutes: 60, price: 50 }
  ];

  beforeEach(async () => {
    appointmentServiceMock = { create: jest.fn().mockResolvedValue({}) } as any;
    serviceServiceMock = { getByEmployee: jest.fn().mockResolvedValue(mockServices) } as any;
    emailNotificationMock = { notify: jest.fn() } as any;
    activatedRouteMock = {
      snapshot: {
        paramMap: { get: jest.fn().mockImplementation((k: string) => k === 'companySlug' ? 'peluqueria-juan' : k === 'employeeId' ? 'employee-1' : null) },
        queryParamMap: { get: jest.fn().mockReturnValue(null) }
      }
    };

    await TestBed.configureTestingModule({
      imports: [BookingFormComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: CompanyService, useValue: { getBySlug: jest.fn().mockResolvedValue(mockCompany) } },
        { provide: UserService, useValue: { getById: jest.fn().mockResolvedValue(mockEmployee) } },
        { provide: ServiceService, useValue: serviceServiceMock },
        { provide: EmailNotificationService, useValue: emailNotificationMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: { navigate: jest.fn().mockReturnValue(Promise.resolve(true)) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
  });

  describe('Inicialización con query params (serviceIds)', () => {
    beforeEach(() => {
      activatedRouteMock.snapshot.queryParamMap.get.mockImplementation((k: string) =>
        k === 'serviceIds' ? 'service-1' : k === 'date' ? '2026-03-20' : k === 'time' ? '10:00' : null
      );
    });

    it('debe cargar servicios por IDs desde query params', async () => {
      await component.ngOnInit();

      expect(serviceServiceMock.getByEmployee).toHaveBeenCalledWith('employee-1');
      expect(component.selectedServices()).toEqual([mockServices[0]]);
    });

    it('debe cargar múltiples servicios desde query params', async () => {
      activatedRouteMock.snapshot.queryParamMap.get.mockImplementation((k: string) =>
        k === 'serviceIds' ? 'service-1,service-2' : k === 'date' ? '2026-03-20' : k === 'time' ? '10:00' : null
      );

      await component.ngOnInit();

      expect(component.selectedServices()).toEqual(mockServices);
    });

    it('debe avanzar a paso 1 cuando hay query params', async () => {
      await component.ngOnInit();

      expect(component.currentStep()).toBe(1);
    });
  });

  describe('Modo abierto (sin query params)', () => {
    beforeEach(async () => {
      activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue(null);
      await component.ngOnInit();
    });

    it('debe entrar en modo abierto', () => {
      expect(component.isOpenMode()).toBe(true);
    });

    it('debe cargar servicios del empleado', () => {
      expect(serviceServiceMock.getByEmployee).toHaveBeenCalledWith('employee-1');
    });

    it('debe iniciar en paso 0', () => {
      expect(component.currentStep()).toBe(0);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      activatedRouteMock.snapshot.queryParamMap.get.mockImplementation((k: string) =>
        k === 'serviceIds' ? 'service-1' : k === 'date' ? '2026-03-20' : k === 'time' ? '10:00' : null
      );
    });

    it('no debe llamar a create si el formulario es inválido', async () => {
      component.bookingForm.patchValue({ client_name: '', client_phone: '' });
      await component.onSubmit();

      expect(appointmentServiceMock.create).not.toHaveBeenCalled();
    });

    it('debe llamar a appointmentService.create con service_ids array', async () => {
      await component.ngOnInit();
      component.bookingForm.patchValue({
        client_name: 'Juan Pérez', client_phone: '555-123-456789',
        client_email: 'juan@example.com', notes: 'Nota'
      });

      await component.onSubmit();

      expect(appointmentServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          company_id: 'company-1', employee_id: 'employee-1',
          service_ids: ['service-1'], client_name: 'Juan Pérez',
          appointment_date: '2026-03-20', appointment_time: '10:00'
        })
      );
    });

    it('debe enviar múltiples service_ids', async () => {
      activatedRouteMock.snapshot.queryParamMap.get.mockImplementation((k: string) =>
        k === 'serviceIds' ? 'service-1,service-2' : k === 'date' ? '2026-03-20' : k === 'time' ? '10:00' : null
      );
      await component.ngOnInit();
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '555-123-456789' });

      await component.onSubmit();

      expect(appointmentServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ service_ids: ['service-1', 'service-2'] })
      );
    });

    it('debe establecer loading durante el envío', async () => {
      let resolvePromise: () => void;
      appointmentServiceMock.create.mockImplementation(() => new Promise(r => { resolvePromise = r; }));
      await component.ngOnInit();
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '555-123-456789' });

      const promise = component.onSubmit();
      expect(component.loading()).toBe(true);

      resolvePromise!();
      await promise;
      expect(component.loading()).toBe(false);
    });

    it('no debe crear duplicados si onSubmit se llama mientras ya está cargando', async () => {
      let resolvePromise: () => void;
      appointmentServiceMock.create.mockImplementation(() => new Promise(r => { resolvePromise = r; }));
      await component.ngOnInit();
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '555-123-456789' });

      const firstPromise = component.onSubmit();
      expect(component.loading()).toBe(true);

      const secondPromise = component.onSubmit();

      resolvePromise!();
      await firstPromise;
      await secondPromise;

      expect(appointmentServiceMock.create).toHaveBeenCalledTimes(1);
    });

    it('debe establecer submitError cuando el servidor falla', async () => {
      appointmentServiceMock.create.mockRejectedValue(new Error('Error del servidor'));
      await component.ngOnInit();
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '555-123-456789' });

      await component.onSubmit();

      expect(component.submitError()).toBe('Error del servidor');
    });

    it('debe permitir envío solo con email sin teléfono', async () => {
      appointmentServiceMock.create.mockResolvedValue({});
      await component.ngOnInit();
      component.bookingForm.patchValue({
        client_name: 'María',
        client_phone: '',
        client_email: 'maria@test.com'
      });

      await component.onSubmit();

      expect(appointmentServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          client_name: 'María',
          client_phone: undefined,
          client_email: 'maria@test.com'
        })
      );
      expect(component.success()).toBe(true);
    });

    it('debe enviar notificación de email después de crear cita', async () => {
      const mockAppointment = { id: 'appt-1' };
      appointmentServiceMock.create.mockResolvedValue(mockAppointment);
      await component.ngOnInit();
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '555-123-456789' });

      await component.onSubmit();

      expect(emailNotificationMock.notify).toHaveBeenCalledWith('appt-1', 'created');
    });
  });

  describe('Formulario', () => {
    it('debe validar que nombre es requerido', () => {
      component.bookingForm.patchValue({ client_name: '', client_phone: '555-123-456789' });
      expect(component.bookingForm.get('client_name')?.hasError('required')).toBe(true);
    });

    it('debe validar teléfono con mínimo 10 dígitos', () => {
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '04143333' });
      component.bookingForm.updateValueAndValidity();
      expect(component.bookingForm.errors?.['invalidPhone']).toBe(true);
    });

    it('debe validar contacto mínimo (teléfono o email)', () => {
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '', client_email: '' });
      component.bookingForm.updateValueAndValidity();
      expect(component.bookingForm.errors?.['noContact']).toBe(true);
    });

    it('debe permitir reserva solo con email (sin teléfono)', () => {
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '', client_email: 'juan@test.com' });
      component.bookingForm.updateValueAndValidity();
      expect(component.bookingForm.errors?.['noContact']).toBeUndefined();
      expect(component.bookingForm.errors?.['invalidPhone']).toBeUndefined();
    });
  });

  describe('Navegación de pasos (modo abierto)', () => {
    beforeEach(async () => {
      activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue(null);
      await component.ngOnInit();
    });

    it('debe avanzar al paso 1 con onSelectionProceed', () => {
      component.selectionForm.patchValue({ service_id: 'service-1', appointment_date: '2026-04-10', appointment_time: '10:00' });

      component.onSelectionProceed();

      expect(component.currentStep()).toBe(1);
      expect(component.selectedDate).toBe('2026-04-10');
      expect(component.selectedTime).toBe('10:00');
    });

    it('debe establecer selectedServices al seleccionar un servicio', () => {
      component.selectionForm.patchValue({ service_id: 'service-1', appointment_date: '2026-04-10', appointment_time: '10:00' });

      component.onSelectionProceed();

      expect(component.selectedServices()).toEqual([mockServices[0]]);
    });

    it('debe retroceder al paso 0 desde paso 1 en modo abierto', () => {
      component.currentStep.set(1);

      component.prevStep();

      expect(component.currentStep()).toBe(0);
    });

    it('debe avanzar al paso 2 desde paso 1 con nextStep', () => {
      component.currentStep.set(1);

      component.nextStep();

      expect(component.currentStep()).toBe(2);
    });

    it('debe retroceder al paso 1 desde paso 2', () => {
      component.currentStep.set(2);

      component.prevStep();

      expect(component.currentStep()).toBe(1);
    });
  });

  describe('Computed signals', () => {
    beforeEach(async () => {
      activatedRouteMock.snapshot.queryParamMap.get.mockImplementation((k: string) =>
        k === 'serviceIds' ? 'service-1,service-2' : k === 'date' ? '2026-03-20' : k === 'time' ? '10:00' : null
      );
      await component.ngOnInit();
    });

    it('debe calcular duración total correctamente', () => {
      expect(component.totalDuration()).toBe(90);
    });

    it('debe calcular precio total correctamente', () => {
      expect(component.totalPrice()).toBe(75);
    });

    it('debe formatear lista de servicios', () => {
      expect(component.selectedServicesText()).toContain('Corte de cabello');
      expect(component.selectedServicesText()).toContain('Tinte');
    });
  });
});
