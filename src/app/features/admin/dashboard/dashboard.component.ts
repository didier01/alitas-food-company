import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { forkJoin } from 'rxjs';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { SedeService } from '../../../core/services/sede.service';
import { PromocionService } from '../../../core/services/promocion.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NzStatisticModule, NzCardModule, NzGridModule, NzIconModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  productoService = inject(ProductoService);
  categoriaService = inject(CategoriaService);
  sedeService = inject(SedeService);
  promocionService = inject(PromocionService);

  loading = signal(true);
  stats = {
    productos: 0,
    categorias: 0,
    sedes: 0,
    promociones: 0
  };

  ngOnInit() {
    forkJoin({
      prods: this.productoService.getAll(),
      cats: this.categoriaService.getAll(),
      sedes: this.sedeService.getAll(),
      promos: this.promocionService.getAll()
    }).subscribe(data => {
      this.stats.productos = data.prods.length;
      this.stats.categorias = data.cats.length;
      this.stats.sedes = data.sedes.filter(s => s.activa).length;
      this.stats.promociones = data.promos.filter(p => p.activa).length;
      this.loading.set(false);
    });
  }
}
