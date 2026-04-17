import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer';
import { CartService } from '../../../core/services/cart.service';
import { CartDrawerComponent } from './../cart-drawer/cart-drawer.component';


@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [CommonModule, NzBadgeModule, NzButtonModule, NzIconModule, NzDrawerModule],
  templateUrl: './cart-button.component.html',
  styleUrl: './cart-button.component.scss'
})
export class CartButtonComponent {
  cartService = inject(CartService);
  drawerService = inject(NzDrawerService);

  openCart() {
    this.drawerService.create({
      nzTitle: 'Tu Pedido',
      nzContent: CartDrawerComponent,
      nzWidth: 400,
      nzClosable: true
    });
  }
}
