import { TestBed } from '@angular/core/testing';
import { AppointmentService } from './appointment.service';
import { ScheduleService } from './schedule.service';
import { SupabaseClient } from '@supabase/supabase-js';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let mockSupabase: {
    from: jest.Mock;
  };
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

    mockSupabase = {
      from: jest.fn().mockReturnValue({
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
      })
    };

    scheduleServiceMock = {
      getByCompany: jest.fn().mockResolvedValue([
        { day_of_week: 5, start_time: '09:00:00', end_time: '18:00:00' }
      ])
    } as any;

    TestBed.configureTestingModule({
      providers: [
        AppointmentService,
        { provide: SupabaseClient, useValue: mockSupabase },
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

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
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

      const fromMock = mockSupabase.from as jest.Mock;
      const fromReturn = fromMock.mock.results[0].value;
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
  });

  describe('getByEmployee', () => {
    it('debe obtener citas por empleado y fecha', async () => {
      await service.getByEmployee('employee-1', '2026-03-20');

      expect(mockSupabase.from).toHaveBeenCalledWith('appointments');
    });
  });

  describe('cancel', () => {
    it('debe actualizar estado a cancelled', async () => {
      await service.cancel('apt-1');

      const fromMock = mockSupabase.from as jest.Mock;
      const fromReturn = fromMock.mock.results[0].value;
      expect(fromReturn.update).toHaveBeenCalled();
    });
  });
});
