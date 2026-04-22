import { Injectable, signal } from '@angular/core';

export type OrderMode = 'delivery' | 'dine-in' | 'pending';

interface OrderModeStorage {
  mode: OrderMode;
  timestamp: number;
}

const STORAGE_KEY = 'alitas_order_mode';
const EXPIRY_HOURS = 3;

@Injectable({
  providedIn: 'root'
})
export class OrderModeService {
  private readonly _mode = signal<OrderMode>('pending');
  public readonly mode = this._mode.asReadonly();

  constructor() {}

  initMode(queryMode: string | null): void {
    // 1. If explicit query parameter exists, it overrides and we save it
    if (queryMode === 'restaurante') {
      this.setMode('dine-in');
      return;
    } else if (queryMode === 'domicilio') {
      this.setMode('delivery');
      return;
    }

    // 2. Fallback to localStorage logic
    const storedStr = localStorage.getItem(STORAGE_KEY);
    if (storedStr) {
      try {
        const stored: OrderModeStorage = JSON.parse(storedStr);
        const now = new Date().getTime();
        const diffHours = (now - stored.timestamp) / (1000 * 60 * 60);

        if (diffHours < EXPIRY_HOURS) {
          this._mode.set(stored.mode);
        } else {
          // Expired, clear it and remain 'pending'
          localStorage.removeItem(STORAGE_KEY);
          this._mode.set('pending');
        }
      } catch (e) {
        // Bad JSON
        localStorage.removeItem(STORAGE_KEY);
        this._mode.set('pending');
      }
    } else {
      this._mode.set('pending');
    }
  }

  setMode(newMode: OrderMode): void {
    this._mode.set(newMode);
    
    const objToStore: OrderModeStorage = {
      mode: newMode,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(objToStore));
  }
}
