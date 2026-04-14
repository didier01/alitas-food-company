import { Component, OnInit, inject, effect, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService } from '../../../core/services/category.service';
import { ComboService } from '../../../core/services/combo.service';
import { VenueService } from '../../../core/services/venue.service';
import { SeoService } from '../../../core/services/seo.service';
import { Category } from '../../../core/models/category.model';
import { Combo } from '../../../core/models/combo.model';
import { ProductoCardComponent } from '../../../shared/components/product-card/producto-card.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon'; import { TagService, TagGroup } from '../../../core/services/tag.service';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductoCardComponent, EmptyStateComponent, LoadingSpinnerComponent, NzInputModule, NzIconModule, NzDrawerModule, NzButtonModule, NzTagModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  productService = inject(ProductService);
  categoriaService = inject(CategoryService);
  comboService = inject(ComboService);
  venueService = inject(VenueService);
  seoService = inject(SeoService);
  tagService = inject(TagService);

  categories: Category[] = [];
  loading = signal(true);

  // Tags and Filters state
  showFilters = signal(false);
  groupedTags = signal<{ [key: string]: TagGroup[] }>({});
  activeTagsCount = computed(() => this.productService.selectedTags().length);

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
      this.categories = cats.filter(c => c.active).sort((a, b) => a.sort_order - b.sort_order);
      this.productService.loadProductsInSignal(); // Carga real la data a la signal
      this.loadTags();
    });
  }

  loadTags() {
    this.tagService.getAll().subscribe(tags => {
      // Agrupar tags por group_name
      const groups = tags.reduce((acc, tag) => {
        if (!acc[tag.group_name]) {
          acc[tag.group_name] = [];
        }
        acc[tag.group_name].push(tag);
        return acc;
      }, {} as { [key: string]: TagGroup[] });

      this.groupedTags.set(groups);
      this.loading.set(false);
    });
  }

  onSearchChange(term: string) {
    this.productService.searchFilter.set(term);
  }

  setCategoria(catId: string) {
    this.productService.categoryFilter.set(catId);
  }

  openFilters() {
    this.showFilters.set(true);
  }

  closeFilters() {
    this.showFilters.set(false);
  }

  toggleTag(tagId: string) {
    const currentTags = this.productService.selectedTags();
    if (currentTags.includes(tagId)) {
      this.productService.selectedTags.set(currentTags.filter(t => t !== tagId));
    } else {
      this.productService.selectedTags.set([...currentTags, tagId]);
    }
  }

  isTagSelected(tagId: string): boolean {
    return this.productService.selectedTags().includes(tagId);
  }

  clearFilters() {
    this.productService.selectedTags.set([]);
  }

  // Para iterar sobre el objeto de tags agrupados en la vista
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }
}
