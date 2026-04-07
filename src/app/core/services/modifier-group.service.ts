import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map } from 'rxjs';
import { ModifierGroup, ModifierOption } from '../models/modifier-group.model';

@Injectable({
  providedIn: 'root'
})
export class ModifierGroupService {
  private supabase = inject(SupabaseService).getClient();

  getAll(): Observable<ModifierGroup[]> {
    return from(
      this.supabase.from('modifier_groups').select(`
        *,
        options:modifier_options(
          id,
          product_id,
          products ( name, price )
        )
      `)
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
        return res.data.map((mg: any) => ({
          ...mg,
          options: mg.options?.map((opt: any) => ({
            id: opt.id,
            product_id: opt.product_id,
            name: opt.products?.name,
            extra_price: opt.products?.price || 0
          }))
        })) as ModifierGroup[];
      })
    );
  }

  create(group: Partial<ModifierGroup>): Observable<ModifierGroup> {
    return from(
      this.supabase.from('modifier_groups')
        .insert([{ name: group.name }])
        .select()
        .single()
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
        return res.data as ModifierGroup;
      })
    );
  }

  delete(id: string): Observable<void> {
    return from(
      this.supabase.from('modifier_groups').delete().eq('id', id)
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
      })
    );
  }

  addOption(groupId: string, productId: string): Observable<ModifierOption> {
    return from(
      this.supabase.from('modifier_options')
        .insert([{ group_id: groupId, product_id: productId }])
        .select('*, products(name, price)')
        .single()
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
        return {
          id: res.data.id,
          product_id: res.data.product_id,
          name: res.data.products?.name,
          extra_price: res.data.products?.price || 0
        } as ModifierOption;
      })
    );
  }

  removeOption(optionId: string): Observable<void> {
    return from(
      this.supabase.from('modifier_options').delete().eq('id', optionId)
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
      })
    );
  }
}
