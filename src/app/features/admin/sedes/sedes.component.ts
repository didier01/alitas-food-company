import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { SedeService } from '../../../core/services/sede.service';
import { Sede } from '../../../core/models/sede.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-sedes',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzDrawerModule, NzFormModule, NzInputModule,
    NzSwitchModule, NzPopconfirmModule, NzTagModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './sedes.component.html',
  styleUrl: './sedes.component.scss'
})
export class SedesComponent implements OnInit {
  sedeService = inject(SedeService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  sedes: Sede[] = [];
  loadingData = signal(true);
  loadingAction = false;
  drawerVisible = false;
  editingId: string | null = null;
  sedeForm: FormGroup;

  constructor() {
    this.sedeForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      lat: [null, Validators.required],
      lng: [null, Validators.required],
      telefono: ['', Validators.required],
      whatsapp: ['', Validators.required],
      apertura: ['11:00', Validators.required],
      cierre: ['22:00', Validators.required],
      imagenUrl: ['', Validators.required],
      activa: [true]
    });
  }

  ngOnInit() {
    this.loadSedes();
  }

  loadSedes() {
    this.loadingData.set(true);
    this.sedeService.getAll().subscribe({
      next: (data) => {
        this.sedes = data;
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error al cargar sedes');
        this.loadingData.set(false);
      }
    });
  }

  openDrawer() {
    this.editingId = null;
    this.sedeForm.reset({ activa: true, apertura: '11:00', cierre: '22:00' });
    this.drawerVisible = true;
  }

  editSede(sede: Sede) {
    this.editingId = sede.id;
    this.sedeForm.patchValue({
      nombre: sede.nombre,
      direccion: sede.direccion,
      lat: sede.coordenadas.lat,
      lng: sede.coordenadas.lng,
      telefono: sede.telefono,
      whatsapp: sede.whatsapp,
      apertura: sede.horario.apertura,
      cierre: sede.horario.cierre,
      imagenUrl: sede.imagenUrl,
      activa: sede.activa
    });
    this.drawerVisible = true;
  }

  closeDrawer() {
    this.drawerVisible = false;
    this.sedeForm.reset();
  }

  saveSede() {
    if (this.sedeForm.invalid) return;
    this.loadingAction = true;

    const formVal = this.sedeForm.value;
    const saveObj: Sede = {
      id: this.editingId || `sede-${Date.now()}`,
      nombre: formVal.nombre,
      direccion: formVal.direccion,
      coordenadas: { lat: formVal.lat, lng: formVal.lng },
      telefono: formVal.telefono,
      whatsapp: formVal.whatsapp,
      horario: { apertura: formVal.apertura, cierre: formVal.cierre, diasActivos: ['Todos'] },
      imagenUrl: formVal.imagenUrl,
      activa: formVal.activa
    };

    const targetSub = this.editingId
      ? this.sedeService.update(saveObj)
      : this.sedeService.create(saveObj);

    targetSub.subscribe({
      next: () => {
        this.message.success(`Sede ${this.editingId ? 'actualizada' : 'creada'} con éxito`);
        this.loadSedes();
        this.closeDrawer();
        this.loadingAction = false;
      },
      error: () => {
        this.message.error('Error al guardar la sede');
        this.loadingAction = false;
      }
    });
  }

  deleteSede(sede: Sede) {
    // Para simplificar desactivamos en lugar de borrar permanente
    sede.activa = false;
    this.sedeService.update(sede).subscribe(() => {
      this.message.success('Sede desactivada correctamente');
      this.loadSedes();
    });
  }
}
