import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promocion-badge',
  standalone: true,
  imports: [CommonModule],
    templateUrl: './promocion-badge.component.html',
    styleUrl: './promocion-badge.component.scss'
})
export class PromocionBadgeComponent {
  @Input() texto = 'PROMO';
  @Input() animar = true;
}
