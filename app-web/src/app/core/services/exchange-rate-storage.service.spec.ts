import { ExchangeRateStorageService } from './exchange-rate-storage.service';

describe('ExchangeRateStorageService', () => {
  let service: ExchangeRateStorageService;

  beforeEach(() => {
    localStorage.clear();
    service = new ExchangeRateStorageService();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should return default rate 1 when localStorage is empty', () => {
    expect(service.getRate()).toBe(1);
  });

  it('should return stored rate from localStorage on initialization', () => {
    localStorage.setItem('citasya_exchange_rate', '6.85');
    const newService = new ExchangeRateStorageService();
    expect(newService.getRate()).toBe(6.85);
  });

  it('should ignore invalid stored values and use default', () => {
    localStorage.setItem('citasya_exchange_rate', 'not-a-number');
    const newService = new ExchangeRateStorageService();
    expect(newService.getRate()).toBe(1);
  });

  it('should ignore zero stored values and use default', () => {
    localStorage.setItem('citasya_exchange_rate', '0');
    const newService = new ExchangeRateStorageService();
    expect(newService.getRate()).toBe(1);
  });

  it('should ignore negative stored values and use default', () => {
    localStorage.setItem('citasya_exchange_rate', '-5');
    const newService = new ExchangeRateStorageService();
    expect(newService.getRate()).toBe(1);
  });

  it('should save rate to localStorage when setRate is called', () => {
    service.setRate(7.05);
    expect(localStorage.getItem('citasya_exchange_rate')).toBe('7.05');
    expect(service.getRate()).toBe(7.05);
  });

  it('should not save invalid rate values', () => {
    service.setRate(0);
    expect(service.getRate()).toBe(1);

    service.setRate(-3);
    expect(service.getRate()).toBe(1);
  });

  it('should not save NaN values', () => {
    service.setRate(NaN);
    expect(service.getRate()).toBe(1);
  });

  it('should update rate when setRate is called with a valid value', () => {
    service.setRate(6.85);
    expect(service.getRate()).toBe(6.85);

    service.setRate(7.5);
    expect(service.getRate()).toBe(7.5);
    expect(localStorage.getItem('citasya_exchange_rate')).toBe('7.5');
  });

  it('should expose rate as a readable signal', () => {
    expect(service.rate()).toBe(1);

    service.setRate(6.85);
    expect(service.rate()).toBe(6.85);
  });
});