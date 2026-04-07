import { Injectable, inject } from '@angular/core';
import { Observable, from, map, switchMap, of } from 'rxjs';
import { Order, OrderStatus } from '../models/order.model';
import { BaseSupabaseService } from './base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService extends BaseSupabaseService<Order> {
  protected override table = 'orders';

  // For Admin: Get all orders with items
  override getAll(): Observable<Order[]> {
    return from(
      this.supabase.getClient()
        .from(this.table)
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false })
    ).pipe(
      map(res => res.data || [])
    );
  }

  // Get orders by Venue with items
  getByVenue(venueId: string): Observable<Order[]> {
    return from(
      this.supabase.getClient()
        .from(this.table)
        .select('*, items:order_items(*)')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false })
    ).pipe(
      map(res => res.data || [])
    );
  }

  // Create new order (Client)
  createOrder(order: Order): Observable<Order> {
    const { items, ...orderHeader } = order;
    
    return from(
      this.supabase.getClient()
        .from(this.table)
        .insert(orderHeader)
        .select()
        .single()
    ).pipe(
      switchMap(res => {
          const newOrder = res.data;
          if (!newOrder || !items || items.length === 0) return of(newOrder);
          
          const itemsToSave = items.map(item => ({
            ...item,
            order_id: newOrder.id
          }));

          return from(
            this.supabase.getClient()
              .from('order_items')
              .insert(itemsToSave)
          ).pipe(
            map(() => ({ ...newOrder, items }))
          );
      })
    );
  }

  updateOrderStatus(orderId: string, status: OrderStatus): Observable<any> {
    return from(
      this.supabase.getClient()
        .from(this.table)
        .update({ status })
        .eq('id', orderId)
    );
  }
}
