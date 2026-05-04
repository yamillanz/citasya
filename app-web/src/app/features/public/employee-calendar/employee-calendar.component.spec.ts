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
  let routerMock: jest.Mocked<Router>;

  const mockCompany = {
    id: 'company-1', name: 'Peluquería Juan', slug: 'peluqueria-juan',
    is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
  const mockEmployee = {
    id: 'employee-1', email: 'employee@test.com', full_name: 'Juan Empleado',
    role: 'employee' as const, company_id: 'company-1', is_active: true,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  };
  const mockServices = [
    { id: 'service-1', name: 'Corte', duration_minutes: 30, price: 25,
      company_id: 'company-1', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 'service-2', name: 'Tinte', duration_minutes: 60, price: 50,
      company_id: 'company-1', is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  ];

  beforeEach(async () => {
    companyServiceMock = { getBySlug: jest.fn().mockResolvedValue(mockCompany) } as any;
    userServiceMock = { getById: jest.fn().mockResolvedValue(mockEmployee) } as any;
    serviceServiceMock = { getByEmployee: jest.fn().mockResolvedValue(mockServices) } as any;
    appointmentServiceMock = { getAvailableSlots: jest.fn().mockResolvedValue(['09:00', '09:30', '10:00']) } as any;
    routerMock = { navigate: jest.fn().mockReturnValue(Promise.resolve(true)) } as any;

    await TestBed.configureTestingModule({
      imports: [EmployeeCalendarComponent],
      providers: [
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (k: string) => k === 'companySlug' ? 'peluqueria-juan' : k === 'employeeId' ? 'employee-1' : null }, queryParamMap: { get: jest.fn().mockReturnValue(null) } } } },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeCalendarComponent);
    component = fixture.componentInstance;
  });

  describe('Inicialización', () => {
    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe cargar datos de empresa, empleado y servicios', async () => {
      await component.ngOnInit();

      expect(companyServiceMock.getBySlug).toHaveBeenCalledWith('peluqueria-juan');
      expect(userServiceMock.getById).toHaveBeenCalledWith('employee-1');
      expect(serviceServiceMock.getByEmployee).toHaveBeenCalledWith('employee-1');
    });

    it('debe establecer error si no hay companySlug', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      (routeMock.snapshot.paramMap.get as jest.Mock) = jest.fn().mockReturnValue(null);

      await component.ngOnInit();

      expect(component.error()).toBe('Página no encontrada');
    });

    it('debe establecer error si la empresa no existe', async () => {
      companyServiceMock.getBySlug = jest.fn().mockResolvedValue(null);

      await component.ngOnInit();

      expect(component.error()).toBe('Empresa no encontrada');
    });

    it('debe establecer error si el empleado no existe', async () => {
      userServiceMock.getById = jest.fn().mockResolvedValue(null);

      await component.ngOnInit();

      expect(component.error()).toBe('Profesional no encontrado');
    });
  });

  describe('Selección de servicios múltiples', () => {
    beforeEach(async () => { await component.ngOnInit(); });

    it('debe agregar un servicio al hacer toggle', () => {
      component.onServiceToggle('service-1');

      expect(component.selectedServiceIds()).toContain('service-1');
    });

    it('debe remover un servicio si ya estaba seleccionado', () => {
      component.onServiceToggle('service-1');
      component.onServiceToggle('service-1');

      expect(component.selectedServiceIds()).not.toContain('service-1');
    });

    it('debe permitir seleccionar múltiples servicios', () => {
      component.onServiceToggle('service-1');
      component.onServiceToggle('service-2');

      expect(component.selectedServiceIds()).toHaveLength(2);
      expect(component.selectedServiceIds()).toEqual(['service-1', 'service-2']);
    });

    it('debe limpiar la hora al cambiar servicios', () => {
      component.selectedTime.set('10:00');

      component.onServiceToggle('service-1');

      expect(component.selectedTime()).toBe('');
    });

    it('debe recargar slots si hay fecha seleccionada al toggle servicio', async () => {
      component.selectedDate.set('2026-04-10');

      await component.onServiceToggle('service-1');

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalled();
    });

    it('debe calcular duración total con servicios seleccionados', () => {
      component.onServiceToggle('service-1');
      component.onServiceToggle('service-2');

      expect(component.totalDuration()).toBe(90);
    });

    it('debe calcular precio total con servicios seleccionados', () => {
      component.onServiceToggle('service-1');
      component.onServiceToggle('service-2');

      expect(component.totalPrice()).toBe(75);
    });
  });

  describe('Selección de fecha y slots', () => {
    beforeEach(async () => {
      await component.ngOnInit();
      component.onServiceToggle('service-1');
    });

    it('debe cargar slots al seleccionar fecha', async () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);

      await component.handleDateSelect({ startStr: '2026-04-10T00:00:00' });

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith(
        mockCompany.id, mockEmployee.id, '2026-04-10', 30
      );
    });

    it('debe usar duración total de múltiples servicios para calcular slots', async () => {
      component.selectedServiceIds.set(['service-1', 'service-2']);
      component.selectedDate.set('2026-04-10');
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);

      await component.loadAvailableSlots();

      expect(appointmentServiceMock.getAvailableSlots).toHaveBeenCalledWith(
        mockCompany.id, mockEmployee.id, '2026-04-10', 90
      );
    });
  });

  describe('proceedToBooking', () => {
    beforeEach(async () => { await component.ngOnInit(); });

    it('no debe navegar si faltan datos', () => {
      component.company.set(null);
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

    it('debe navegar con serviceIds como string separado por comas', () => {
      component.company.set(mockCompany);
      component.employee.set(mockEmployee);
      component.selectedServiceIds.set(['service-1', 'service-2']);
      component.selectedDate.set('2026-04-10');
      component.selectedTime.set('10:30');

      component.proceedToBooking();

      expect(routerMock.navigate).toHaveBeenCalledWith(
        ['/c', mockCompany.slug, 'e', mockEmployee.id, 'book'],
        { queryParams: { date: '2026-04-10', time: '10:30', serviceIds: 'service-1,service-2' } }
      );
    });
  });

  describe('Pre-selección via query param serviceId', () => {
    it('debe pre-seleccionar servicio cuando serviceId es válido', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      (routeMock.snapshot.queryParamMap.get as jest.Mock).mockReturnValue('service-1');

      await component.ngOnInit();

      expect(component.selectedServiceIds()).toContain('service-1');
      expect(component.selectedServiceIds()).toHaveLength(1);
    });

    it('no debe pre-seleccionar cuando serviceId no existe', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      (routeMock.snapshot.queryParamMap.get as jest.Mock).mockReturnValue(null);

      await component.ngOnInit();

      expect(component.selectedServiceIds()).toHaveLength(0);
    });

    it('no debe pre-seleccionar cuando serviceId no pertenece al empleado', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      (routeMock.snapshot.queryParamMap.get as jest.Mock).mockReturnValue('service-inexistente');

      await component.ngOnInit();

      expect(component.selectedServiceIds()).toHaveLength(0);
    });

    it('no debe duplicar selección si ya estaba seleccionado', async () => {
      const routeMock = TestBed.inject(ActivatedRoute);
      (routeMock.snapshot.queryParamMap.get as jest.Mock).mockReturnValue('service-1');
      component.selectedServiceIds.set(['service-1']);

      await component.ngOnInit();

      expect(component.selectedServiceIds()).toHaveLength(1);
    });
  });
});
