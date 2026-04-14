import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { forkJoin } from 'rxjs';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { VenueService } from '../../../core/services/venue.service';
import { PromotionService } from '../../../core/services/promotion.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NzStatisticModule, NzCardModule, NzGridModule, NzIconModule, LoadingSpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  venueService = inject(VenueService);
  promotionService = inject(PromotionService);

  loading = signal(true);
  stats = {
    productos: 0,
    categorias: 0,
    sedes: 0,
    promociones: 0
  };

  ngOnInit() {
    forkJoin({
      prods: this.productService.getAll(),
      cats: this.categoryService.getAll(),
      sedes: this.venueService.getAll(),
      promos: this.promotionService.getAll()
    }).subscribe(data => {
      this.stats.productos = data.prods.length;
      this.stats.categorias = data.cats.length;
      this.stats.sedes = data.sedes.filter(s => s.active).length;
      this.stats.promociones = data.promos.filter(p => p.active).length;
      this.loading.set(false);
    });
  }
}
