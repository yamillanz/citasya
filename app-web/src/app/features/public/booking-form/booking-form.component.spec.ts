import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BookingFormComponent } from './booking-form.component';
import { AppointmentService } from '../../../core/services/appointment.service';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('BookingFormComponent', () => {
  let component: BookingFormComponent;
  let fixture: ComponentFixture<BookingFormComponent>;
  let appointmentServiceMock: jest.Mocked<AppointmentService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;
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

    it('debe marcar campos como tocados si el formulario es inválido', async () => {
      await component.ngOnInit();
      component.bookingForm.patchValue({ client_name: '', client_phone: '' });

      await component.onSubmit();

      expect(component.bookingForm.get('client_name')?.touched).toBe(true);
      expect(component.bookingForm.get('client_phone')?.touched).toBe(true);
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

    it('debe establecer submitError cuando el servidor falla', async () => {
      appointmentServiceMock.create.mockRejectedValue(new Error('Error del servidor'));
      await component.ngOnInit();
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '555-123-456789' });

      await component.onSubmit();

      expect(component.submitError()).toBe('Error del servidor');
    });
  });

  describe('Formulario', () => {
    it('debe validar que nombre es requerido', () => {
      component.bookingForm.patchValue({ client_name: '', client_phone: '555-123-456789' });
      expect(component.bookingForm.get('client_name')?.hasError('required')).toBe(true);
    });

    it('debe validar teléfono con mínimo 12 dígitos', () => {
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '555-123-4567' });
      component.bookingForm.updateValueAndValidity();
      expect(component.bookingForm.errors?.['invalidPhone']).toBe(true);
    });

    it('debe validar contacto mínimo (teléfono o email)', () => {
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '', client_email: '' });
      component.bookingForm.updateValueAndValidity();
      expect(component.bookingForm.errors?.['noContact']).toBe(true);
    });
  });

  describe('Navegación de pasos (modo abierto)', () => {
    beforeEach(async () => {
      activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue(null);
      await component.ngOnInit();
    });

    it('debe avanzar al paso 1 con proceedFromStep0 válido', () => {
      component.selectionForm.patchValue({ service_id: 'service-1', appointment_date: '2026-04-10', appointment_time: '10:00' });
      component.selectedDate = '2026-04-10';
      component.selectedTime = '10:00';

      component.proceedFromStep0();

      expect(component.currentStep()).toBe(1);
    });

    it('no debe avanzar si selectionForm es inválido', () => {
      component.selectionForm.patchValue({ service_id: '', appointment_date: '', appointment_time: '' });

      component.proceedFromStep0();

      expect(component.currentStep()).toBe(0);
      expect(component.selectionForm.get('service_id')?.touched).toBe(true);
    });
  });

  describe('onServiceChange (modo abierto)', () => {
    it('debe establecer el servicio en selectedServices array', async () => {
      activatedRouteMock.snapshot.queryParamMap.get.mockReturnValue(null);
      await component.ngOnInit();

      const event = { target: { value: 'service-1' } } as any;
      component.onServiceChange(event);

      expect(component.selectedServices()).toEqual([mockServices[0]]);
    });
  });
});
