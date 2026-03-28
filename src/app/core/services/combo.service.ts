import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Combo } from '../models/combo.model';
import { environment } from '../../../environments/environment';
import { Observable, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComboService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private storageKey = 'alitas_mock_combos';

  getAll(): Observable<Combo[]> {
    return this.http.get<Combo[]>(`${this.apiUrl}/combos`);
  }

  getBySede(venueId: string): Observable<Combo[]> {
    return this.getAll().pipe(
      map(combos => combos.filter(c => c.active && (c.venueIds.includes('TODAS') || c.venueIds.includes(venueId))))
    );
  }

  create(combo: Combo): Observable<Combo> {
    return this.http.post<Combo>(`${this.apiUrl}/combos`, combo);
  }

  update(combo: Combo): Observable<Combo> {
    return this.http.put<Combo>(`${this.apiUrl}/combos/${combo.id}`, combo);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/combos/${id}`);
  }
}
