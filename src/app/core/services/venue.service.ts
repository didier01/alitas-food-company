import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Venue } from '../models/venue.model';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VenueService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Global signal for the selected venue in the public site
  selectedVenue = signal<Venue | null>(null);

  constructor() {
    this.initSelectedVenue();
  }

  private initSelectedVenue() {
    const saved = localStorage.getItem('alitas_selected_venue');
    if (saved) {
      this.selectedVenue.set(JSON.parse(saved));
    }
  }

  setVenue(venue: Venue) {
    this.selectedVenue.set(venue);
    localStorage.setItem('alitas_selected_venue', JSON.stringify(venue));
  }

  getAll(): Observable<Venue[]> {
    return this.http.get<Venue[]>(`${this.apiUrl}/venues`);
  }

  getById(id: string): Observable<Venue> {
    return this.http.get<Venue>(`${this.apiUrl}/venues/${id}`);
  }

  create(venue: Venue): Observable<Venue> {
    return this.http.post<Venue>(`${this.apiUrl}/venues`, venue);
  }

  update(venue: Venue): Observable<Venue> {
    return this.http.put<Venue>(`${this.apiUrl}/venues/${venue.id}`, venue);
  }
}
