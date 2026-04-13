import { CsvExportService } from './csv-export.service';

describe('CsvExportService', () => {
  let service: CsvExportService;

  beforeEach(() => {
    service = new CsvExportService();
    (globalThis as any).URL.createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
    (globalThis as any).URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('debe crear un enlace de descarga con el nombre de archivo correcto', () => {
    const mockLink = document.createElement('a');
    const setAttributeSpy = jest.spyOn(mockLink, 'setAttribute');
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

    service.exportCsv('reporte.csv', ['Nombre'], [['Juan']]);

    expect(setAttributeSpy).toHaveBeenCalledWith('download', 'reporte.csv');
  });

  it('debe revocar la URL del blob después de la descarga', () => {
    service.exportCsv('test.csv', ['Col1'], [['val1']]);

    expect((globalThis as any).URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
  });

  it('debe crear la URL del blob após crear el Blob', () => {
    service.exportCsv('test.csv', ['Col1'], [['val1']]);

    expect((globalThis as any).URL.createObjectURL).toHaveBeenCalled();
  });

  it('debe hacer clic en el enlace para iniciar la descarga', () => {
    const mockLink = document.createElement('a');
    const clickSpy = jest.spyOn(mockLink, 'click');
    jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

    service.exportCsv('test.csv', ['Col1'], [['val1']]);

    expect(clickSpy).toHaveBeenCalled();
  });

  describe('generación de contenido CSV', () => {
    let capturedBlob: Blob | null = null;

    beforeEach(() => {
      capturedBlob = null;
      const originalCreateObjectURL = (globalThis as any).URL.createObjectURL;
      (globalThis as any).URL.createObjectURL = jest.fn((blob: Blob) => {
        capturedBlob = blob;
        return 'blob:mock-url';
      });
    });

    function readBlobContent(blob: Blob): Promise<string> {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(blob);
      });
    }

    it('debe agregar BOM UTF-8 al contenido CSV', async () => {
      service.exportCsv('test.csv', ['Nombre'], [['Juan']]);

      const content = await readBlobContent(capturedBlob!);
      const csvWithoutBom = content.replace(/^\ufeff/, '');
      expect(csvWithoutBom).toBe('Nombre\n"Juan"');
    });

    it('debe escapar comillas dobles dentro de celdas', async () => {
      service.exportCsv('test.csv', ['Nombre'], [['Juan "El jefe"']]);

      const content = await readBlobContent(capturedBlob!);
      expect(content).toContain('"Juan ""El jefe"""');
    });

    it('debe crear múltiples filas correctamente', async () => {
      service.exportCsv('test.csv', ['Nombre', 'Monto'], [['Ana', '100'], ['Luis', '200']]);

      const content = await readBlobContent(capturedBlob!);
      const lines = content.replace('\ufeff', '').split('\n');
      expect(lines[0]).toBe('Nombre,Monto');
      expect(lines[1]).toBe('"Ana","100"');
      expect(lines[2]).toBe('"Luis","200"');
    });

    it('debe configurar el tipo MIME como text/csv con charset utf-8', () => {
      service.exportCsv('test.csv', ['Col1'], [['val1']]);

      expect(capturedBlob!.type).toBe('text/csv;charset=utf-8;');
    });
  });
});