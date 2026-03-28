import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VenueMenu } from '../models/venue-menu.model';
import { environment } from '../../../environments/environment';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VenueMenuService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAll(): Observable<VenueMenu[]> {
    return this.http.get<VenueMenu[]>(`${this.apiUrl}/venue-menu`);
  }

  getMenuByVenue(venueId: string): Observable<VenueMenu | undefined> {
    return this.getAll().pipe(
      map(menus => menus.find(m => m.isShared || m.venueId === venueId))
    );
  }

  createVenueMenu(menu: VenueMenu): Observable<VenueMenu> {
    return this.http.post<VenueMenu>(`${this.apiUrl}/venue-menu`, menu);
  }

  shareMenuAcrossAllVenues(menuId: string): Observable<VenueMenu> {
    const updatePayload = {
      isShared: true,
      venueId: 'ALL'
    } as Partial<VenueMenu>;
    return this.http.put<VenueMenu>(`${this.apiUrl}/venue-menu/${menuId}`, updatePayload);
  }

  addRemoveProduct(menuId: string, productIds: string[]): Observable<VenueMenu> {
    return this.http.put<VenueMenu>(`${this.apiUrl}/venue-menu/${menuId}`, { productIds });
  }

  update(menu: VenueMenu): Observable<VenueMenu> {
    return this.http.put<VenueMenu>(`${this.apiUrl}/venue-menu/${menu.id}`, menu);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/venue-menu/${id}`);
  }
}
