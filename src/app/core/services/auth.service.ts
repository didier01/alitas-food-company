import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Usuario } from '../models/usuario.model';
import { environment } from '../../../environments/environment';
import { delay, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Signal global del usuario
  currentUser = signal<Usuario | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('alistas_user');
    if (userStr) {
      this.currentUser.set(JSON.parse(userStr));
    }
  }

  login(email: string, password: string): Observable<Usuario> {
    // Simulamos la verificación
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`).pipe(
      map(usuarios => {
        const user = usuarios.find(u => u.email === email && u.activo);
        if (user && password !== '') { // En un escenario real validamos el hash de la contraseña
          return user;
        }
        throw new Error('Credenciales inválidas');
      }),
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('alistas_token', 'mock_jwt_token_123'); // Token mock
        localStorage.setItem('alistas_user', JSON.stringify(user));
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('alistas_token');
    localStorage.removeItem('alistas_user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('alistas_token');
  }

  getToken(): string | null {
    return localStorage.getItem('alistas_token');
  }
}
