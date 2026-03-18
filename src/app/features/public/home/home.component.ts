import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductoService } from '../../../core/services/producto.service';
import { PromocionService } from '../../../core/services/promocion.service';
import { ComboService } from '../../../core/services/combo.service';
import { SeoService } from '../../../core/services/seo.service';
import { SedeService } from '../../../core/services/sede.service';
import { Producto } from '../../../core/models/producto.model';
import { Promocion } from '../../../core/models/promocion.model';
import { Combo } from '../../../core/models/combo.model';
import { ProductoCardComponent } from '../../../shared/components/producto-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { catchError } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductoCardComponent, LoadingSpinnerComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  productoService = inject(ProductoService);
  promocionService = inject(PromocionService);
  comboService = inject(ComboService);
  sedeService = inject(SedeService);

  destacados = signal<Producto[]>([]);
  promociones = signal<Promocion[]>([]);
  combos = signal<Combo[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const sedeId = this.sedeService.selectedSede()?.id || 'ALL';

    forkJoin({
      productos: this.productoService.getAll(),
      promos: this.promocionService.getActivasBySede(sedeId),
      combos: this.comboService.getBySede(sedeId)
    }).pipe(
      catchError(error => {
        console.error('Error loading home data', error);
        return of({ productos: [], promos: [], combos: [] });
      })
    ).subscribe(data => {
      this.destacados.set(data.productos.filter(p => p.destacado && p.disponible).slice(0, 4));
      this.promociones.set(data.promos);
      this.combos.set(data.combos);
      this.loading.set(false);
    });
  }

  pedirCombo(combo: Combo) {
    const phone = this.sedeService.selectedSede()?.whatsapp || '+573000000000';
    const message = encodeURIComponent(`Hola AListas, quiero pedir el combo: ${combo.nombre} por ${combo.precio} COP.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  }
}
