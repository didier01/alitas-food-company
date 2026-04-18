import { Injectable, inject } from '@angular/core';
import { VenueMenu } from '../models/venue-menu.model';
import { Observable, from, map } from 'rxjs';
import { BaseSupabaseService } from './base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class VenueMenuService extends BaseSupabaseService<VenueMenu> {
  protected override table = 'venue_menus';

  override getAll(): Observable<VenueMenu[]> {
    const query = this.supabase.getClient().from(this.table)
      .select('*, venue_menu_products(product_id), venue_menu_combos(combo_id)');

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((m: any) => ({
          ...m,
          product_ids: m.venue_menu_products?.map((p: any) => p.product_id) || [],
          combo_ids: m.venue_menu_combos?.map((c: any) => c.combo_id) || []
        })) as VenueMenu[];
      })
    );
  }

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

  override create(item: VenueMenu): Observable<VenueMenu> {
    const { id, product_ids, combo_ids, venue_menu_products, venue_menu_combos, ...dataToSave } = item as any;
    
    // First save the main record
    const promise = this.supabase.getClient()
      .from(this.table)
      .insert(dataToSave)
      .select()
      .single()
      .then(async ({ data: newMenu, error }) => {
        if (error) throw error;

        // Associate products
        if (product_ids && product_ids.length > 0) {
          const rows = product_ids.map((pid: string) => ({ menu_id: newMenu.id, product_id: pid }));
          await this.supabase.getClient().from('venue_menu_products').insert(rows);
        }

        // Associate combos
        if (combo_ids && combo_ids.length > 0) {
          const rows = combo_ids.map((cid: string) => ({ menu_id: newMenu.id, combo_id: cid }));
          await this.supabase.getClient().from('venue_menu_combos').insert(rows);
        }

        return { ...newMenu, product_ids, combo_ids } as VenueMenu;
      });

    return from(promise);
  }

  override update(item: VenueMenu): Observable<VenueMenu> {
    const id = item.id;
    const { id: _, product_ids, combo_ids, venue_menu_products, venue_menu_combos, ...dataToSave } = item as any;

    const promise = this.supabase.getClient()
      .from(this.table)
      .update(dataToSave)
      .eq('id', id)
      .select()
      .single()
      .then(async ({ data: updatedMenu, error }) => {
        if (error) throw error;

        // Update products associations
        if (product_ids !== undefined) {
          await this.supabase.getClient().from('venue_menu_products').delete().eq('menu_id', id);
          if (product_ids.length > 0) {
            const rows = product_ids.map((pid: string) => ({ menu_id: id, product_id: pid }));
            await this.supabase.getClient().from('venue_menu_products').insert(rows);
          }
        }

        // Update combos associations
        if (combo_ids !== undefined) {
          await this.supabase.getClient().from('venue_menu_combos').delete().eq('menu_id', id);
          if (combo_ids.length > 0) {
            const rows = combo_ids.map((cid: string) => ({ menu_id: id, combo_id: cid }));
            await this.supabase.getClient().from('venue_menu_combos').insert(rows);
          }
        }

        return { ...updatedMenu, product_ids, combo_ids } as VenueMenu;
      });

    return from(promise);
  }

  shareMenuAcrossAllVenues(menuId: string): Observable<VenueMenu> {
    const updatePayload = {
      is_shared: true,
      venue_id: null // In DB it might expect null for shared
    } as any;
    return this.update({ id: menuId, ...updatePayload } as VenueMenu);
  }

  addRemoveProduct(menuId: string, productIds: string[]): Observable<any> {
    return from(this.supabase.getClient().from('venue_menu_products').delete().eq('menu_id', menuId)).pipe(
      map(({ error }) => {
        if (error) throw error;
        return productIds.map(pid => ({ menu_id: menuId, product_id: pid }));
      }),
      map(rows => from(this.supabase.getClient().from('venue_menu_products').insert(rows)))
    );
  }
}
