import { Injectable, signal } from '@angular/core';
import { Venue } from '../models/venue.model';
import { BaseSupabaseService } from './base-supabase.service';

@Injectable({
  providedIn: 'root'
})
export class VenueService extends BaseSupabaseService<Venue> {
  protected override table = 'venues';

  // Global signal for the selected venue in the public site
  selectedVenue = signal<Venue | null>(null);

  constructor() {
    super();
    this.initSelectedVenue();
  }

  private initSelectedVenue() {
    const saved = localStorage.getItem('alitas_selected_venue');
    if (saved) {
      try {
        this.selectedVenue.set(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved venue', e);
      }
    }
  }

  setVenue(venue: Venue) {
    this.selectedVenue.set(venue);
    localStorage.setItem('alitas_selected_venue', JSON.stringify(venue));
  }
}
