import { Injectable, signal } from '@angular/core';

export type OrderMode = 'delivery' | 'dine-in';

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
  private readonly _mode = signal<OrderMode>('dine-in');
  public readonly mode = this._mode.asReadonly();

  private readonly _isModalOpen = signal<boolean>(false);
  public readonly isModalOpen = this._isModalOpen.asReadonly();

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

        if (diffHours < EXPIRY_HOURS && (stored.mode === 'dine-in' || stored.mode === 'delivery')) {
          this._mode.set(stored.mode);
          this._isModalOpen.set(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    // First visit or expired: default to dine-in and open welcome modal
    this._mode.set('dine-in');
    this._isModalOpen.set(true);
  }

  setMode(newMode: OrderMode): void {
    this._mode.set(newMode);
    this._isModalOpen.set(false);
    
    const objToStore: OrderModeStorage = {
      mode: newMode,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(objToStore));
  }

  openModal(): void {
    this._isModalOpen.set(true);
  }

  closeModal(): void {
    this._isModalOpen.set(false);
  }
}
