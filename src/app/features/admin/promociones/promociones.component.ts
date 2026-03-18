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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { PromocionService } from '../../../core/services/promocion.service';
import { SedeService } from '../../../core/services/sede.service';
import { Promocion } from '../../../core/models/promocion.model';
import { Sede } from '../../../core/models/sede.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzDatePickerModule, NzSwitchModule, NzSelectModule,
    NzPopconfirmModule, NzTagModule, LoadingSpinnerComponent
  ],
  templateUrl: './promociones.component.html',
  styleUrl: './promociones.component.scss'
})
export class PromocionesComponent implements OnInit {
  promoService = inject(PromocionService);
  sedeService = inject(SedeService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  promociones: Promocion[] = [];
  sedes: Sede[] = [];
  loadingData = signal<boolean>(true);
  loadingAction = false;
  modalVisible = false;
  editingId: string | null = null;
  promoForm: FormGroup;

  constructor() {
    this.promoForm = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: ['', Validators.required],
      descuentoPorcentaje: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      fechaInicio: [null, Validators.required],
      fechaFin: [null, Validators.required],
      sedeIds: [['TODAS']],
      imagenUrl: ['', Validators.required],
      activa: [true]
    });
  }

  ngOnInit() {
    this.loadingData.set(true);
    forkJoin({
      promos: this.promoService.getAll(),
      sedes: this.sedeService.getAll()
    }).subscribe({
      next: (data) => {
        this.promociones = data.promos;
        this.sedes = data.sedes;
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error cargando promociones');
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
    this.promoForm.reset({ activa: true, descuentoPorcentaje: 10, sedeIds: ['TODAS'] });
    this.modalVisible = true;
  }

  editPromo(promo: Promocion) {
    this.editingId = promo.id;
    this.promoForm.patchValue({
      titulo: promo.titulo,
      descripcion: promo.descripcion,
      descuentoPorcentaje: promo.descuentoPorcentaje,
      fechaInicio: promo.fechaInicio,
      fechaFin: promo.fechaFin,
      sedeIds: promo.sedeIds,
      imagenUrl: promo.imagenUrl,
      activa: promo.activa
    });
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  savePromo() {
    if (this.promoForm.invalid) return;
    this.loadingAction = true;

    const formVal = this.promoForm.value;
    const saveObj: Promocion = {
      id: this.editingId || `promo-${Date.now()}`,
      titulo: formVal.titulo,
      descripcion: formVal.descripcion,
      descuentoPorcentaje: formVal.descuentoPorcentaje,
      fechaInicio: formVal.fechaInicio,
      fechaFin: formVal.fechaFin,
      sedeIds: formVal.sedeIds,
      imagenUrl: formVal.imagenUrl,
      diasAplica: ['Todos'],
      activa: formVal.activa
    };

    const targetSub = this.editingId
      ? this.promoService.update(saveObj)
      : this.promoService.create(saveObj);

    targetSub.subscribe({
      next: () => {
        this.message.success(`Promoción guardada`);
        // Actualizamos local array simulando
        if (this.editingId) {
          const idx = this.promociones.findIndex(p => p.id === this.editingId);
          if (idx !== -1) this.promociones[idx] = saveObj;
        } else {
          this.promociones.unshift(saveObj);
        }
        this.closeModal();
        this.loadingAction = false;
      },
      error: () => {
        this.message.error('Error al guardar');
        this.loadingAction = false;
      }
    });
  }

  deletePromo(promo: Promocion) {
    this.promoService.delete(promo.id).subscribe(() => {
      this.message.success('Promoción eliminada');
      this.promociones = this.promociones.filter(p => p.id !== promo.id);
    });
  }
}
