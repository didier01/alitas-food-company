import { Injectable } from '@angular/core';
import { Allergen } from '../models/allergen.model';
import { BaseSupabaseService } from './base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AllergenService extends BaseSupabaseService<Allergen> {
  protected override table = 'allergens';
}
