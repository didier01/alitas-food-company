import { Injectable } from '@angular/core';
import { Category } from '../models/category.model';
import { BaseSupabaseService } from './base-supabase.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseSupabaseService<Category> {
  protected override table = 'categories';

  // We can override methods if we need custom logic, like custom sorting
  override getAll(): Observable<Category[]> {
    return super.getAll().pipe(
      map(categories => (categories || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)))
    );
  }
}
