import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { EmployeeCalendarComponent } from './employee-calendar.component';
import { AuthService } from '../../../../core/services/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { CompanyService } from '../../../../core/services/company.service';
import { ConfirmationService, MessageService } from 'primeng/api';

describe('EmployeeCalendarComponent', () => {
  let component: EmployeeCalendarComponent;
  let fixture: ComponentFixture<EmployeeCalendarComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let appointmentServiceMock: jest.Mocked<AppointmentService>;
  let companyServiceMock: jest.Mocked<CompanyService>;
  let messageServiceMock: jest.Mocked<MessageService>;

  const mockUser = {
    id: 'employee-1',
    email: 'employee@test.com',
    full_name: 'Juan Empleado',
    role: 'employee' as const,
    company_id: 'company-1',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockCompany = {
    id: 'company-1',
    name: 'Peluquería Juan',
    slug: 'peluqueria-juan',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const mockAppointments = [
    {
      id: 'apt-1',
      company_id: 'company-1',
      employee_id: 'employee-1',
      service_id: 'srv-1',
      client_name: 'Juan Cliente',
      client_phone: '555-111-1111',
      appointment_date: '2026-04-03',
      appointment_time: '10:00',
      status: 'completed',
      service: { name: 'Corte de cabello' }
    },
    {
      id: 'apt-2',
      company_id: 'company-1',
      employee_id: 'employee-1',
      service_id: 'srv-2',
      client_name: 'María Pérez',
      client_phone: '555-222-2222',
      appointment_date: '2026-04-03',
      appointment_time: '11:00',
      status: 'pending',
      service: { name: 'Tinte' }
    }
  ];

  let clipboardWriteTextMock: jest.Mock;

  beforeEach(async () => {
    clipboardWriteTextMock = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: clipboardWriteTextMock },
      writable: true
    });

    authServiceMock = {
      getCurrentUser: jest.fn().mockResolvedValue(mockUser)
    } as any;

    appointmentServiceMock = {
      getByEmployeeAll: jest.fn().mockResolvedValue(mockAppointments)
    } as any;

    companyServiceMock = {
      getById: jest.fn().mockResolvedValue(mockCompany),
      getBySlug: jest.fn().mockResolvedValue(mockCompany)
    } as any;

    messageServiceMock = {
      add: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [EmployeeCalendarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: AppointmentService, useValue: appointmentServiceMock },
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: MessageService, useValue: messageServiceMock },
        ConfirmationService,
        provideNoopAnimations()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeCalendarComponent);
    component = fixture.componentInstance;
  });

  describe('Inicialización', () => {
    it('debe crear el componente', () => {
      expect(component).toBeTruthy();
    });

    it('debe inicializar loading en true', () => {
      expect(component.loading()).toBe(true);
    });

    it('debe inicializar error como string vacío', () => {
      expect(component.error()).toBe('');
    });

    it('debe inicializar copying en false', () => {
      expect(component.copying()).toBe(false);
    });

    it('debe cargar el usuario y las citas en ngOnInit', async () => {
      await component.ngOnInit();

      expect(component.user()).toEqual(mockUser);
      expect(component.appointments()).toEqual(mockAppointments);
      expect(component.loading()).toBe(false);
    });

    it('debe establecer error si no hay usuario', async () => {
      authServiceMock.getCurrentUser = jest.fn().mockResolvedValue(null);

      await component.ngOnInit();

      expect(component.error()).toBe('No se pudo obtener la información del usuario');
      expect(component.loading()).toBe(false);
    });

    it('debe establecer error si falla la carga de citas', async () => {
      appointmentServiceMock.getByEmployeeAll = jest.fn().mockRejectedValue(new Error('Network error'));

      await component.ngOnInit();

      expect(component.error()).toBe('Error al cargar las citas');
      expect(component.loading()).toBe(false);
    });
  });

  describe('copyBookingLink', () => {
    beforeEach(() => {
      component.user.set(mockUser);
    });

    it('debe mostrar error si el usuario no tiene company_id', async () => {
      component.user.set({ ...mockUser, company_id: undefined as any });

      await component.copyBookingLink();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo obtener la información de la empresa'
      });
      expect(companyServiceMock.getById).not.toHaveBeenCalled();
    });

    it('debe copiar el link al portapapeles correctamente', async () => {
      await component.copyBookingLink();

      const expectedUrl = `${window.location.origin}/c/${mockCompany.slug}/e/${mockUser.id}`;
      expect(clipboardWriteTextMock).toHaveBeenCalledWith(expectedUrl);
      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Link copiado',
        detail: 'El cliente podrá ver tu calendario y seleccionar servicio, fecha y hora',
        life: 5000
      });
    });

    it('debe obtener la empresa antes de generar el link', async () => {
      await component.copyBookingLink();

      expect(companyServiceMock.getById).toHaveBeenCalledWith(mockUser.company_id);
    });

    it('debe mostrar error si la empresa no tiene slug', async () => {
      companyServiceMock.getById = jest.fn().mockResolvedValue({ ...mockCompany, slug: undefined as any });

      await component.copyBookingLink();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo copiar el link. Por favor intenta de nuevo.'
      });
    });

    it('debe mostrar error si falla la obtención de la empresa', async () => {
      companyServiceMock.getById = jest.fn().mockRejectedValue(new Error('Company not found'));

      await component.copyBookingLink();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo copiar el link. Por favor intenta de nuevo.'
      });
    });

    it('debe mostrar error si falla el clipboard', async () => {
      clipboardWriteTextMock.mockRejectedValue(new Error('Clipboard error'));

      await component.copyBookingLink();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo copiar el link. Por favor intenta de nuevo.'
      });
    });

    it('debe establecer copying en true durante la operación', async () => {
      let resolveClipboard: () => void;
      clipboardWriteTextMock.mockReturnValue(new Promise<void>((resolve) => {
        resolveClipboard = resolve;
      }));

      const copyPromise = component.copyBookingLink();

      expect(component.copying()).toBe(true);

      resolveClipboard!();
      await copyPromise;

      expect(component.copying()).toBe(false);
    });

    it('debe restablecer copying a false incluso si hay error', async () => {
      clipboardWriteTextMock.mockRejectedValue(new Error('Clipboard error'));

      await component.copyBookingLink();

      expect(component.copying()).toBe(false);
    });
  });

  describe('onAppointmentClick', () => {
    it('debe establecer la cita seleccionada', () => {
      const appointment = mockAppointments[0];

      component.onAppointmentClick(appointment);

      expect(component.selectedAppointment()).toEqual(appointment);
    });

    it('debe mostrar el diálogo de detalles', () => {
      const appointment = mockAppointments[0];

      component.onAppointmentClick(appointment);

      expect(component.showDetailsDialog()).toBe(true);
    });
  });

  describe('getStatusLabel', () => {
    it('debe retornar etiqueta correcta para completed', () => {
      expect(component.getStatusLabel('completed')).toBe('Completada');
    });

    it('debe retornar etiqueta correcta para pending', () => {
      expect(component.getStatusLabel('pending')).toBe('Pendiente');
    });

    it('debe retornar etiqueta correcta para cancelled', () => {
      expect(component.getStatusLabel('cancelled')).toBe('Cancelada');
    });

    it('debe retornar etiqueta correcta para no_show', () => {
      expect(component.getStatusLabel('no_show')).toBe('No asistió');
    });

    it('debe retornar el status original si no tiene etiqueta', () => {
      expect(component.getStatusLabel('unknown')).toBe('unknown');
    });
  });

  describe('getStatusSeverity', () => {
    it('debe retornar success para completed', () => {
      expect(component.getStatusSeverity('completed')).toBe('success');
    });

    it('debe retornar warn para pending', () => {
      expect(component.getStatusSeverity('pending')).toBe('warn');
    });

    it('debe retornar danger para cancelled', () => {
      expect(component.getStatusSeverity('cancelled')).toBe('danger');
    });

    it('debe retornar secondary para no_show', () => {
      expect(component.getStatusSeverity('no_show')).toBe('secondary');
    });

    it('debe retornar info para status desconocido', () => {
      expect(component.getStatusSeverity('unknown')).toBe('info');
    });
  });

  describe('formatDate', () => {
    it('debe formatear la fecha en español', () => {
      const result = component.formatDate('2026-04-03');

      expect(result).toContain('abril');
      expect(result).toContain('2026');
    });
  });

  describe('formatTime', () => {
    it('debe formatear hora correctamente', () => {
      expect(component.formatTime('10:00')).toBe('10:00');
    });

    it('debe formatear hora con minutos', () => {
      expect(component.formatTime('14:30')).toBe('14:30');
    });
  });

  describe('loadAppointments', () => {
    it('debe cargar citas del empleado', async () => {
      component.user.set(mockUser);

      await component.loadAppointments();

      expect(appointmentServiceMock.getByEmployeeAll).toHaveBeenCalledWith(mockUser.id);
      expect(component.appointments()).toEqual(mockAppointments);
    });

    it('debe establecer error si falla la carga', async () => {
      component.user.set(mockUser);
      appointmentServiceMock.getByEmployeeAll = jest.fn().mockRejectedValue(new Error('Network error'));

      await component.loadAppointments();

      expect(component.error()).toBe('Error al cargar las citas');
    });

    it('no debe hacer nada si no hay usuario', async () => {
      component.user.set(null);

      await component.loadAppointments();

      expect(appointmentServiceMock.getByEmployeeAll).not.toHaveBeenCalled();
    });
  });

  describe('closeDetailsDialog', () => {
    it('debe cerrar el diálogo y limpiar la cita seleccionada', () => {
      component.showDetailsDialog.set(true);
      component.selectedAppointment.set(mockAppointments[0]);

      component.closeDetailsDialog();

      expect(component.showDetailsDialog()).toBe(false);
      expect(component.selectedAppointment()).toBeNull();
    });
  });

  describe('handleCancelAppointment', () => {
    let confirmationService: ConfirmationService;

    beforeEach(() => {
      confirmationService = TestBed.inject(ConfirmationService);
      component.user.set(mockUser);
      component.selectedAppointment.set(mockAppointments[1]);
      appointmentServiceMock.cancel = jest.fn().mockResolvedValue(undefined);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('no debe hacer nada si no hay cita seleccionada', async () => {
      component.selectedAppointment.set(null);

      await component.handleCancelAppointment();

      expect(appointmentServiceMock.cancel).not.toHaveBeenCalled();
    });

    it('debe mostrar diálogo de confirmación con el mensaje correcto', () => {
      const spy = jest.spyOn(confirmationService, 'confirm').mockImplementation(() => {});

      component.handleCancelAppointment();

      expect(spy).toHaveBeenCalledWith(expect.objectContaining({
        message: '¿Cancelar esta cita?',
        header: 'Confirmar cancelación',
        acceptLabel: 'Sí, cancelar',
        rejectLabel: 'No',
        acceptButtonStyleClass: 'p-button-danger'
      }));
    });

    it('no debe cancelar si el usuario rechaza la confirmación', async () => {
      jest.spyOn(confirmationService, 'confirm').mockImplementation((options: any) => {
        options.reject();
      });

      await component.handleCancelAppointment();

      expect(appointmentServiceMock.cancel).not.toHaveBeenCalled();
    });

    it('debe llamar a appointmentService.cancel con el ID correcto al confirmar', async () => {
      jest.spyOn(confirmationService, 'confirm').mockImplementation((options: any) => {
        options.accept();
      });

      await component.handleCancelAppointment();

      expect(appointmentServiceMock.cancel).toHaveBeenCalledWith('apt-2');
    });

    it('debe mostrar toast de éxito tras cancelar', async () => {
      jest.spyOn(confirmationService, 'confirm').mockImplementation((options: any) => {
        options.accept();
      });

      await component.handleCancelAppointment();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cita cancelada correctamente'
      });
    });

    it('debe recargar las citas y cerrar el diálogo tras cancelar exitosamente', async () => {
      jest.spyOn(confirmationService, 'confirm').mockImplementation((options: any) => {
        options.accept();
      });
      appointmentServiceMock.getByEmployeeAll.mockClear();

      await component.handleCancelAppointment();

      expect(appointmentServiceMock.getByEmployeeAll).toHaveBeenCalledWith(mockUser.id);
      expect(component.showDetailsDialog()).toBe(false);
      expect(component.selectedAppointment()).toBeNull();
    });

    it('debe mostrar toast de error si falla la cancelación', async () => {
      jest.spyOn(confirmationService, 'confirm').mockImplementation((options: any) => {
        options.accept();
      });
      appointmentServiceMock.cancel = jest.fn().mockRejectedValue(new Error('No autorizado'));

      await component.handleCancelAppointment();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No autorizado'
      });
    });

    it('debe usar mensaje genérico si el error no tiene message', async () => {
      jest.spyOn(confirmationService, 'confirm').mockImplementation((options: any) => {
        options.accept();
      });
      appointmentServiceMock.cancel = jest.fn().mockRejectedValue({});

      await component.handleCancelAppointment();

      expect(messageServiceMock.add).toHaveBeenCalledWith({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cancelar la cita'
      });
    });

    it('no debe cerrar el diálogo si falla la cancelación', async () => {
      jest.spyOn(confirmationService, 'confirm').mockImplementation((options: any) => {
        options.accept();
      });
      appointmentServiceMock.cancel = jest.fn().mockRejectedValue(new Error('Falló'));
      component.showDetailsDialog.set(true);

      await component.handleCancelAppointment();

      expect(component.showDetailsDialog()).toBe(true);
    });
  });

  describe('cancellingAppointment', () => {
    let confirmationService: ConfirmationService;

    beforeEach(() => {
      confirmationService = TestBed.inject(ConfirmationService);
      component.user.set(mockUser);
      component.selectedAppointment.set(mockAppointments[1]);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('debe iniciar en false', () => {
      expect(component.cancellingAppointment()).toBe(false);
    });

    it('debe estar en true durante la cancelación y false tras éxito', async () => {
      jest.spyOn(confirmationService, 'confirm').mockImplementation((options: any) => {
        options.accept();
      });
      let resolveCancel: () => void;
      appointmentServiceMock.cancel = jest.fn().mockReturnValue(new Promise<void>(resolve => {
        resolveCancel = resolve;
      }));

      const promise = component.handleCancelAppointment();

      await Promise.resolve();

      expect(component.cancellingAppointment()).toBe(true);

      resolveCancel!();
      await promise;

      expect(component.cancellingAppointment()).toBe(false);
    });

    it('debe restablecer a false incluso si hay error', async () => {
      jest.spyOn(confirmationService, 'confirm').mockImplementation((options: any) => {
        options.accept();
      });
      appointmentServiceMock.cancel = jest.fn().mockRejectedValue(new Error('Error'));

      await component.handleCancelAppointment();

      expect(component.cancellingAppointment()).toBe(false);
    });
  });

  describe('calendarAppointments', () => {
    it('debe retornar las citas del empleado tipadas para el calendario', () => {
      component.appointments.set(mockAppointments);

      expect(component.calendarAppointments).toEqual(mockAppointments);
    });
  });

  describe('refreshData', () => {
    it('debe recargar las citas del empleado', async () => {
      component.user.set(mockUser);
      appointmentServiceMock.getByEmployeeAll.mockClear();

      await component.refreshData();

      expect(appointmentServiceMock.getByEmployeeAll).toHaveBeenCalledWith(mockUser.id);
    });
  });
});