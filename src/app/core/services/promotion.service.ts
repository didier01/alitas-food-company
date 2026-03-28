import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Promotion } from '../models/promotion.model';
import { environment } from '../../../environments/environment';
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private storageKey = 'alitas_mock_promotions';

  getAll(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.apiUrl}/promociones`);
  }

  getActiveByVenue(venueId: string): Observable<Promotion[]> {
    return this.getAll().pipe(
      map(promos => promos.filter(p => p.active && (p.venueIds.includes('ALL') || p.venueIds.includes(venueId))))
    );
  }

  create(promotion: Promotion): Observable<Promotion> {
    return this.http.post<Promotion>(`${this.apiUrl}/promociones`, promotion);
  }

  update(promotion: Promotion): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.apiUrl}/promociones/${promotion.id}`, promotion);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/promociones/${id}`);
  }
}
