import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { CartButtonComponent } from '../../shared/components/cart-button/cart-button.component';
import { OrderModeService } from '../../core/services/order-mode.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, CartButtonComponent],
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
