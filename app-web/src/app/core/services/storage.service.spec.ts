import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

let mockFromFn: jest.Mock;
let mockUploadFn: jest.Mock;
let mockCreateSignedUrlFn: jest.Mock;
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
    mockCreateSignedUrlFn = jest.fn().mockResolvedValue({
      data: { signedUrl: 'https://example.com/storage/receipts/receipt.png?token=abc123' },
      error: null
    });
    mockRemoveFn = jest.fn().mockResolvedValue({ error: null });

    mockFromFn.mockImplementation((bucket: string) => ({
      upload: mockUploadFn,
      createSignedUrl: mockCreateSignedUrlFn,
      remove: mockRemoveFn
    }));

    TestBed.configureTestingModule({
      providers: [StorageService]
    });

    service = TestBed.inject(StorageService);
  });

  afterEach(() => { jest.clearAllMocks(); });

  describe('uploadReceipt', () => {
    it('debe subir una imagen PNG y retornar la URL firmada', async () => {
      const url = await service.uploadReceipt(mockFile, 'company-1', 'apt-1', 'completion');

      expect(mockFromFn).toHaveBeenCalledWith('receipts');
      expect(mockUploadFn).toHaveBeenCalledWith(
        'company-1/apt-1_completion.png',
        mockFile,
        { upsert: true }
      );
      expect(mockCreateSignedUrlFn).toHaveBeenCalledWith(
        'company-1/apt-1_completion.png',
        3600
      );
      expect(url).toBe('https://example.com/storage/receipts/receipt.png?token=abc123');
    });

    it('debe subir una imagen JPG con la extensión correcta', async () => {
      const url = await service.uploadReceipt(mockJpgFile, 'company-1', 'apt-2', 'payment');

      expect(mockUploadFn).toHaveBeenCalledWith(
        'company-1/apt-2_payment.jpg',
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

    it('debe lanzar error si la generación de URL firmada falla', async () => {
      mockCreateSignedUrlFn.mockResolvedValueOnce({
        data: null,
        error: new Error('Signed URL error')
      });

      await expect(
        service.uploadReceipt(mockFile, 'company-1', 'apt-1', 'completion')
      ).rejects.toThrow('Error al generar la URL del comprobante.');
    });
  });

  describe('deleteReceipt', () => {
    it('debe eliminar el archivo del bucket receipts', async () => {
      await service.deleteReceipt('company-1/apt-1_completion.png');

      expect(mockFromFn).toHaveBeenCalledWith('receipts');
      expect(mockRemoveFn).toHaveBeenCalledWith([
        'company-1/apt-1_completion.png'
      ]);
    });

    it('debe propagar el error si la eliminación falla', async () => {
      mockRemoveFn.mockResolvedValueOnce({ error: new Error('Delete failed') });

      await expect(
        service.deleteReceipt('company-1/apt-1_completion.png')
      ).rejects.toThrow('Delete failed');
    });
  });

  describe('getReceiptUrl', () => {
    it('debe retornar la URL firmada para un comprobante de completion', async () => {
      const url = await service.getReceiptUrl('company-1', 'apt-1', 'completion');

      expect(mockCreateSignedUrlFn).toHaveBeenCalledWith(
        'company-1/apt-1_completion.jpg',
        3600
      );
      expect(url).toBe('https://example.com/storage/receipts/receipt.png?token=abc123');
    });

    it('debe retornar la URL firmada para un comprobante de payment', async () => {
      const url = await service.getReceiptUrl('company-1', 'apt-2', 'payment');

      expect(mockCreateSignedUrlFn).toHaveBeenCalledWith(
        'company-1/apt-2_payment.jpg',
        3600
      );
    });
  });
});
