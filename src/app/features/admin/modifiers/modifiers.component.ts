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
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { ModifierGroupService } from '../../../core/services/modifier-group.service';
import { ModifierGroup, ModifierOption } from '../../../core/models/modifier-group.model';
import { forkJoin, finalize } from 'rxjs';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'app-modifiers',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzSelectModule, NzPopconfirmModule, NzTagModule, NzTabsModule, NzCheckboxModule, NzTooltipModule, NzDividerModule
  ],
  templateUrl: './modifiers.component.html',
  styleUrl: './modifiers.component.scss'
})
export class ModifiersComponent implements OnInit {
  modifierGroupService = inject(ModifierGroupService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  groups: ModifierGroup[] = [];
  globalOptions: ModifierOption[] = [];
  groupedOptions: any[] = []; // Nueva propiedad para evitar bucles

  loadingData = signal(true);
  loadingAction = signal(false);

  // Modales
  isGroupModalVisible = false;
  isOptionModalVisible = false;
  isLinkModalVisible = false;

  groupForm: FormGroup;
  optionForm: FormGroup;

  activeGroup: ModifierGroup | null = null;
  selectedOptionIds: string[] = [];

  constructor() {
    this.groupForm = this.fb.group({
      id: [null],
      name: ['', Validators.required]
    });

    this.optionForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      category: [''] // Nuevo campo opcional
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loadingData.set(true);
    forkJoin({
      groups: this.modifierGroupService.getAll(),
      options: this.modifierGroupService.getAllGlobalOptions()
    }).pipe(
      finalize(() => this.loadingData.set(false))
    ).subscribe({
      next: (data) => {
        this.groups = data.groups;
        this.globalOptions = data.options;
        this.updateGroupedOptions(); // Calcular grupos aquí
      },
      error: (err: any) => {
        console.error(err);
        this.message.error('Error cargando los modificadores');
      }
    });
  }

  // --- GESTIÓN DE GRUPOS ---

  showCreateGroupModal() {
    this.groupForm.reset({ name: '' });
    this.isGroupModalVisible = true;
  }

  editGroup(group: ModifierGroup) {
    this.groupForm.patchValue({
      id: group.id,
      name: group.name
    });
    this.isGroupModalVisible = true;
  }

  saveGroup() {
    if (this.groupForm.invalid) return;
    this.loadingAction.set(true);

    const { id, name } = this.groupForm.value;

    if (id) {
      // Editar
      this.modifierGroupService.update(id, { name }).subscribe({
        next: () => {
          this.message.success('Grupo actualizado');
          this.isGroupModalVisible = false;
          this.loadingAction.set(false);
          this.loadData();
        },
        error: () => {
          this.message.error('Error al actualizar grupo');
          this.loadingAction.set(false);
        }
      });
    } else {
      // Crear
      this.modifierGroupService.create({ name }).subscribe({
        next: (newGroup: ModifierGroup) => {
          this.groups = [...this.groups, { ...newGroup, options: [] }];
          this.message.success('Grupo guardado');
          this.isGroupModalVisible = false;
          this.loadingAction.set(false);
        },
        error: () => {
          this.message.error('Error al guardar grupo');
          this.loadingAction.set(false);
        }
      });
    }
  }

  deleteGroup(id: string) {
    this.modifierGroupService.delete(id).subscribe({
      next: () => {
        this.groups = this.groups.filter(g => g.id !== id);
        this.message.success('Grupo eliminado');
      },
      error: () => this.message.error('Error al eliminar grupo')
    });
  }

  // --- GESTIÓN DE CATÁLOGO DE OPCIONES ---

  showCreateOptionModal() {
    this.optionForm.reset({ name: '', price: 0, category: '' });
    this.isOptionModalVisible = true;
  }

  editOption(option: ModifierOption) {
    this.optionForm.patchValue({
      id: option.id,
      name: option.name,
      price: option.price,
      category: option.category || ''
    });
    this.isOptionModalVisible = true;
  }

  saveOption() {
    if (this.optionForm.invalid) return;
    this.loadingAction.set(true);

    const { id, name, price, category } = this.optionForm.value;

    if (id) {
      // Editar existente
      this.modifierGroupService.updateGlobalOption(id, { name, price, category }).subscribe({
        next: () => {
          this.message.success('Opción actualizada');
          this.isOptionModalVisible = false;
          this.loadingAction.set(false);
          this.loadData();
        },
        error: () => {
          this.message.error('Error al actualizar opción');
          this.loadingAction.set(false);
        }
      });
    } else if (name.includes(',')) {
      // Creación masiva
      const names = name.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '');
      this.modifierGroupService.createBulkGlobalOptions(names, price, category).subscribe({
        next: (newOpts) => {
          this.globalOptions = [...this.globalOptions, ...newOpts];
          this.message.success(`${newOpts.length} opciones añadidas al catálogo`);
          this.isOptionModalVisible = false;
          this.loadingAction.set(false);
          this.loadData();
        },
        error: () => {
          this.message.error('Error en creación masiva');
          this.loadingAction.set(false);
        }
      });
    } else {
      // Crear una sola
      this.modifierGroupService.createGlobalOption(name, price, category).subscribe({
        next: (newOpt) => {
          this.globalOptions = [...this.globalOptions, newOpt];
          this.updateGroupedOptions(); // Actualizar grupos
          this.message.success('Opción añadida al catálogo');
          this.isOptionModalVisible = false;
          this.loadingAction.set(false);
        },
        error: () => {
          this.message.error('Error al crear opción');
          this.loadingAction.set(false);
        }
      });
    }
  }

  private updateGroupedOptions() {
    const groupsMap: { [key: string]: ModifierOption[] } = {};
    
    this.globalOptions.forEach(opt => {
      const cat = opt.category || 'Sin Categoría';
      if (!groupsMap[cat]) groupsMap[cat] = [];
      groupsMap[cat].push(opt);
    });

    this.groupedOptions = Object.keys(groupsMap).sort((a, b) => {
      if (a === 'Sin Categoría') return 1;
      if (b === 'Sin Categoría') return -1;
      return a.localeCompare(b);
    }).map(key => ({
      category: key,
      options: groupsMap[key]
    }));
  }

  deleteGlobalOption(id: string) {
    this.modifierGroupService.deleteGlobalOption(id).subscribe({
      next: () => {
        this.globalOptions = this.globalOptions.filter(o => o.id !== id);
        this.message.success('Opción eliminada del catálogo');
        this.loadData(); // Recargar para actualizar grupos vinculados
      },
      error: () => this.message.error('Error al eliminar opción')
    });
  }

  // --- VINCULACIÓN ---

  openLinkModal(group: ModifierGroup) {
    this.activeGroup = group;
    this.selectedOptionIds = group.options?.map(o => o.id) || [];
    this.isLinkModalVisible = true;
  }

  async saveLinks() {
    if (!this.activeGroup) return;
    this.loadingAction.set(true);

    try {
      const currentIds = this.activeGroup.options?.map(o => o.id) || [];
      const toAdd = this.selectedOptionIds.filter(id => !currentIds.includes(id));
      const toRemove = currentIds.filter(id => !this.selectedOptionIds.includes(id));

      for (const id of toRemove) {
        await this.modifierGroupService.unlinkOptionFromGroup(this.activeGroup.id, id).toPromise();
      }
      for (const id of toAdd) {
        await this.modifierGroupService.linkOptionToGroup(this.activeGroup.id, id).toPromise();
      }

      this.message.success('Vinculación actualizada');
      this.isLinkModalVisible = false;
      this.loadData();
    } catch (error) {
      this.message.error('Error al actualizar vínculos');
    } finally {
      this.loadingAction.set(false);
    }
  }

  toggleOption(id: string) {
    const index = this.selectedOptionIds.indexOf(id);
    if (index > -1) {
      this.selectedOptionIds.splice(index, 1);
    } else {
      this.selectedOptionIds.push(id);
    }
  }

}
