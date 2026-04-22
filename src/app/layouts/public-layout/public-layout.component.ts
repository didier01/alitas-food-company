import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { SedeSelectComponent } from '../../shared/components/sede-select/sede-select.component';
import { CartButtonComponent } from '../../shared/components/cart-button/cart-button.component';
import { OrderModeService } from '../../core/services/order-mode.service';
import { OrderModeModalComponent } from '../../shared/components/modals/order-mode-modal/order-mode-modal.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SedeSelectComponent, CartButtonComponent, OrderModeModalComponent],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.scss'
})
export class PublicLayoutComponent implements OnInit {
  menuOpen = false;
  
  private route = inject(ActivatedRoute);
  private orderModeService = inject(OrderModeService);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.orderModeService.initMode(params['modo'] || null);
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
