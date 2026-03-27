import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VenueService } from '../../../core/services/venue.service';
import { SeoService } from '../../../core/services/seo.service';
import { Venue } from '../../../core/models/venue.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, NzIconModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  seoService = inject(SeoService);
  venueService = inject(VenueService);
  sanitizer = inject(DomSanitizer);

  venues: Venue[] = [];
  loading = signal(true);

  ngOnInit() {
    this.seoService.setTags({
      title: 'Sobre Nosotros',
      description: 'Conoce la historia detrás de alitas Food Company y encuentra la sede más cercana a ti.',
      route: '/about'
    });

    this.venueService.getAll().subscribe(res => {
      this.venues = res.filter(s => s.active);
      this.loading.set(false);
    });
  }

  getMapUrl(sede: Venue): SafeResourceUrl {
    // Generar url segura usando coordinates simples para OSM o google as mock
    const url = `https://maps.google.com/maps?q=${sede.coordinates.lat},${sede.coordinates.lng}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
