import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';

let mockFromFn: jest.Mock;
let mockSelectFn: jest.Mock;
let mockUpdateFn: jest.Mock;
let mockEqFn: jest.Mock;
let mockSingleFn: jest.Mock;

jest.mock('../supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFromFn(...args),
    functions: {
      invoke: jest.fn().mockResolvedValue({ data: { id: 'new-user' }, error: null })
    }
  }
}));

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    mockSingleFn = jest.fn().mockResolvedValue({ data: { id: 'user-1', not_available: true }, error: null });
    mockEqFn = jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingleFn }) });
    mockUpdateFn = jest.fn().mockReturnValue({ eq: mockEqFn });
    mockSelectFn = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockResolvedValue({ data: [], error: null })
        }),
        order: jest.fn().mockResolvedValue({ data: [], error: null })
      }),
      order: jest.fn().mockResolvedValue({ data: [], error: null })
    });
    mockFromFn = jest.fn().mockReturnValue({
      select: mockSelectFn,
      update: mockUpdateFn,
      insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingleFn }) }),
      delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) })
    });

    TestBed.configureTestingModule({
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
  });

  describe('toggleNotAvailable', () => {
    it('debe actualizar not_available a true', async () => {
      await service.toggleNotAvailable('user-1', true);

      expect(mockFromFn).toHaveBeenCalledWith('profiles');
      expect(mockUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({ not_available: true })
      );
      expect(mockEqFn).toHaveBeenCalledWith('id', 'user-1');
    });

    it('debe actualizar not_available a false', async () => {
      mockSingleFn.mockResolvedValueOnce({ data: { id: 'user-1', not_available: false }, error: null });

      await service.toggleNotAvailable('user-1', false);

      expect(mockUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({ not_available: false })
      );
    });

    it('debe propagar error si supabase falla', async () => {
      mockSingleFn.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.toggleNotAvailable('user-1', true)).rejects.toThrow('DB error');
    });
  });

  describe('update', () => {
    it('debe poder actualizar not_available via update general', async () => {
      await service.update('user-1', { not_available: true });

      expect(mockFromFn).toHaveBeenCalledWith('profiles');
      expect(mockUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({ not_available: true })
      );
    });
  });
});
