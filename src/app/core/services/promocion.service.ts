import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Promocion } from '../models/promocion.model';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PromocionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<Promocion[]> {
    return this.http.get<Promocion[]>(`${this.apiUrl}/promociones`);
  }

  getActivasBySede(sedeId: string): Observable<Promocion[]> {
    return this.getAll().pipe(
      map(promos => promos.filter(p => p.activa && (p.sedeIds.includes('ALL') || p.sedeIds.includes(sedeId))))
    );
  }

  create(promocion: Promocion): Observable<Promocion> {
    return this.http.post<Promocion>(`${this.apiUrl}/promociones`, promocion);
  }

  update(promocion: Promocion): Observable<Promocion> {
    return this.http.put<Promocion>(`${this.apiUrl}/promociones/${promocion.id}`, promocion);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/promociones/${id}`);
  }
}
