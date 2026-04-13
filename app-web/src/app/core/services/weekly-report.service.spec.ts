import { TestBed } from '@angular/core/testing';
import { WeeklyReportService } from './weekly-report.service';

let mockFromFn: jest.Mock;

jest.mock('../supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFromFn(...args)
  }
}));

function createChain(finalResult: { data: any; error: any }) {
  const resolvedPromise = Promise.resolve(finalResult);

  const chain: any = {};
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);
  chain.in = jest.fn().mockReturnValue(chain);
  chain.gte = jest.fn().mockReturnValue(chain);
  chain.lte = jest.fn().mockReturnValue(chain);
  chain.order = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue(finalResult);

  // Make the chain thenable so `await` works
  chain.then = resolvedPromise.then.bind(resolvedPromise);
  chain.catch = resolvedPromise.catch.bind(resolvedPromise);

  return chain;
}

describe('WeeklyReportService', () => {
  let service: WeeklyReportService;

  const mockEmployees = [
    { id: 'emp-1', full_name: 'Ana García', role: 'employee', company_id: 'company-1', is_active: true },
    { id: 'emp-2', full_name: 'Carlos López', role: 'manager', company_id: 'company-1', is_active: true }
  ];

  const mockAppointmentRows = [
    {
      id: 'apt-1',
      company_id: 'company-1',
      employee_id: 'emp-1',
      client_name: 'Juan Pérez',
      appointment_date: '2026-04-13',
      appointment_time: '10:00',
      status: 'completed',
      amount_collected: 150,
      services: [{ service: { id: 's1', name: 'Corte', price: 100, commission_percentage: 50, duration_minutes: 30, company_id: 'company-1', is_active: true, created_at: '2026-01-01' } }],
      employee: { full_name: 'Ana García' }
    },
    {
      id: 'apt-2',
      company_id: 'company-1',
      employee_id: 'emp-1',
      client_name: 'María Torres',
      appointment_date: '2026-04-14',
      appointment_time: '11:00',
      status: 'completed',
      amount_collected: 80,
      services: [{ service: { id: 's2', name: 'Peinado', price: 80, commission_percentage: 40, duration_minutes: 45, company_id: 'company-1', is_active: true, created_at: '2026-01-01' } }],
      employee: { full_name: 'Ana García' }
    },
    {
      id: 'apt-3',
      company_id: 'company-1',
      employee_id: 'emp-2',
      client_name: 'Pedro Ruiz',
      appointment_date: '2026-04-15',
      appointment_time: '09:00',
      status: 'completed',
      amount_collected: 200,
      services: [
        { service: { id: 's1', name: 'Corte', price: 100, commission_percentage: 50, duration_minutes: 30, company_id: 'company-1', is_active: true, created_at: '2026-01-01' } },
        { service: { id: 's3', name: 'Tinte', price: 100, commission_percentage: 30, duration_minutes: 60, company_id: 'company-1', is_active: true, created_at: '2026-01-01' } }
      ],
      employee: { full_name: 'Carlos López' }
    }
  ];

  beforeEach(() => {
    mockFromFn = jest.fn();
    TestBed.configureTestingModule({
      providers: [WeeklyReportService]
    });
    service = TestBed.inject(WeeklyReportService);
  });

  describe('getEmployees', () => {
    it('debe consultar profiles con company_id filtrando por roles activos', async () => {
      const chain = createChain({ data: mockEmployees, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getEmployees('company-1');

      expect(mockFromFn).toHaveBeenCalledWith('profiles');
      expect(result).toEqual(mockEmployees);
    });

    it('debe lanzar error si la consulta falla', async () => {
      const chain = createChain({ data: null, error: new Error('DB error') });
      mockFromFn.mockReturnValue(chain);

      await expect(service.getEmployees('company-1')).rejects.toThrow('DB error');
    });

    it('debe retornar array vacío si data es null', async () => {
      const chain = createChain({ data: null, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getEmployees('company-1');
      expect(result).toEqual([]);
    });
  });

  describe('getWeeklySummary', () => {
    it('debe consultar appointments con status completed en el rango de fechas', async () => {
      const chain = createChain({ data: mockAppointmentRows, error: null });
      mockFromFn.mockReturnValue(chain);

      const startDate = new Date(2026, 3, 13);
      const endDate = new Date(2026, 3, 19);
      const result = await service.getWeeklySummary('company-1', startDate, endDate);

      expect(mockFromFn).toHaveBeenCalledWith('appointments');
      expect(chain.eq).toHaveBeenCalledWith('company_id', 'company-1');
      expect(chain.eq).toHaveBeenCalledWith('status', 'completed');
    });

    it('debe filtrar por employee_id cuando se proporciona', async () => {
      const chain = createChain({ data: [mockAppointmentRows[0]], error: null });
      mockFromFn.mockReturnValue(chain);

      const startDate = new Date(2026, 3, 13);
      const endDate = new Date(2026, 3, 19);
      const result = await service.getWeeklySummary('company-1', startDate, endDate, 'emp-1');

      expect(chain.eq).toHaveBeenCalledWith('employee_id', 'emp-1');
    });

    it('debe agrupar citas por empleado y calcular totales', async () => {
      const chain = createChain({ data: mockAppointmentRows, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getWeeklySummary('company-1', new Date(2026, 3, 13), new Date(2026, 3, 19));

      expect(result).toHaveLength(2);

      const ana = result.find(r => r.employee_name === 'Ana García');
      expect(ana).toBeDefined();
      expect(ana!.total_appointments).toBe(2);
      expect(ana!.total_amount).toBe(230);

      const carlos = result.find(r => r.employee_name === 'Carlos López');
      expect(carlos).toBeDefined();
      expect(carlos!.total_appointments).toBe(1);
      expect(carlos!.total_amount).toBe(200);
    });

    it('debe calcular la comisión correctamente por empleado', async () => {
      const chain = createChain({ data: mockAppointmentRows, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getWeeklySummary('company-1', new Date(2026, 3, 13), new Date(2026, 3, 19));

      const ana = result.find(r => r.employee_name === 'Ana García');
      // apt-1: commission = 150 * (100/100) * (50/100) = 75
      // apt-2: commission = 80 * (80/80) * (40/100) = 32
      // Total: 107
      expect(ana!.total_commission).toBe(107);
    });

    it('debe ordenar resultados por nombre de empleado', async () => {
      const chain = createChain({ data: mockAppointmentRows, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getWeeklySummary('company-1', new Date(2026, 3, 13), new Date(2026, 3, 19));

      expect(result[0].employee_name).toBe('Ana García');
      expect(result[1].employee_name).toBe('Carlos López');
    });

    it('debe lanzar error si la consulta a Supabase falla', async () => {
      const chain = createChain({ data: null, error: new Error('DB error') });
      mockFromFn.mockReturnValue(chain);

      await expect(service.getWeeklySummary('company-1', new Date(), new Date())).rejects.toThrow('DB error');
    });
  });

  describe('getEmployeeDetail', () => {
    const mockDetailRows = [
      {
        id: 'apt-1',
        company_id: 'company-1',
        employee_id: 'emp-1',
        client_name: 'Juan Pérez',
        appointment_date: '2026-04-13',
        appointment_time: '10:00',
        status: 'completed',
        amount_collected: 150,
        services: [{ service: { id: 's1', name: 'Corte', price: 100, commission_percentage: 50, duration_minutes: 30, company_id: 'company-1', is_active: true, created_at: '2026-01-01' } }]
      },
      {
        id: 'apt-2',
        company_id: 'company-1',
        employee_id: 'emp-1',
        client_name: 'María Torres',
        appointment_date: '2026-04-14',
        appointment_time: '11:00',
        status: 'cancelled',
        amount_collected: 0,
        services: [{ service: { id: 's2', name: 'Peinado', price: 80, commission_percentage: 40, duration_minutes: 45, company_id: 'company-1', is_active: true, created_at: '2026-01-01' } }]
      }
    ];

    it('debe consultar appointments filtrando por companyId y employeeId', async () => {
      const chain = createChain({ data: mockDetailRows, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getEmployeeDetail('company-1', 'emp-1', new Date(2026, 3, 13), new Date(2026, 3, 19));

      expect(mockFromFn).toHaveBeenCalledWith('appointments');
      expect(chain.eq).toHaveBeenCalledWith('company_id', 'company-1');
      expect(chain.eq).toHaveBeenCalledWith('employee_id', 'emp-1');
    });

    it('debe incluir todos los estados de cita (no solo completed)', async () => {
      const chain = createChain({ data: mockDetailRows, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getEmployeeDetail('company-1', 'emp-1', new Date(2026, 3, 13), new Date(2026, 3, 19));

      expect(result).toHaveLength(2);
      expect(result.some(r => r.status === 'completed')).toBe(true);
      expect(result.some(r => r.status === 'cancelled')).toBe(true);
    });

    it('debe aplanar los servicios correctamente', async () => {
      const chain = createChain({ data: mockDetailRows, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getEmployeeDetail('company-1', 'emp-1', new Date(2026, 3, 13), new Date(2026, 3, 19));

      expect(result[0].services).toEqual([{ id: 's1', name: 'Corte', price: 100, commission_percentage: 50, duration_minutes: 30, company_id: 'company-1', is_active: true, created_at: '2026-01-01' }]);
    });

    it('debe calcular la comisión para cada cita en el detalle', async () => {
      const chain = createChain({ data: mockDetailRows, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getEmployeeDetail('company-1', 'emp-1', new Date(2026, 3, 13), new Date(2026, 3, 19));

      // apt-1: completed, amount=150, commission = 150 * (100/100) * (50/100) = 75
      expect(result[0].commission).toBe(75);
      // apt-2: cancelled, amount=0, commission = 0
      expect(result[1].commission).toBe(0);
    });
  });
});