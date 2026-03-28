import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { ComboService } from '../../../core/services/combo.service';
import { ProductService } from '../../../core/services/product.service';
import { VenueService } from '../../../core/services/venue.service';
import { Combo } from '../../../core/models/combo.model';
import { Product } from '../../../core/models/product.model';
import { Venue } from '../../../core/models/venue.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-combos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzSwitchModule, NzSelectModule, NzPopconfirmModule, NzTagModule, NzAlertModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './combos.component.html',
  styleUrl: './combos.component.scss'
})
export class CombosComponent implements OnInit {
  comboService = inject(ComboService);
  productService = inject(ProductService);
  venueService = inject(VenueService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  combos: Combo[] = [];
  products: Product[] = [];
  venues: Venue[] = [];
  loadingData = signal(true);
  loadingAction = signal(false);
  modalVisible = false;
  editingId: string | null = null;
  comboForm: FormGroup;

  constructor() {
    this.comboForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(100)]],
      includedProducts: [[], Validators.required],
      venueIds: [['TODAS']],
      active: [true],
      showSavings: [true],
      imageUrl: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadingData.set(true);
    forkJoin({
      combos: this.comboService.getAll(),
      products: this.productService.getAll(),
      venues: this.venueService.getAll()
    }).subscribe({
      next: (data) => {
        console.log(data);
        this.combos = data.combos;
        this.products = data.products;
        this.venues = data.venues;
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error cargando combos');
        this.loadingData.set(false);
      }
    });
  }

  getSedeName(id: string): string {
    const s = this.venues.find(x => x.id === id);
    return s ? s.name : id;
  }

  getRealPrice(includedList: any[]): number {
    if (!includedList || !this.products.length) return 0;
    return includedList.reduce((acc, curr) => {
      const id = typeof curr === 'string' ? curr : curr.id;
      const q = typeof curr === 'string' ? 1 : curr.quantity;
      const p = this.products.find(x => x.id === id);
      return acc + (p ? p.price * q : 0);
    }, 0);
  }

  getFormRealPrice(): number {
    const includedIds = this.comboForm.get('includedProducts')?.value || [];
    return this.getRealPrice(includedIds);
  }

  getFormSavings(): number {
    const realPrice = this.getFormRealPrice();
    const specialPrice = this.comboForm.get('price')?.value || 0;
    return realPrice - specialPrice;
  }

  getFormSavingsPercent(): number {
    const realPrice = this.getFormRealPrice();
    if (realPrice === 0) return 0;
    const savings = realPrice - (this.comboForm.get('price')?.value || 0);
    return Math.max(0, Math.round((savings / realPrice) * 100));
  }

  getComboRealPrice(combo: Combo): number {
    return this.getRealPrice(combo.includedProducts);
  }

  getComboSavings(combo: Combo): number {
    return this.getComboRealPrice(combo) - combo.price;
  }

  openModal() {
    this.editingId = null;
    this.comboForm.reset({ active: true, showSavings: true, price: 0, venueIds: ['TODAS'], includedProducts: [] });
    this.modalVisible = true;
  }

  editCombo(combo: Combo) {
    this.editingId = combo.id;
    this.comboForm.patchValue({
      name: combo.name,
      description: combo.description,
      price: combo.price,
      includedProducts: combo.includedProducts?.map(p => p.id), // simplificado para view multiselect
      venueIds: combo.venueIds,
      active: combo.active,
      showSavings: combo.showSavings,
      imageUrl: combo.imageUrl
    });
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  saveCombo() {
    if (this.comboForm.invalid) return;
    this.loadingAction.set(true);

    const formVal = this.comboForm.value;
    const saveObj: Combo = {
      id: this.editingId || `combo-${Date.now()}`,
      name: formVal.name,
      description: formVal.description,
      price: formVal.price,
      includedProducts: (formVal.includedProducts || []).map((id: string) => ({ id: id, quantity: 1 })),
      venueIds: formVal.venueIds,
      active: formVal.active,
      showSavings: formVal.showSavings,
      imageUrl: formVal.imageUrl
    };

    const targetSub = this.editingId
      ? this.comboService.update(saveObj)
      : this.comboService.create(saveObj);

    targetSub.subscribe({
      next: () => {
        this.message.success(`Combo guardado`);
        if (this.editingId) {
          const idx = this.combos.findIndex(p => p.id === this.editingId);
          if (idx !== -1) this.combos[idx] = saveObj;
        } else {
          this.combos.unshift(saveObj);
        }
        this.closeModal();
        this.loadingAction.set(false);
      },
      error: () => {
        this.message.error('Error al guardar');
        this.loadingAction.set(false);
      }
    });
  }

  deleteCombo(combo: Combo) {
    this.comboService.delete(combo.id).subscribe(() => {
      this.message.success('Combo eliminado');
      this.combos = this.combos.filter(c => c.id !== combo.id);
    });
  }
}
