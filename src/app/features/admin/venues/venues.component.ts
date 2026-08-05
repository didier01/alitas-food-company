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
import { SupabaseService } from '../../../core/services/supabase.service';
import { Venue } from '../../../core/models/venue.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

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
  supabaseService = inject(SupabaseService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  venues: Venue[] = [];
  loadingData = signal(true);
  loadingAction = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  modalVisible = false;
  editingId: string | null = null;
  venueForm: FormGroup;

  constructor() {
    this.venueForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      google_maps_url: ['', Validators.required],
      phone: [''],
      whatsapp: ['', Validators.required],
      schedule_opening: ['11:00', Validators.required],
      schedule_closing: ['22:00', Validators.required],
      image_url: ['', Validators.required],
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
    this.selectedFile = null;
    this.imagePreview = null;
    this.venueForm.reset({ active: true, schedule_opening: '11:00', schedule_closing: '22:00' });
    this.modalVisible = true;
  }

  editSede(sede: Venue) {
    this.editingId = sede.id;
    this.selectedFile = null;
    this.imagePreview = sede.image_url;
    this.venueForm.patchValue({
      name: sede.name,
      address: sede.address,
      google_maps_url: sede.google_maps_url,
      phone: sede.phone,
      whatsapp: sede.whatsapp,
      schedule_opening: sede.schedule_opening,
      schedule_closing: sede.schedule_closing,
      image_url: sede.image_url,
      active: sede.active
    });
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.selectedFile = null;
    this.imagePreview = null;
    this.venueForm.reset();
  }

  async saveSede() {
    if (this.venueForm.invalid) return;
    this.loadingAction = true;

    try {
      let finalImageUrl = this.venueForm.get('image_url')?.value;

      if (this.selectedFile) {
        finalImageUrl = await this.supabaseService.uploadImage(this.selectedFile, 'info/sedes');
      }

      const formVal = this.venueForm.value;
      const saveObj: Venue = {
        id: this.editingId || `sede-${Date.now()}`,
        name: formVal.name,
        address: formVal.address,
        google_maps_url: formVal.google_maps_url,
        phone: formVal.phone,
        whatsapp: formVal.whatsapp,
        schedule_opening: formVal.schedule_opening,
        schedule_closing: formVal.schedule_closing,
        schedule_active_days: ['Todos'],
        image_url: finalImageUrl,
        active: formVal.active
      };

      const targetSub = this.editingId
        ? this.venueService.update(saveObj)
        : this.venueService.create(saveObj);

      targetSub.subscribe({
        next: () => {
          this.message.success(`Sede ${this.editingId ? 'actualizada' : 'creada'} con éxito`);
          this.loadSedes();
          this.closeModal();
          this.loadingAction = false;
        },
        error: () => {
          this.message.error('Error al guardar la sede');
          this.loadingAction = false;
        }
      });
    } catch (error) {
      console.error(error);
      this.message.error('Error al subir la imagen. Verifica la configuración de Supabase.');
      this.loadingAction = false;
    }
  }

  deleteSede(sede: Venue) {
    this.venueService.delete(sede.id).subscribe({
      next: () => {
        this.message.success('Sede eliminada permanentemente');
        this.loadSedes();
      },
      error: (err) => {
        console.error(err);
        this.message.error('Error al eliminar la sede.');
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.venueForm.patchValue({ image_url: 'pending-upload' });
    };
    reader.readAsDataURL(file);
  }
}
