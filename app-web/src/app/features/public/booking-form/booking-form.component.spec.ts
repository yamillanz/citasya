import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
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
  let companyServiceMock: jest.Mocked<CompanyService>;
  let userServiceMock: jest.Mocked<UserService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;

  const mockCompany = {
    id: 'company-1',
    name: 'Peluquería Juan',
    slug: 'peluqueria-juan'
  };

  const mockEmployee = {
    id: 'employee-1',
    full_name: 'Juan Pérez'
  };

  const mockService = {
    id: 'service-1',
    name: 'Corte de cabello',
    duration_minutes: 30,
    price: 25
  };

  const mockServices = [
    {
      id: 'service-1',
      name: 'Corte de cabello',
      duration_minutes: 30,
      price: 25
    },
    {
      id: 'service-2',
      name: 'Tinte',
      duration_minutes: 60,
      price: 50
    }
  ];

  beforeEach(async () => {
    appointmentServiceMock = {
      create: jest.fn().mockResolvedValue({})
    } as any;

    companyServiceMock = {
      getBySlug: jest.fn().mockResolvedValue(mockCompany)
    } as any;

    userServiceMock = {
      getById: jest.fn().mockResolvedValue(mockEmployee)
    } as any;

    serviceServiceMock = {
      getById: jest.fn().mockResolvedValue(mockService),
      getByEmployee: jest.fn().mockResolvedValue(mockServices)
    } as any;

    const routerMock = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
      createUrlTree: jest.fn().mockReturnValue({})
    };

    const activatedRouteMock = {
      snapshot: {
        paramMap: {
          get: jest.fn().mockImplementation((key: string) => {
            if (key === 'companySlug') return 'peluqueria-juan';
            if (key === 'employeeId') return 'employee-1';
            return null;
          })
        },
        queryParamMap: {
          get: jest.fn()
        }
      }
    };

    await TestBed.configureTestingModule({
      imports: [BookingFormComponent],
      providers: [
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFormComponent);
    component = fixture.componentInstance;
  });

  describe('Inicialización', () => {
    let routeMock: any;

    beforeEach(() => {
      routeMock = TestBed.inject(ActivatedRoute);
      routeMock.snapshot.queryParamMap.get.mockImplementation((key: string) => {
        if (key === 'date') return '2026-03-20';
        if (key === 'serviceId') return 'service-1';
        if (key === 'time') return '10:00';
        return null;
      });
    });

    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar currentStep en 0 por defecto', () => {
      expect(component.currentStep()).toBe(0);
    });

    it('debe inicializar currentStep en 1 con query params', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      routeMock.snapshot.queryParamMap.get.mockImplementation((key: string) => {
        if (key === 'date') return '2026-03-20';
        if (key === 'serviceId') return 'service-1';
        if (key === 'time') return '10:00';
        return null;
      });
      
      await component.ngOnInit();
      expect(component.currentStep()).toBe(1);
    });

    it('debe inicializar signals en sus valores por defecto', () => {
      expect(component.loading()).toBe(false);
      expect(component.success()).toBe(false);
      expect(component.error()).toBe('');
      expect(component.submitError()).toBe('');
    });

    it('debe cargar datos iniciales desde los servicios', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      routeMock.snapshot.queryParamMap.get.mockImplementation((key: string) => {
        if (key === 'date') return '2026-03-20';
        if (key === 'serviceId') return 'service-1';
        if (key === 'time') return '10:00';
        return null;
      });
      
      await component.ngOnInit();
      expect(component.company()).toEqual(mockCompany);
      expect(component.employee()).toEqual(mockEmployee);
      expect(component.service()).toEqual(mockService);
    });
  });

  describe('Formulario', () => {
    it('debe tener todos los campos del formulario', () => {
      expect(component.bookingForm.contains('client_name')).toBe(true);
      expect(component.bookingForm.contains('client_phone')).toBe(true);
      expect(component.bookingForm.contains('client_email')).toBe(true);
      expect(component.bookingForm.contains('notes')).toBe(true);
    });

    it('debe validar que nombre es requerido', () => {
      component.bookingForm.patchValue({ client_name: '', client_phone: '555-123-4567' });
      expect(component.bookingForm.get('client_name')?.valid).toBe(false);
      expect(component.bookingForm.get('client_name')?.hasError('required')).toBe(true);
    });

    it('debe validar nombre con mínimo 2 caracteres', () => {
      component.bookingForm.patchValue({ client_name: 'A', client_phone: '555-123-4567' });
      expect(component.bookingForm.get('client_name')?.hasError('minlength')).toBe(true);
    });

    it('debe validar que teléfono es requerido si no hay email', () => {
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '', client_email: '' });
      component.bookingForm.updateValueAndValidity();
      expect(component.bookingForm.errors?.['noContact']).toBe(true);
    });

    it('debe validar teléfono con mínimo 10 dígitos', () => {
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '555-123' });
      component.bookingForm.updateValueAndValidity();
      expect(component.bookingForm.errors?.['invalidPhone']).toBe(true);
    });

    it('debe aceptar teléfono válido con formato XXX-XXX-XXXX', () => {
      component.bookingForm.patchValue({ client_name: 'Juan', client_phone: '555-123-4567' });
      expect(component.bookingForm.get('client_phone')?.valid).toBe(true);
    });

    it('debe aceptar email válido', () => {
      component.bookingForm.get('client_email')?.setValue('test@example.com');
      expect(component.bookingForm.get('client_email')?.valid).toBe(true);
    });

    it('debe permitir email vacío (opcional)', () => {
      component.bookingForm.get('client_email')?.setValue('');
      expect(component.bookingForm.get('client_email')?.valid).toBe(true);
    });

    it('debe ser válido con datos completos', () => {
      component.bookingForm.patchValue({
        client_name: 'Juan Pérez',
        client_phone: '555-123-4567',
        client_email: 'juan@example.com',
        notes: 'Nota de prueba'
      });
      expect(component.bookingForm.valid).toBe(true);
    });
  });

  describe('formatPhone', () => {
    it('debe formatear teléfono con 3 dígitos', () => {
      expect(component.formatPhone('555')).toBe('555');
    });

    it('debe formatear teléfono con 6 dígitos', () => {
      expect(component.formatPhone('555123')).toBe('555-123');
    });

    it('debe formatear teléfono con 10 dígitos (completo)', () => {
      expect(component.formatPhone('5551234567')).toBe('555-123-4567');
    });

    it('debe ignorar caracteres no numéricos', () => {
      expect(component.formatPhone('555-abc-1234')).toBe('555-123-4');
    });

    it('debe manejar números con más de 10 dígitos (truncar)', () => {
      expect(component.formatPhone('555123456789')).toBe('555-123-4567');
    });
  });

  describe('onPhoneInput', () => {
    it('debe formatear el teléfono en tiempo real', () => {
      const input = { target: { value: '5551234567' } } as any;
      component.onPhoneInput(input);
      expect(component.bookingForm.value.client_phone).toBe('555-123-4567');
    });
  });

  describe('notesLength computed', () => {
    it('debe retornar 0 cuando notes está vacío', () => {
      component.bookingForm.get('notes')?.setValue('');
      expect(component.notesLength()).toBe(0);
    });

    it('debe retornar la longitud correcta de las notas', () => {
      component.bookingForm.get('notes')?.setValue('Nota de prueba');
      expect(component.notesLength()).toBe(14);
    });
  });

  describe('Navegación de pasos', () => {
    let routeMock: any;

    beforeEach(async () => {
      routeMock = TestBed.inject(ActivatedRoute);
      routeMock.snapshot.queryParamMap.get.mockImplementation((key: string) => {
        if (key === 'date') return '2026-03-20';
        if (key === 'serviceId') return 'service-1';
        if (key === 'time') return '10:00';
        return null;
      });
      await component.ngOnInit();
    });

    it('debe iniciar en paso 1', () => {
      expect(component.currentStep()).toBe(1);
    });

    it('debe avanzar al paso 2 con nextStep()', () => {
      component.nextStep();
      expect(component.currentStep()).toBe(2);
    });

    it('debe retroceder al paso 1 con prevStep() desde paso 2', () => {
      component.currentStep.set(2);
      component.prevStep();
      expect(component.currentStep()).toBe(1);
    });
  });

  describe('getError', () => {
    it('debe retornar mensaje para campo requerido', () => {
      const control = component.bookingForm.get('client_name');
      control?.setValue('');
      control?.markAsTouched();
      expect(component.getError('client_name')).toBe('Este campo es requerido');
    });

    it('debe retornar mensaje para valor muy corto', () => {
      const control = component.bookingForm.get('client_name');
      control?.setValue('A');
      control?.markAsTouched();
      expect(component.getError('client_name')).toBe('El valor es muy corto');
    });

    it('debe retornar string vacío para campo válido', () => {
      const control = component.bookingForm.get('client_name');
      control?.setValue('Juan');
      control?.markAsTouched();
      expect(component.getError('client_name')).toBe('');
    });

    it('debe retornar string vacío para campo no tocado', () => {
      component.bookingForm.patchValue({ client_name: '' });
      expect(component.getError('client_name')).toBe('');
    });
  });

  describe('formatDate', () => {
    it('debe formatear la fecha en español', () => {
      const result = component.formatDate('2026-03-20');
      expect(result).toContain('20');
      expect(result).toContain('marzo');
      expect(result).toContain('2026');
    });
  });

  describe('onSubmit', () => {
    let routeMock: any;

    beforeEach(async () => {
      routeMock = TestBed.inject(ActivatedRoute);
      routeMock.snapshot.queryParamMap.get.mockImplementation((key: string) => {
        if (key === 'date') return '2026-03-20';
        if (key === 'serviceId') return 'service-1';
        if (key === 'time') return '10:00';
        return null;
      });
      
      await component.ngOnInit();
    });

    it('no debe enviar si el formulario es inválido', async () => {
      component.bookingForm.patchValue({ client_name: '', client_phone: '' });
      await component.onSubmit();
      expect(appointmentServiceMock.create).not.toHaveBeenCalled();
    });

    it('debe marcar todos los campos como tocados si es inválido', async () => {
      component.bookingForm.patchValue({ client_name: '', client_phone: '' });
      await component.onSubmit();
      expect(component.bookingForm.get('client_name')?.touched).toBe(true);
      expect(component.bookingForm.get('client_phone')?.touched).toBe(true);
    });

    it('debe llamar appointmentService.create con datos correctos', async () => {
      component.bookingForm.patchValue({
        client_name: 'Juan Pérez',
        client_phone: '555-123-4567',
        client_email: 'juan@example.com',
        notes: 'Nota de prueba'
      });

      await component.onSubmit();

      expect(appointmentServiceMock.create).toHaveBeenCalledWith({
        company_id: 'company-1',
        employee_id: 'employee-1',
        service_id: 'service-1',
        client_name: 'Juan Pérez',
        client_phone: '5551234567',
        client_email: 'juan@example.com',
        appointment_date: '2026-03-20',
        appointment_time: '10:00',
        notes: 'Nota de prueba'
      });
    });

    it('debe establecer success en true después de envío exitoso', async () => {
      component.bookingForm.patchValue({
        client_name: 'Juan',
        client_phone: '555-123-4567'
      });

      await component.onSubmit();

      expect(component.success()).toBe(true);
      expect(component.currentStep()).toBe(3);
    });

    it('debe establecer loading durante el envío', async () => {
      let resolvePromise: () => void;
      appointmentServiceMock.create.mockImplementation(() => new Promise(resolve => {
        resolvePromise = resolve;
      }));
      
      component.bookingForm.patchValue({
        client_name: 'Juan',
        client_phone: '555-123-4567'
      });

      const promise = component.onSubmit();
      expect(component.loading()).toBe(true);
      
      resolvePromise!();
      await promise;
      
      expect(component.loading()).toBe(false);
    });

    it('debe manejar errores del servidor', async () => {
      appointmentServiceMock.create.mockRejectedValue(new Error('Error del servidor'));
      
      component.bookingForm.patchValue({
        client_name: 'Juan',
        client_phone: '555-123-4567'
      });

      await component.onSubmit();

      expect(component.submitError()).toBe('Error del servidor');
      expect(component.success()).toBe(false);
      expect(component.currentStep()).toBe(1);
    });

    it('debe limpiar submitError antes del envío', async () => {
      component.submitError.set('Error previo');
      
      component.bookingForm.patchValue({
        client_name: 'Juan',
        client_phone: '555-123-4567'
      });

      await component.onSubmit();

      expect(component.submitError()).toBe('');
    });

    it('debe enviar sin email ni notas (opcionales)', async () => {
      component.bookingForm.patchValue({
        client_name: 'Juan',
        client_phone: '555-123-4567',
        client_email: '',
        notes: ''
      });

      await component.onSubmit();

      expect(appointmentServiceMock.create).toHaveBeenCalledWith(
        expect.objectContaining({
          client_email: undefined,
          notes: undefined
        })
      );
    });
  });

  describe('Modo Abierto (isOpenMode)', () => {
    let routeMock: any;

    beforeEach(async () => {
      routeMock = TestBed.inject(ActivatedRoute);
      routeMock.snapshot.queryParamMap.get.mockReturnValue(null);
      serviceServiceMock.getByEmployee = jest.fn().mockResolvedValue(mockServices);
      
      await component.ngOnInit();
    });

    it('debe establecer isOpenMode en true cuando no hay query params', () => {
      expect(component.isOpenMode()).toBe(true);
    });

    it('debe cargar servicios del empleado', () => {
      expect(serviceServiceMock.getByEmployee).toHaveBeenCalledWith('employee-1');
    });

    it('debe iniciar en paso 0 en modo abierto', () => {
      expect(component.currentStep()).toBe(0);
    });

    it('debe tener selectionForm con campos requeridos', () => {
      expect(component.selectionForm.contains('service_id')).toBe(true);
      expect(component.selectionForm.contains('appointment_date')).toBe(true);
      expect(component.selectionForm.contains('appointment_time')).toBe(true);
    });

    it('debe validar que service_id es requerido', () => {
      component.selectionForm.patchValue({
        service_id: '',
        appointment_date: '2026-04-10',
        appointment_time: '10:00'
      });
      
      expect(component.selectionForm.get('service_id')?.valid).toBe(false);
      expect(component.selectionForm.get('service_id')?.hasError('required')).toBe(true);
    });

    it('debe validar que appointment_date es requerido', () => {
      component.selectionForm.patchValue({
        service_id: 'service-1',
        appointment_date: '',
        appointment_time: '10:00'
      });
      
      expect(component.selectionForm.get('appointment_date')?.valid).toBe(false);
      expect(component.selectionForm.get('appointment_date')?.hasError('required')).toBe(true);
    });

    it('debe validar que appointment_time es requerido', () => {
      component.selectionForm.patchValue({
        service_id: 'service-1',
        appointment_date: '2026-04-10',
        appointment_time: ''
      });
      
      expect(component.selectionForm.get('appointment_time')?.valid).toBe(false);
      expect(component.selectionForm.get('appointment_time')?.hasError('required')).toBe(true);
    });
  });

  describe('onServiceChange (modo abierto)', () => {
    it('debe establecer el servicio seleccionado', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      routeMock.snapshot.queryParamMap.get.mockReturnValue(null);
      await component.ngOnInit();
      
      const services = component.services();
      const event = {
        target: { value: services[0].id } as HTMLSelectElement
      } as any;
      
      component.onServiceChange(event);
      
      expect(component.service()).toEqual(services[0]);
    });
  });

  describe('onDateSelect (modo abierto)', () => {
    it('debe establecer la fecha seleccionada', () => {
      const event = {
        target: { value: '2026-04-10' } as HTMLInputElement
      } as any;
      
      component.onDateSelect(event);
      
      expect(component.selectedDate).toBe('2026-04-10');
    });

    it('debe actualizar selectionForm con la fecha', () => {
      const event = {
        target: { value: '2026-04-10' } as HTMLInputElement
      } as any;
      
      component.onDateSelect(event);
      
      expect(component.selectionForm.get('appointment_date')?.value).toBe('2026-04-10');
    });

    it('no debe hacer nada si el valor está vacío', () => {
      component.selectedDate = '2026-04-10';
      const event = {
        target: { value: '' } as HTMLInputElement
      } as any;
      
      component.onDateSelect(event);
      
      expect(component.selectedDate).toBe('2026-04-10');
    });
  });

  describe('onTimeSelect (modo abierto)', () => {
    it('debe establecer la hora seleccionada', () => {
      const event = {
        target: { value: '10:30' } as HTMLInputElement
      } as any;
      
      component.onTimeSelect(event);
      
      expect(component.selectedTime).toBe('10:30');
    });

    it('debe actualizar selectionForm con la hora', () => {
      const event = {
        target: { value: '10:30' } as HTMLInputElement
      } as any;
      
      component.onTimeSelect(event);
      
      expect(component.selectionForm.get('appointment_time')?.value).toBe('10:30');
    });

    it('no debe hacer nada si el valor está vacío', () => {
      component.selectedTime = '10:30';
      const event = {
        target: { value: '' } as HTMLInputElement
      } as any;
      
      component.onTimeSelect(event);
      
      expect(component.selectedTime).toBe('10:30');
    });
  });

  describe('canProceedFromStep0 (modo abierto)', () => {
    it('debe retornar false si el formulario es inválido', () => {
      component.selectionForm.patchValue({
        service_id: '',
        appointment_date: '',
        appointment_time: ''
      });
      
      expect(component.canProceedFromStep0()).toBe(false);
    });

    it('debe retornar false si falta fecha', () => {
      component.selectionForm.patchValue({
        service_id: 'service-1',
        appointment_date: '',
        appointment_time: '10:00'
      });
      
      expect(component.canProceedFromStep0()).toBe(false);
    });

    it('debe retornar false si falta hora', () => {
      component.selectionForm.patchValue({
        service_id: 'service-1',
        appointment_date: '2026-04-10',
        appointment_time: ''
      });
      
      expect(component.canProceedFromStep0()).toBe(false);
    });

    it('debe retornar true si el formulario es válido', () => {
      component.selectionForm.patchValue({
        service_id: 'service-1',
        appointment_date: '2026-04-10',
        appointment_time: '10:00'
      });
      component.selectedDate = '2026-04-10';
      component.selectedTime = '10:00';
      
      expect(component.canProceedFromStep0()).toBe(true);
    });
  });

  describe('proceedFromStep0 (modo abierto)', () => {
    it('no debe avanzar si el formulario es inválido', () => {
      component.selectionForm.patchValue({
        service_id: '',
        appointment_date: '',
        appointment_time: ''
      });
      
      component.proceedFromStep0();
      
      expect(component.currentStep()).toBe(0);
    });

    it('debe marcar todos los campos como tocados si es inválido', () => {
      component.selectionForm.patchValue({
        service_id: '',
        appointment_date: '',
        appointment_time: ''
      });
      
      component.proceedFromStep0();
      
      expect(component.selectionForm.get('service_id')?.touched).toBe(true);
      expect(component.selectionForm.get('appointment_date')?.touched).toBe(true);
      expect(component.selectionForm.get('appointment_time')?.touched).toBe(true);
    });

    it('debe avanzar al paso 1 si el formulario es válido', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      routeMock.snapshot.queryParamMap.get.mockReturnValue(null);
      await component.ngOnInit();
      
      const services = component.services();
      component.selectionForm.patchValue({
        service_id: services[0].id,
        appointment_date: '2026-04-10',
        appointment_time: '10:00'
      });
      component.selectedDate = '2026-04-10';
      component.selectedTime = '10:00';
      
      component.proceedFromStep0();
      
      expect(component.currentStep()).toBe(1);
    });
  });

  describe('prevStep (modo abierto)', () => {
    it('debe retroceder del paso 1 al paso 0 en modo abierto', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      routeMock.snapshot.queryParamMap.get.mockReturnValue(null);
      await component.ngOnInit();
      
      component.currentStep.set(1);
      expect(component.isOpenMode()).toBe(true);
      
      component.prevStep();
      
      expect(component.currentStep()).toBe(0);
    });

    it('debe retroceder del paso 2 al paso 1 en modo abierto', () => {
      component.currentStep.set(2);
      
      component.prevStep();
      
      expect(component.currentStep()).toBe(1);
    });
  });

  describe('loadServices (modo abierto)', () => {
    it('debe cargar servicios del empleado', async () => {
      serviceServiceMock.getByEmployee = jest.fn().mockResolvedValue(mockServices);
      
      await component.loadServices('employee-1');
      
      expect(serviceServiceMock.getByEmployee).toHaveBeenCalledWith('employee-1');
    });

    it('debe establecer error si falla la carga de servicios', async () => {
      serviceServiceMock.getByEmployee = jest.fn().mockRejectedValue(new Error('Network error'));
      
      await component.loadServices('employee-1');
      
      expect(component.error()).toBe('Error al cargar los servicios');
    });

    it('debe manejar lista vacía de servicios', async () => {
      serviceServiceMock.getByEmployee = jest.fn().mockResolvedValue([]);
      
      await component.loadServices('employee-1');
      
      expect(component.services()).toEqual([]);
    });
  });
});