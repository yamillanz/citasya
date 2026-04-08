import { TestBed } from '@angular/core/testing';
import { AppointmentService } from './appointment.service';
import { ScheduleService } from './schedule.service';

let mockFromFn: jest.Mock;
let appointmentsInsertMock: jest.Mock;
let appointmentServicesInsertMock: jest.Mock;
let appointmentsUpdateMock: jest.Mock;
let servicesSelectInMock: jest.Mock;

jest.mock('../supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFromFn(...args)
  }
}));

describe('AppointmentService', () => {
  let service: AppointmentService;
  let scheduleServiceMock: jest.Mocked<ScheduleService>;

  const mockAppointment = {
    id: 'apt-1',
    company_id: 'company-1',
    employee_id: 'employee-1',
    service_id: 'service-1',
    client_name: 'Juan Pérez',
    client_phone: '12345678',
    appointment_date: '2026-03-20',
    appointment_time: '10:00',
    status: 'pending' as const,
    services: [{ id: 'service-1', name: 'Corte', duration_minutes: 30, price: 25 }]
  };

  const mockServices = [
    { id: 'service-1', name: 'Corte', duration_minutes: 30, price: 25 },
    { id: 'service-2', name: 'Tinte', duration_minutes: 60, price: 50 }
  ];

  beforeEach(() => {
    mockFromFn = jest.fn();
    appointmentsInsertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockAppointment, error: null })
      })
    });
    appointmentServicesInsertMock = jest.fn().mockResolvedValue({ error: null });
    appointmentsUpdateMock = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockAppointment, error: null })
        })
      })
    });
    servicesSelectInMock = jest.fn().mockResolvedValue({ data: mockServices, error: null });

    mockFromFn.mockImplementation((table: string) => {
      if (table === 'services') {
        return { select: jest.fn().mockReturnValue({ in: servicesSelectInMock }) };
      }
      if (table === 'appointment_services') {
        return {
          insert: appointmentServicesInsertMock,
          delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              neq: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({ data: mockAppointment, error: null })
              })
            }),
            single: jest.fn().mockResolvedValue({ data: mockAppointment, error: null }),
            order: jest.fn().mockReturnValue({
              order: jest.fn().mockResolvedValue({ data: [mockAppointment], error: null })
            })
          }),
          in: servicesSelectInMock
        }),
        insert: appointmentsInsertMock,
        update: appointmentsUpdateMock,
        delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) })
      };
    });

    scheduleServiceMock = {
      getByCompany: jest.fn().mockResolvedValue([
        { day_of_week: 5, start_time: '09:00:00', end_time: '18:00:00' }
      ])
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AppointmentService,
        { provide: ScheduleService, useValue: scheduleServiceMock }
      ]
    });

    service = TestBed.inject(AppointmentService);
  });

  describe('create', () => {
    it('debe insertar en la tabla appointments con estado pending', async () => {
      await service.create({
        company_id: 'company-1',
        employee_id: 'employee-1',
        service_ids: ['service-1'],
        client_name: 'Juan',
        client_phone: '12345678',
        appointment_date: '2026-03-20',
        appointment_time: '10:00'
      });

      expect(mockFromFn).toHaveBeenCalledWith('appointments');
      expect(appointmentsInsertMock).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'pending', service_id: 'service-1' })
      );
    });

    it('debe insertar registros en appointment_services por cada servicio', async () => {
      await service.create({
        company_id: 'company-1',
        employee_id: 'employee-1',
        service_ids: ['service-1', 'service-2'],
        client_name: 'Ana',
        client_phone: '1112223334',
        appointment_date: '2026-03-22',
        appointment_time: '10:00'
      });

      expect(mockFromFn).toHaveBeenCalledWith('appointment_services');
      expect(appointmentServicesInsertMock).toHaveBeenCalledWith([
        { appointment_id: 'apt-1', service_id: 'service-1' },
        { appointment_id: 'apt-1', service_id: 'service-2' }
      ]);
    });

    it('debe lanzar error si service_ids está vacío', async () => {
      await expect(
        service.create({
          company_id: 'company-1',
          employee_id: 'employee-1',
          service_ids: [],
          client_name: 'Juan',
          client_phone: '12345678',
          appointment_date: '2026-03-20',
          appointment_time: '10:00'
        })
      ).rejects.toThrow('At least one service is required');
    });
  });

  describe('getAvailableSlots', () => {
    it('debe consultar el schedule de la empresa', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(scheduleServiceMock.getByCompany).toHaveBeenCalledWith('company-1');
    });

    it('debe retornar vacío si no hay schedule para el día', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).toEqual([]);
    });

    it('debe excluir slots ocupados por citas existentes', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([
        { id: 'apt-1', appointment_time: '09:00', appointment_date: '2026-03-20',
          services: [{ id: 's1', name: 'Corte', duration_minutes: 30, price: 25 }] } as any
      ]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '11:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).not.toContain('09:00');
      expect(slots).toContain('09:30');
    });

    it('debe excluir slots que se superponen por duración del servicio', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([
        { id: 'apt-1', appointment_time: '09:30', appointment_date: '2026-03-20',
          services: [{ id: 's1', name: 'Tinte', duration_minutes: 60, price: 50 }] } as any
      ]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '12:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).not.toContain('09:30');
      expect(slots).not.toContain('10:00');
      expect(slots).toContain('09:00');
      expect(slots).toContain('10:30');
    });

    it('debe retornar vacío si no hay schedule para ese día de la semana', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 0, start_time: '09:00:00', end_time: '18:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).toEqual([]);
    });

    it('debe retornar vacío si el servicio no cabe en el horario', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '10:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 90);

      expect(slots).toEqual([]);
    });
  });

  describe('getByEmployee', () => {
    it('debe consultar appointments con el employee_id y fecha', async () => {
      await service.getByEmployee('emp-1', '2026-03-20');

      expect(mockFromFn).toHaveBeenCalledWith('appointments');
    });
  });

  describe('cancel', () => {
    it('debe llamar a update en la tabla appointments', async () => {
      await service.cancel('apt-1');

      expect(mockFromFn).toHaveBeenCalledWith('appointments');
      expect(appointmentsUpdateMock).toHaveBeenCalled();
    });
  });

  describe('updateServices', () => {
    it('debe lanzar error si service_ids está vacío', async () => {
      await expect(service.updateServices('apt-1', [])).rejects.toThrow('At least one service is required');
    });
  });
});
