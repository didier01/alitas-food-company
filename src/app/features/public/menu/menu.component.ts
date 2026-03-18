import { Component, OnInit, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { ComboService } from '../../../core/services/combo.service';
import { SedeService } from '../../../core/services/sede.service';
import { SeoService } from '../../../core/services/seo.service';
import { Categoria } from '../../../core/models/categoria.model';
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
  productoService = inject(ProductoService);
  categoriaService = inject(CategoriaService);
  comboService = inject(ComboService);
  sedeService = inject(SedeService);
  seoService = inject(SeoService);

  categorias: Categoria[] = [];
  loading = signal(true);

  constructor() {
    // Escuchar cambios en la sede seleccionada podría forzar una recarga en una app real, aquí la data la tenemos cargada
    effect(() => {
      // Por ej: si cambia this.sedeService.selectedSede() recargar productos
    });
  }

  ngOnInit() {
    this.seoService.setTags({
      title: 'Menú Completo',
      description: 'Explora el menú completo de AListas Food Company. Filtra por categorías y encuentra tus platos favoritos.',
      route: '/menu'
    });

    // Al iniciar, cargamos todo o filtramos lo que la app permita para Mocks
    this.categoriaService.getAll().subscribe(cats => {
      this.categorias = cats.filter(c => c.activa).sort((a, b) => a.orden - b.orden);
      this.productoService.loadProductosEnSignal(); // Carga real la data a la signal
      this.loading.set(false);
    });
  }

  onSearchChange(term: string) {
    this.productoService.filtroBusqueda.set(term);
  }

  setCategoria(catId: string) {
    this.productoService.filtroCategoria.set(catId);
  }
}
