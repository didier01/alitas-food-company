import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzMessageService } from 'ng-zorro-antd/message';
import { VenueMenuService } from '../../../core/services/venue-menu.service';
import { VenueService } from '../../../core/services/venue.service';
import { VenueMenu } from '../../../core/models/venue-menu.model';
import { Venue } from '../../../core/models/venue.model';
import { forkJoin } from 'rxjs';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-venue-menus',
  standalone: true,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzIconModule, NzTagModule, LoadingSpinnerComponent, NzTooltipModule],
  templateUrl: './venue-menus.component.html',
  styleUrl: './venue-menus.component.scss'
})
export class VenueMenusComponent implements OnInit {
  venueMenuService = inject(VenueMenuService);
  venueService = inject(VenueService);
  message = inject(NzMessageService);

  menus: VenueMenu[] = [];
  venues: Venue[] = [];
  menusSedesMap: { menu: VenueMenu }[] = [];
  loading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      menus: this.venueMenuService.getAll(),
      venues: this.venueService.getAll()
    }).subscribe({
      next: (data) => {
        this.menus = data.menus;
        this.venues = data.venues;
        this.menusSedesMap = this.menus.map(m => ({ menu: m }));
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Error cargando menús');
        this.loading.set(false);
      }
    });
  }

  getSedeName(venueId: string): string {
    const sede = this.venues.find(s => s.id === venueId);
    return sede ? sede.name : 'Venue Desconocida';
  }

  shareGlobal(menu: VenueMenu) {
    this.venueMenuService.shareMenuAcrossAllVenues(menu.id).subscribe(() => {
      this.message.success('Menú compartido a todas las venues exitosamente.');
      this.loadData();
    });
  }
}
