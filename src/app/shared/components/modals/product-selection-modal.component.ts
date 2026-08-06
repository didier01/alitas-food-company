import { ChangeDetectorRef, Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzModalModule, NzModalRef } from 'ng-zorro-antd/modal';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Product } from '../../../core/models/product.model';
import { AssignedModifierGroup, ModifierOption } from '../../../core/models/modifier-group.model';
import { CartService } from '../../../core/services/cart.service';
import { AllergenService } from '../../../core/services/allergen.service';
import { Allergen } from '../../../core/models/allergen.model';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AnalyticsService } from '../../../core/services/analytics.service';


@Component({
  selector: 'app-product-selection-modal',
  standalone: true,
  imports: [
    CommonModule, FormsModule, NzModalModule, NzButtonModule,
    NzRadioModule, NzCheckboxModule, NzInputNumberModule, NzIconModule
  ],
  templateUrl: './product-selection-modal.component.html',
  styleUrl: './product-selection-modal.component.scss'
})
export class ProductSelectionModalComponent implements OnInit, OnDestroy {
  @Input() product!: Product;

  modal = inject(NzModalRef);
  allergenService = inject(AllergenService);
  cartService = inject(CartService);
  message = inject(NzMessageService);
  analyticsService = inject(AnalyticsService);
  cdr = inject(ChangeDetectorRef);

  selections: any = {};
  totalPrice = 0;
  allergens: Allergen[] = [];
  private startTime = 0;

  ngOnInit() {
    this.startTime = Date.now();
    this.totalPrice = this.product.price;
    this.initializeSelections();
    this.loadAllergens();
  }

  ngOnDestroy() {
    if (this.startTime > 0 && this.product) {
      const durationSeconds = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));
      this.analyticsService.trackModalViewDuration(this.product.name, durationSeconds);
    }
  }

  loadAllergens() {
    this.allergenService.getAll().subscribe(data => {
      this.allergens = data;
      this.cdr.detectChanges();
    });
  }

  getAllergenName(id: string): string {
    const allergen = this.allergens.find(a => a.id === id);
    return allergen ? allergen.name : 'Cargando...';
  }

  initializeSelections() {
    if (!this.product.modifier_groups) return;

    this.product.modifier_groups.forEach((group: AssignedModifierGroup) => {
      if (group.max_selection === 1) {
        this.selections[group.group_id] = null;
      } else {
        this.selections[group.group_id] = {};
        group.options?.forEach((opt: ModifierOption) => {
          this.selections[group.group_id][opt.id] = false;
        });
      }
    });
  }

  getSelectedOptions(group: AssignedModifierGroup): ModifierOption[] {
    let selectedOpts: ModifierOption[] = [];
    if (group.max_selection === 1) {
      const selectedId = this.selections[group.group_id];
      const opt = group.options?.find((o: ModifierOption) => o.id === selectedId);
      if (opt) selectedOpts.push(opt);
    } else {
      group.options?.forEach((opt: ModifierOption) => {
        if (this.selections[group.group_id] && this.selections[group.group_id][opt.id]) {
          selectedOpts.push(opt);
        }
      });
    }
    return selectedOpts;
  }

  getSelectedCount(group: AssignedModifierGroup): number {
    if (group.max_selection === 1) {
      return this.selections[group.group_id] ? 1 : 0;
    } else {
      return Object.values(this.selections[group.group_id] || {}).filter(v => v === true).length;
    }
  }

  shouldShowPrice(group: AssignedModifierGroup, opt: ModifierOption): boolean {
    if (opt.price <= 0) return false;
    if (!group.free_selections || group.free_selections <= 0) return true;

    const selectedCount = this.getSelectedCount(group);
    const isSelected = group.max_selection === 1
      ? this.selections[group.group_id] === opt.id
      : (this.selections[group.group_id] && this.selections[group.group_id][opt.id]);

    if (!isSelected) {
      return selectedCount >= group.free_selections;
    }

    const selectedOpts = this.getSelectedOptions(group);
    selectedOpts.sort((a, b) => a.price - b.price);

    const index = selectedOpts.findIndex(o => o.id === opt.id);
    return index >= group.free_selections;
  }

  updateTotal() {
    let extra = 0;
    this.product.modifier_groups?.forEach((group: AssignedModifierGroup) => {
      const selectedOpts = this.getSelectedOptions(group);

      if (selectedOpts.length > 0) {
        const freeCount = group.free_selections || 0;
        selectedOpts.sort((a, b) => a.price - b.price);

        selectedOpts.forEach((opt, index) => {
          if (index >= freeCount) {
            extra += opt.price;
          }
        });
      }
    });
    this.totalPrice = this.product.price + extra;
  }

  isValid(): boolean {
    if (!this.product.modifier_groups) return true;

    for (const group of this.product.modifier_groups) {
      let count = 0;
      if (group.max_selection === 1) {
        count = this.selections[group.group_id] ? 1 : 0;
      } else {
        count = Object.values(this.selections[group.group_id]).filter(v => v === true).length;
      }

      if (count < group.min_selection || count > group.max_selection) {
        return false;
      }
    }
    return true;
  }

  confirmSelection() {
    const chosenOptions: ModifierOption[] = [];
    this.product.modifier_groups?.forEach((group: AssignedModifierGroup) => {
      if (group.max_selection === 1) {
        const opt = group.options?.find((o: ModifierOption) => o.id === this.selections[group.group_id]);
        if (opt) chosenOptions.push(opt);
      } else {
        group.options?.forEach((opt: ModifierOption) => {
          if (this.selections[group.group_id][opt.id]) {
            chosenOptions.push(opt);
          }
        });
      }
    });

    this.cartService.addItem(this.product, chosenOptions, 1, this.totalPrice);
    this.analyticsService.trackAddToSelection(this.product.name, this.totalPrice);
    this.message.success(`${this.product.name} añadido al carrito`);
    this.modal.close(true);
  }
}
