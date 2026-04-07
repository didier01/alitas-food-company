import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { AllergenService } from '../../../../core/services/allergen.service';
import { Allergen } from '../../../../core/models/allergen.model';

@Component({
  selector: 'app-allergens',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, NzTableModule,
    NzButtonModule, NzIconModule, NzModalModule, NzFormModule,
    NzInputModule, NzPopconfirmModule
  ],
  templateUrl: './allergens.component.html'
})
export class AllergensComponent implements OnInit {
  allergenService = inject(AllergenService);
  fb = inject(FormBuilder);
  message = inject(NzMessageService);

  allergens: Allergen[] = [];
  loadingData = signal(true);
  loadingAction = false;
  modalVisible = false;
  editingId: string | null = null;
  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loadingData.set(true);
    this.allergenService.getAll().subscribe({
      next: (data) => {
        this.allergens = data;
        this.loadingData.set(false);
      },
      error: () => {
        this.message.error('Error al cargar alérgenos');
        this.loadingData.set(false);
      }
    });
  }

  openModal() {
    this.editingId = null;
    this.form.reset();
    this.modalVisible = true;
  }

  editItem(item: Allergen) {
    this.editingId = item.id;
    this.form.patchValue({ name: item.name });
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }

  saveItem() {
    if (this.form.invalid) return;
    this.loadingAction = true;

    const saveObj: Allergen = {
      id: this.editingId || `alg-${Date.now()}`,
      name: this.form.value.name
    };

    const req$ = this.editingId
      ? this.allergenService.update(saveObj)
      : this.allergenService.create(saveObj);

    req$.subscribe({
      next: () => {
        this.message.success('Alérgeno guardado correctamente');
        this.loadData();
        this.closeModal();
        this.loadingAction = false;
      },
      error: () => {
        this.message.error('Error al guardar');
        this.loadingAction = false;
      }
    });
  }

  deleteItem(item: Allergen) {
    this.allergenService.delete(item.id).subscribe(() => {
      this.message.success('Alérgeno eliminado');
      this.loadData();
    });
  }
}
