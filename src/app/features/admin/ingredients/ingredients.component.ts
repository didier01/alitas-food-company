import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { IngredientService } from '../../../core/services/ingredient.service';
import { Ingredient } from '../../../core/models/ingredient.model';
import { ProductService } from '../../../core/services/product.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-ingredients',
  standalone: true,
  imports: [CommonModule, FormsModule, NzTableModule, NzSwitchModule, LoadingSpinnerComponent],
  template: `
    <div class="page-container">
      <div class="page-header">
        <h2>Inventario de Ingredientes (Stock Global)</h2>
        <p>Controla la disponibilidad de ingredientes en todos los productos simultáneamente.</p>
      </div>

      <app-loading-spinner [show]="loading()"></app-loading-spinner>

      <nz-table #basicTable [nzData]="ingredients" [nzLoading]="loading()" nzSize="middle" *ngIf="!loading()">
        <thead>
          <tr>
            <th>Ingrediente / Adición</th>
            <th nzWidth="150px">Estado de Stock</th>
            <th>Impacto</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let data of basicTable.data">
            <td>
              <span style="font-weight: 600; font-size: 1rem;">{{ data.name }}</span>
            </td>
            <td>
              <nz-switch 
                [(ngModel)]="data.available" 
                (ngModelChange)="toggleStock(data)"
                [nzCheckedChildren]="checkedTemplate"
                [nzUnCheckedChildren]="unCheckedTemplate">
              </nz-switch>
              <ng-template #checkedTemplate><span nz-icon nzType="check"></span></ng-template>
              <ng-template #unCheckedTemplate><span nz-icon nzType="close"></span></ng-template>
            </td>
            <td>
              <span [style.color]="data.available ? '#52c41a' : '#ff4d4f'">
                {{ data.available ? 'Visible en el menú' : 'AGOTADO - Oculto en todo el menú' }}
              </span>
            </td>
          </tr>
        </tbody>
      </nz-table>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
    }
    .page-header {
      margin-bottom: 24px;
    }
    .page-header h2 {
      margin: 0;
      color: var(--admin-text-primary);
    }
    .page-header p {
      color: var(--admin-text-secondary);
      margin-top: 4px;
    }
  `]
})
export class IngredientsComponent implements OnInit {
  ingredientService = inject(IngredientService);
  productService = inject(ProductService);
  message = inject(NzMessageService);

  ingredients: Ingredient[] = [];
  loading = signal(true);

  ngOnInit() {
    this.loadIngredients();
  }

  loadIngredients() {
    this.loading.set(true);
    this.ingredientService.getAll().subscribe({
      next: (data) => {
        this.ingredients = [...data];
        this.loading.set(false);
      },
      error: () => {
        this.message.error('Error al cargar ingredientes');
        this.loading.set(false);
      }
    });
  }

  toggleStock(ing: Ingredient) {
    this.ingredientService.update(ing).subscribe({
      next: () => {
        this.message.success(`${ing.name} marcado como ${ing.available ? 'disponible' : 'AGOTADO'}`);
        // Refresh the public signals if they are in the same memory context (for dev)
        this.productService.allIngredients.set([...this.ingredients]);
      },
      error: () => {
        this.message.error('Error al actualizar stock');
        ing.available = !ing.available; // Rollback
      }
    });
  }
}
