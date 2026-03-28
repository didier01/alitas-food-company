import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { VenueService } from '../../../core/services/venue.service';
import { Venue } from '../../../core/models/venue.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';

@Component({
  selector: 'app-venues',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule,
    NzSwitchModule, NzPopconfirmModule, NzTagModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './venues.component.html',
  styleUrl: './venues.component.scss'
})
export class VenuesComponent implements OnInit {
  venueService = inject(VenueService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  venues: Venue[] = [];
  loadingData = signal(true);
  loadingAction = false;
  modalVisible = false;
  editingId: string | null = null;
  venueForm: FormGroup;

  constructor() {
    this.venueForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      googleMapsUrl: ['', Validators.required],
      phone: ['', Validators.required],
      whatsapp: ['', Validators.required],
      opening: ['11:00', Validators.required],
      closing: ['22:00', Validators.required],
      imageUrl: ['', Validators.required],
      active: [true]
    });
  }

  ngOnInit() {
    this.loadSedes();
  }

  loadSedes() {
    this.loadingData.set(true);
    this.venueService.getAll().subscribe({
      next: (data) => {
        this.venues = data;
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error al cargar sedes');
        this.loadingData.set(false);
      }
    });
  }

  openModal() {
    this.editingId = null;
    this.venueForm.reset({ active: true, opening: '11:00', closing: '22:00' });
    this.modalVisible = true;
  }

  editSede(sede: Venue) {
    this.editingId = sede.id;
    this.venueForm.patchValue({
      name: sede.name,
      address: sede.address,
      googleMapsUrl: sede.googleMapsUrl,
      phone: sede.phone,
      whatsapp: sede.whatsapp,
      opening: sede.schedule.opening,
      closing: sede.schedule.closing,
      imageUrl: sede.imageUrl,
      active: sede.active
    });
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.venueForm.reset();
  }

  saveSede() {
    if (this.venueForm.invalid) return;
    this.loadingAction = true;

    const formVal = this.venueForm.value;
    const saveObj: Venue = {
      id: this.editingId || `sede-${Date.now()}`,
      name: formVal.name,
      address: formVal.address,
      googleMapsUrl: formVal.googleMapsUrl,
      phone: formVal.phone,
      whatsapp: formVal.whatsapp,
      schedule: { opening: formVal.opening, closing: formVal.closing, activeDays: ['Todos'] },
      imageUrl: formVal.imageUrl,
      active: formVal.active
    };

    const targetSub = this.editingId
      ? this.venueService.update(saveObj)
      : this.venueService.create(saveObj);

    targetSub.subscribe({
      next: () => {
        this.message.success(`Venue ${this.editingId ? 'actualizada' : 'creada'} con éxito`);
        this.loadSedes();
        this.closeModal();
        this.loadingAction = false;
      },
      error: () => {
        this.message.error('Error al guardar la sede');
        this.loadingAction = false;
      }
    });
  }

  deleteSede(sede: Venue) {
    // Para simplificar desactivamos en lugar de borrar permanente
    sede.active = false;
    this.venueService.update(sede).subscribe(() => {
      this.message.success('Venue desactivada correctamente');
      this.loadSedes();
    });
  }
}
