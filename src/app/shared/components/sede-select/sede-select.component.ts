import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { VenueService } from '../../../core/services/venue.service';
import { Venue } from '../../../core/models/venue.model';

@Component({
  selector: 'app-sede-select',
  standalone: true,
  imports: [CommonModule, FormsModule, NzSelectModule],
  templateUrl: './sede-select.component.html',
  styleUrl: './sede-select.component.scss'
})
export class SedeSelectComponent implements OnInit {
  venueService = inject(VenueService);
  venues = signal<Venue[]>([]);

  ngOnInit() {
    this.venueService.getAll().subscribe(data => {
      this.venues.set(data.filter(s => s.active));

      // Preseleccionar si no hay nada guardado, usando un microtask para evitar NG0100
      if (!this.venueService.selectedVenue() && this.venues().length > 0) {
        Promise.resolve().then(() => {
          if (!this.venueService.selectedVenue()) {
            this.venueService.setVenue(this.venues()[0]);
          }
        });
      }
    });
  }

  safeSedeId(): string {
    return this.venueService.selectedVenue()?.id || '';
  }

  onSedeChange(venueId: string) {
    const s = this.venues().find((x: Venue) => x.id === venueId);
    if (s) {
      this.venueService.setVenue(s);
    }
  }
}
