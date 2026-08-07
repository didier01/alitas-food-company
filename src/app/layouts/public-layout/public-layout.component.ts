import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CartButtonComponent } from '../../shared/components/cart-button/cart-button.component';
import { OrderModeService } from '../../core/services/order-mode.service';
import { OrderModeModalComponent } from '../../shared/components/modals/order-mode-modal/order-mode-modal.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, CartButtonComponent, OrderModeModalComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent implements OnInit {
  menuOpen = false;
  
  private route = inject(ActivatedRoute);
  orderModeService = inject(OrderModeService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderModeService.initMode(params['modo'] || null);
    });
  }

  openOrderModeModal() {
    this.orderModeService.openModal();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
