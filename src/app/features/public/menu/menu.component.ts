import { Component, OnInit, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ComboService } from '../../../core/services/combo.service';
import { VenueService } from '../../../core/services/venue.service';
import { SeoService } from '../../../core/services/seo.service';
import { Category } from '../../../core/models/category.model';
import { Combo } from '../../../core/models/combo.model';
import { ProductoCardComponent } from '../../../shared/components/producto-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductoCardComponent, EmptyStateComponent, LoadingSpinnerComponent, NzInputModule, NzIconModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  productService = inject(ProductService);
  categoriaService = inject(CategoryService);
  comboService = inject(ComboService);
  venueService = inject(VenueService);
  seoService = inject(SeoService);

  categories: Category[] = [];
  loading = signal(true);

  constructor() {
    // Escuchar cambios en la sede seleccionada podría forzar una recarga en una app real, aquí la data la tenemos cargada
    effect(() => {
      console.log('Menu data updated:', this.productService.filteredMenu());
    });
  }

  ngOnInit() {
    this.seoService.setTags({
      title: 'Menú Completo',
      description: 'Explora el menú completo de alitas Food Company. Filtra por categorías y encuentra tus platos favoritos.',
      route: '/menu'
    });

    // Al iniciar, cargamos todo o filtramos lo que la app permita para Mocks
    this.categoriaService.getAll().subscribe(cats => {
      console.log(cats);
      this.categories = cats.filter(c => c.active).sort((a, b) => a.sort_order - b.sort_order);
      this.productService.loadProductsInSignal(); // Carga real la data a la signal
      this.loading.set(false);
    });
  }

  onSearchChange(term: string) {
    this.productService.searchFilter.set(term);
  }

  setCategoria(catId: string) {
    this.productService.categoryFilter.set(catId);
  }
}
