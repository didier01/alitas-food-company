import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { Product } from '../../../core/models/product.model';
import { PromocionBadgeComponent } from './../promocion-badge.component';
import { VenueService } from '../../../core/services/venue.service';
import { ProductSelectionModalComponent } from './../modals/product-selection-modal.component';
import { CartService } from '../../../core/services/cart.service';
import { NzMessageService } from 'ng-zorro-antd/message';

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

  addToCartDirectly() {
    if (this.producto.modifier_groups && this.producto.modifier_groups.length > 0) {
      this.openSelectionModal();
    } else {
      this.cartService.addItem(this.producto, []);
      this.message.success(`${this.producto.name} añadido al carrito`);
    }
  }

  openSelectionModal() {
    const modal = this.modalService.create({
      nzTitle: `Personalizar ${this.producto.name}`,
      nzContent: ProductSelectionModalComponent,
      nzData: { product: this.producto }, // NZ-ZORRO 17+ uses nzData, but we can also use componentParams in older versions
      nzFooter: null,
      nzWidth: 500,
      nzClassName: 'dark-modal' // Optional: if we have dark theme classes
    });

    // Handle data passing for standalone components manually if nzData is not enough
    const instance = modal.getContentComponent();
    instance.product = this.producto;
  }
}
