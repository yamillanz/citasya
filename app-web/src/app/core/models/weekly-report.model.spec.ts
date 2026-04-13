import {
  calculateAppointmentCommission,
  getStartOfWeek,
  getEndOfWeek,
  formatDate,
  getStatusLabel,
  getStatusSeverity
} from './weekly-report.model';
import { Service } from './service.model';

describe('weekly-report.model', () => {
  const mockServices: Service[] = [
    { id: 's1', company_id: 'c1', name: 'Corte', duration_minutes: 30, price: 100, commission_percentage: 50, is_active: true, created_at: '2026-01-01' },
    { id: 's2', company_id: 'c1', name: 'Peinado', duration_minutes: 45, price: 80, commission_percentage: 40, is_active: true, created_at: '2026-01-01' }
  ];

  describe('calculateAppointmentCommission', () => {
    it('debe calcular comisión ponderada cuando hay múltiples servicios', () => {
      const amount = 180;
      const commission = calculateAppointmentCommission(amount, mockServices);

      // Corte: 100/180 * 180 * 0.5 = 50
      // Peinado: 80/180 * 180 * 0.4 = 32
      // Total: 82
      expect(commission).toBe(82);
    });

    it('debe calcular comisión para un solo servicio', () => {
      const singleService: Service[] = [
        { id: 's1', company_id: 'c1', name: 'Corte', duration_minutes: 30, price: 50, commission_percentage: 30, is_active: true, created_at: '2026-01-01' }
      ];
      const commission = calculateAppointmentCommission(100, singleService);
      expect(commission).toBe(30);
    });

    it('debe retornar 0 si el monto es 0', () => {
      expect(calculateAppointmentCommission(0, mockServices)).toBe(0);
    });

    it('debe retornar 0 si no hay servicios', () => {
      expect(calculateAppointmentCommission(100, [])).toBe(0);
    });

    it('debe retornar 0 si todos los precios son 0', () => {
      const freeServices: Service[] = [
        { id: 's1', company_id: 'c1', name: 'Gratis', duration_minutes: 15, price: 0, commission_percentage: 50, is_active: true, created_at: '2026-01-01' }
      ];
      expect(calculateAppointmentCommission(100, freeServices)).toBe(0);
    });

    it('debe manejar servicios con undefined en price', () => {
      const undefinedPriceService: Service[] = [
        { id: 's1', company_id: 'c1', name: 'Corte', duration_minutes: 30, price: undefined as any, commission_percentage: 50, is_active: true, created_at: '2026-01-01' }
      ];
      expect(calculateAppointmentCommission(100, undefinedPriceService)).toBe(0);
    });
  });

  describe('getStartOfWeek', () => {
    it('debe retornar lunes como inicio de semana para un miércoles', () => {
      const wednesday = new Date(2026, 3, 15); // April 15, 2026 = Wednesday
      const start = getStartOfWeek(wednesday);
      expect(start.getDay()).toBe(1); // Monday
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
    });

    it('debe retornar el mismo día si es lunes', () => {
      const monday = new Date(2026, 3, 13); // April 13, 2026 = Monday
      const start = getStartOfWeek(monday);
      expect(start.getDate()).toBe(13);
    });

    it('debe retroceder al lunes anterior si es domingo', () => {
      const sunday = new Date(2026, 3, 19); // April 19, 2026 = Sunday
      const start = getStartOfWeek(sunday);
      expect(start.getDay()).toBe(1); // Monday
      expect(start.getDate()).toBe(13);
    });

    it('debe retroceder al lunes anterior si es sábado', () => {
      const saturday = new Date(2026, 3, 18); // April 18, 2026 = Saturday
      const start = getStartOfWeek(saturday);
      expect(start.getDay()).toBe(1);
      expect(start.getDate()).toBe(13);
    });
  });

  describe('getEndOfWeek', () => {
    it('debe retornar domingo como fin de semana', () => {
      const wednesday = new Date(2026, 3, 15);
      const end = getEndOfWeek(wednesday);
      expect(end.getDay()).toBe(0); // Sunday
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });

    it('debe ser el domingo de la misma semana (6 días después del lunes)', () => {
      const date = new Date(2026, 3, 15); // Wednesday April 15
      const start = getStartOfWeek(date);
      const end = getEndOfWeek(date);
      expect(end.getDate()).toBe(start.getDate() + 6);
    });
  });

  describe('formatDate', () => {
    it('debe formatear fecha como YYYY-MM-DD', () => {
      const date = new Date(2026, 3, 15);
      const formatted = formatDate(date);
      expect(formatted).toBe('2026-04-15');
    });

    it('debe agregar ceros a la izquierda para meses y días < 10', () => {
      const date = new Date(2026, 0, 5);
      expect(formatDate(date)).toBe('2026-01-05');
    });
  });

  describe('getStatusLabel', () => {
    it('debe retornar etiqueta en español para completed', () => {
      expect(getStatusLabel('completed')).toBe('Completada');
    });

    it('debe retornar etiqueta en español para pending', () => {
      expect(getStatusLabel('pending')).toBe('Pendiente');
    });

    it('debe retornar etiqueta en español para cancelled', () => {
      expect(getStatusLabel('cancelled')).toBe('Cancelada');
    });

    it('debe retornar etiqueta en español para no_show', () => {
      expect(getStatusLabel('no_show')).toBe('No asistió');
    });

    it('debe retornar el status original si no existe etiqueta', () => {
      expect(getStatusLabel('unknown')).toBe('unknown');
    });
  });

  describe('getStatusSeverity', () => {
    it('debe retornar severity correcto para cada status', () => {
      expect(getStatusSeverity('completed')).toBe('success');
      expect(getStatusSeverity('pending')).toBe('warn');
      expect(getStatusSeverity('cancelled')).toBe('danger');
      expect(getStatusSeverity('no_show')).toBe('secondary');
    });

    it('debe retornar info para status desconocido', () => {
      expect(getStatusSeverity('unknown')).toBe('info');
    });
  });
});