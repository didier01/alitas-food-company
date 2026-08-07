import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { OrderModeService } from '../../../../core/services/order-mode.service';

@Component({
  selector: 'app-order-mode-modal',
  standalone: true,
  imports: [CommonModule, NzIconModule],
  templateUrl: './order-mode-modal.component.html',
  styleUrl: './order-mode-modal.component.scss'
})
export class OrderModeModalComponent {
  orderModeService = inject(OrderModeService);

  isModalOpen = this.orderModeService.isModalOpen;
  currentMode = this.orderModeService.mode;
  isLeaving = false;

  selectMode(modeType: 'delivery' | 'dine-in') {
    this.isLeaving = true;
    setTimeout(() => {
      this.orderModeService.setMode(modeType);
      this.isLeaving = false;
    }, 300);
  }

  closeModal() {
    this.orderModeService.closeModal();
  }
}
