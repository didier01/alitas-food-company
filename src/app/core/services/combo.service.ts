import { Injectable, inject } from '@angular/core';
import { Combo } from '../models/combo.model';
import { Observable, from, map } from 'rxjs';
import { BaseSupabaseService } from './base-supabase.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ComboService extends BaseSupabaseService<Combo> {
  protected override table = 'combos';

  override getAll(): Observable<Combo[]> {
    if (environment.useMocks && !this.useRealData) {
      return this.http.get<Combo[]>(`/assets/mock/${this.table}.json`);
    }

    const promise = this.supabase.getClient()
      .from(this.table)
      .select(`
        *,
        combo_venues(venue_id),
        combo_products(*),
        combo_allergens(allergen_id),
        combo_modifier_groups(
          group_id, min_selection, max_selection, free_selections,
          modifier_groups(
            id, name,
            modifier_group_options(
              option_id,
              modifier_options(*)
            )
          )
        )
      `);

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []).map((c: any) => ({
          ...c,
          venue_ids: c.combo_venues?.map((v: any) => v.venue_id) || [],
          allergen_ids: c.combo_allergens?.map((ca: any) => ca.allergen_id) || [],
          included_products: c.combo_products?.map((p: any) => ({
            id: p.product_id,
            quantity: p.quantity
          })) || [],
          modifier_groups: c.combo_modifier_groups?.map((cmg: any) => ({
            group_id: cmg.group_id,
            name: cmg.modifier_groups?.name,
            min_selection: cmg.min_selection,
            max_selection: cmg.max_selection,
            free_selections: cmg.free_selections,
            options: cmg.modifier_groups?.modifier_group_options?.map((mgo: any) => ({
              id: mgo.modifier_options?.id,
              name: mgo.modifier_options?.name,
              price: mgo.modifier_options?.price || 0,
              active: mgo.modifier_options?.active
            })) || []
          })) || []
        })) as Combo[];
      })
    );
  }

  override create(item: Combo): Observable<Combo> {
    if (environment.useMocks && !this.useRealData) {
      return from(Promise.resolve({ ...item, id: `combo-mock-${Date.now()}` } as Combo));
    }

    const { id, included_products, venue_ids, combo_venues, combo_products, allergen_ids, allergens, combo_allergens, modifier_groups, ...dataToSave } = item as any;
    
    const promise = this.supabase.getClient()
      .from(this.table)
      .insert(dataToSave)
      .select()
      .single()
      .then(async ({ data: newCombo, error }) => {
        if (error) throw error;
        
        if (included_products && included_products.length > 0) {
          const cpData = included_products.map((p: any) => ({
            combo_id: newCombo.id,
            product_id: p.id,
            quantity: p.quantity || 1
          }));
          await this.supabase.getClient().from('combo_products').insert(cpData);
        }
        
        if (venue_ids && venue_ids.length > 0) {
          const cvData = venue_ids.map((vId: string) => ({
            combo_id: newCombo.id,
            venue_id: vId
          }));
          await this.supabase.getClient().from('combo_venues').insert(cvData);
        }
        
        if (allergen_ids && allergen_ids.length > 0) {
          const caData = allergen_ids.map((aId: string) => ({
            combo_id: newCombo.id,
            allergen_id: aId
          }));
          await this.supabase.getClient().from('combo_allergens').insert(caData);
        }
        
        if (modifier_groups && modifier_groups.length > 0) {
          const cmgData = modifier_groups.map((mg: any) => ({
            combo_id: newCombo.id,
            group_id: mg.group_id,
            min_selection: mg.min_selection,
            max_selection: mg.max_selection,
            free_selections: mg.free_selections || 0
          }));
          await this.supabase.getClient().from('combo_modifier_groups').insert(cmgData);
        }
        
        return { ...newCombo, included_products, venue_ids, allergen_ids, modifier_groups } as Combo;
      });

    return from(promise);
  }

  override update(item: Combo): Observable<Combo> {
    if (environment.useMocks && !this.useRealData) {
      return from(Promise.resolve(item));
    }

    const id = item.id;
    const { included_products, venue_ids, combo_venues, combo_products, allergen_ids, allergens, combo_allergens, modifier_groups, ...dataToSave } = item as any;
    
    const promise = this.supabase.getClient()
      .from(this.table)
      .update(dataToSave)
      .eq('id', id)
      .select()
      .single()
      .then(async ({ data: updatedCombo, error }) => {
        if (error) throw error;
        
        await this.supabase.getClient().from('combo_products').delete().eq('combo_id', id);
        if (included_products && included_products.length > 0) {
          const cpData = included_products.map((p: any) => ({
            combo_id: id,
            product_id: p.id,
            quantity: p.quantity || 1
          }));
          await this.supabase.getClient().from('combo_products').insert(cpData);
        }
        
        await this.supabase.getClient().from('combo_venues').delete().eq('combo_id', id);
        if (venue_ids && venue_ids.length > 0) {
          const cvData = venue_ids.map((vId: string) => ({
            combo_id: id,
            venue_id: vId
          }));
          await this.supabase.getClient().from('combo_venues').insert(cvData);
        }
        
        await this.supabase.getClient().from('combo_allergens').delete().eq('combo_id', id);
        if (allergen_ids && allergen_ids.length > 0) {
          const caData = allergen_ids.map((aId: string) => ({
            combo_id: id,
            allergen_id: aId
          }));
          await this.supabase.getClient().from('combo_allergens').insert(caData);
        }

        await this.supabase.getClient().from('combo_modifier_groups').delete().eq('combo_id', id);
        if (modifier_groups && modifier_groups.length > 0) {
          const cmgData = modifier_groups.map((mg: any) => ({
            combo_id: id,
            group_id: mg.group_id,
            min_selection: mg.min_selection,
            max_selection: mg.max_selection,
            free_selections: mg.free_selections || 0
          }));
          await this.supabase.getClient().from('combo_modifier_groups').insert(cmgData);
        }
        
        return { ...updatedCombo, included_products, venue_ids, allergen_ids, modifier_groups } as Combo;
      });

    return from(promise);
  }

  /**
   * Get active combos for a specific venue.
   * If venueId is 'ALL' or 'TODAS', returns all active combos.
   */
  getBySede(venueId: string): Observable<Combo[]> {
    let selectStr = `
        *,
        combo_venues(venue_id),
        combo_products(*),
        combo_allergens(allergen_id),
        combo_modifier_groups(
          group_id, min_selection, max_selection, free_selections,
          modifier_groups(
            id, name,
            modifier_group_options(
              option_id,
              modifier_options(*)
            )
          )
        )`;
        
    if (venueId !== 'ALL' && venueId !== 'TODAS') {
      selectStr = `
        *,
        combo_venues!inner(venue_id),
        combo_products(*),
        combo_allergens(allergen_id),
        combo_modifier_groups(
          group_id, min_selection, max_selection, free_selections,
          modifier_groups(
            id, name,
            modifier_group_options(
              option_id,
              modifier_options(*)
            )
          )
        )`;
    }

    let query = this.supabase.getClient().from(this.table)
      .select(selectStr)
      .eq('active', true);

    if (venueId !== 'ALL' && venueId !== 'TODAS') {
      query = query.eq('combo_venues.venue_id', venueId);
    }

    return from(query).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        // Map the result to match our UI model
        return (data || []).map((c: any) => ({
          ...c,
          venue_ids: (c as any).combo_venues?.map((v: any) => v.venue_id) || [],
          allergen_ids: (c as any).combo_allergens?.map((ca: any) => ca.allergen_id) || [],
          included_products: (c as any).combo_products?.map((p: any) => ({
            id: p.product_id,
            quantity: p.quantity
          })) || [],
          modifier_groups: c.combo_modifier_groups?.map((cmg: any) => ({
            group_id: cmg.group_id,
            name: cmg.modifier_groups?.name,
            min_selection: cmg.min_selection,
            max_selection: cmg.max_selection,
            free_selections: cmg.free_selections,
            options: cmg.modifier_groups?.modifier_group_options?.map((mgo: any) => ({
              id: mgo.modifier_options?.id,
              name: mgo.modifier_options?.name,
              price: mgo.modifier_options?.price || 0,
              active: mgo.modifier_options?.active
            })) || []
          })) || []
        })) as Combo[];
      })
    );
  }
}
