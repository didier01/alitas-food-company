import { Injectable, inject } from '@angular/core';
import { Promotion } from '../models/promotion.model';
import { Observable, from, map } from 'rxjs';
import { BaseSupabaseService } from './base-supabase.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PromotionService extends BaseSupabaseService<Promotion> {
  protected override table = 'promotions';

  override getAll(): Observable<Promotion[]> {
    if (environment.useMocks && !this.useRealData) {
      return this.http.get<Promotion[]>(`/assets/mock/${this.table}.json`);
    }

    const promise = this.supabase.getClient()
      .from(this.table)
      .select('*, promotion_venues(venue_id)');

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((p: any) => ({
          ...p,
          venue_ids: p.promotion_venues?.map((v: any) => v.venue_id) || []
        })) as Promotion[];
      })
    );
  }

  override create(item: Promotion): Observable<Promotion> {
    if (environment.useMocks && !this.useRealData) {
      return from(Promise.resolve({ ...item, id: `promo-mock-${Date.now()}` } as Promotion));
    }

    const { id, venue_ids, promotion_venues, ...dataToSave } = item as any;
    
    const promise = this.supabase.getClient()
      .from(this.table)
      .insert(dataToSave)
      .select()
      .single()
      .then(async ({ data: newPromo, error }) => {
        if (error) throw error;
        
        if (venue_ids && venue_ids.length > 0) {
          const pvData = venue_ids.map((vId: string) => ({
            promotion_id: newPromo.id,
            venue_id: vId
          }));
          await this.supabase.getClient().from('promotion_venues').insert(pvData);
        }
        
        return { ...newPromo, venue_ids } as Promotion;
      });

    return from(promise);
  }

  override update(item: Promotion): Observable<Promotion> {
    if (environment.useMocks && !this.useRealData) {
      return from(Promise.resolve(item));
    }

    const id = item.id;
    const { venue_ids, promotion_venues, ...dataToSave } = item as any;
    
    const promise = this.supabase.getClient()
      .from(this.table)
      .update(dataToSave)
      .eq('id', id)
      .select()
      .single()
      .then(async ({ data: updatedPromo, error }) => {
        if (error) throw error;
        
        await this.supabase.getClient().from('promotion_venues').delete().eq('promotion_id', id);
        if (venue_ids && venue_ids.length > 0) {
          const pvData = venue_ids.map((vId: string) => ({
            promotion_id: id,
            venue_id: vId
          }));
          await this.supabase.getClient().from('promotion_venues').insert(pvData);
        }
        
        return { ...updatedPromo, venue_ids } as Promotion;
      });

    return from(promise);
  }

  /**
   * Get active promotions for a specific venue.
   * If venueId is 'ALL', returns all active promotions.
   * Uses inner join on promotion_venues table.
   */
  getActiveByVenue(venueId: string): Observable<Promotion[]> {
    let selectStr = '*, promotion_venues(venue_id)';
    if (venueId !== 'ALL' && venueId !== 'TODAS') {
      selectStr = '*, promotion_venues!inner(venue_id)';
    }

    let query = this.supabase.getClient().from(this.table)
      .select(selectStr)
      .eq('active', true);

    if (venueId !== 'ALL' && venueId !== 'TODAS') {
      query = query.eq('promotion_venues.venue_id', venueId);
    }

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        // Map the result to match our UI model
        return (data || []).map((p: any) => ({
          ...p,
          venue_ids: (p as any).promotion_venues?.map((v: any) => v.venue_id) || []
        })) as Promotion[];
      })
    );
  }
}
