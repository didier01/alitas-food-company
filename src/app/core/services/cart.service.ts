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

const CART_STORAGE_KEY = 'alitas_cart';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signal for cart items
  private cartItems = signal<CartItem[]>(this.loadCart());

  private loadCart(): CartItem[] {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.cartItems()));
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
    this.saveCart();
  }

  generateWhatsAppMessage(venueName: string, customerName?: string, deliveryAddress?: string): string {
    const items = this.cartItems();
    if (items.length === 0) return '';

    let message = `*Pedido alitas - ${venueName}* 🍗\n\n`;
    
    if (customerName) message += `*Cliente:* ${customerName}\n`;
    if (deliveryAddress) message += `*Entrega/Mesa:* ${deliveryAddress}\n\n`;

    items.forEach(item => {
      message += `*${item.quantity}x ${item.product.name}*\n`;
      if (item.selectedOptions.length > 0) {
        message += `_Variantes:_ ${item.selectedOptions.map(o => o.name).join(', ')}\n`;
      }
      message += `Subtotal: $${item.totalPrice.toLocaleString()}\n\n`;
    });

    message += `--------------------------\n`;
    message += `*TOTAL: $${this.totalAmount().toLocaleString()} COP*`;
    
    return encodeURIComponent(message);
  }
}
