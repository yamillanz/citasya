import { TestBed } from '@angular/core/testing';
import { ServiceService } from './service.service';

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
  chain.order = jest.fn().mockReturnValue(chain);
  chain.insert = jest.fn().mockReturnValue(chain);
  chain.delete = jest.fn().mockReturnValue(chain);
  chain.single = jest.fn().mockResolvedValue(finalResult);

  chain.then = resolvedPromise.then.bind(resolvedPromise);
  chain.catch = resolvedPromise.catch.bind(resolvedPromise);

  return chain;
}

describe('ServiceService', () => {
  let service: ServiceService;

  const mockServices = [
    { id: 'srv-1', name: 'Corte', duration_minutes: 30, company_id: 'company-1', is_active: true },
    { id: 'srv-2', name: 'Tinte', duration_minutes: 60, company_id: 'company-1', is_active: true }
  ];

  const mockEmployeeServices = [
    { employee_id: 'emp-1', service: { id: 'srv-1', name: 'Corte', duration_minutes: 30, company_id: 'company-1', is_active: true } },
    { employee_id: 'emp-1', service: { id: 'srv-2', name: 'Tinte', duration_minutes: 60, company_id: 'company-1', is_active: true } }
  ];

  beforeEach(() => {
    mockFromFn = jest.fn();
    TestBed.configureTestingModule({
      providers: [ServiceService]
    });
    service = TestBed.inject(ServiceService);
  });

  describe('syncEmployeeServices', () => {
    it('should delete existing and insert new service assignments', async () => {
      const deleteChain = createChain({ data: null, error: null });
      const insertChain = createChain({ data: null, error: null });
      mockFromFn
        .mockReturnValueOnce(deleteChain)
        .mockReturnValueOnce(insertChain);

      await service.syncEmployeeServices('emp-1', ['srv-1', 'srv-2']);

      expect(mockFromFn).toHaveBeenCalledWith('employee_services');
      expect(mockFromFn).toHaveBeenCalledTimes(2);
      expect(deleteChain.delete).toHaveBeenCalled();
      expect(deleteChain.eq).toHaveBeenCalledWith('employee_id', 'emp-1');
      expect(insertChain.insert).toHaveBeenCalledWith([
        { employee_id: 'emp-1', service_id: 'srv-1' },
        { employee_id: 'emp-1', service_id: 'srv-2' }
      ]);
    });

    it('should skip insert when serviceIds is empty', async () => {
      const deleteChain = createChain({ data: null, error: null });
      mockFromFn.mockReturnValueOnce(deleteChain);

      await service.syncEmployeeServices('emp-1', []);

      expect(mockFromFn).toHaveBeenCalledTimes(1);
      expect(mockFromFn).toHaveBeenCalledWith('employee_services');
      expect(deleteChain.delete).toHaveBeenCalled();
    });

    it('should throw when delete fails', async () => {
      const deleteChain = createChain({ data: null, error: new Error('Delete failed') });
      mockFromFn.mockReturnValueOnce(deleteChain);

      await expect(service.syncEmployeeServices('emp-1', ['srv-1'])).rejects.toThrow('Delete failed');
    });

    it('should throw when insert fails', async () => {
      const deleteChain = createChain({ data: null, error: null });
      const insertChain = createChain({ data: null, error: new Error('Insert failed') });
      mockFromFn
        .mockReturnValueOnce(deleteChain)
        .mockReturnValueOnce(insertChain);

      await expect(service.syncEmployeeServices('emp-1', ['srv-1'])).rejects.toThrow('Insert failed');
    });
  });

  describe('getByEmployee', () => {
    it('should fetch services for an employee', async () => {
      const chain = createChain({ data: mockEmployeeServices, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getByEmployee('emp-1');

      expect(mockFromFn).toHaveBeenCalledWith('employee_services');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('srv-1');
      expect(result[1].id).toBe('srv-2');
    });

    it('should filter out inactive services', async () => {
      const dataWithInactive = [
        { employee_id: 'emp-1', service: { id: 'srv-1', name: 'Corte', duration_minutes: 30, company_id: 'company-1', is_active: true } },
        { employee_id: 'emp-1', service: { id: 'srv-2', name: 'Tinte', duration_minutes: 60, company_id: 'company-1', is_active: false } }
      ];
      const chain = createChain({ data: dataWithInactive, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getByEmployee('emp-1');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('srv-1');
    });
  });

  describe('getByCompany', () => {
    it('should fetch active services for a company', async () => {
      const chain = createChain({ data: mockServices, error: null });
      mockFromFn.mockReturnValue(chain);

      const result = await service.getByCompany('company-1');

      expect(mockFromFn).toHaveBeenCalledWith('services');
      expect(chain.eq).toHaveBeenCalledWith('company_id', 'company-1');
      expect(chain.eq).toHaveBeenCalledWith('is_active', true);
      expect(result).toEqual(mockServices);
    });
  });
});