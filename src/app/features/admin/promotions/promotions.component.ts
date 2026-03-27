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
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  promotions: Promotion[] = [];
  venues: Venue[] = [];
  loadingData = signal<boolean>(true);
  loadingAction = false;
  modalVisible = false;
  editingId: string | null = null;
  promoForm: FormGroup;

  constructor() {
    this.promoForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      discountPercentage: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      venueIds: [['TODAS']],
      imageUrl: ['', Validators.required],
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
    this.promoForm.reset({ active: true, discountPercentage: 10, venueIds: ['TODAS'] });
    this.modalVisible = true;
  }

  editPromo(promo: Promotion) {
    this.editingId = promo.id;
    this.promoForm.patchValue({
      title: promo.title,
      description: promo.description,
      discountPercentage: promo.discountPercentage,
      startDate: promo.startDate,
      endDate: promo.endDate,
      venueIds: promo.venueIds,
      imageUrl: promo.imageUrl,
      active: promo.active
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
    const saveObj: Promotion = {
      id: this.editingId || `promo-${Date.now()}`,
      title: formVal.title,
      description: formVal.description,
      discountPercentage: formVal.discountPercentage,
      startDate: formVal.startDate,
      endDate: formVal.endDate,
      venueIds: formVal.venueIds,
      imageUrl: formVal.imageUrl,
      applicableDays: ['Todos'],
      active: formVal.active
    };

    const targetSub = this.editingId
      ? this.promotionService.update(saveObj)
      : this.promotionService.create(saveObj);

    targetSub.subscribe({
      next: () => {
        this.message.success(`Promoción guardada`);
        // Actualizamos local array simulando
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
  }

  deletePromo(promo: Promotion) {
    this.promotionService.delete(promo.id).subscribe(() => {
      this.message.success('Promoción eliminada');
      this.promotions = this.promotions.filter(p => p.id !== promo.id);
    });
  }
}
