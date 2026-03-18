import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { ComboService } from '../../../core/services/combo.service';
import { ProductoService } from '../../../core/services/producto.service';
import { SedeService } from '../../../core/services/sede.service';
import { Combo } from '../../../core/models/combo.model';
import { Producto } from '../../../core/models/producto.model';
import { Sede } from '../../../core/models/sede.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-combos',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzSwitchModule, NzSelectModule, NzPopconfirmModule, NzTagModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './combos.component.html',
  styleUrl: './combos.component.scss'
})
export class CombosComponent implements OnInit {
  comboService = inject(ComboService);
  productoService = inject(ProductoService);
  sedeService = inject(SedeService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  combos: Combo[] = [];
  productos: Producto[] = [];
  sedes: Sede[] = [];
  loadingData = signal(true);
  loadingAction = signal(false);
  modalVisible = false;
  editingId: string | null = null;
  comboForm: FormGroup;

  constructor() {
    this.comboForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(100)]],
      productosIncluidos: [[], Validators.required],
      sedeIds: [['TODAS']],
      activo: [true],
      imagenUrl: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadingData.set(true);
    forkJoin({
      combos: this.comboService.getAll(),
      productos: this.productoService.getAll(),
      sedes: this.sedeService.getAll()
    }).subscribe({
      next: (data) => {
        this.combos = data.combos;
        this.productos = data.productos;
        this.sedes = data.sedes;
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error cargando combos');
        this.loadingData.set(false);
      }
    });
  }

  getSedeName(id: string): string {
    const s = this.sedes.find(x => x.id === id);
    return s ? s.nombre : id;
  }

  openModal() {
    this.editingId = null;
    this.comboForm.reset({ activo: true, precio: 0, sedeIds: ['TODAS'], productosIncluidos: [] });
    this.modalVisible = true;
  }

  editCombo(combo: Combo) {
    this.editingId = combo.id;
    this.comboForm.patchValue({
      nombre: combo.nombre,
      descripcion: combo.descripcion,
      precio: combo.precio,
      productosIncluidos: combo.productosIncluidos.map(p => p.productoId), // simplificado para view multiselect
      sedeIds: combo.sedeIds,
      activo: combo.activo,
      imagenUrl: combo.imagenUrl
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
      nombre: formVal.nombre,
      descripcion: formVal.descripcion,
      precio: formVal.precio,
      productosIncluidos: (formVal.productosIncluidos || []).map((id: string) => ({ productoId: id, cantidad: 1 })),
      sedeIds: formVal.sedeIds,
      activo: formVal.activo,
      imagenUrl: formVal.imagenUrl
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
