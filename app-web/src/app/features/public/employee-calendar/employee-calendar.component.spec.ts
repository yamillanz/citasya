import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeCalendarComponent } from './employee-calendar.component';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ActivatedRoute, Router } from '@angular/router';

describe('EmployeeCalendarComponent (Public)', () => {
  let component: EmployeeCalendarComponent;
  let fixture: ComponentFixture<EmployeeCalendarComponent>;
  let companyServiceMock: jest.Mocked<CompanyService>;
  let userServiceMock: jest.Mocked<UserService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;
  let appointmentServiceMock: jest.Mocked<AppointmentService>;

  const mockCompany = {
    id: 'company-1',
    name: 'Peluquería Juan',
    slug: 'peluqueria-juan',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockEmployee = {
    id: 'employee-1',
    email: 'employee@test.com',
    full_name: 'Juan Empleado',
    role: 'employee' as const,
    company_id: 'company-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockServices = [
    {
      id: 'service-1',
      name: 'Corte de cabello',
      duration_minutes: 30,
      price: 25,
      company_id: 'company-1',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'service-2',
      name: 'Tinte',
      duration_minutes: 60,
      price: 50,
      company_id: 'company-1',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    companyServiceMock = {
      getBySlug: jest.fn().mockResolvedValue(mockCompany),
      getById: jest.fn().mockResolvedValue(mockCompany)
    } as any;

    userServiceMock = {
      getById: jest.fn().mockResolvedValue(mockEmployee)
    } as any;

    serviceServiceMock = {
      getByEmployee: jest.fn().mockResolvedValue(mockServices),
      getById: jest.fn().mockResolvedValue(mockServices[0])
    } as any;

    appointmentServiceMock = {
      getAvailableSlots: jest.fn().mockResolvedValue(['09:00', '09:30', '10:00'])
    } as any;

    await TestBed.configureTestingModule({
      imports: [EmployeeCalendarComponent],
      providers: [
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => {
                  if (key === 'companySlug') return 'peluqueria-juan';
                  if (key === 'employeeId') return 'employee-1';
                  return null;
                }
              }
            }
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
            createUrlTree: jest.fn().mockReturnValue({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeCalendarComponent);
    component = fixture.componentInstance;
  });

  describe('Inicialización', () => {
    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar signals en sus valores por defecto', () => {
      expect(component.loading()).toBe(true);
      expect(component.error()).toBe('');
      expect(component.company()).toBeNull();
      expect(component.employee()).toBeNull();
      expect(component.services()).toEqual([]);
      expect(component.selectedServiceIds()).toEqual([]);
      expect(component.selectedDate()).toBe('');
      expect(component.selectedTime()).toBe('');
      expect(component.availableSlots()).toEqual([]);
    });

    it('debe cargar datos iniciales en ngOnInit', async () => {
      await component.ngOnInit();

      expect(component.company()).toEqual(mockCompany);
      expect(component.employee()).toEqual(mockEmployee);
      expect(component.services()).toEqual(mockServices);
      expect(component.loading()).toBe(false);
    });

    it('debe establecer error si no hay companySlug en la URL', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      (routeMock.snapshot.paramMap.get as jest.Mock) = jest.fn().mockReturnValue(null);

      await component.ngOnInit();

      expect(component.error()).toBe('Página no encontrada');
      expect(component.loading()).toBe(false);
    });

    it('debe establecer error si no hay employeeId en la URL', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      (routeMock.snapshot.paramMap.get as jest.Mock) = jest.fn()
        .mockImplementation((key: string) => {
          if (key === 'companySlug') return 'peluqueria-juan';
          return null;
        });

      await component.ngOnInit();

      expect(component.error()).toBe('Página no encontrada');
      expect(component.loading()).toBe(false);
    });

    it('debe establecer error si la empresa no existe', async () => {
      companyServiceMock.getBySlug = jest.fn().mockResolvedValue(null);

      await component.ngOnInit();

      expect(component.error()).toBe('Empresa no encontrada');
      expect(component.loading()).toBe(false);
    });

    it('debe establecer error si el empleado no existe', async () => {
      userServiceMock.getById = jest.fn().mockResolvedValue(null);

      await component.ngOnInit();

      expect(component.error()).toBe('Profesional no encontrado');
      expect(component.loading()).toBe(false);
    });

    it('debe establecer error si falla la carga de datos', async () => {
      companyServiceMock.getBySlug = jest.fn().mockRejectedValue(new Error('Network error'));

      await component.ngOnInit();

      expect(component.error()).toBe('Error al cargar los datos');
      expect(component.loading()).toBe(false);
    });
  });

  describe('Selección de servicios (múltiples)', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('debe agregar un servicio con onServiceToggle', () => {
      component.onServiceToggle('service-1');

      expect(component.selectedServiceIds()).toContain('service-1');
      expect(component.selectedTime()).toBe('');
    });

    it('debe remover un servicio si ya está seleccionado', () => {
      component.onServiceToggle('service-1');
      component.onServiceToggle('service-1');

      expect(component.selectedServiceIds()).not.toContain('service-1');
    });

    it('debe permitir seleccionar múltiples servicios', () => {
      component.onServiceToggle('service-1');
      component.onServiceToggle('service-2');

      expect(component.selectedServiceIds()).toEqual(['service-1', 'service-2']);
    });

    it('debe calcular selectedServices correctamente', () => {
      component.onServiceToggle('service-1');

      expect(component.selectedServices()).toEqual([mockServices[0]]);
    });

    it('debe calcular totalDuration con servicios seleccionados', () => {
      component.onServiceToggle('service-1');
      component.onServiceToggle('service-2');

      expect(component.totalDuration()).toBe(90); // 30 + 60
    });

    it('debe calcular totalPrice con servicios seleccionados', () => {
      component.onServiceToggle('service-1');
      component.onServiceToggle('service-2');

      expect(component.totalPrice()).toBe(75); // 25 + 50
    });

    it('debe retornar 0 si no hay servicios seleccionados', () => {
      expect(component.totalDuration()).toBe(0);
      expect(component.totalPrice()).toBe(0);
    });

    it('debe limpiar la hora seleccionada al cambiar servicios', () => {
      component.selectedTime.set('10:00');

      component.onServiceToggle('service-1');

      expect(component.selectedTime()).toBe('');
    });

    it('debe recargar slots si hay fecha seleccionada y se toggle servicio', async () => {
      component.selectedDate.set('2026-04-10');

      component.onServiceToggle('service-1');

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalled();
    });

    it('debe indicar si un servicio está seleccionado con isServiceSelected', () => {
      component.onServiceToggle('service-1');

      expect(component.isServiceSelected('service-1')).toBe(true);
      expect(component.isServiceSelected('service-2')).toBe(false);
    });
  });

  describe('Selección de fecha', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      component.onServiceToggle('service-1');
    });

    it('debe establecer la fecha seleccionada desde handleDateSelect', async () => {
      const mockArg = { startStr: '2026-04-10T00:00:00' };

      await component.handleDateSelect(mockArg);

      expect(component.selectedDate()).toBe('2026-04-10');
      expect(component.selectedTime()).toBe('');
    });

    it('debe establecer la fecha seleccionada desde handleDateClick', async () => {
      const mockArg = { dateStr: '2026-04-10T00:00:00+00:00' };

      await component.handleDateClick(mockArg);

      expect(component.selectedDate()).toBe('2026-04-10');
      expect(component.selectedTime()).toBe('');
    });

    it('debe cargar slots disponibles al seleccionar fecha', async () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      const mockArg = { startStr: '2026-04-10T00:00:00' };

      await component.handleDateSelect(mockArg);

      expect(component.availableSlots()).toEqual(['09:00', '09:30', '10:00']);
    });

    it('debe limpiar la hora seleccionada al cambiar de fecha', async () => {
      component.selectedTime.set('10:00');
      const mockArg = { startStr: '2026-04-10T00:00:00' };

      await component.handleDateSelect(mockArg);

      expect(component.selectedTime()).toBe('');
    });
  });

  describe('Selección de hora', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('debe establecer la hora seleccionada', () => {
      component.selectTime('10:30');

      expect(component.selectedTime()).toBe('10:30');
    });

    it('debe poder cambiar la hora seleccionada', () => {
      component.selectTime('10:30');
      component.selectTime('11:00');

      expect(component.selectedTime()).toBe('11:00');
    });
  });

  describe('loadAvailableSlots', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('no debe hacer nada si falta información', async () => {
      component.company.set(null);
      component.employee.set(mockEmployee);
      component.selectedDate.set('2026-04-10');
      component.selectedServiceIds.set(['service-1']);

      await component.loadAvailableSlots();

      expect(appointmentServiceMock.getAvailableSlots).not.toHaveBeenCalled();
    });

    it('no debe hacer nada si duration es 0', async () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      component.selectedDate.set('2026-04-10');
      component.selectedServiceIds.set([]);

      await component.loadAvailableSlots();

      expect(appointmentServiceMock.getAvailableSlots).not.toHaveBeenCalled();
    });

    it('debe llamar al servicio con los parámetros correctos', async () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      component.selectedDate.set('2026-04-10');
      component.onServiceToggle('service-1');

      await component.loadAvailableSlots();

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith(
        mockCompany.id,
        mockEmployee.id,
        '2026-04-10',
        30
      );
    });

    it('debe usar duración total con múltiples servicios', async () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      component.selectedDate.set('2026-04-10');
      component.selectedServiceIds.set(['service-1', 'service-2']);

      await component.loadAvailableSlots();

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith(
        mockCompany.id,
        mockEmployee.id,
        '2026-04-10',
        90
      );
    });

    it('debe establecer los slots disponibles', async () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      component.selectedDate.set('2026-04-10');
      component.onServiceToggle('service-1');

      await component.loadAvailableSlots();

      expect(component.availableSlots()).toEqual(['09:00', '09:30', '10:00']);
    });

    it('debe manejar lista vacía de slots', async () => {
      appointmentServiceMock.getAvailableSlots = jest.fn().mockResolvedValue([]);
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      component.selectedDate.set('2026-04-10');
      component.onServiceToggle('service-1');

      await component.loadAvailableSlots();

      expect(component.availableSlots()).toEqual([]);
    });
  });

  describe('proceedToBooking', () => {
    let routerMock: jest.Mocked<Router>;

    beforeEach(async () => {
      routerMock = TestBed.inject(Router) as jest.Mocked<Router>;
      await component.ngOnInit();
    });

    it('no debe navegar si falta información', () => {
      component.company.set(null);
      component.employee.set(mockEmployee);
      component.selectedServiceIds.set(['service-1']);
      component.selectedDate.set('2026-04-10');
      component.selectedTime.set('10:00');

      component.proceedToBooking();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('no debe navegar si no hay servicios seleccionados', () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      component.selectedServiceIds.set([]);
      component.selectedDate.set('2026-04-10');
      component.selectedTime.set('10:00');

      component.proceedToBooking();

      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('debe navegar a la página de booking con query params correctos (un servicio)', () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      component.selectedServiceIds.set(['service-1']);
      component.selectedDate.set('2026-04-10');
      component.selectedTime.set('10:30');

      component.proceedToBooking();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/c', mockCompany.slug, 'e', mockEmployee.id, 'book'],
        {
          queryParams: {
            date: '2026-04-10',
            time: '10:30',
            serviceIds: 'service-1'
          }
        }
      );
    });

    it('debe navegar con múltiples servicios como string separado por comas', () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      component.selectedServiceIds.set(['service-1', 'service-2']);
      component.selectedDate.set('2026-04-15');
      component.selectedTime.set('14:00');

      component.proceedToBooking();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/c', mockCompany.slug, 'e', mockEmployee.id, 'book'],
        {
          queryParams: {
            date: '2026-04-15',
            time: '14:00',
            serviceIds: 'service-1,service-2'
          }
        }
      );
    });
  });

  describe('formatDate', () => {
    it('debe formatear la fecha en español', () => {
      const result = component.formatDate('2026-04-10');

      expect(result).toContain('abril');
    });

    it('debe manejar diferentes fechas', () => {
      const result = component.formatDate('2026-12-25');

      expect(result).toContain('diciembre');
    });
  });
});
