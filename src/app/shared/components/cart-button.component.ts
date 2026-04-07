import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule, NzDrawerService } from 'ng-zorro-antd/drawer';
import { CartService } from '../../core/services/cart.service';
import { CartDrawerComponent } from './cart-drawer.component';


@Component({
  selector: 'app-cart-button',
  standalone: true,
  imports: [CommonModule, NzBadgeModule, NzButtonModule, NzIconModule, NzDrawerModule],
  template: `
    <div class="floating-cart" *ngIf="cartService.count() > 0">
      <nz-badge [nzCount]="cartService.count()" [nzOffset]="[-5, 5]">
        <button nz-button nzType="primary" nzShape="circle" class="cart-btn" (click)="openCart()">
          <span nz-icon nzType="shopping-cart" nzTheme="outline"></span>
        </button>
      </nz-badge>
    </div>
  `,
  styles: [`
    .floating-cart {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }
    .cart-btn {
      width: 60px;
      height: 60px;
      font-size: 24px;
      box-shadow: 0 4px 15px rgba(255, 122, 0, 0.4);
      border: none;
      background: linear-gradient(135deg, #FF7A00 0%, #FF4D00 100%);
    }
    ::ng-deep .ant-badge-count {
        background: #fff;
        color: #FF4D00;
        font-weight: bold;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
  `]
})
export class CartButtonComponent {
  cartService = inject(CartService);
  drawerService = inject(NzDrawerService);

  openCart() {
    this.drawerService.create({
      nzTitle: 'Tu Pedido 🍗',
      nzContent: CartDrawerComponent,
      nzWidth: 400,
      nzClosable: true
    });
  }
}
