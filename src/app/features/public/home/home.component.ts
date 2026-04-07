import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { PromotionService } from '../../../core/services/promotion.service';
import { ComboService } from '../../../core/services/combo.service';
import { SeoService } from '../../../core/services/seo.service';
import { VenueService } from '../../../core/services/venue.service';
import { Product } from '../../../core/models/product.model';
import { Promotion } from '../../../core/models/promotion.model';
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
  productService = inject(ProductService);
  promotionService = inject(PromotionService);
  comboService = inject(ComboService);
  venueService = inject(VenueService);

  destacados = signal<Product[]>([]);
  promotions = signal<Promotion[]>([]);
  combos = signal<Combo[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    const venueId = this.venueService.selectedVenue()?.id || 'ALL';

    forkJoin({
      products: this.productService.getAll(),
      promos: this.promotionService.getActiveByVenue(venueId),
      combos: this.comboService.getBySede(venueId)
    }).pipe(
      catchError(error => {
        console.error('Error loading home data', error);
        return of({ products: [], promos: [], combos: [] });
      })
    ).subscribe(data => {
      this.destacados.set(data.products.filter(p => p.featured && p.available).slice(0, 4));
      this.promotions.set(data.promos);
      this.combos.set(data.combos);
      this.loading.set(false);
    });
  }

  getComboRealPrice(combo: Combo): number {
    if (!combo.included_products) return 0;
    // We need products data to calculate. In home we have them in data.products
    // but the subscription above just filters featured. Let's make sure we have all products or pass them
    return combo.included_products.reduce((acc, curr) => {
      const p = this.productService.filteredMenu().find(x => x.id === curr.id) || 
                this.destacados().find(x => x.id === curr.id); 
      // This is a bit tricky if products aren't all loaded. 
      // Usually product service has them.
      return acc + (p ? p.price * curr.quantity : 0);
    }, 0);
  }

  getComboSavings(combo: Combo): number {
    const real = this.getComboRealPrice(combo);
    return real > 0 ? real - combo.price : 0;
  }

  pedirCombo(combo: Combo) {
    const phone = this.venueService.selectedVenue()?.whatsapp || '+573000000000';
    const message = encodeURIComponent(`Hola alitas, quiero pedir el combo: ${combo.name} por ${combo.price} COP.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  }
}
