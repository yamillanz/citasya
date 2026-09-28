import { parseDateOnly } from './appointment.model';

describe('parseDateOnly', () => {
  it('debe interpretar YYYY-MM-DD como fecha local, sin corrimiento de zona', () => {
    const d = parseDateOnly('2026-09-30');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8); // septiembre = índice 8
    expect(d.getDate()).toBe(30);
  });

  it('debe mostrar la fecha elegida al formatear en es-ES', () => {
    const formatted = parseDateOnly('2026-09-30').toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
    expect(formatted).toContain('30');
  });

  it('debe ser tolerante a entradas incompletas', () => {
    const d = parseDateOnly('2026-09');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(8);
    expect(d.getDate()).toBe(1);
  });
});
