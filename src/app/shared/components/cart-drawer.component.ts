import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { CartService } from '../../core/services/cart.service';
import { VenueService } from '../../core/services/venue.service';
import { OrderService } from '../../core/services/order.service';
import { OptionsListPipe } from '../pipes/options-list.pipe';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Order } from '../../core/models/order.model';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzIconModule, NzListModule, NzEmptyModule, OptionsListPipe, NzFormModule, NzInputModule, FormsModule],
  template: `
    <div class="cart-container">
      @if (cartService.items().length === 0) {
        <nz-empty nzNotFoundImage="simple" nzNotFoundContent="Tu carrito está vacío"></nz-empty>
      } @else {
        <div class="cart-items">
          @for (item of cartService.items(); track item.id) {
            <div class="cart-item">
              <div class="item-info">
                <span class="item-name">{{ item.product.name }}</span>
                <span class="item-options" *ngIf="item.selectedOptions.length > 0">
                  {{ item.selectedOptions | optionsList }}
                </span>
                <span class="item-price">{{ item.totalPrice | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
              </div>
              <div class="item-actions">
                <button nz-button nzSize="small" nzType="text" (click)="cartService.updateQuantity(item.id, -1)">
                  <span nz-icon nzType="minus"></span>
                </button>
                <span class="qty">{{ item.quantity }}</span>
                <button nz-button nzSize="small" nzType="text" (click)="cartService.updateQuantity(item.id, 1)">
                  <span nz-icon nzType="plus"></span>
                </button>
                <button nz-button nzSize="small" nzType="text" nzDanger (click)="cartService.removeItem(item.id)" class="del-btn">
                  <span nz-icon nzType="delete"></span>
                </button>
              </div>
            </div>
          }
        </div>

        <div class="cart-footer">
          <div class="customer-form">
            <h4>Datos de Entrega</h4>
            <div class="form-group">
              <input nz-input placeholder="Tu Nombre" [(ngModel)]="customerName" />
            </div>
            <div class="form-group">
              <input nz-input placeholder="Mesa o Dirección" [(ngModel)]="deliveryAddress" />
            </div>
          </div>

          <div class="summary">
            <div class="summary-line">
              <span>Subtotal</span>
              <span>{{ cartService.totalAmount() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            </div>
            <div class="summary-line total">
              <span>Total a Pagar</span>
              <span>{{ cartService.totalAmount() | currency:'COP':'symbol-narrow':'1.0-0' }}</span>
            </div>
          </div>
          
          <button nz-button nzType="primary" nzBlock class="btn-whatsapp" [nzLoading]="isSaving" (click)="checkout()">
            <span nz-icon nzType="whatsapp"></span>
            Confirmar y Enviar Pedido
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .cart-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .cart-items {
      flex: 1;
      overflow-y: auto;
    }
    .cart-item {
      display: flex;
      justify-content: space-between;
      padding: 16px 0;
      border-bottom: 1px solid #333;
    }
    .item-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .item-name {
      font-weight: 600;
      color: #fff;
    }
    .item-options {
      font-size: 0.8rem;
      color: #888;
    }
    .item-price {
      color: var(--primary-color);
      font-weight: 500;
      margin-top: 4px;
    }
    .item-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .qty {
      font-weight: bold;
      color: #fff;
      min-width: 20px;
      text-align: center;
    }
    .del-btn {
      margin-left: 8px;
    }
    .cart-footer {
      padding-top: 20px;
      border-top: 1px solid #444;
    }
    .summary-line {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      color: #aaa;
    }
    .summary-line.total {
      font-size: 1.2rem;
      font-weight: bold;
      color: #fff;
      margin-top: 12px;
      margin-bottom: 16px;
    }
    .customer-form {
        margin-bottom: 20px;
        h4 {
            color: #ccc;
            margin-bottom: 10px;
            font-size: 0.9rem;
            text-transform: uppercase;
        }
        .form-group {
            margin-bottom: 8px;
        }
        input {
            background: rgba(255,255,255,0.05);
            border: 1px solid #444;
            color: white;
            &::placeholder {
                color: #666;
            }
        }
    }
    .btn-whatsapp {
      height: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      background: #25D366;
      border-color: #25D366;
    }
    .btn-whatsapp:hover {
      background: #128C7E;
      border-color: #128C7E;
    }
  `]
})
export class CartDrawerComponent {
  cartService = inject(CartService);
  venueService = inject(VenueService);
  orderService = inject(OrderService);
  message = inject(NzMessageService);
  drawerRef = inject(NzDrawerRef);

  customerName = '';
  deliveryAddress = '';
  isSaving = false;

  checkout() {
    if (!this.customerName || !this.deliveryAddress) {
      this.message.warning('Por favor completa tu nombre y dirección/mesa');
      return;
    }

    const venue = this.venueService.selectedVenue();
    if (!venue) {
      this.message.error('Por favor selecciona una sede primero');
      return;
    }

    this.isSaving = true;

    // Build the order object for the DB
    const order: Order = {
      venue_id: venue.id,
      customer_name: this.customerName,
      delivery_address: this.deliveryAddress,
      total_amount: this.cartService.totalAmount(),
      status: 'PENDIENTE',
      items: this.cartService.items().map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.product.price, // Base price
        subtotal: item.totalPrice,
        options_json: item.selectedOptions
      }))
    };

    // Save to Database
    this.orderService.createOrder(order).subscribe({
      next: () => {
        // Prepare WhatsApp message
        const phone = venue.whatsapp || '+573000000000';
        const msg = this.cartService.generateWhatsAppMessage(
            venue.name, 
            this.customerName, 
            this.deliveryAddress
        );
        
        window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
        
        this.cartService.clearCart();
        this.isSaving = false;
        this.message.success('Pedido registrado correctamente');
        this.drawerRef.close();
      },
      error: (err) => {
        console.error('Error saving order:', err);
        this.message.error('Hubo un error al guardar tu pedido. Por favor intenta de nuevo.');
        this.isSaving = false;
      }
    });
  }
}


