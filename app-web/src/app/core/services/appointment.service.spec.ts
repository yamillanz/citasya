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
        { day_of_week: 5, start_time: '09:00:00', end_time: '11:00:00' }
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
        { day_of_week: 5, start_time: '09:00:00', end_time: '12:00:00' }
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
        { day_of_week: 5, start_time: '09:00:00', end_time: '10:00:00' }
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

  describe('markAsPaid', () => {
    it('debe actualizar la cita con campos de pago', async () => {
      await service.markAsPaid('apt-1', {
        payment_method: 'cash',
        payment_reference: 'ref-001',
        payment_amount_bs: 500
      });

      expect(mockFromFn).toHaveBeenCalledWith('appointments');
      expect(appointmentsUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          is_paid: true,
          payment_method: 'cash',
          payment_reference: 'ref-001',
          payment_amount_bs: 500
        })
      );
    });

    it('debe omitir campos opcionales si no se proveen', async () => {
      await service.markAsPaid('apt-1', {
        payment_method: 'transfer'
      });

      expect(appointmentsUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          is_paid: true,
          payment_method: 'transfer'
        })
      );
      const callArgs = appointmentsUpdateMock.mock.calls[0][0];
      expect(callArgs.payment_reference).toBeUndefined();
      expect(callArgs.payment_amount_bs).toBeUndefined();
    });

    it('debe incluir payment_date automáticamente', async () => {
      await service.markAsPaid('apt-1', {
        payment_method: 'mobile_payment'
      });

      expect(appointmentsUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_date: expect.any(String)
        })
      );
    });

    it('debe propager el error si supabase falla', async () => {
      appointmentsUpdateMock.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValue({ error: new Error('DB error') })
      });

      await expect(
        service.markAsPaid('apt-1', { payment_method: 'card' })
      ).rejects.toThrow('DB error');
    });

    it('debe incluir payment_receipt_url cuando se provee', async () => {
      await service.markAsPaid('apt-1', {
        payment_method: 'transfer',
        payment_receipt_url: 'https://example.com/receipts/payment.png'
      });

      expect(appointmentsUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          is_paid: true,
          payment_method: 'transfer',
          payment_receipt_url: 'https://example.com/receipts/payment.png'
        })
      );
    });

    it('debe omitir payment_receipt_url si no se provee', async () => {
      await service.markAsPaid('apt-1', {
        payment_method: 'cash'
      });

      const callArgs = appointmentsUpdateMock.mock.calls[0][0];
      expect(callArgs.payment_receipt_url).toBeUndefined();
    });
  });

  describe('updateStatus', () => {
    it('debe incluir receipt_url cuando se provee al completar', async () => {
      await service.updateStatus(
        'apt-1',
        'completed',
        50,
        6.5,
        325,
        'Cliente frecuente',
        'https://example.com/receipts/completion.png'
      );

      expect(appointmentsUpdateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          amount_collected: 50,
          exchange_rate: 6.5,
          amount_in_bs: 325,
          observations: 'Cliente frecuente',
          receipt_url: 'https://example.com/receipts/completion.png'
        })
      );
    });

    it('debe omitir receipt_url si no se provee', async () => {
      await service.updateStatus('apt-1', 'completed', 50, 6.5, 325, 'Sin comprobante');

      const callArgs = appointmentsUpdateMock.mock.calls[0][0];
      expect(callArgs.receipt_url).toBeUndefined();
    });

    it('debe incluir receipt_url incluso sin observaciones', async () => {
      await service.updateStatus(
        'apt-1',
        'completed',
        50,
        6.5,
        325,
        undefined,
        'https://example.com/receipts/completion.png'
      );

      const callArgs = appointmentsUpdateMock.mock.calls[0][0];
      expect(callArgs.receipt_url).toBe('https://example.com/receipts/completion.png');
      expect(callArgs.observations).toBeUndefined();
    });
  });

  describe('getByCompanyPaginated', () => {
    const mockPaginatedAppointments = [
      { ...mockAppointment, id: 'apt-1', client_name: 'Juan Pérez' },
      { ...mockAppointment, id: 'apt-2', client_name: 'María López', status: 'completed' as const },
      { ...mockAppointment, id: 'apt-3', client_name: 'Carlos Ruiz' },
      { ...mockAppointment, id: 'apt-4', client_name: 'Ana Martínez', status: 'cancelled' as const },
      { ...mockAppointment, id: 'apt-5', client_name: 'Pedro Díaz' },
      { ...mockAppointment, id: 'apt-6', client_name: 'Laura Sánchez', status: 'completed' as const },
      { ...mockAppointment, id: 'apt-7', client_name: 'Diego Torres' },
      { ...mockAppointment, id: 'apt-8', client_name: 'Sofía Herrera', status: 'no_show' as const },
      { ...mockAppointment, id: 'apt-9', client_name: 'Andrés Vega' },
      { ...mockAppointment, id: 'apt-10', client_name: 'Elena Rojas' },
      { ...mockAppointment, id: 'apt-11', client_name: 'Miguel Ángel' },
      { ...mockAppointment, id: 'apt-12', client_name: 'Valentina Cruz' },
    ];

    const paginatedQueryResult = { data: null as any, error: null as any, count: 0 };
    let paginatedRangeMock: jest.Mock;
    let paginatedEqCalls: string[][];
    let paginatedIlikeCalls: string[][];

    beforeEach(() => {
      paginatedEqCalls = [];
      paginatedIlikeCalls = [];

      paginatedRangeMock = jest.fn().mockResolvedValue(paginatedQueryResult);
      const paginatedOrderTimeMock = jest.fn().mockReturnValue({ range: paginatedRangeMock });
      const orderDateMock = jest.fn().mockReturnValue({ order: paginatedOrderTimeMock });

      const chainMethods = {
        eq: jest.fn().mockImplementation(function (this: any, field: string, value: string) {
          paginatedEqCalls.push([field, value]);
          return this;
        }),
        neq: jest.fn().mockImplementation(function (this: any) {
          return this;
        }),
        ilike: jest.fn().mockImplementation(function (this: any, field: string, value: string) {
          paginatedIlikeCalls.push([field, value]);
          return this;
        }),
      };

      mockFromFn.mockImplementation((table: string) => {
        if (table === 'appointments') {
          return {
            select: jest.fn().mockReturnValue(
              Object.assign({ order: orderDateMock, range: paginatedRangeMock }, chainMethods)
            )
          };
        }
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
    });

    it('debe usar range con los offsets correctos y count exact para la primera página', async () => {
      paginatedQueryResult.data = mockPaginatedAppointments.slice(0, 10);
      paginatedQueryResult.count = 12;
      paginatedQueryResult.error = null;

      const result = await service.getByCompanyPaginated({
        companyId: 'company-1',
        page: 0,
        pageSize: 10
      });

      expect(paginatedRangeMock).toHaveBeenCalledWith(0, 9);
      expect(result.data).toHaveLength(10);
      expect(result.totalCount).toBe(12);
      expect(result.hasMore).toBe(true);
    });

    it('debe retornar hasMore false cuando es la última página', async () => {
      paginatedQueryResult.data = mockPaginatedAppointments.slice(10, 12);
      paginatedQueryResult.count = 12;
      paginatedQueryResult.error = null;

      const result = await service.getByCompanyPaginated({
        companyId: 'company-1',
        page: 1,
        pageSize: 10
      });

      expect(paginatedRangeMock).toHaveBeenCalledWith(10, 19);
      expect(result.data).toHaveLength(2);
      expect(result.totalCount).toBe(12);
      expect(result.hasMore).toBe(false);
    });

    it('debe aplicar filtro de estado cuando se provee', async () => {
      paginatedQueryResult.data = mockPaginatedAppointments.filter(a => a.status === 'pending');
      paginatedQueryResult.count = 6;
      paginatedQueryResult.error = null;

      await service.getByCompanyPaginated({
        companyId: 'company-1',
        page: 0,
        pageSize: 10,
        status: 'pending'
      });

      expect(paginatedEqCalls.some((call: string[]) => call[0] === 'status' && call[1] === 'pending')).toBe(true);
    });

    it('NO debe aplicar filtro de estado cuando es all', async () => {
      paginatedQueryResult.data = mockPaginatedAppointments;
      paginatedQueryResult.count = 12;
      paginatedQueryResult.error = null;

      await service.getByCompanyPaginated({
        companyId: 'company-1',
        page: 0,
        pageSize: 10,
        status: 'all'
      });

      expect(paginatedEqCalls.some((call: string[]) => call[0] === 'status')).toBe(false);
    });

    it('debe aplicar filtro de empleado cuando se provee', async () => {
      paginatedQueryResult.data = [mockPaginatedAppointments[0]];
      paginatedQueryResult.count = 1;
      paginatedQueryResult.error = null;

      await service.getByCompanyPaginated({
        companyId: 'company-1',
        page: 0,
        pageSize: 10,
        employeeId: 'emp-1'
      });

      expect(paginatedEqCalls.some((call: string[]) => call[0] === 'employee_id' && call[1] === 'emp-1')).toBe(true);
    });

    it('debe aplicar filtro de fecha cuando se provee', async () => {
      paginatedQueryResult.data = [mockPaginatedAppointments[0]];
      paginatedQueryResult.count = 1;
      paginatedQueryResult.error = null;

      await service.getByCompanyPaginated({
        companyId: 'company-1',
        page: 0,
        pageSize: 10,
        date: '2026-03-20'
      });

      expect(paginatedEqCalls.some((call: string[]) => call[0] === 'appointment_date' && call[1] === '2026-03-20')).toBe(true);
    });

    it('debe aplicar búsqueda con ilike cuando se provee search', async () => {
      paginatedQueryResult.data = [mockPaginatedAppointments[0]];
      paginatedQueryResult.count = 1;
      paginatedQueryResult.error = null;

      await service.getByCompanyPaginated({
        companyId: 'company-1',
        page: 0,
        pageSize: 10,
        search: 'Juan'
      });

      expect(paginatedIlikeCalls.some((call: string[]) => call[0] === 'client_name' && call[1] === '%Juan%')).toBe(true);
    });

    it('debe propagar el error si Supabase falla', async () => {
      paginatedQueryResult.data = null;
      paginatedQueryResult.count = null;
      paginatedQueryResult.error = new Error('DB error');

      await expect(
        service.getByCompanyPaginated({
          companyId: 'company-1',
          page: 0,
          pageSize: 10
        })
      ).rejects.toThrow('DB error');
    });

    it('debe retornar hasMore false y totalCount 0 cuando no hay resultados', async () => {
      paginatedQueryResult.data = [];
      paginatedQueryResult.count = 0;
      paginatedQueryResult.error = null;

      const result = await service.getByCompanyPaginated({
        companyId: 'company-1',
        page: 0,
        pageSize: 10,
        search: 'zzz_no_existe'
      });

      expect(result.data).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.hasMore).toBe(false);
    });
  });
});
