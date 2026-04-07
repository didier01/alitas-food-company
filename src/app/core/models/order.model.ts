import { Product } from './product.model';
import { ModifierOption } from './modifier-group.model';

export type OrderStatus = 'PENDIENTE' | 'PREPARANDO' | 'ENVIADO' | 'COMPLETADO' | 'CANCELADO';

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  product_name?: string; // For display
  quantity: number;
  unit_price: number;
  subtotal: number;
  options_json: any[]; // Array of selected options
}

export interface Order {
  id?: string;
  venue_id: string;
  customer_name: string;
  customer_phone?: string;
  delivery_address?: string;
  total_amount: number;
  status: OrderStatus;
  created_at?: string;
  items?: OrderItem[];
}
