import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface TagGroup {
  tag: string;
  group_name: string;
  display_order?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private supabase = inject(SupabaseService);

  getAll(): Observable<TagGroup[]> {
    const promise = this.supabase.getClient()
      .from('tag_groups')
      .select('*')
      .order('display_order', { ascending: true });
    
    return from(promise).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as TagGroup[];
    }));
  }

  create(tag: TagGroup): Observable<TagGroup> {
    const promise = this.supabase.getClient()
      .from('tag_groups')
      .insert(tag)
      .select()
      .single();
    
    return from(promise).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as TagGroup;
    }));
  }

  update(originalTag: string, updates: Partial<TagGroup>): Observable<TagGroup> {
    const promise = this.supabase.getClient()
      .from('tag_groups')
      .update(updates)
      .eq('tag', originalTag)
      .select()
      .single();
    
    return from(promise).pipe(map(({ data, error }) => {
      if (error) throw error;
      return data as TagGroup;
    }));
  }

  delete(tag: string): Observable<void> {
    const promise = this.supabase.getClient()
      .from('tag_groups')
      .delete()
      .eq('tag', tag);
    
    return from(promise).pipe(map(({ error }) => {
      if (error) throw error;
    }));
  }
}
