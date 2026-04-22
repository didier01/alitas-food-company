import { Component, OnInit, inject, signal, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { OrderService } from '../../../core/services/order.service';
import { VenueService } from '../../../core/services/venue.service';
import { Order, OrderStatus } from '../../../core/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule, NzTableModule, NzTagModule, NzButtonModule,
    NzIconModule, NzDropDownModule, NzModalModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private venueService = inject(VenueService);
  private message = inject(NzMessageService);
  private modal = inject(NzModalService);

  orders = signal<Order[]>([]);
  loading = signal(true);

  statusColors: Record<OrderStatus, string> = {
    'PENDIENTE': 'default',
    'PREPARANDO': 'processing',
    'ENVIADO': 'success',
    'COMPLETADO': 'success',
    'CANCELADO': 'error'
  };

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    const venue = this.venueService.selectedVenue();

    const obs = venue
      ? this.orderService.getByVenue(venue.id)
      : this.orderService.getAll();

    obs.subscribe({
      next: (data) => {
        // Sort by date descending
        this.orders.set(data.sort((a, b) =>
          new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
        ));
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Error cargando pedidos');
        this.loading.set(false);
      }
    });
  }

  updateStatus(order: Order, newStatus: OrderStatus) {
    if (!order.id) return;

    this.orderService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        this.message.success(`Pedido marcado como ${newStatus}`);
        this.orders.update(all => all.map(o => o.id === order.id ? { ...o, status: newStatus } : o));
      },
      error: () => this.message.error('Error al actualizar estado')
    });
  }

  @ViewChild('orderDetailsTpl') orderDetailsTpl!: TemplateRef<any>;
  selectedOrder = signal<Order | null>(null);

  viewDetails(order: Order) {
    console.log('Viewing order details:', order);
    console.log('Order items count:', order.items?.length);
    this.selectedOrder.set(order);
    this.modal.create({
      nzTitle: `Detalles del Pedido #${order.id?.substring(0, 8) || 'Nuevo'}`,
      nzContent: this.orderDetailsTpl,
      nzFooter: null,
      nzWidth: 550,
      nzCentered: true,
      nzClassName: 'order-details-modal-wrapper'
    });
  }
}
