import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SedeService } from '../../../core/services/sede.service';
import { SeoService } from '../../../core/services/seo.service';
import { Sede } from '../../../core/models/sede.model';
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
  sedeService = inject(SedeService);
  sanitizer = inject(DomSanitizer);

  sedes: Sede[] = [];
  loading = signal(true);

  ngOnInit() {
    this.seoService.setTags({
      title: 'Sobre Nosotros',
      description: 'Conoce la historia detrás de AListas Food Company y encuentra la sede más cercana a ti.',
      route: '/about'
    });

    this.sedeService.getAll().subscribe(res => {
      this.sedes = res.filter(s => s.activa);
      this.loading.set(false);
    });
  }

  getMapUrl(sede: Sede): SafeResourceUrl {
    // Generar url segura usando coordinates simples para OSM o google as mock
    const url = `https://maps.google.com/maps?q=${sede.coordenadas.lat},${sede.coordenadas.lng}&z=15&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
