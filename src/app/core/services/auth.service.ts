import { Injectable, signal, inject } from '@angular/core';
import { User } from '../models/user.model';
import { from, map, Observable, switchMap, tap, of } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabase = inject(SupabaseService);

  // Signal global del usuario (perfil completo)
  currentUser = signal<User | null>(null);

  constructor() {
    this.refreshSession();
  }

  private async refreshSession() {
    const client = this.supabase.getClient();
    const { data: { session } } = await client.auth.getSession();

    if (session?.user) {
      this.loadProfile(session.user.id).subscribe();
    }
  }

  loadProfile(userId: string): Observable<User | null> {
    return from(
      this.supabase.getClient()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error && error.code === 'PGRST116') {
          console.warn('Perfil no encontrado para el usuario:', userId);
          return null;
        }
        if (error) throw error;
        return data as User;
      }),
      tap(user => {
        if (user) {
          this.currentUser.set(user);
        } else {
          // Si no hay perfil, creamos un objeto temporal básico para no romper la app
          this.currentUser.set({
            id: userId,
            name: 'Usuario sin Perfil',
            email: '',
            role: 'mesero',
            active: false
          });
        }
      })
    );
  }

  login(email: string, password: string): Observable<User | null> {
    return from(
      this.supabase.getClient().auth.signInWithPassword({ email, password })
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) throw error;
        if (!data.user) throw new Error('No user found after login');
        return this.loadProfile(data.user.id);
      })
    );
  }

  async logout() {
    await this.supabase.getClient().auth.signOut();
    this.currentUser.set(null);
    localStorage.removeItem('alitas_token'); // Limpieza legacy
    localStorage.removeItem('alitas_user');
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('alitas_token');
  }
}
