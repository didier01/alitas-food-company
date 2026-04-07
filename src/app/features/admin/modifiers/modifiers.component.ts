import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';

import { ModifierGroupService } from '../../../core/services/modifier-group.service';
import { ProductService } from '../../../core/services/product.service';
import { ModifierGroup } from '../../../core/models/modifier-group.model';
import { Product } from '../../../core/models/product.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { forkJoin, finalize } from 'rxjs';

@Component({
  selector: 'app-modifiers',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule, NzSelectModule,
    NzPopconfirmModule, NzTagModule, LoadingSpinnerComponent
  ],
  templateUrl: './modifiers.component.html',
  styleUrl: './modifiers.component.scss'
})
export class ModifiersComponent implements OnInit {
  modifierGroupService = inject(ModifierGroupService);
  productService = inject(ProductService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  groups: ModifierGroup[] = [];
  products: Product[] = []; // To choose as options
  loadingData = signal(true);
  loadingAction = signal(false);

  // Group Creation Modal
  isGroupModalVisible = false;
  groupForm: FormGroup;

  // Options linking Modal
  isOptionsModalVisible = false;
  activeGroup: ModifierGroup | null = null;
  selectedProductIds: string[] = [];

  constructor() {
    this.groupForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadingData.set(true);
    forkJoin({
      groups: this.modifierGroupService.getAll(),
      products: this.productService.getAll()
    }).pipe(
      finalize(() => this.loadingData.set(false))
    ).subscribe({
      next: (data) => {
        this.groups = data.groups;
        this.products = data.products;
      },
      error: (err: any) => {
        console.error(err);
        this.message.error('Error cargando los modificadores');
      }
    });
  }

  showCreateGroupModal() {
    this.groupForm.reset();
    this.isGroupModalVisible = true;
  }

  saveGroup() {
    if (this.groupForm.invalid) return;
    this.loadingAction.set(true);
    
    this.modifierGroupService.create(this.groupForm.value).subscribe({
      next: (newGroup: ModifierGroup) => {
        this.groups = [...this.groups, { ...newGroup, options: [] }];
        this.message.success('Grupo de extras guardado');
        this.isGroupModalVisible = false;
        this.loadingAction.set(false);
      },
      error: (err: any) => {
        console.error(err);
        this.message.error('Error al guardar grupo');
        this.loadingAction.set(false);
      }
    });
  }

  deleteGroup(id: string) {
    this.modifierGroupService.delete(id).subscribe({
      next: () => {
        this.groups = this.groups.filter(g => g.id !== id);
        this.message.success('Grupo eliminado correctamente');
      },
      error: (err: any) => {
        console.error(err);
        this.message.error('Error al eliminar grupo. Compruebe que no se usa en Combos.');
      }
    });
  }

  openOptionsModal(group: ModifierGroup) {
    this.activeGroup = group;
    // Pre-fill selected product IDs from options
    this.selectedProductIds = group.options ? group.options.map(opt => opt.product_id) : [];
    this.isOptionsModalVisible = true;
  }

  async saveOptionsToGroup() {
    if (!this.activeGroup) return;
    this.loadingAction.set(true);

    const oldOptions = this.activeGroup.options || [];
    const oldProductIds = oldOptions.map(o => o.product_id);

    const idsToAdd = this.selectedProductIds.filter(id => !oldProductIds.includes(id));
    const optsToRemove = oldOptions.filter(o => !this.selectedProductIds.includes(o.product_id));

    try {
      // Remove
      for (const opt of optsToRemove) {
        await this.modifierGroupService.removeOption(opt.id).toPromise();
      }
      
      // Add
      for (const pId of idsToAdd) {
        await this.modifierGroupService.addOption(this.activeGroup.id, pId).toPromise();
      }

      this.message.success('Opciones actualizadas exitosamente');
      this.isOptionsModalVisible = false;
      this.loadData(); // Reload all state softly
    } catch (error: any) {
      console.error(error);
      this.message.error('Hubo un error sincronizando las opciones.');
      this.loadingAction.set(false);
    }
  }
}
