import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzDrawerRef } from 'ng-zorro-antd/drawer';
import { CartService } from '../../../core/services/cart.service';
import { VenueService } from '../../../core/services/venue.service';
import { OrderService } from '../../../core/services/order.service';
import { OrderModeService } from '../../../core/services/order-mode.service';
import { OptionsListPipe } from '../../pipes/options-list.pipe';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormsModule } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Order } from '../../../core/models/order.model';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { AnalyticsService } from '../../../core/services/analytics.service';


@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule,
    NzButtonModule, NzIconModule,
    NzListModule, NzEmptyModule,
    OptionsListPipe, NzFormModule,
    NzInputModule, FormsModule,
    NzDividerModule],
  templateUrl: './cart-drawer.component.html',
  styleUrls: ['./cart-drawer.component.scss']
})
export class CartDrawerComponent implements OnInit {
  cartService = inject(CartService);
  venueService = inject(VenueService);
  orderService = inject(OrderService);
  orderModeService = inject(OrderModeService);
  message = inject(NzMessageService);
  drawerRef = inject(NzDrawerRef);
  analyticsService = inject(AnalyticsService);

  customerName = '';
  deliveryAddress = '';
  customer_phone = '';
  shippingPrice = 4000;
  isSaving = false;

  ngOnInit() {
    this.analyticsService.trackViewSelectionSummary(this.cartService.count(), this.cartService.totalAmount());
  }

  close() {
    this.drawerRef.close();
  }

  checkout() {
    if (!this.customerName || !this.deliveryAddress || !this.customer_phone) {
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
      customer_phone: this.customer_phone,
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

    // Save to Database
    this.orderService.createOrder(order).subscribe({
      next: () => {
        // Prepare WhatsApp message
        const phone = venue.whatsapp || '+573000000000';
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const msg = this.cartService.generateWhatsAppMessage(
          venue.name,
          this.customerName,
          this.deliveryAddress,
          this.customer_phone
        );

        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');

        this.isSaving = false;
        this.message.success('¡Pedido registrado! Tu selección estará guardada en tu carrito.');
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


