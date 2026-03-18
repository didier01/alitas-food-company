import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Producto } from '../../core/models/producto.model';
import { PromocionBadgeComponent } from './promocion-badge.component';
import { SedeService } from '../../core/services/sede.service';

@Component({
  selector: 'app-producto-card',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzButtonModule, NzIconModule, PromocionBadgeComponent],
    templateUrl: './producto-card.component.html',
    styleUrl: './producto-card.component.scss'
})
export class ProductoCardComponent {
  @Input({ required: true }) producto!: Producto;
  @Input() isPromo: boolean = false;
  
  sedeService = inject(SedeService);

  pedirWhatsapp() {
    const sede = this.sedeService.selectedSede();
    const phone = sede?.whatsapp || '+573000000000'; // Fallback
    const message = encodeURIComponent(`Hola AListas, me gustaría pedir una ${this.producto.nombre} por ${this.producto.precio} COP.`);
    window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
  }
}
