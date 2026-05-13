import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

let mockFromFn: jest.Mock;
let mockUploadFn: jest.Mock;
let mockGetPublicUrlFn: jest.Mock;
let mockRemoveFn: jest.Mock;

jest.mock('../supabase', () => ({
  supabase: {
    storage: {
      from: (...args: any[]) => mockFromFn(...args)
    }
  }
}));

describe('StorageService', () => {
  let service: StorageService;

  const mockFile = new File(['test content'], 'receipt.png', { type: 'image/png' });
  const mockJpgFile = new File(['test content'], 'receipt.jpg', { type: 'image/jpeg' });
  const mockLargeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.png', { type: 'image/png' });
  const mockGifFile = new File(['test content'], 'animated.gif', { type: 'image/gif' });
  const mockPdfFile = new File(['test content'], 'doc.pdf', { type: 'application/pdf' });

  beforeEach(() => {
    mockFromFn = jest.fn();
    mockUploadFn = jest.fn().mockResolvedValue({ error: null });
    mockGetPublicUrlFn = jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/storage/receipts/receipt.png' }
    });
    mockRemoveFn = jest.fn().mockResolvedValue({ error: null });

    mockFromFn.mockImplementation((bucket: string) => ({
      upload: mockUploadFn,
      getPublicUrl: mockGetPublicUrlFn,
      remove: mockRemoveFn
    }));

    TestBed.configureTestingModule({
      providers: [StorageService]
    });

    service = TestBed.inject(StorageService);
  });

  afterEach(() => { jest.clearAllMocks(); });

  describe('uploadReceipt', () => {
    it('debe subir una imagen PNG y retornar la URL pública', async () => {
      const url = await service.uploadReceipt(mockFile, 'company-1', 'apt-1', 'completion');

      expect(mockFromFn).toHaveBeenCalledWith('receipts');
      expect(mockUploadFn).toHaveBeenCalledWith(
        'receipts/company-1/apt-1_completion.png',
        mockFile,
        { upsert: true }
      );
      expect(url).toBe('https://example.com/storage/receipts/receipt.png');
    });

    it('debe subir una imagen JPG con la extensión correcta', async () => {
      const url = await service.uploadReceipt(mockJpgFile, 'company-1', 'apt-2', 'payment');

      expect(mockUploadFn).toHaveBeenCalledWith(
        'receipts/company-1/apt-2_payment.jpg',
        mockJpgFile,
        { upsert: true }
      );
    });

    it('debe usar el tipo correcto en el path para completion', async () => {
      await service.uploadReceipt(mockFile, 'company-1', 'apt-1', 'completion');

      expect(mockUploadFn).toHaveBeenCalledWith(
        expect.stringContaining('_completion.png'),
        expect.anything(),
        expect.anything()
      );
    });

    it('debe usar el tipo correcto en el path para payment', async () => {
      await service.uploadReceipt(mockFile, 'company-1', 'apt-1', 'payment');

      expect(mockUploadFn).toHaveBeenCalledWith(
        expect.stringContaining('_payment.png'),
        expect.anything(),
        expect.anything()
      );
    });

    it('debe lanzar error si el archivo no es PNG o JPG', async () => {
      await expect(
        service.uploadReceipt(mockGifFile, 'company-1', 'apt-1', 'completion')
      ).rejects.toThrow('Solo se permiten imágenes PNG o JPG');
    });

    it('debe lanzar error si el archivo es PDF', async () => {
      await expect(
        service.uploadReceipt(mockPdfFile, 'company-1', 'apt-1', 'completion')
      ).rejects.toThrow('Solo se permiten imágenes PNG o JPG');
    });

    it('debe lanzar error si el archivo supera 2MB', async () => {
      await expect(
        service.uploadReceipt(mockLargeFile, 'company-1', 'apt-1', 'completion')
      ).rejects.toThrow('La imagen no debe superar 2MB');
    });

    it('debe lanzar error si la subida a Supabase falla', async () => {
      mockUploadFn.mockResolvedValueOnce({ error: new Error('Storage error') });

      await expect(
        service.uploadReceipt(mockFile, 'company-1', 'apt-1', 'completion')
      ).rejects.toThrow('Error al subir el comprobante. Intente de nuevo.');
    });
  });

  describe('deleteReceipt', () => {
    it('debe eliminar el archivo del bucket receipts', async () => {
      await service.deleteReceipt('receipts/company-1/apt-1_completion.png');

      expect(mockFromFn).toHaveBeenCalledWith('receipts');
      expect(mockRemoveFn).toHaveBeenCalledWith([
        'receipts/company-1/apt-1_completion.png'
      ]);
    });

    it('debe propagar el error si la eliminación falla', async () => {
      mockRemoveFn.mockResolvedValueOnce({ error: new Error('Delete failed') });

      await expect(
        service.deleteReceipt('receipts/company-1/apt-1_completion.png')
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('getReceiptUrl', () => {
    it('debe construir la URL pública para un comprobante de completion', () => {
      const url = service.getReceiptUrl('company-1', 'apt-1', 'completion');

      expect(mockGetPublicUrlFn).toHaveBeenCalledWith(
        'receipts/company-1/apt-1_completion.jpg'
      );
      expect(url).toBe('https://example.com/storage/receipts/receipt.png');
    });

    it('debe construir la URL pública para un comprobante de payment', () => {
      const url = service.getReceiptUrl('company-1', 'apt-2', 'payment');

      expect(mockGetPublicUrlFn).toHaveBeenCalledWith(
        'receipts/company-1/apt-2_payment.jpg'
      );
    });
  });
});
