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
import { PromotionService } from '../../../core/services/promotion.service';
import { VenueService } from '../../../core/services/venue.service';
import { SupabaseService } from '../../../core/services/supabase.service';
import { Promotion } from '../../../core/models/promotion.model';
import { Venue } from '../../../core/models/venue.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzTableModule, NzButtonModule,
    NzIconModule, NzModalModule, NzFormModule, NzInputModule, NzInputNumberModule,
    NzDatePickerModule, NzSwitchModule, NzSelectModule,
    NzPopconfirmModule, NzTagModule, LoadingSpinnerComponent
  ],
  templateUrl: './promotions.component.html',
  styleUrl: './promotions.component.scss'
})
export class PromotionsComponent implements OnInit {
  promotionService = inject(PromotionService);
  venueService = inject(VenueService);
  supabaseService = inject(SupabaseService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  promotions: Promotion[] = [];
  venues: Venue[] = [];
  loadingData = signal<boolean>(true);
  loadingAction = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  modalVisible = false;
  editingId: string | null = null;
  promoForm: FormGroup;

  constructor() {
    this.promoForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      discount_percentage: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      start_date: [null, Validators.required],
      end_date: [null, Validators.required],
      venue_ids: [['TODAS']],
      image_url: ['', Validators.required],
      active: [true]
    });
  }

  ngOnInit() {
    this.loadingData.set(true);
    forkJoin({
      promos: this.promotionService.getAll(),
      venues: this.venueService.getAll()
    }).subscribe({
      next: (data) => {
        this.promotions = data.promos;
        this.venues = data.venues;
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error cargando promotions');
        this.loadingData.set(false);
      }
    });
  }

  getSedeName(id: string): string {
    const s = this.venues.find(x => x.id === id);
    return s ? s.name : id;
  }

  openModal() {
    this.editingId = null;
    this.selectedFile = null;
    this.imagePreview = null;
    this.promoForm.reset({ active: true, discount_percentage: 10, venue_ids: ['TODAS'] });
    this.modalVisible = true;
  }

  editPromo(promo: Promotion) {
    this.editingId = promo.id;
    this.selectedFile = null;
    this.imagePreview = promo.image_url;
    this.promoForm.patchValue({
      title: promo.title,
      description: promo.description,
      discount_percentage: promo.discount_percentage,
      start_date: promo.start_date,
      end_date: promo.end_date,
      venue_ids: promo.venue_ids,
      image_url: promo.image_url,
      active: promo.active
    });
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
    this.selectedFile = null;
    this.imagePreview = null;
  }

  async savePromo() {
    if (this.promoForm.invalid) return;
    this.loadingAction = true;

    try {
      let finalImageUrl = this.promoForm.get('image_url')?.value;

      if (this.selectedFile) {
        finalImageUrl = await this.supabaseService.uploadImage(this.selectedFile, 'uploadImage/promotions');
      }

      const formVal = this.promoForm.value;
      
      let finalVenueIds = formVal.venue_ids || [];
      if (finalVenueIds.includes('TODAS')) {
        finalVenueIds = this.venues.map(v => v.id);
      }

      const saveObj: any = {
        title: formVal.title,
        description: formVal.description,
        discount_percentage: formVal.discount_percentage,
        start_date: formVal.start_date,
        end_date: formVal.end_date,
        venue_ids: finalVenueIds,
        image_url: finalImageUrl,
        applicable_days: ['Todos'],
        active: formVal.active
      };

      if (this.editingId) {
        saveObj.id = this.editingId;
      }

      const targetSub = this.editingId
        ? this.promotionService.update(saveObj)
        : this.promotionService.create(saveObj);

      targetSub.subscribe({
        next: () => {
          this.message.success(`Promoción guardada`);
          if (this.editingId) {
            const idx = this.promotions.findIndex(p => p.id === this.editingId);
            if (idx !== -1) this.promotions[idx] = saveObj;
          } else {
            this.promotions.unshift(saveObj);
          }
          this.closeModal();
          this.loadingAction = false;
        },
        error: () => {
          this.message.error('Error al guardar');
          this.loadingAction = false;
        }
      });
    } catch (error) {
      console.error(error);
      this.message.error('Error al subir la imagen.');
      this.loadingAction = false;
    }
  }

  deletePromo(promo: Promotion) {
    this.promotionService.delete(promo.id).subscribe(() => {
      this.message.success('Promoción eliminada');
      this.promotions = this.promotions.filter(p => p.id !== promo.id);
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.promoForm.patchValue({ image_url: 'pending-upload' });
    };
    reader.readAsDataURL(file);
  }
}
