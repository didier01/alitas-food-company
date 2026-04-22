import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { OptionsListPipe } from '../../../shared/pipes/options-list.pipe';
import { CategoryService } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { VenueService } from '../../../core/services/venue.service';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models/category.model';
import { Product } from '../../../core/models/product.model';
import { Order } from '../../../core/models/order.model';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ProductSelectionModalComponent } from '../../../shared/components/modals/product-selection-modal.component';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule,
    NzButtonModule, NzIconModule,
    NzCardModule, NzTabsModule, NzInputModule,
    NzDividerModule, OptionsListPipe, NzEmptyModule, NzModalModule],
  templateUrl: './pos.component.html',
  styleUrl: './pos.component.scss'
})
export class PosComponent implements OnInit {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  venueService = inject(VenueService);
  categoryService = inject(CategoryService);
  productService = inject(ProductService);
  message = inject(NzMessageService);
  modalService = inject(NzModalService);

  categories = signal<Category[]>([]);
  activeCategoryId = signal<string>('');

  // POS Order form
  mesaNumber = '';
  customerName = '';
  notes = '';
  isSaving = false;
  
  showMobileComanda = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.categoryService.getAll().subscribe({
      next: (cats) => {
        const activeCats = cats.filter(c => c.active).sort((a, b) => a.sort_order - b.sort_order);
        this.categories.set(activeCats);
        if (activeCats.length > 0) {
          this.setCategory(activeCats[0].id!);
        }
        // Load products AND combos simultaneously into the service signals
        this.productService.loadProductsInSignal();
      }
    });
  }

  setCategory(id: string) {
    this.activeCategoryId.set(id);
    this.productService.categoryFilter.set(id);
  }

  get searchTerm(): string {
    return this.productService.searchFilter();
  }

  set searchTerm(value: string) {
    this.productService.searchFilter.set(value);
  }

  getFilteredProducts() {
    return this.productService.filteredMenu();
  }

  // Add a product directly to cart (no modal for now, just auto-select options or omit if complex)
  // In a robust POS, this would open a modifier selector. For the MVP, we add base product.
  addProductToCart(product: Product) {
    if (product.modifier_groups && product.modifier_groups.length > 0) {
      const modal = this.modalService.create({
        nzTitle: `Personalizar ${product.name}`,
        nzContent: ProductSelectionModalComponent,
        nzData: { product: product },
        nzFooter: null,
        nzWidth: 500,
        nzClassName: 'dark-modal'
      });

      const instance = modal.getContentComponent();
      instance.product = product;
    } else {
      this.cartService.addItem(product, [], 1);
      this.message.success(`${product.name} agregado a la comanda`);
    }
  }

  submitOrder() {
    if (!this.mesaNumber.trim()) {
      this.message.warning('Debes ingresar un Número de Mesa o Localizador');
      return;
    }

    if (this.cartService.items().length === 0) {
      this.message.warning('La comanda está vacía');
      return;
    }

    const venueId = this.venueService.selectedVenue()?.id;
    if (!venueId) {
      this.message.error('Asegúrate de tener una Sede seleccionada activa');
      return;
    }

    this.isSaving = true;

    const order: Order = {
      venue_id: venueId,
      customer_name: this.customerName || 'Cliente Local',
      delivery_address: `Mesa: ${this.mesaNumber} ${this.notes ? '| Notas: ' + this.notes : ''}`,
      customer_phone: '',
      total_amount: this.cartService.totalAmount(),
      status: 'PENDIENTE',
      items: this.cartService.items().map(item => {
        const prod = item.product as any;
        return {
          product_id: prod.isCombo ? null : prod.id,
          product_name: prod.name,
          quantity: item.quantity,
          unit_price: prod.price,
          subtotal: item.totalPrice,
          options_json: item.selectedOptions
        };
      })
    };

    this.orderService.createOrder(order).subscribe({
      next: () => {
        this.message.success(`¡Orden para la Mesa ${this.mesaNumber} enviada a cocina!`);
        this.cartService.clearCart();
        this.mesaNumber = '';
        this.customerName = '';
        this.notes = '';
        this.isSaving = false;
        this.showMobileComanda = false;
      },
      error: () => {
        this.message.error('Error al enviar la comanda a cocina');
        this.isSaving = false;
      }
    });
  }
}
