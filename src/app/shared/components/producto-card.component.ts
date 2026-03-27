import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Product } from '../../core/models/product.model';
import { PromocionBadgeComponent } from './promocion-badge.component';
import { VenueService } from '../../core/services/venue.service';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzIconModule, PromocionBadgeComponent],
  templateUrl: './producto-card.component.html',
  styleUrl: './producto-card.component.scss'
})
export class ProductoCardComponent {
  @Input({ required: true }) producto!: Product;
  @Input() isPromo: boolean = false;

  venueService = inject(VenueService);

  pedirWhatsapp() {
    const sede = this.venueService.selectedVenue();
    const phone = sede?.whatsapp || '+573000000000'; // Fallback
    const message = encodeURIComponent(`Hola alitas, me gustaría pedir una ${this.producto.name} por ${this.producto.price} COP.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  }
}
