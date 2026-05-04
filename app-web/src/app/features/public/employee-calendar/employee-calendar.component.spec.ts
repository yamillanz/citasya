import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeCalendarComponent } from './employee-calendar.component';
import { CompanyService } from '../../../core/services/company.service';
import { UserService } from '../../../core/services/user.service';
import { ServiceService } from '../../../core/services/service.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Appointment } from '../../../core/models/appointment.model';

describe('EmployeeCalendarComponent (Public)', () => {
  let component: EmployeeCalendarComponent;
  let fixture: ComponentFixture<EmployeeCalendarComponent>;
  let companyServiceMock: jest.Mocked<CompanyService>;
  let userServiceMock: jest.Mocked<UserService>;
  let serviceServiceMock: jest.Mocked<ServiceService>;
  let appointmentServiceMock: jest.Mocked<AppointmentService>;
  let authServiceMock: jest.Mocked<AuthService>;
  let routerMock: jest.Mocked<Router>;
  let confirmationService: ConfirmationService;
  let messageService: MessageService;

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

  const mockPendingAppointments: Appointment[] = [
    {
      id: 'apt-1', company_id: 'company-1', employee_id: 'employee-1',
      service_id: 'service-1', client_name: 'María García', client_phone: '555-0101',
      client_email: 'maria@test.com', appointment_date: '2026-05-10',
      appointment_time: '10:00:00', status: 'pending', notes: 'Prefiere pelo corto',
      created_at: '2026-05-01T00:00:00Z', updated_at: '2026-05-01T00:00:00Z'
    },
    {
      id: 'apt-2', company_id: 'company-1', employee_id: 'employee-1',
      service_id: 'service-2', client_name: 'Carlos López', client_phone: '555-0202',
      appointment_date: '2026-05-12', appointment_time: '14:30:00',
      status: 'pending', created_at: '2026-05-02T00:00:00Z', updated_at: '2026-05-02T00:00:00Z'
    },
    {
      id: 'apt-3', company_id: 'company-1', employee_id: 'employee-1',
      service_id: 'service-1', client_name: 'Ana Ruiz', client_phone: '555-0303',
      appointment_date: '2026-05-15', appointment_time: '09:00:00',
      status: 'completed', amount_collected: 25,
      created_at: '2026-04-28T00:00:00Z', updated_at: '2026-04-28T00:00:00Z'
    }
  ];

  beforeEach(async () => {
    companyServiceMock = { getBySlug: jest.fn().mockResolvedValue(mockCompany) } as any;
    userServiceMock = { getById: jest.fn().mockResolvedValue(mockEmployee) } as any;
    serviceServiceMock = { getByEmployee: jest.fn().mockResolvedValue(mockServices) } as any;
    appointmentServiceMock = { getAvailableSlots: jest.fn().mockResolvedValue(['09:00', '09:30', '10:00']), getByEmployeeAll: jest.fn().mockResolvedValue([]) } as any;
    authServiceMock = { getCurrentUser: jest.fn().mockResolvedValue(null) } as any;
    routerMock = { navigate: jest.fn().mockReturnValue(Promise.resolve(true)), createUrlTree: jest.fn().mockReturnValue({}), serializeUrl: jest.fn().mockReturnValue(''), events: of(null) } as any;

    await TestBed.configureTestingModule({
      imports: [EmployeeCalendarComponent],
      providers: [
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: ServiceService, useValue: serviceServiceMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: (k: string) => k === 'companySlug' ? 'peluqueria-juan' : k === 'employeeId' ? 'employee-1' : null }, queryParamMap: { get: jest.fn().mockReturnValue(null) } } } },
        { provide: Router, useValue: routerMock },
        ConfirmationService,
        MessageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeCalendarComponent);
    component = fixture.componentInstance;
    confirmationService = TestBed.inject(ConfirmationService);
    messageService = TestBed.inject(MessageService);
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

  describe('Carga de citas pendientes', () => {
    it('debe llamar getByEmployeeAll al inicializar', async () => {
      await component.ngOnInit();

      expect(appointmentServiceMock.getByEmployeeAll).toHaveBeenCalledWith('employee-1');
    });

    it('debe filtrar solo citas con status pending', async () => {
      appointmentServiceMock.getByEmployeeAll = jest.fn().mockResolvedValue(mockPendingAppointments);

      await component.ngOnInit();

      expect(component.pendingAppointments()).toHaveLength(2);
      expect(component.pendingAppointments().every(a => a.status === 'pending')).toBe(true);
      expect(component.pendingAppointments().find(a => a.id === 'apt-3')).toBeUndefined();
    });

    it('debe llamar authService.getCurrentUser al inicializar', async () => {
      await component.ngOnInit();

      expect(authServiceMock.getCurrentUser).toHaveBeenCalled();
    });
  });

  describe('canCancel (control de acceso)', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('debe ser false cuando no hay usuario autenticado', () => {
      component.currentUser.set(null);

      expect(component.canCancel()).toBe(false);
    });

    it('debe ser true cuando el usuario autenticado es el empleado', () => {
      component.currentUser.set({
        id: 'employee-1', email: 'emp@test.com', full_name: 'Juan Empleado',
        role: 'employee', company_id: 'company-1', is_active: true,
        created_at: '', updated_at: ''
      });

      expect(component.canCancel()).toBe(true);
    });

    it('debe ser true cuando el usuario es manager de la misma empresa', () => {
      component.currentUser.set({
        id: 'manager-1', email: 'manager@test.com', full_name: 'Manager Uno',
        role: 'manager', company_id: 'company-1', is_active: true,
        created_at: '', updated_at: ''
      });

      expect(component.canCancel()).toBe(true);
    });

    it('debe ser false cuando el usuario es manager de otra empresa', () => {
      component.currentUser.set({
        id: 'manager-2', email: 'other@test.com', full_name: 'Other Manager',
        role: 'manager', company_id: 'company-99', is_active: true,
        created_at: '', updated_at: ''
      });

      expect(component.canCancel()).toBe(false);
    });

    it('debe ser false cuando el usuario es un empleado diferente', () => {
      component.currentUser.set({
        id: 'employee-99', email: 'other-emp@test.com', full_name: 'Other Employee',
        role: 'employee', company_id: 'company-1', is_active: true,
        created_at: '', updated_at: ''
      });

      expect(component.canCancel()).toBe(false);
    });
  });

  describe('buildEvents', () => {
    beforeEach(async () => {
      appointmentServiceMock.getByEmployeeAll = jest.fn().mockResolvedValue(mockPendingAppointments);
      await component.ngOnInit();
    });

    it('debe mapear citas pendientes a EventInput con id, title, start', () => {
      const events = component.buildEvents();

      expect(events).toHaveLength(2);

      const firstEvent = events.find(e => e.id === 'apt-1')!;
      expect(firstEvent.title).toBe('10:00 - María García');
      expect(firstEvent.start).toBe('2026-05-10T10:00:00');

      const secondEvent = events.find(e => e.id === 'apt-2')!;
      expect(secondEvent.title).toBe('14:30 - Carlos López');
      expect(secondEvent.start).toBe('2026-05-12T14:30:00');
    });

    it('debe usar color amarillo (#F4D03F) para citas pendientes', () => {
      const events = component.buildEvents();

      events.forEach(event => {
        expect(event.backgroundColor).toBe('#F4D03F');
        expect(event.borderColor).toBe('#F4D03F');
      });
    });

    it('debe incluir datos del cliente en extendedProps', () => {
      const events = component.buildEvents();
      const event = events.find(e => e.id === 'apt-1')!;

      expect(event.extendedProps).toEqual({
        clientName: 'María García',
        clientPhone: '555-0101',
        clientEmail: 'maria@test.com',
        status: 'pending',
        amount: undefined
      });
    });
  });

  describe('handleEventClick', () => {
    beforeEach(async () => {
      appointmentServiceMock.getByEmployeeAll = jest.fn().mockResolvedValue(mockPendingAppointments);
      await component.ngOnInit();
    });

    it('debe abrir el diálogo con la cita correcta al hacer clic en un evento', () => {
      const spy = jest.spyOn(component.dialogVisible, 'set');

      component.handleEventClick({ event: { id: 'apt-1' } });

      expect(component.selectedAppointment()).toEqual(
        expect.objectContaining({ id: 'apt-1', client_name: 'María García' })
      );
      expect(spy).toHaveBeenCalledWith(true);
    });

    it('no debe abrir el diálogo si el id del evento no coincide con ninguna cita', () => {
      const spy = jest.spyOn(component.dialogVisible, 'set');

      component.handleEventClick({ event: { id: 'non-existent' } });

      expect(component.selectedAppointment()).toBeNull();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('closeDialog', () => {
    it('debe cerrar el diálogo y limpiar la cita seleccionada', () => {
      component.dialogVisible.set(true);
      component.selectedAppointment.set(mockPendingAppointments[0]);

      component.closeDialog();

      expect(component.dialogVisible()).toBe(false);
      expect(component.selectedAppointment()).toBeNull();
    });
  });

  describe('handleCancelAppointment', () => {
    let confirmSpy: jest.SpyInstance;
    let messageSpy: jest.SpyInstance;

    beforeEach(async () => {
      appointmentServiceMock.getByEmployeeAll = jest.fn().mockResolvedValue(mockPendingAppointments);
      appointmentServiceMock.cancel = jest.fn().mockResolvedValue(undefined);
      await component.ngOnInit();

      confirmSpy = jest.spyOn(confirmationService, 'confirm');
      messageSpy = jest.spyOn(messageService, 'add');
    });

    it('no debe hacer nada si no hay cita seleccionada', async () => {
      component.selectedAppointment.set(null);

      await component.handleCancelAppointment();

      expect(confirmSpy).not.toHaveBeenCalled();
      expect(appointmentServiceMock.cancel).not.toHaveBeenCalled();
    });

    it('debe mostrar diálogo de confirmación con los parámetros correctos', async () => {
      component.selectedAppointment.set(mockPendingAppointments[0]);
      confirmSpy.mockImplementation((config: any) => {
        config.reject();
      });

      await component.handleCancelAppointment();

      expect(confirmSpy).toHaveBeenCalledTimes(1);
      const confirmArgs = confirmSpy.mock.calls[0][0];
      expect(confirmArgs.message).toBe('¿Cancelar esta cita?');
      expect(confirmArgs.header).toBe('Confirmar cancelación');
      expect(confirmArgs.acceptLabel).toBe('Sí, cancelar');
      expect(confirmArgs.rejectLabel).toBe('No');
      expect(confirmArgs.acceptButtonStyleClass).toBe('p-button-danger');
    });

    it('no debe cancelar la cita si el usuario rechaza la confirmación', async () => {
      component.selectedAppointment.set(mockPendingAppointments[0]);
      confirmSpy.mockImplementation((config: any) => {
        config.reject();
      });

      await component.handleCancelAppointment();

      expect(appointmentServiceMock.cancel).not.toHaveBeenCalled();
    });

    it('debe llamar appointmentService.cancel si el usuario confirma', async () => {
      component.selectedAppointment.set(mockPendingAppointments[0]);
      confirmSpy.mockImplementation((config: any) => {
        config.accept();
      });

      await component.handleCancelAppointment();

      expect(appointmentServiceMock.cancel).toHaveBeenCalledWith('apt-1');
    });

    it('debe mostrar toast de éxito y cerrar el diálogo tras cancelar exitosamente', async () => {
      component.selectedAppointment.set(mockPendingAppointments[0]);
      component.dialogVisible.set(true);
      confirmSpy.mockImplementation((config: any) => {
        config.accept();
      });

      await component.handleCancelAppointment();

      expect(messageSpy).toHaveBeenCalledWith({
        severity: 'success', summary: 'Éxito', detail: 'Cita cancelada correctamente'
      });
      expect(appointmentServiceMock.getByEmployeeAll).toHaveBeenCalled();
      expect(component.dialogVisible()).toBe(false);
      expect(component.selectedAppointment()).toBeNull();
    });

    it('debe mostrar toast de error si falla la cancelación', async () => {
      component.selectedAppointment.set(mockPendingAppointments[0]);
      confirmSpy.mockImplementation((config: any) => {
        config.accept();
      });
      appointmentServiceMock.cancel = jest.fn().mockRejectedValue(new Error('Error de red'));
      jest.spyOn(console, 'error').mockImplementation(() => {});

      await component.handleCancelAppointment();

      expect(messageSpy).toHaveBeenCalledWith({
        severity: 'error', summary: 'Error', detail: 'Error de red'
      });
    });

    it('debe dejar cancellingAppointment en false al terminar la operación', async () => {
      component.selectedAppointment.set(mockPendingAppointments[0]);
      confirmSpy.mockImplementation((config: any) => {
        config.accept();
      });

      expect(component.cancellingAppointment()).toBe(false);
      await component.handleCancelAppointment();
      expect(component.cancellingAppointment()).toBe(false);
      expect(appointmentServiceMock.cancel).toHaveBeenCalled();
    });
  });
});
