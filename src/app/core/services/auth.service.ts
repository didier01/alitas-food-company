import { Injectable, signal, inject } from '@angular/core';
import { User } from '../models/user.model';
import { map, Observable, tap } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userService = inject(UserService);

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
    return this.userService.getAll().pipe(
      map(usuarios => {
        const user = usuarios.find(u => u.email === email && u.active);
        if (user && password !== '') { 
          return user;
        }
        throw new Error('Credenciales inválidas');
      }),
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('alitas_token', 'mock_jwt_token_123'); 
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
