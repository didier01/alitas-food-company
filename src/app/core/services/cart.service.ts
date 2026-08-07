import { Injectable, computed, signal } from '@angular/core';
import { Product } from '../models/product.model';
import { ModifierOption } from '../models/modifier-group.model';

export interface CartItem {
  id: string; // Unique ID for this specific combination
  product: Product;
  selectedOptions: ModifierOption[];
  quantity: number;
  totalPrice: number; // Price of product + extras * quantity
}

interface CartStoragePayload {
  items: CartItem[];
  timestamp: number;
}

const CART_STORAGE_KEY = 'alitas_cart';
const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour expiration

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signal for cart items
  private cartItems = signal<CartItem[]>(this.loadCart());

  private loadCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        // Legacy format: save with timestamp now
        return parsed;
      } else if (parsed && Array.isArray(parsed.items) && parsed.timestamp) {
        const now = Date.now();
        if (now - parsed.timestamp < ONE_HOUR_MS) {
          return parsed.items;
        } else {
          // Expired (> 1 hour), clear storage
          localStorage.removeItem(CART_STORAGE_KEY);
          return [];
        }
      }
      return [];
    } catch {
      return [];
    }
  }

  private saveCart() {
    try {
      const payload: CartStoragePayload = {
        items: this.cartItems(),
        timestamp: Date.now()
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }

  // Computed signals
  items = computed(() => this.cartItems());
  
  count = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + item.quantity, 0);
  });

  totalAmount = computed(() => {
    return this.cartItems().reduce((acc, item) => acc + item.totalPrice, 0);
  });

  addItem(product: Product, selectedOptions: ModifierOption[], quantity: number = 1, computedUnitPrice?: number) {
    const items = this.cartItems();
    
    // Create a unique key based on product ID and sorted option IDs to identify duplicate configurations
    const optionsKey = selectedOptions.map(o => o.id).sort().join('-');
    const itemId = `${product.id}-${optionsKey}`;

    const existingIndex = items.findIndex(i => i.id === itemId);
    
    const unitPrice = computedUnitPrice ?? (product.price + selectedOptions.reduce((acc, o) => acc + o.price, 0));

    if (existingIndex !== -1) {
      const updatedItems = [...items];
      updatedItems[existingIndex] = {
        ...updatedItems[existingIndex],
        quantity: updatedItems[existingIndex].quantity + quantity,
        totalPrice: (updatedItems[existingIndex].quantity + quantity) * unitPrice
      };
      this.cartItems.set(updatedItems);
      this.saveCart();
    } else {
      const newItem: CartItem = {
        id: itemId,
        product,
        selectedOptions,
        quantity,
        totalPrice: quantity * unitPrice
      };
      this.cartItems.set([...items, newItem]);
      this.saveCart();
    }
  }

  updateQuantity(itemId: string, delta: number) {
    const items = this.cartItems();
    const idx = items.findIndex(i => i.id === itemId);
    
    if (idx !== -1) {
      const updatedItems = [...items];
      const newQty = updatedItems[idx].quantity + delta;
      
      if (newQty <= 0) {
        this.removeItem(itemId);
      } else {
        const unitPrice = updatedItems[idx].totalPrice / updatedItems[idx].quantity;
        updatedItems[idx] = {
          ...updatedItems[idx],
          quantity: newQty,
          totalPrice: newQty * unitPrice
        };
        this.cartItems.set(updatedItems);
        this.saveCart();
      }
    }
  }

  removeItem(itemId: string) {
    this.cartItems.set(this.cartItems().filter(i => i.id !== itemId));
    this.saveCart();
  }

  clearCart() {
    this.cartItems.set([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }

  generateWhatsAppMessage(venueName: string, customerName?: string, deliveryAddress?: string, customerPhone?: string): string {
    const items = this.cartItems();
    if (items.length === 0) return '';

    let message = `🍗 *¡NUEVO PEDIDO A DOMICILIO!* 🍗\n`;
    message += `📍 *Sede:* ${venueName}\n\n`;

    if (customerName) message += `👤 *Cliente:* ${customerName}\n`;
    if (deliveryAddress) message += `🏠 *Dirección / Punto:* ${deliveryAddress}\n`;
    if (customerPhone) message += `📞 *Teléfono:* ${customerPhone}\n`;

    message += `\n🛒 *DETALLE DEL PEDIDO:*\n`;
    message += `──────────────────────────\n`;

    items.forEach(item => {
      message += `• *${item.quantity}x ${item.product.name}*\n`;
      if (item.selectedOptions && item.selectedOptions.length > 0) {
        message += `  _Opciones:_ ${item.selectedOptions.map(o => o.name).join(', ')}\n`;
      }
      message += `  Subtotal: $${item.totalPrice.toLocaleString('es-CO')} COP\n\n`;
    });

    message += `──────────────────────────\n`;
    message += `💰 *TOTAL A PAGAR: $${this.totalAmount().toLocaleString('es-CO')} COP*\n\n`;
    message += `_Quedamos atentos a la confirmación de su pedido. ¡Gracias por elegir Alitas Food Company!_`;

    return encodeURIComponent(message);
  }
}
