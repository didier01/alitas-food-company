import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';
import { delay, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Signal global del usuario
  currentUser = signal<User | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userStr = localStorage.getItem('alitas_user');
    if (userStr) {
      this.currentUser.set(JSON.parse(userStr));
    }
  }

  login(email: string, password: string): Observable<User> {
    // Simulamos la verificación
    return this.http.get<User[]>(`${this.apiUrl}/users`).pipe(
      map(usuarios => {
        const user = usuarios.find(u => u.email === email && u.active);
        if (user && password !== '') { // En un escenario real validamos el hash de la contraseña
          return user;
        }
        throw new Error('Credenciales inválidas');
      }),
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('alitas_token', 'mock_jwt_token_123'); // Token mock
        localStorage.setItem('alitas_user', JSON.stringify(user));
      })
    );
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('alitas_token');
    localStorage.removeItem('alitas_user');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('alitas_token');
  }

  getToken(): string | null {
    return localStorage.getItem('alitas_token');
  }
}
