import { Injectable, inject } from '@angular/core';
import { VenueMenu } from '../models/venue-menu.model';
import { Observable, from, map } from 'rxjs';
import { BaseSupabaseService } from './base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class VenueMenuService extends BaseSupabaseService<VenueMenu> {
  protected override table = 'venue_menus';

  /**
   * Get the active menu for a specific venue.
   * Includes products and combos through join tables.
   */
  getMenuByVenue(venueId: string): Observable<VenueMenu | undefined> {
    const query = this.supabase.getClient().from(this.table)
      .select('*, venue_menu_products(product_id), venue_menu_combos(combo_id)')
      .or(`venue_id.eq.${venueId},is_shared.eq.true`)
      .eq('active', true)
      .limit(1)
      .single();

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) {
          if (error.code === 'PGRST116') return undefined; // No rows found
          throw error;
        }
        
        // Map join tables to simple ID arrays for convenient UI usage
        return {
          ...data,
          product_ids: (data as any).venue_menu_products.map((p: any) => p.product_id),
          combo_ids: (data as any).venue_menu_combos.map((c: any) => c.combo_id)
        } as VenueMenu;
      })
    );
  }

  shareMenuAcrossAllVenues(menuId: string): Observable<VenueMenu> {
    const updatePayload = {
      is_shared: true,
      venue_id: null // In DB it might expect null for shared
    } as any;
    return this.update({ id: menuId, ...updatePayload });
  }

  addRemoveProduct(menuId: string, productIds: string[]): Observable<any> {
    // This is more complex because it involves the join table venue_menu_products
    // Standard BaseSupabaseService doesn't handle this directly.
    return from(this.supabase.getClient().from('venue_menu_products').delete().eq('menu_id', menuId)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return productIds.map(pid => ({ menu_id: menuId, product_id: pid }));
      }),
      map(rows => from(this.supabase.getClient().from('venue_menu_products').insert(rows)))
    );
  }
}
