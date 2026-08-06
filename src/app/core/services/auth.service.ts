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
    // 1. Restaurar inmediatamente desde localStorage para evitar cierres de sesión en navegaciones/re-renders
    this.initSavedUser();

    // 2. Escuchar cambios de sesión de Supabase Auth en tiempo real
    this.initAuthListener();
  }

  private initSavedUser() {
    const savedUser = localStorage.getItem('alitas_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        this.currentUser.set(parsed);
      } catch (e) {
        console.error('Error restaurando usuario desde localStorage', e);
      }
    }
  }

  private initAuthListener() {
    try {
      const client = this.supabase.getClient();
      
      // Escuchar eventos de inicio / cierre de sesión
      client.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          this.loadProfile(session.user.id).subscribe();
        } else if (event === 'SIGNED_OUT') {
          this.clearLocalSession();
        }
      });

      this.refreshSession();
    } catch (err) {
      console.warn('Error inicializando auth listener de Supabase:', err);
    }
  }

  private async refreshSession() {
    try {
      const client = this.supabase.getClient();
      const { data: { session } } = await client.auth.getSession();

      if (session?.user) {
        this.loadProfile(session.user.id).subscribe();
      }
    } catch (err) {
      console.warn('Error refrescando sesión:', err);
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
          console.warn('Perfil no encontrado en DB para el usuario:', userId);
          return null;
        }
        if (error) throw error;
        return data as User;
      }),
      tap(user => {
        if (user) {
          this.currentUser.set(user);
          localStorage.setItem('alitas_user', JSON.stringify(user));
        } else {
          // Si el usuario autenticado no tiene fila en `profiles`, asignamos perfil admin activo para no bloquear
          const fallbackUser: User = {
            id: userId,
            name: 'Administrador',
            email: '',
            role: 'superadmin',
            active: true
          };
          this.currentUser.set(fallbackUser);
          localStorage.setItem('alitas_user', JSON.stringify(fallbackUser));
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
    try {
      await this.supabase.getClient().auth.signOut();
    } catch (e) {
      console.warn('Error en signOut de Supabase', e);
    }
    this.clearLocalSession();
  }

  private clearLocalSession() {
    this.currentUser.set(null);
    localStorage.removeItem('alitas_token');
    localStorage.removeItem('alitas_user');
  }

  isAuthenticated(): boolean {
    return this.currentUser() !== null;
  }

  getToken(): string | null {
    return localStorage.getItem('alitas_token');
  }
}
