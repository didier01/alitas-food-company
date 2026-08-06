import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Product } from '../../../core/models/product.model';
import { PromocionBadgeComponent } from '../promotion-badge/promocion-badge.component';
import { VenueService } from '../../../core/services/venue.service';
import { ProductSelectionModalComponent } from './../modals/product-selection-modal.component';
import { CartService } from '../../../core/services/cart.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AnalyticsService } from '../../../core/services/analytics.service';


@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzIconModule, NzModalModule, PromocionBadgeComponent],
  templateUrl: './producto-card.component.html',
  styleUrl: './producto-card.component.scss'
})
export class ProductoCardComponent {
  @Input({ required: true }) producto!: Product;
  @Input() isPromo: boolean = false;

  venueService = inject(VenueService);
  modalService = inject(NzModalService);
  cartService = inject(CartService);
  message = inject(NzMessageService);
  analyticsService = inject(AnalyticsService);

  addToCartDirectly() {
    if (this.producto.modifier_groups && this.producto.modifier_groups.length > 0) {
      this.openSelectionModal();
    } else {
      this.cartService.addItem(this.producto, []);
      this.analyticsService.trackAddToSelection(this.producto.name, this.producto.price);
      this.message.success(`${this.producto.name} añadido al carrito`);
    }
  }

  openSelectionModal() {
    this.analyticsService.trackProductClick(this.producto.name, '', this.producto.price);

    const modal = this.modalService.create({
      nzTitle: `Personalizar ${this.producto.name}`,
      nzContent: ProductSelectionModalComponent,
      nzData: { product: this.producto },
      nzFooter: null,
      nzWidth: 440,
      nzClassName: 'dark-modal'
    });

    const instance = modal.getContentComponent();
    instance.product = this.producto;
  }
}
