import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { BaseSupabaseService } from './base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseSupabaseService<User> {
  protected override table = 'users';
}
