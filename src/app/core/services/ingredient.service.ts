import { Injectable } from '@angular/core';
import { Ingredient } from '../models/ingredient.model';
import { BaseSupabaseService } from './base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class IngredientService extends BaseSupabaseService<Ingredient> {
  protected override table = 'ingredients';
}
