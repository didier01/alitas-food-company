import { inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';

export abstract class BaseSupabaseService<T> {
  protected supabase = inject(SupabaseService);
  protected http = inject(HttpClient);
  protected abstract table: string;
  protected useRealData = true; // Override to test real connection in dev

  /**
   * Fetches all records from the table.
   * If useMocks is true and useRealData is false, it falls back to the local JSON file.
   */
  getAll(): Observable<T[]> {
    if (environment.useMocks && !this.useRealData) {
      return this.http.get<T[]>(`/assets/mock/${this.table}.json`);
    }

    const promise = this.supabase.getClient()
      .from(this.table)
      .select('*');

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []) as T[];
      })
    );
  }

  /**
   * Fetches a single record by ID.
   */
  getById(id: string): Observable<T> {
    if (environment.useMocks && !this.useRealData) {
      return this.http.get<T[]>(`/assets/mock/${this.table}.json`).pipe(
        map(items => {
          const item = (items as any[]).find(i => i.id === id);
          if (!item) throw new Error('Not found in mock');
          return item;
        })
      );
    }

    const promise = this.supabase.getClient()
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single();

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as T;
      })
    );
  }

  /**
   * Creates a new record.
   */
  create(item: T): Observable<T> {
    if (environment.useMocks && !this.useRealData) {
      return from(Promise.resolve({ ...item, id: `${this.table}-mock-${Date.now()}` } as T));
    }

    const { id, ...dataToSave } = item as any;
    const promise = this.supabase.getClient()
      .from(this.table)
      .insert(dataToSave)
      .select()
      .single();

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as T;
      })
    );
  }

  /**
   * Updates an existing record.
   */
  update(item: T): Observable<T> {
    if (environment.useMocks && !this.useRealData) {
      return from(Promise.resolve(item));
    }

    const id = (item as any).id;
    const promise = this.supabase.getClient()
      .from(this.table)
      .update(item)
      .eq('id', id)
      .select()
      .single();

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as T;
      })
    );
  }

  /**
   * Deletes a record by ID.
   */
  delete(id: string): Observable<void> {
    if (environment.useMocks && !this.useRealData) {
      return from(Promise.resolve());
    }

    const promise = this.supabase.getClient()
      .from(this.table)
      .delete()
      .eq('id', id);

    return from(promise).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  /**
   * Bulk updates multiple records using upsert.
   * Requires the records to have their primary key (id).
   */
  bulkUpdate(items: T[]): Observable<T[]> {
    const promise = this.supabase.getClient()
      .from(this.table)
      .upsert(items)
      .select();

    return from(promise).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return (data || []) as T[];
      })
    );
  }
}
