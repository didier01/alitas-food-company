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
        modifier_group_options(
          option_id,
          modifier_options(*)
        )
      `)
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
        return res.data.map((mg: any) => ({
          ...mg,
          options: mg.modifier_group_options?.map((mgo: any) => ({
            id: mgo.modifier_options?.id,
            name: mgo.modifier_options?.name,
            price: mgo.modifier_options?.price || 0,
            active: mgo.modifier_options?.active
          })) || []
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

  update(id: string, data: Partial<ModifierGroup>): Observable<void> {
    return from(
      this.supabase.from('modifier_groups')
        .update({ name: data.name })
        .eq('id', id)
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
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

  // --- MÉTODOS DE OPCIONES (NUEVO MODELO) ---

  /** Crea una opción global en el catálogo */
  createGlobalOption(name: string, price: number, category?: string): Observable<ModifierOption> {
    return from(
      this.supabase.from('modifier_options')
        .insert([{ name, price, category }])
        .select()
        .single()
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
        return res.data as ModifierOption;
      })
    );
  }

  /** Crea múltiples opciones globales con el mismo precio y categoría */
  createBulkGlobalOptions(names: string[], price: number, category?: string): Observable<ModifierOption[]> {
    const records = names.map(name => ({ name: name.trim(), price, category }));
    return from(
      this.supabase.from('modifier_options')
        .insert(records)
        .select()
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
        return res.data as ModifierOption[];
      })
    );
  }

  /** Actualiza una opción global */
  updateGlobalOption(id: string, data: Partial<ModifierOption>): Observable<void> {
    return from(
      this.supabase.from('modifier_options')
        .update(data)
        .eq('id', id)
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
      })
    );
  }

  /** Vincula una opción existente a un grupo */
  linkOptionToGroup(groupId: string, optionId: string): Observable<void> {
    return from(
      this.supabase.from('modifier_group_options')
        .insert([{ group_id: groupId, option_id: optionId }])
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
      })
    );
  }

  /** Desvincula una opción de un grupo */
  unlinkOptionFromGroup(groupId: string, optionId: string): Observable<void> {
    return from(
      this.supabase.from('modifier_group_options')
        .delete()
        .eq('group_id', groupId)
        .eq('option_id', optionId)
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
      })
    );
  }

  /** Elimina una opción del catálogo global */
  deleteGlobalOption(optionId: string): Observable<void> {
    return from(
      this.supabase.from('modifier_options')
        .delete()
        .eq('id', optionId)
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
      })
    );
  }

  getAllGlobalOptions(): Observable<ModifierOption[]> {
    return from(
      this.supabase.from('modifier_options').select('*').order('name')
    ).pipe(
      map((res: any) => {
        if (res.error) throw res.error;
        return res.data as ModifierOption[];
      })
    );
  }
}
