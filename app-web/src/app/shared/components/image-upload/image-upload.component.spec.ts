import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadComponent } from './image-upload.component';

(global as any).ClipboardEvent = class ClipboardEvent extends Event {
  clipboardData: any;
  constructor(type: string, options?: any) {
    super(type);
    this.clipboardData = options?.clipboardData || null;
  }
};

(global as any).DragEvent = class DragEvent extends Event {
  dataTransfer: any;
  constructor(type: string, options?: any) {
    super(type);
    this.dataTransfer = options?.dataTransfer || null;
  }
};

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;

  const createPngFile = (name = 'receipt.png', size = 1024): File => {
    const content = 'x'.repeat(size);
    return new File([content], name, { type: 'image/png' });
  };

  const createJpgFile = (name = 'receipt.jpg', size = 1024): File => {
    const content = 'x'.repeat(size);
    return new File([content], name, { type: 'image/jpeg' });
  };

  const createGifFile = (): File => {
    return new File(['x'], 'animated.gif', { type: 'image/gif' });
  };

  const createPdfFile = (): File => {
    return new File(['x'], 'doc.pdf', { type: 'application/pdf' });
  };

  const createLargePngFile = (): File => {
    const content = 'x'.repeat(3 * 1024 * 1024);
    return new File([content], 'large.png', { type: 'image/png' });
  };

  beforeEach(async () => {
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();

    await TestBed.configureTestingModule({
      imports: [ImageUploadComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('selección de archivo por click', () => {
    it('debe emitir el archivo cuando se selecciona un PNG válido', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createPngFile();

      const input = fixture.nativeElement.querySelector('input[type="file"]');
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change'));

      expect(selectedSpy).toHaveBeenCalledWith(file);
      expect(component.selectedFile()).toBe(file);
      expect(component.fileName()).toBe('receipt.png');
    });

    it('debe emitir el archivo cuando se selecciona un JPG válido', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createJpgFile();

      const input = fixture.nativeElement.querySelector('input[type="file"]');
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change'));

      expect(selectedSpy).toHaveBeenCalledWith(file);
      expect(component.fileName()).toBe('receipt.jpg');
    });

    it('NO debe emitir archivo si el archivo es GIF', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createGifFile();

      const input = fixture.nativeElement.querySelector('input[type="file"]');
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change'));

      expect(selectedSpy).not.toHaveBeenCalled();
      expect(component.validationError()).toBe('Solo se permiten imágenes PNG o JPG');
    });

    it('NO debe emitir archivo si el archivo es PDF', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createPdfFile();

      const input = fixture.nativeElement.querySelector('input[type="file"]');
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change'));

      expect(selectedSpy).not.toHaveBeenCalled();
      expect(component.validationError()).toBe('Solo se permiten imágenes PNG o JPG');
    });

    it('NO debe emitir archivo si el archivo supera 2MB', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createLargePngFile();

      const input = fixture.nativeElement.querySelector('input[type="file"]');
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change'));

      expect(selectedSpy).not.toHaveBeenCalled();
      expect(component.validationError()).toBe('La imagen no debe superar 2MB');
    });
  });

  describe('drag and drop', () => {
    it('debe aceptar un PNG válido arrastrado', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createPngFile();

      const dropEvent = new DragEvent('drop');
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] }
      });

      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      uploadZone.dispatchEvent(dropEvent);

      expect(selectedSpy).toHaveBeenCalledWith(file);
      expect(component.selectedFile()).toBe(file);
    });

    it('debe rechazar un GIF arrastrado y mostrar error', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createGifFile();

      const dropEvent = new DragEvent('drop');
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] }
      });

      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      uploadZone.dispatchEvent(dropEvent);

      expect(selectedSpy).not.toHaveBeenCalled();
      expect(component.validationError()).toBe('Solo se permiten imágenes PNG o JPG');
    });

    it('NO debe procesar drop si uploading es true', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      fixture.componentRef.setInput('uploading', true);
      fixture.detectChanges();
      const file = createPngFile();

      const dropEvent = new DragEvent('drop');
      Object.defineProperty(dropEvent, 'dataTransfer', {
        value: { files: [file] }
      });

      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      uploadZone.dispatchEvent(dropEvent);

      expect(selectedSpy).not.toHaveBeenCalled();
    });
  });

  describe('clipboard paste', () => {
    it('debe aceptar una imagen pegada desde el portapapeles', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createPngFile();

      const clipboardData = {
        items: [{ type: 'image/png', getAsFile: () => file }]
      };
      const pasteEvent = new ClipboardEvent('paste', { clipboardData: clipboardData as any });

      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      uploadZone.dispatchEvent(pasteEvent);

      expect(selectedSpy).toHaveBeenCalledWith(file);
      expect(component.fileName()).toBe('Imagen pegada');
    });

    it('debe ignorar silenciosamente datos que no son imagen en el portapapeles', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');

      const clipboardData = {
        items: [{ type: 'text/plain', getAsFile: () => null }]
      };
      const pasteEvent = new ClipboardEvent('paste', { clipboardData: clipboardData as any });

      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      uploadZone.dispatchEvent(pasteEvent);

      expect(selectedSpy).not.toHaveBeenCalled();
      expect(component.validationError()).toBeNull();
    });

    it('debe rechazar una imagen GIF pegada y mostrar error', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createGifFile();

      const clipboardData = {
        items: [{ type: 'image/gif', getAsFile: () => file }]
      };
      const pasteEvent = new ClipboardEvent('paste', { clipboardData: clipboardData as any });

      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      uploadZone.dispatchEvent(pasteEvent);

      expect(selectedSpy).not.toHaveBeenCalled();
      expect(component.validationError()).toBe('Solo se permiten imágenes PNG o JPG');
    });

    it('debe rechazar una imagen mayor a 2MB pegada y mostrar error', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      const file = createLargePngFile();

      const clipboardData = {
        items: [{ type: 'image/png', getAsFile: () => file }]
      };
      const pasteEvent = new ClipboardEvent('paste', { clipboardData: clipboardData as any });

      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      uploadZone.dispatchEvent(pasteEvent);

      expect(selectedSpy).not.toHaveBeenCalled();
      expect(component.validationError()).toBe('La imagen no debe superar 2MB');
    });

    it('NO debe procesar paste si uploading es true', () => {
      const selectedSpy = jest.spyOn(component.imageSelected, 'emit');
      fixture.componentRef.setInput('uploading', true);
      fixture.detectChanges();
      const file = createPngFile();

      const clipboardData = {
        items: [{ type: 'image/png', getAsFile: () => file }]
      };
      const pasteEvent = new ClipboardEvent('paste', { clipboardData: clipboardData as any });

      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      uploadZone.dispatchEvent(pasteEvent);

      expect(selectedSpy).not.toHaveBeenCalled();
    });
  });

  describe('eliminar imagen', () => {
    it('debe emitir imageRemoved y limpiar el estado', () => {
      const removedSpy = jest.spyOn(component.imageRemoved, 'emit');

      component.selectedFile.set(createPngFile());
      component.previewUrl.set('blob:test');
      component.fileName.set('receipt.png');

      component.removeImage();

      expect(removedSpy).toHaveBeenCalled();
      expect(component.selectedFile()).toBeNull();
      expect(component.previewUrl()).toBeNull();
      expect(component.fileName()).toBe('');
      expect(component.validationError()).toBeNull();
    });
  });

  describe('estado visual', () => {
    it('debe mostrar la zona de upload cuando no hay imagen seleccionada', () => {
      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      expect(uploadZone).toBeTruthy();
    });

    it('debe mostrar preview cuando hay imagen seleccionada', () => {
      component.selectedFile.set(createPngFile());
      component.previewUrl.set('blob:test');
      component.fileName.set('receipt.png');
      component.fileSize.set('1.0 KB');
      fixture.detectChanges();

      const preview = fixture.nativeElement.querySelector('.image-preview');
      expect(preview).toBeTruthy();
      expect(preview.querySelector('img')).toBeTruthy();
    });

    it('debe mostrar indicador de progreso cuando uploading es true', () => {
      fixture.componentRef.setInput('uploading', true);
      fixture.detectChanges();

      const progressBar = fixture.nativeElement.querySelector('p-progressbar');
      expect(progressBar).toBeTruthy();
    });

    it('debe mostrar error de validación cuando existe', () => {
      component.validationError.set('Solo se permiten imágenes PNG o JPG');
      fixture.detectChanges();

      const errorMsg = fixture.nativeElement.querySelector('.error-message');
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.textContent).toContain('Solo se permiten imágenes PNG o JPG');
    });

    it('debe agregar clase disabled a la zona cuando uploading es true', () => {
      fixture.componentRef.setInput('uploading', true);
      fixture.detectChanges();

      const uploadZone = fixture.nativeElement.querySelector('.upload-zone');
      expect(uploadZone.classList.contains('upload-zone--disabled')).toBe(true);
    });
  });

  describe('formato de tamaño de archivo', () => {
    it('debe formatear bytes correctamente para archivos pequeños', () => {
      const file = createPngFile('small.png', 500);

      const input = fixture.nativeElement.querySelector('input[type="file"]');
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change'));

      expect(component.fileSize()).toContain('500 B');
    });

    it('debe formatear bytes correctamente para archivos en KB', () => {
      const file = createPngFile('medium.png', 50 * 1024);

      const input = fixture.nativeElement.querySelector('input[type="file"]');
      Object.defineProperty(input, 'files', { value: [file] });
      input.dispatchEvent(new Event('change'));

      expect(component.fileSize()).toContain('50.0 KB');
    });
  });
});
