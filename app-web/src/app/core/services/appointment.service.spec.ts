import { TestBed } from '@angular/core/testing';
import { AppointmentService } from './appointment.service';
import { ScheduleService } from './schedule.service';

let mockFromFn: jest.Mock;

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
    status: 'pending' as const
  };

  beforeEach(() => {
    mockFromFn = jest.fn();

    const mockSelect = {
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            neq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockAppointment, error: null })
            })
          }),
          single: jest.fn().mockResolvedValue({ data: [mockAppointment], error: null })
        })
      })
    };

    const mockInsert = {
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockAppointment, error: null })
        })
      })
    };

    const mockSupabase = {
      ...mockSelect,
      ...mockInsert,
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockAppointment, error: null })
          })
        })
      }),
      delete: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null })
      })
    };

    mockFromFn.mockReturnValue(mockSupabase);

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
    it('debe crear una cita con estado pending', async () => {
      const appointmentData = {
        company_id: 'company-1',
        employee_id: 'employee-1',
        service_id: 'service-1',
        client_name: 'Juan',
        client_phone: '12345678',
        appointment_date: '2026-03-20',
        appointment_time: '10:00'
      };

      const result = await service.create(appointmentData);

      expect(mockFromFn).toHaveBeenCalledWith('appointments');
      expect(result.status).toBe('pending');
    });

    it('debe llamar a insert con los datos correctos', async () => {
      const appointmentData = {
        company_id: 'company-1',
        employee_id: 'employee-1',
        service_id: 'service-1',
        client_name: 'Pedro',
        client_phone: '98765432',
        appointment_date: '2026-03-21',
        appointment_time: '14:00'
      };

      await service.create(appointmentData);

      const fromReturn = mockFromFn.mock.results[0].value;
      expect(fromReturn.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          ...appointmentData,
          status: 'pending'
        })
      );
    });
  });

  describe('getAvailableSlots', () => {
    it('debe llamar a scheduleService.getByCompany', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(scheduleServiceMock.getByCompany).toHaveBeenCalledWith('company-1');
    });

    it('debe retornar array vacío si no hay schedule para el día', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).toEqual([]);
    });

    it('debe calcular slots basados en duración del servicio', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '10:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots.length).toBe(2);
      expect(slots[0]).toBe('09:00');
      expect(slots[1]).toBe('09:30');
    });

    it('debe excluir slots con citas existentes', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([
        {
          id: 'apt-1',
          appointment_time: '09:00',
          appointment_date: '2026-03-20'
        } as any
      ]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '11:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).not.toContain('09:00');
      expect(slots).toContain('09:30');
      expect(slots).toContain('10:00');
    });

    it('debe calcular slots correctamente con duración de 60 minutos', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '12:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 60);

      expect(slots).toEqual(['09:00', '10:00', '11:00']);
    });

    it('debe calcular slots correctamente con duración de 15 minutos', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '10:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 15);

      expect(slots).toEqual(['09:00', '09:15', '09:30', '09:45']);
    });

    it('debe manejar horarios con minutos específicos', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '08:30:00', end_time: '10:30:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots[0]).toBe('08:30');
      expect(slots[slots.length - 1]).toBe('10:00');
    });

    it('debe excluir slots que se superponen con citas existentes', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([
        {
          id: 'apt-1',
          appointment_time: '09:30',
          appointment_date: '2026-03-20'
        } as any
      ]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '11:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).not.toContain('09:30');
      expect(slots).toContain('09:00');
      expect(slots).toContain('10:00');
    });

    it('debe manejar múltiples citas existentes', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([
        {
          id: 'apt-1',
          appointment_time: '09:00',
          appointment_date: '2026-03-20'
        } as any,
        {
          id: 'apt-2',
          appointment_time: '10:00',
          appointment_date: '2026-03-20'
        } as any
      ]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '12:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).not.toContain('09:00');
      expect(slots).not.toContain('10:00');
      expect(slots).toContain('09:30');
      expect(slots).toContain('10:30');
      expect(slots).toContain('11:00');
    });

    it('debe retornar array vacío si no hay schedule para ese día de la semana', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 0, start_time: '09:00:00', end_time: '18:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).toEqual([]);
    });

    it('debe retornar array vacío si el servicio no cabe en el horario disponible', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '10:00:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 90);

      expect(slots).toEqual([]);
    });

    it('debe incluir slot si el servicio cabe exactamente en el horario', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '10:30:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 90);

      expect(slots).toEqual(['09:00']);
    });

    it('debe retornar array vacío si el horario es muy corto para el servicio', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:00:00', end_time: '09:20:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 30);

      expect(slots).toEqual([]);
    });

    it('debe formatear horas correctamente con padding de ceros', async () => {
      jest.spyOn(service, 'getByEmployee').mockResolvedValueOnce([]);
      scheduleServiceMock.getByCompany.mockResolvedValueOnce([
        { day_of_week: 4, start_time: '09:05:00', end_time: '09:35:00' }
      ]);

      const slots = await service.getAvailableSlots('company-1', 'employee-1', '2026-03-20', 15);

      expect(slots[0]).toBe('09:05');
      expect(slots[1]).toBe('09:20');
    });
  });

  describe('getByEmployee', () => {
    it('debe obtener citas por empleado y fecha', async () => {
      await service.getByEmployee('employee-1', '2026-03-20');

      expect(mockFromFn).toHaveBeenCalledWith('appointments');
    });
  });

  describe('cancel', () => {
    it('debe actualizar estado a cancelled', async () => {
      await service.cancel('apt-1');

      const fromReturn = mockFromFn.mock.results[0].value;
      expect(fromReturn.update).toHaveBeenCalled();
    });
  });
});
