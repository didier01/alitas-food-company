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
import { SupabaseService } from '../../../core/services/supabase.service';
import { Combo } from '../../../core/models/combo.model';
import { Product } from '../../../core/models/product.model';
import { Venue } from '../../../core/models/venue.model';
import { AllergenService } from '../../../core/services/allergen.service';
import { Allergen } from '../../../core/models/allergen.model';
import { ModifierGroupService } from '../../../core/services/modifier-group.service';
import { ModifierGroup } from '../../../core/models/modifier-group.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { AbstractControl, FormArray } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';

@Component({
  selector: 'app-combos',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzTooltipModule, NzSwitchModule, NzSelectModule, NzPopconfirmModule, NzTagModule, NzAlertModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './combos.component.html',
  styleUrl: './combos.component.scss'
})
export class CombosComponent implements OnInit {
  comboService = inject(ComboService);
  productService = inject(ProductService);
  venueService = inject(VenueService);
  supabaseService = inject(SupabaseService);
  allergenService = inject(AllergenService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  modifierGroupService = inject(ModifierGroupService);

  combos: Combo[] = [];
  products: Product[] = [];
  venues: Venue[] = [];
  allergensList: Allergen[] = [];
  globalModifiersList: ModifierGroup[] = [];
  loadingData = signal(true);
  loadingAction = signal(false);
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  modalVisible = false;
  editingId: string | null = null;
  comboForm: FormGroup;
  selectedProductsDetails: { id: string, name: string, price: number, quantity: number }[] = [];

  newGroupToAddId: string | null = null;

  constructor() {
    this.comboForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(100)]],
      included_products: [[], Validators.required],
      venue_ids: [['TODAS']],
      active: [true],
      show_savings: [true],
      image_url: ['', Validators.required],
      allergen_ids: [[]],
      modifier_groups: this.fb.array([])
    });
  }

  get modifier_groups_array(): FormArray {
    return this.comboForm.get('modifier_groups') as FormArray;
  }

  getOptionsArray(groupForm: AbstractControl): FormArray {
    return groupForm.get('options') as FormArray;
  }

  addModifierGroup() {
    if (!this.newGroupToAddId) {
      this.message.warning('Por favor selecciona un grupo de la lista.');
      return;
    }

    // Evitar duplicados
    const existing = this.modifier_groups_array.controls.find(c => c.value.group_id === this.newGroupToAddId);
    if (existing) {
      this.message.warning('Este grupo ya ha sido asignado al combo.');
      return;
    }

    const group = this.globalModifiersList.find(g => g.id === this.newGroupToAddId);
    if (!group) return;

    const groupForm = this.fb.group({
      group_id: [group.id],
      name: [group.name, Validators.required],
      min_selection: [0, Validators.required],
      max_selection: [1, Validators.required],
      free_selections: [0], // Modificadores del Combo tienen gratis
      options: [group.options] // Read-only array of options for preview
    });

    this.modifier_groups_array.push(groupForm);
    this.newGroupToAddId = null;
  }

  removeModifierGroup(index: number) {
    this.modifier_groups_array.removeAt(index);
  }

  ngOnInit() {
    this.loadingData.set(true);
    forkJoin({
      combos: this.comboService.getAll(),
      products: this.productService.getAll(),
      venues: this.venueService.getAll(),
      allergens: this.allergenService.getAll(),
      modifiers: this.modifierGroupService.getAll()
    }).subscribe({
      next: (data) => {
        this.combos = data.combos;
        this.products = data.products;
        this.venues = data.venues;
        this.allergensList = data.allergens;
        this.globalModifiersList = data.modifiers;
        this.loadingData.set(false);

        console.log('modifiers: ', this.globalModifiersList)
      },
      error: () => {
        this.message.error('Error cargando combos y catálogo');
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
    return this.selectedProductsDetails.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
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
    return this.getRealPrice(combo.included_products || []);
  }

  getComboSavings(combo: Combo): number {
    return this.getComboRealPrice(combo) - combo.price;
  }

  openModal() {
    this.editingId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.selectedProductsDetails = [];
    this.comboForm.reset({ active: true, show_savings: true, price: 0, venue_ids: ['TODAS'], included_products: [], allergen_ids: [] });
    this.modifier_groups_array.clear();
    this.modalVisible = true;
  }

  editCombo(combo: Combo) {
    this.editingId = combo.id;
    this.modifier_groups_array.clear();
    this.selectedFile = null;
    this.imagePreview = combo.image_url;

    this.selectedProductsDetails = combo.included_products?.map(p => {
      const pData = this.products.find(x => x.id === p.id);
      return {
        id: p.id,
        name: pData?.name || p.id,
        price: pData?.price || 0,
        quantity: p.quantity || 1
      };
    }) || [];

    this.comboForm.patchValue({
      name: combo.name,
      description: combo.description,
      price: combo.price,
      included_products: combo.included_products?.map(p => p.id), // simplificado para view multiselect
      venue_ids: combo.venue_ids,
      active: combo.active,
      show_savings: combo.show_savings,
      image_url: combo.image_url,
      allergen_ids: combo.allergen_ids || []
    });

    if (combo.modifier_groups) {
      combo.modifier_groups.forEach(group => {
        const groupForm = this.fb.group({
          group_id: [group.group_id],
          name: [group.name, Validators.required],
          min_selection: [group.min_selection, Validators.required],
          max_selection: [group.max_selection, Validators.required],
          free_selections: [group.free_selections || 0],
          options: [group.options || []]
        });

        this.modifier_groups_array.push(groupForm);
      });
    }

    this.modalVisible = true;
  }

  onProductsSelectionChange(ids: string[]) {
    // Keep existing, add new with qty 1
    const newDetails = (ids || []).map(id => {
      const existing = this.selectedProductsDetails.find(x => x.id === id);
      if (existing) return existing;
      const prod = this.products.find(x => x.id === id);
      return { id: id, name: prod?.name || id, price: prod?.price || 0, quantity: 1 };
    });
    this.selectedProductsDetails = newDetails;
  }

  closeModal() {
    this.modalVisible = false;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  async saveCombo() {
    if (this.comboForm.invalid) return;
    this.loadingAction.set(true);

    try {
      let finalImageUrl = this.comboForm.get('image_url')?.value;

      if (this.selectedFile) {
        finalImageUrl = await this.supabaseService.uploadImage(this.selectedFile, 'menu-images/combos');
      }

      const formVal = this.comboForm.value;
      let finalVenueIds = formVal.venue_ids || [];
      if (finalVenueIds.includes('TODAS')) {
        finalVenueIds = this.venues.map(v => v.id);
      }

      const saveObj: any = {
        name: formVal.name,
        description: formVal.description,
        price: formVal.price,
        included_products: this.selectedProductsDetails.map(p => ({ id: p.id, quantity: p.quantity })),
        venue_ids: finalVenueIds,
        active: formVal.active,
        show_savings: formVal.show_savings,
        image_url: finalImageUrl,
        allergen_ids: formVal.allergen_ids,
        modifier_groups: formVal.modifier_groups
      };

      if (this.editingId) {
        saveObj.id = this.editingId;
      }

      const targetSub = this.editingId
        ? this.comboService.update(saveObj)
        : this.comboService.create(saveObj);

      targetSub.subscribe({
        next: () => {
          this.message.success(`Combo guardado`);
          if (this.editingId) {
            const idx = this.combos.findIndex(p => p.id === this.editingId);
            if (idx !== -1) {
              this.combos[idx] = saveObj;
              this.combos = [...this.combos];
            }
          } else {
            this.combos = [saveObj, ...this.combos];
          }
          this.closeModal();
          this.loadingAction.set(false);
        },
        error: () => {
          this.message.error('Error al guardar');
          this.loadingAction.set(false);
        }
      });
    } catch (error) {
      console.error(error);
      this.message.error('Error al subir la imagen.');
      this.loadingAction.set(false);
    }
  }

  duplicateCombo(combo: Combo) {
    this.loadingAction.set(true);

    // Copy the combo but ensure ID is omitted to generate a new constraint UUID
    const duplicateObj: any = {
      name: `${combo.name} (Copia)`,
      description: combo.description,
      price: combo.price,
      image_url: combo.image_url,
      active: false, // Default to hidden for safety
      show_savings: combo.show_savings,
      included_products: combo.included_products?.map(p => ({ id: p.id, quantity: p.quantity })) || [],
      venue_ids: combo.venue_ids || [],
      allergen_ids: combo.allergen_ids || [],
      modifier_groups: combo.modifier_groups || []
    };

    this.comboService.create(duplicateObj).subscribe({
      next: (newCombo) => {
        this.message.success('Combo duplicado exitosamente');
        this.combos = [newCombo, ...this.combos]; // Update reference for UI refresh
        this.loadingAction.set(false);
      },
      error: (err) => {
        console.error(err);
        this.message.error('Error al duplicar el combo');
        this.loadingAction.set(false);
      }
    });
  }

  async deleteCombo(combo: Combo) {
    if (combo.image_url) {
      await this.supabaseService.safeDeleteImage(combo.image_url);
    }
    this.comboService.delete(combo.id).subscribe(() => {
      this.message.success('Combo eliminado');
      this.combos = this.combos.filter(c => c.id !== combo.id);
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.comboForm.patchValue({ image_url: 'pending-upload' });
    };
    reader.readAsDataURL(file);
  }
}
