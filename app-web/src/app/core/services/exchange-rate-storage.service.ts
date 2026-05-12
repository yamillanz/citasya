import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'citasya_exchange_rate';
const DEFAULT_RATE = 1;

@Injectable({ providedIn: 'root' })
export class ExchangeRateStorageService {
  private _rate = signal<number>(this.loadFromStorage());

  readonly rate = this._rate.asReadonly();

  getRate(): number {
    return this._rate();
  }

  setRate(rate: number): void {
    if (rate > 0 && !isNaN(rate)) {
      this._rate.set(rate);
      this.saveToStorage(rate);
    }
  }

  private loadFromStorage(): number {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseFloat(stored);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    } catch {
      // localStorage not available (private browsing, quota exceeded, etc.)
    }
    return DEFAULT_RATE;
  }

  private saveToStorage(rate: number): void {
    try {
      localStorage.setItem(STORAGE_KEY, String(rate));
    } catch {
      // Silently fail if localStorage is not available
    }
  }
}